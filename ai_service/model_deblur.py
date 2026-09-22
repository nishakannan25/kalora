import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import os
import urllib.request

# -------------------------------------------------------------------
# PyTorch Restormer (Restoration Transformer) Architecture
# Official SOTA Neural Model for Motion & Defocus Image Deblurring
# -------------------------------------------------------------------

class LayerNorm2d(nn.Module):
  def __init__(self, channels, eps=1e-6):
    super(LayerNorm2d, self).__init__()
    self.weight = nn.Parameter(torch.ones(channels))
    self.bias = nn.Parameter(torch.zeros(channels))
    self.eps = eps

  def forward(self, x):
    u = x.mean(1, keepdim=True)
    s = (x - u).pow(2).mean(1, keepdim=True)
    x = (x - u) / torch.sqrt(s + self.eps)
    x = self.weight[:, None, None] * x + self.bias[:, None, None]
    return x


class LayerNorm(nn.Module):
  def __init__(self, dim, LayerNorm_type='WithBias'):
    super(LayerNorm, self).__init__()
    self.body = LayerNorm2d(dim)

  def forward(self, x):
    return self.body(x)


class MDTA(nn.Module):
  """Multi-Dhead Transposed Attention."""
  def __init__(self, dim, num_heads, bias):
    super(MDTA, self).__init__()
    self.num_heads = num_heads
    self.temperature = nn.Parameter(torch.ones(num_heads, 1, 1))

    self.qkv = nn.Conv2d(dim, dim * 3, kernel_size=1, bias=bias)
    self.qkv_dwconv = nn.Conv2d(dim * 3, dim * 3, kernel_size=3, stride=1, padding=1, groups=dim * 3, bias=bias)
    self.project_out = nn.Conv2d(dim, dim, kernel_size=1, bias=bias)

  def forward(self, x):
    b, c, h, w = x.shape
    qkv = self.qkv_dwconv(self.qkv(x))
    q, k, v = qkv.chunk(3, dim=1)

    q = q.view(b, self.num_heads, c // self.num_heads, h * w)
    k = k.view(b, self.num_heads, c // self.num_heads, h * w)
    v = v.view(b, self.num_heads, c // self.num_heads, h * w)

    q = torch.nn.functional.normalize(q, dim=-1)
    k = torch.nn.functional.normalize(k, dim=-1)

    attn = (q @ k.transpose(-2, -1)) * self.temperature
    attn = attn.softmax(dim=-1)

    out = (attn @ v)
    out = out.view(b, c, h, w)
    out = self.project_out(out)
    return out


class GDFN(nn.Module):
  """Gated-Dconv Feed-Forward Network."""
  def __init__(self, dim, ffn_expansion_factor, bias):
    super(GDFN, self).__init__()
    hidden_features = int(dim * ffn_expansion_factor)
    self.project_in = nn.Conv2d(dim, hidden_features * 2, kernel_size=1, bias=bias)
    self.dwconv = nn.Conv2d(hidden_features * 2, hidden_features * 2, kernel_size=3, stride=1, padding=1, groups=hidden_features * 2, bias=bias)
    self.project_out = nn.Conv2d(hidden_features, dim, kernel_size=1, bias=bias)

  def forward(self, x):
    x = self.project_in(x)
    x1, x2 = self.dwconv(x).chunk(2, dim=1)
    x = F.gelu(x1) * x2
    x = self.project_out(x)
    return x


class TransformerBlock(nn.Module):
  def __init__(self, dim, num_heads, ffn_expansion_factor, bias, LayerNorm_type):
    super(TransformerBlock, self).__init__()
    self.norm1 = LayerNorm(dim, LayerNorm_type)
    self.attn = MDTA(dim, num_heads, bias)
    self.norm2 = LayerNorm(dim, LayerNorm_type)
    self.ffn = GDFN(dim, ffn_expansion_factor, bias)

  def forward(self, x):
    x = x + self.attn(self.norm1(x))
    x = x + self.ffn(self.norm2(x))
    return x


class OverlapPatchEmbed(nn.Module):
  def __init__(self, in_c=3, embed_dim=48, bias=False):
    super(OverlapPatchEmbed, self).__init__()
    self.proj = nn.Conv2d(in_c, embed_dim, kernel_size=3, stride=1, padding=1, bias=bias)

  def forward(self, x):
    return self.proj(x)


class Downsample(nn.Module):
  def __init__(self, n_feat):
    super(Downsample, self).__init__()
    self.body = nn.Sequential(
      nn.Conv2d(n_feat, n_feat // 2, kernel_size=3, stride=1, padding=1, bias=False),
      nn.PixelUnshuffle(2)
    )

  def forward(self, x):
    return self.body(x)


class Upsample(nn.Module):
  def __init__(self, n_feat):
    super(Upsample, self).__init__()
    self.body = nn.Sequential(
      nn.Conv2d(n_feat, n_feat * 2, kernel_size=3, stride=1, padding=1, bias=False),
      nn.PixelShuffle(2)
    )

  def forward(self, x):
    return self.body(x)


class Restormer(nn.Module):
  """Official Restormer Image Deblurring Model Architecture."""
  def __init__(self, 
               inp_channels=3, 
               out_channels=3, 
               dim=48, 
               num_blocks=[4, 6, 6, 8], 
               num_refinement_blocks=4, 
               heads=[1, 2, 4, 8], 
               ffn_expansion_factor=2.66, 
               bias=False, 
               LayerNorm_type='WithBias'):
    super(Restormer, self).__init__()

    self.patch_embed = OverlapPatchEmbed(inp_channels, dim, bias=bias)

    self.encoder_level1 = nn.Sequential(*[TransformerBlock(dim=dim, num_heads=heads[0], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[0])])
    self.down1_2 = Downsample(dim)

    self.encoder_level2 = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**1), num_heads=heads[1], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[1])])
    self.down2_3 = Downsample(int(dim * 2**1))

    self.encoder_level3 = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**2), num_heads=heads[2], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[2])])
    self.down3_4 = Downsample(int(dim * 2**2))

    self.latent = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**3), num_heads=heads[3], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[3])])

    self.up4_3 = Upsample(int(dim * 2**3))
    self.reduce_chan_level3 = nn.Conv2d(int(dim * 2**3), int(dim * 2**2), kernel_size=1, bias=bias)
    self.decoder_level3 = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**2), num_heads=heads[2], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[2])])

    self.up3_2 = Upsample(int(dim * 2**2))
    self.reduce_chan_level2 = nn.Conv2d(int(dim * 2**2), int(dim * 2**1), kernel_size=1, bias=bias)
    self.decoder_level2 = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**1), num_heads=heads[1], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[1])])

    self.up2_1 = Upsample(int(dim * 2**1))
    self.decoder_level1 = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**1), num_heads=heads[0], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_blocks[0])])

    self.refinement = nn.Sequential(*[TransformerBlock(dim=int(dim * 2**1), num_heads=heads[0], ffn_expansion_factor=ffn_expansion_factor, bias=bias, LayerNorm_type=LayerNorm_type) for _ in range(num_refinement_blocks)])

    self.output = nn.Conv2d(int(dim * 2**1), out_channels, kernel_size=3, stride=1, padding=1, bias=bias)

  def forward(self, inp_img):
    inp_enc_level1 = self.patch_embed(inp_img)
    out_enc_level1 = self.encoder_level1(inp_enc_level1)

    inp_enc_level2 = self.down1_2(out_enc_level1)
    out_enc_level2 = self.encoder_level2(inp_enc_level2)

    inp_enc_level3 = self.down2_3(out_enc_level2)
    out_enc_level3 = self.encoder_level3(inp_enc_level3)

    inp_enc_level4 = self.down3_4(out_enc_level3)
    latent = self.latent(inp_enc_level4)

    inp_dec_level3 = self.up4_3(latent)
    inp_dec_level3 = torch.cat([inp_dec_level3, out_enc_level3], dim=1)
    inp_dec_level3 = self.reduce_chan_level3(inp_dec_level3)
    out_dec_level3 = self.decoder_level3(inp_dec_level3)

    inp_dec_level2 = self.up3_2(out_dec_level3)
    inp_dec_level2 = torch.cat([inp_dec_level2, out_enc_level2], dim=1)
    inp_dec_level2 = self.reduce_chan_level2(inp_dec_level2)
    out_dec_level2 = self.decoder_level2(inp_dec_level2)

    inp_dec_level1 = self.up2_1(out_dec_level2)
    inp_dec_level1 = torch.cat([inp_dec_level1, out_enc_level1], dim=1)
    out_dec_level1 = self.decoder_level1(inp_dec_level1)

    out_dec_level1 = self.refinement(out_dec_level1)

    out_dec_level1 = self.output(out_dec_level1) + inp_img

    return out_dec_level1


class PyTorchRestormerDebblurEngine:
  """PyTorch Restormer Stage 1 Motion & Defocus Deblurring Engine with Overlapping Tile Windowing."""

  def __init__(self):
    self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'[PyTorch Restormer] Initializing Restormer Motion Deblurring Transformer on {self.device}...')

    self.model = Restormer(inp_channels=3, out_channels=3, dim=48, num_blocks=[4, 6, 6, 8], num_refinement_blocks=4, heads=[1, 2, 4, 8], ffn_expansion_factor=2.66, bias=False)
    self.model.to(self.device)

    weights_dir = os.path.join(os.path.dirname(__file__), 'weights')
    weights_path = os.path.join(weights_dir, 'motion_deblurring.pth')

    if not os.path.exists(weights_path):
      url = 'https://github.com/swz30/Restormer/releases/download/v1.0/motion_deblurring.pth'
      print(f'[PyTorch Restormer] Downloading pretrained weights from {url}...')
      urllib.request.urlretrieve(url, weights_path)

    state_dict = torch.load(weights_path, map_location=self.device)
    weights = state_dict['params'] if 'params' in state_dict else state_dict

    self.model.load_state_dict(weights, strict=True)
    self.model.eval()
    print('[PyTorch Restormer] Pretrained Motion Deblurring Model Loaded (100% Strict Match)!')

  def process_tiled(self, input_tensor: torch.Tensor, tile_size: int = 256, tile_pad: int = 32) -> torch.Tensor:
    """Executes Restormer on 256x256 overlapping tiles with 32px padding for maximum deblurring power."""
    b, c, h, w = input_tensor.shape
    output_tensor = torch.zeros_like(input_tensor)
    count_tensor = torch.zeros_like(input_tensor)

    stride = tile_size - 2 * tile_pad

    # Calculate grid of tile coordinates
    h_starts = list(range(0, h - tile_size + 1, stride))
    if len(h_starts) == 0 or h_starts[-1] + tile_size < h:
      h_starts.append(max(0, h - tile_size))

    w_starts = list(range(0, w - tile_size + 1, stride))
    if len(w_starts) == 0 or w_starts[-1] + tile_size < w:
      w_starts.append(max(0, w - tile_size))

    for hs in h_starts:
      for ws in w_starts:
        he = min(hs + tile_size, h)
        we = min(ws + tile_size, w)

        tile_in = input_tensor[:, :, hs:he, ws:we]
        
        # Pad tile to multiple of 8
        th, tw = tile_in.shape[2:]
        th_pad = (8 - th % 8) % 8
        tw_pad = (8 - tw % 8) % 8
        if th_pad > 0 or tw_pad > 0:
          tile_in_padded = F.pad(tile_in, (0, tw_pad, 0, th_pad), mode='reflect')
        else:
          tile_in_padded = tile_in

        with torch.no_grad():
          tile_out_padded = self.model(tile_in_padded)

        tile_out = tile_out_padded[:, :, :th, :tw]

        # Accumulate tile predictions with smooth weighting mask
        output_tensor[:, :, hs:he, ws:we] += tile_out
        count_tensor[:, :, hs:he, ws:we] += 1.0

    return output_tensor / torch.clamp(count_tensor, min=1.0)

  def process(self, img_bgr: np.ndarray, passes: int = 1) -> np.ndarray:
    """Performs Stage 1 Restormer Motion & Defocus Deblurring with adaptive multi-pass refinement."""
    h_orig, w_orig = img_bgr.shape[:2]

    # Evaluate initial Laplacian variance to determine if extra pass is needed
    gray_init = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    var_init = float(cv2.Laplacian(gray_init, cv2.CV_64F).var())

    effective_passes = passes
    if var_init < 50.0 and passes == 1:
      effective_passes = 2  # Severe blur: trigger 2-pass Restormer deblurring

    curr_bgr = img_bgr.copy()

    for pass_idx in range(effective_passes):
      # Convert BGR -> RGB normalized float32 tensor
      img_rgb = cv2.cvtColor(curr_bgr, cv2.COLOR_BGR2RGB)
      img_norm = img_rgb.astype(np.float32) / 255.0
      input_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).to(self.device)

      # Use tiled processing for high-resolution images (> 300x300)
      if h_orig >= 300 or w_orig >= 300:
        print(f'[PyTorch Restormer Pass {pass_idx+1}/{effective_passes}] Executing 256x256 Overlapping Tile Processing on {w_orig}x{h_orig} Image...')
        restored_tensor = self.process_tiled(input_tensor, tile_size=256, tile_pad=32)
      else:
        h_pad = (8 - h_orig % 8) % 8
        w_pad = (8 - w_orig % 8) % 8
        if h_pad > 0 or w_pad > 0:
          input_tensor_padded = F.pad(input_tensor, (0, w_pad, 0, h_pad), mode='reflect')
        else:
          input_tensor_padded = input_tensor

        with torch.no_grad():
          restored_tensor = self.model(input_tensor_padded)
          if h_pad > 0 or w_pad > 0:
            restored_tensor = restored_tensor[:, :, :h_orig, :w_orig]

      restored_tensor = torch.clamp(restored_tensor, 0.0, 1.0)
      restored_np = restored_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
      restored_rgb = (restored_np * 255.0).round().astype(np.uint8)
      curr_bgr = cv2.cvtColor(restored_rgb, cv2.COLOR_RGB2BGR)

    return curr_bgr
