import cv2
import numpy as np
import torch
import os
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr
from model_deblur import PyTorchRestormerDebblurEngine

def run_standalone_deblur_diagnostic():
    print("=================================================================")
    print("   STANDALONE STAGE 1 RESTORMER DEBLURRING DIAGNOSTIC SUITE     ")
    print("=================================================================")
    
    engine = PyTorchRestormerDebblurEngine()
    out_dir = os.path.join(os.path.dirname(__file__), "outputs", "standalone_deblur")
    os.makedirs(out_dir, exist_ok=True)

    # 1. Load or Generate Sharp Ground Truth Saree Motif Image
    gt_path = os.path.join(os.path.dirname(__file__), "outputs", "original_image_915639435582500.jpg")
    if os.path.exists(gt_path):
        gt = cv2.imread(gt_path)
    else:
        gt = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(gt, (40, 40), (600, 440), (120, 20, 40), -1)
        cv2.putText(gt, "KALORA HERITAGE WEAVE MOTIF", (80, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # 2. Synthesize Degradations
    # Motion Blur
    k_motion = np.zeros((15, 15))
    k_motion[7, :] = 1.0 / 15.0
    motion_blur = cv2.filter2D(gt, -1, k_motion)

    # Defocus Blur
    defocus_blur = cv2.GaussianBlur(gt, (15, 15), 0)

    # Gaussian Blur
    gauss_blur = cv2.GaussianBlur(gt, (21, 21), 0)

    degradations = {
        "motion": motion_blur,
        "defocus": defocus_blur,
        "gaussian": gauss_blur
    }

    def calc_metrics(orig, deblurred):
        p = psnr(orig, deblurred, data_range=255)
        s = ssim(orig, deblurred, channel_axis=2, data_range=255)
        gray = cv2.cvtColor(deblurred, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        tenengrad = float(np.mean(cv2.magnitude(sobelx, sobely)**2))
        edge_density = float(np.mean(cv2.Canny(gray, 50, 150) > 0)) * 100.0
        return round(p, 2), round(s, 4), round(lap_var, 2), round(tenengrad, 2), round(edge_density, 2)

    print("\n--- STANDALONE RESTORMER DEBLUR EVALUATION ---")
    for name, deg_img in degradations.items():
        # Save debug_original.png
        orig_path = os.path.join(out_dir, f"debug_original_{name}.png")
        deb_path = os.path.join(out_dir, f"debug_deblurred_{name}.png")
        cv2.imwrite(orig_path, deg_img)

        # Run ONLY Stage 1 Restormer (No Real-ESRGAN, No Sharpening)
        deblurred_img = engine.process(deg_img, passes=2)
        cv2.imwrite(deb_path, deblurred_img)

        deg_p, deg_s, deg_v, deg_t, deg_e = calc_metrics(gt, deg_img)
        deb_p, deb_s, deb_v, deb_t, deb_e = calc_metrics(gt, deblurred_img)

        print(f"\nDegradation Type: {name.upper()}")
        print(f"  debug_original.png  -> PSNR: {deg_p} dB | SSIM: {deg_s} | LapVar: {deg_v} | Tenengrad: {deg_t} | EdgeDensity: {deg_e}%")
        print(f"  debug_deblurred.png -> PSNR: {deb_p} dB | SSIM: {deb_s} | LapVar: {deb_v} | Tenengrad: {deb_t} | EdgeDensity: {deb_e}%")
        print(f"  Detail Variance Gain: +{((deb_v - deg_v) / max(0.01, deg_v)) * 100.0:.1f}%")

if __name__ == "__main__":
    run_standalone_deblur_diagnostic()
