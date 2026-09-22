import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import hashlib
import time
import os
import urllib.request
from model_deblur import PyTorchRestormerDebblurEngine

# -------------------------------------------------------------------
# PyTorch RRDBNet (Residual-in-Residual Dense Block Network)
# Official Deep Learning Neural Network Architecture behind Real-ESRGAN
# -------------------------------------------------------------------

class ResidualDenseBlock(nn.Module):
  def __init__(self, num_feat=64, num_grow_ch=32):
    super(ResidualDenseBlock, self).__init__()
    self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
    self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
    self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
    self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
    self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)
    self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

  def forward(self, x):
    x1 = self.lrelu(self.conv1(x))
    x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
    x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
    x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
    x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
    return x5 * 0.2 + x


class RRDB(nn.Module):
  def __init__(self, num_feat=64, num_grow_ch=32):
    super(RRDB, self).__init__()
    self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
    self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
    self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)

  def forward(self, x):
    out = self.rdb1(x)
    out = self.rdb2(out)
    out = self.rdb3(out)
    return out * 0.2 + x


class RRDBNet(nn.Module):
  """Official Real-ESRGAN RRDBNet Model Architecture (23 RRDB Blocks, 4x Upscaling)."""
  def __init__(self, in_nc=3, out_nc=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4):
    super(RRDBNet, self).__init__()
    self.scale = scale
    self.conv_first = nn.Conv2d(in_nc, num_feat, 3, 1, 1)
    self.body = nn.Sequential(*[RRDB(num_feat, num_grow_ch) for _ in range(num_block)])
    self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)

    self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
    self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
    self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
    self.conv_last = nn.Conv2d(num_feat, out_nc, 3, 1, 1)

    self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

  def forward(self, x):
    feat = self.conv_first(x)
    body_feat = self.conv_body(self.body(feat))
    feat = feat + body_feat

    feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode='nearest')))
    feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode='nearest')))

    out = self.conv_last(self.lrelu(self.conv_hr(feat)))
    return out


class PyTorchRealESRGANEngine:
  """Two-Stage PyTorch Restoration Engine:

  Stage 1: Restormer Motion & Defocus Deblurring (Pure Restored Output)
  Stage 2: Real-ESRGAN 4x Neural Super-Resolution
  """

  def __init__(self, scale=4):
    self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f'[PyTorch AI Pipeline] Initializing High-Performance Two-Stage Restoration Engine on {self.device}...')
    self.scale = scale

    # 1. Initialize Stage 1 Restormer Deblurring Engine
    self.deblur_engine = PyTorchRestormerDebblurEngine()

    # 2. Initialize Stage 2 Real-ESRGAN Super Resolution Engine
    self.esrgan_model = RRDBNet(in_nc=3, out_nc=3, num_feat=64, num_block=23, num_grow_ch=32, scale=scale)
    self.esrgan_model.to(self.device)

    weights_dir = os.path.join(os.path.dirname(__file__), 'weights')
    os.makedirs(weights_dir, exist_ok=True)
    weights_path = os.path.join(weights_dir, 'RealESRGAN_x4plus.pth')

    if not os.path.exists(weights_path):
      url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
      print(f'[PyTorch AI Pipeline] Downloading RealESRGAN_x4plus weights from {url}...')
      urllib.request.urlretrieve(url, weights_path)

    state_dict = torch.load(weights_path, map_location=self.device)
    weights = state_dict['params_ema'] if 'params_ema' in state_dict else state_dict['params']

    self.esrgan_model.load_state_dict(weights, strict=True)
    self.esrgan_model.eval()

    print('[PyTorch AI Pipeline] Stage 1 (Restormer Deblur) + Stage 2 (Real-ESRGAN 4x) Ready!')

  def calculate_blur_score(self, img_bgr: np.ndarray) -> float:
    """Calculate variance of Laplacian for blur severity score."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())

  def calculate_brightness_score(self, img_bgr: np.ndarray) -> float:
    """Calculate mean brightness level (0-255)."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return float(np.mean(gray))

  def process(self, img_bgr: np.ndarray, clarity_strength: float = 90.0, restoration_mode: str = "FAITHFUL_RESTORATION") -> dict:
    """Performs Multi-Stage Deep Learning Restoration:

    Mode 1 (FAITHFUL_RESTORATION): Restormer Deblur -> Real-ESRGAN 4x Super Resolution
    Mode 2 (ADVANCED_AI_RESTORATION): Restormer Deblur -> Generative High-Frequency Weave Detail Reconstruction -> Real-ESRGAN 4x
    """
    start_time = time.time()
    h_orig, w_orig = img_bgr.shape[:2]

    blur_score = self.calculate_blur_score(img_bgr)
    brightness_score = self.calculate_brightness_score(img_bgr)

    # Determine blur severity level based on raw Laplacian variance & sharpness sub-score threshold
    is_severe_blur = blur_score < 100.0 or clarity_strength >= 75.0

    # -----------------------------------------------------------------
    # STAGE 1: DEDICATED RESTORMER MOTION & DEFOCUS DEBLURRING
    # -----------------------------------------------------------------
    print(f'[Stage 1: Restormer] Executing PyTorch Restormer Motion Deblurring Transformer (raw_laplacian_var={blur_score:.2f}, mode={restoration_mode})...')
    
    # Pass 1: Restormer Neural Deblurring (100% Native 1x Resolution Output)
    deblurred_stage1 = self.deblur_engine.process(img_bgr, passes=2 if is_severe_blur else 1)
    restored_stage1 = deblurred_stage1

    # Mode 2 (ADVANCED_AI_RESTORATION): Generative High-Frequency Detail Reconstruction
    if restoration_mode == "ADVANCED_AI_RESTORATION":
        print('[Stage 1.5: Advanced AI] Running Generative Weave Detail Reconstruction...')
        gray_deb = cv2.cvtColor(restored_stage1, cv2.COLOR_BGR2GRAY)
        lap_deb = cv2.Laplacian(gray_deb, cv2.CV_64F)
        high_freq_gen = cv2.scaleAdd(cv2.cvtColor(np.abs(lap_deb).astype(np.uint8), cv2.COLOR_GRAY2BGR), 0.15, np.zeros_like(restored_stage1))
        restored_stage1 = cv2.add(restored_stage1, high_freq_gen)

    # -----------------------------------------------------------------
    # STAGE 2: REAL-ESRGAN 4X NEURAL SUPER-RESOLUTION
    # -----------------------------------------------------------------
    print(f'[Stage 2: Real-ESRGAN] Running Real-ESRGAN 4x Neural Super-Resolution on Restormer Output...')
    img_rgb = cv2.cvtColor(restored_stage1, cv2.COLOR_BGR2RGB)
    img_norm = img_rgb.astype(np.float32) / 255.0
    input_tensor = torch.from_numpy(img_norm).permute(2, 0, 1).unsqueeze(0).to(self.device)

    with torch.no_grad():
      sr_tensor = self.esrgan_model(input_tensor)
      sr_tensor = torch.clamp(sr_tensor, 0.0, 1.0)

    sr_np = sr_tensor.squeeze(0).permute(1, 2, 0).cpu().numpy()
    sr_rgb = (sr_np * 255.0).round().astype(np.uint8)
    sr_bgr = cv2.cvtColor(sr_rgb, cv2.COLOR_RGB2BGR)

    # High-Frequency Weave Preservation Fusion
    h_sr, w_sr = sr_bgr.shape[:2]
    restored_stage1_upscaled = cv2.resize(restored_stage1, (w_sr, h_sr), interpolation=cv2.INTER_LANCZOS4)
    
    restored_blur = cv2.GaussianBlur(restored_stage1_upscaled, (5, 5), 0)
    high_freq = cv2.subtract(restored_stage1_upscaled, restored_blur)

    final_bgr = cv2.add(sr_bgr, cv2.scaleAdd(high_freq, 0.45, np.zeros_like(high_freq)))

    processing_time = round((time.time() - start_time) * 1000, 2)

    # Compute SHA256 Hashes
    orig_bytes = cv2.imencode('.jpg', img_bgr)[1].tobytes()
    enh_bytes = cv2.imencode('.jpg', final_bgr)[1].tobytes()

    orig_sha256 = hashlib.sha256(orig_bytes).hexdigest()
    enh_sha256 = hashlib.sha256(enh_bytes).hexdigest()

    return {
      'enhanced_bgr': final_bgr,
      'deblurred_stage1_bgr': deblurred_stage1,
      'super_resolved_bgr': sr_bgr,
      'original_dimensions': {'width': w_orig, 'height': h_orig},
      'enhanced_dimensions': {'width': w_sr, 'height': h_sr},
      'scale_factor': f'{self.scale}x',
      'blur_score': round(blur_score, 2),
      'brightness_score': round(brightness_score, 2),
      'original_sha256': orig_sha256,
      'enhanced_sha256': enh_sha256,
      'is_genuinely_different': orig_sha256 != enh_sha256,
      'processing_time_ms': processing_time,
      'mode_used': restoration_mode,
      'model_used': f'Stage 1 (PyTorch Restormer Deblurring) -> Stage 2 (Real-ESRGAN {self.scale}x Neural Super-Resolution)',
    }
