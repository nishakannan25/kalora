import torch
import numpy as np
import cv2
import os
import hashlib
from model_deblur import Restormer, PyTorchRestormerDebblurEngine
from model_restoration import PyTorchRealESRGANEngine, RRDBNet

def run_deep_pipeline_trace():
    print("=================================================================")
    print("        KALORA DEEP PYTORCH PIPELINE & CHECKPOINT TRACE          ")
    print("=================================================================")

    # 1. VERIFY CUDA & DEVICE
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"1. PyTorch Version: {torch.__version__}")
    print(f"   CUDA Available:  {torch.cuda.is_available()}")
    print(f"   Running Device:  {device}")

    # 2. AUDIT CHECKPOINT FILES & PARAMETER MATCHING
    weights_dir = os.path.join(os.path.dirname(__file__), "weights")
    motion_ckpt = os.path.join(weights_dir, "motion_deblurring.pth")
    esrgan_ckpt = os.path.join(weights_dir, "RealESRGAN_x4plus.pth")

    print(f"\n2. Stage 1 Restormer Checkpoint:")
    print(f"   Path: {os.path.abspath(motion_ckpt)}")
    print(f"   Exists: {os.path.exists(motion_ckpt)}")
    if os.path.exists(motion_ckpt):
        print(f"   Size: {os.path.getsize(motion_ckpt) / (1024*1024):.2f} MB")
        state_dict1 = torch.load(motion_ckpt, map_location=device)
        weights1 = state_dict1['params'] if 'params' in state_dict1 else state_dict1
        model1 = Restormer(inp_channels=3, out_channels=3, dim=48, num_blocks=[4, 6, 6, 8], num_refinement_blocks=4, heads=[1, 2, 4, 8], ffn_expansion_factor=2.66, bias=False)
        load_res1 = model1.load_state_dict(weights1, strict=True)
        print(f"   Strict Load Match: True (Missing Keys: {len(load_res1.missing_keys)}, Unexpected: {len(load_res1.unexpected_keys)})")
        total_params1 = sum(p.numel() for p in model1.parameters())
        print(f"   Total Trainable Parameters: {total_params1:,}")

    print(f"\n3. Stage 2 Real-ESRGAN Checkpoint:")
    print(f"   Path: {os.path.abspath(esrgan_ckpt)}")
    print(f"   Exists: {os.path.exists(esrgan_ckpt)}")
    if os.path.exists(esrgan_ckpt):
        print(f"   Size: {os.path.getsize(esrgan_ckpt) / (1024*1024):.2f} MB")
        state_dict2 = torch.load(esrgan_ckpt, map_location=device)
        weights2 = state_dict2['params_ema'] if 'params_ema' in state_dict2 else state_dict2['params']
        model2 = RRDBNet(in_nc=3, out_nc=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
        load_res2 = model2.load_state_dict(weights2, strict=True)
        print(f"   Strict Load Match: True (Missing Keys: {len(load_res2.missing_keys)}, Unexpected: {len(load_res2.unexpected_keys)})")
        total_params2 = sum(p.numel() for p in model2.parameters())
        print(f"   Total Trainable Parameters: {total_params2:,}")

    # 4. RUN RUNTIME TENSOR INFERENCE TRACE (INPUT vs OUTPUT TENSORS)
    img_path = os.path.join(os.path.dirname(__file__), "outputs", "original_image_915639435582500.jpg")
    if os.path.exists(img_path):
        img_bgr = cv2.imread(img_path)
    else:
        img_bgr = np.zeros((480, 640, 3), dtype=np.uint8)

    print("\n4. Tensor Processing & Range Audit (Stage 1 Restormer):")
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    img_tensor = torch.from_numpy(img_rgb.astype(np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0).to(device)

    print(f"   Input Tensor Shape: {img_tensor.shape}, Dtype: {img_tensor.dtype}")
    print(f"   Input Tensor Stats -> Min: {img_tensor.min():.4f}, Max: {img_tensor.max():.4f}, Mean: {img_tensor.mean():.4f}, Std: {img_tensor.std():.4f}")

    deblur_engine = PyTorchRestormerDebblurEngine()
    deblurred_bgr = deblur_engine.process(img_bgr, passes=2)

    deb_rgb = cv2.cvtColor(deblurred_bgr, cv2.COLOR_BGR2RGB)
    deb_tensor = torch.from_numpy(deb_rgb.astype(np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0).to(device)

    print(f"   Output Tensor Shape: {deb_tensor.shape}, Dtype: {deb_tensor.dtype}")
    print(f"   Output Tensor Stats -> Min: {deb_tensor.min():.4f}, Max: {deb_tensor.max():.4f}, Mean: {deb_tensor.mean():.4f}, Std: {deb_tensor.std():.4f}")

    # 5. DIFFERENTIAL METRICS (MAE, MSE, SHA256 HASHEST)
    orig_hash = hashlib.sha256(img_bgr.tobytes()).hexdigest()
    deb_hash = hashlib.sha256(deblurred_bgr.tobytes()).hexdigest()
    
    mae = float(np.mean(np.abs(img_bgr.astype(np.float32) - deblurred_bgr.astype(np.float32))))
    mse = float(np.mean((img_bgr.astype(np.float32) - deblurred_bgr.astype(np.float32)) ** 2))

    print("\n5. Differential Verification (Proving Output IS NOT Identity/Fallback):")
    print(f"   Original Image SHA256:  {orig_hash[:16]}...")
    print(f"   Deblurred Image SHA256: {deb_hash[:16]}...")
    print(f"   Images Are Identical:   {orig_hash == deb_hash}")
    print(f"   Mean Absolute Error (MAE): {mae:.4f}")
    print(f"   Mean Squared Error (MSE):  {mse:.4f}")

    # 6. SHARPNESS & TENENGRAD COMPARISON
    def get_metrics(img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        tenengrad = float(np.mean(cv2.magnitude(sobelx, sobely)**2))
        edge_density = float(np.mean(cv2.Canny(gray, 50, 150) > 0)) * 100.0
        return round(lap_var, 2), round(tenengrad, 2), round(edge_density, 2)

    orig_m = get_metrics(img_bgr)
    deb_m = get_metrics(deblurred_bgr)

    print("\n6. Objective Sharpness & Frequency Energy Comparison:")
    print(f"   ORIGINAL  -> Laplacian: {orig_m[0]}, Tenengrad: {orig_m[1]}, EdgeDensity: {orig_m[2]}%")
    print(f"   DEBLURRED -> Laplacian: {deb_m[0]}, Tenengrad: {deb_m[1]}, EdgeDensity: {deb_m[2]}%")
    print(f"   STAGE 1 DETAIL VARIANCE GAIN: +{((deb_m[0] - orig_m[0]) / max(0.01, orig_m[0])) * 100.0:.1f}%")

if __name__ == "__main__":
    run_deep_pipeline_trace()
