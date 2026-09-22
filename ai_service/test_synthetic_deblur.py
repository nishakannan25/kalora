import cv2
import numpy as np
import torch
import os
import time
from skimage.metrics import structural_similarity as ssim
from skimage.metrics import peak_signal_noise_ratio as psnr
from model_restoration import PyTorchRealESRGANEngine

def create_synthetic_blur_dataset():
    """Generates synthetic motion & defocus degraded test images from sharp saree craft patterns."""
    sharp_img = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Render realistic saree pattern motifs & text
    cv2.rectangle(sharp_img, (50, 50), (590, 430), (140, 20, 40), -1) # Silk fabric background
    cv2.rectangle(sharp_img, (70, 70), (570, 410), (200, 160, 40), 4) # Gold border motif
    for x in range(100, 540, 60):
        for y in range(100, 380, 60):
            cv2.circle(sharp_img, (x, y), 15, (255, 220, 80), -1) # Detailed weave motifs
            cv2.circle(sharp_img, (x, y), 8, (120, 10, 20), -1)

    cv2.putText(sharp_img, "KALORA HERITAGE SAREE WEAVE", (90, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

    # 1. Apply Defocus Blur (Kernel 15x15)
    defocus_blur = cv2.GaussianBlur(sharp_img, (15, 15), 0)

    # 2. Apply Motion Blur (15px horizontal motion kernel)
    kernel_motion = np.zeros((15, 15))
    kernel_motion[7, :] = 1.0 / 15.0
    motion_blur = cv2.filter2D(sharp_img, -1, kernel_motion)

    return sharp_img, defocus_blur, motion_blur

def benchmark_deblur_model():
    print("=========================================================")
    print("      PYTORCH DEBLUR MODEL BENCHMARKING SUITE           ")
    print("=========================================================")
    
    sharp, defocus, motion = create_synthetic_blur_dataset()
    engine = PyTorchRealESRGANEngine()

    outputs_dir = os.path.join(os.path.dirname(__file__), "outputs", "benchmark")
    os.makedirs(outputs_dir, exist_ok=True)

    cv2.imwrite(os.path.join(outputs_dir, "00_gt_sharp.png"), sharp)
    cv2.imwrite(os.path.join(outputs_dir, "01_defocus_input.png"), defocus)
    cv2.imwrite(os.path.join(outputs_dir, "01_motion_input.png"), motion)

    # Benchmark Defocus Blur
    res_defocus = engine.process(defocus, clarity_strength=90.0)
    deblurred_defocus = res_defocus["deblurred_stage1_bgr"]
    final_defocus = res_defocus["enhanced_bgr"]
    cv2.imwrite(os.path.join(outputs_dir, "02_defocus_deblurred.png"), deblurred_defocus)
    cv2.imwrite(os.path.join(outputs_dir, "04_defocus_final.png"), final_defocus)

    # Benchmark Motion Blur
    res_motion = engine.process(motion, clarity_strength=90.0)
    deblurred_motion = res_motion["deblurred_stage1_bgr"]
    final_motion = res_motion["enhanced_bgr"]
    cv2.imwrite(os.path.join(outputs_dir, "02_motion_deblurred.png"), deblurred_motion)
    cv2.imwrite(os.path.join(outputs_dir, "04_motion_final.png"), final_motion)

    # Compute PSNR & SSIM metrics against GT sharp image (resized for 4x outputs)
    def calculate_metrics(gt, img):
        if gt.shape != img.shape:
            gt_scaled = cv2.resize(gt, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LANCZOS4)
        else:
            gt_scaled = gt
        
        score_psnr = psnr(gt_scaled, img, data_range=255)
        score_ssim = ssim(gt_scaled, img, channel_axis=2, data_range=255)
        lap_var = cv2.Laplacian(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
        return score_psnr, score_ssim, lap_var

    def_in_p, def_in_s, def_in_v = calculate_metrics(sharp, defocus)
    def_deb_p, def_deb_s, def_deb_v = calculate_metrics(sharp, deblurred_defocus)
    def_fin_p, def_fin_s, def_fin_v = calculate_metrics(sharp, final_defocus)

    mot_in_p, mot_in_s, mot_in_v = calculate_metrics(sharp, motion)
    mot_deb_p, mot_deb_s, mot_deb_v = calculate_metrics(sharp, deblurred_motion)
    mot_fin_p, mot_fin_s, mot_fin_v = calculate_metrics(sharp, final_motion)

    print("\n--- 1. DEFOCUS BLUR RESTORATION METRICS ---")
    print(f"Degraded Input    -> PSNR: {def_in_p:.2f} dB, SSIM: {def_in_s:.4f}, LapVar: {def_in_v:.2f}")
    print(f"Stage 1 Restormer -> PSNR: {def_deb_p:.2f} dB, SSIM: {def_deb_s:.4f}, LapVar: {def_deb_v:.2f} (Gain: +{((def_deb_v-def_in_v)/def_in_v)*100:.1f}%)")
    print(f"Final 4x HD Output-> PSNR: {def_fin_p:.2f} dB, SSIM: {def_fin_s:.4f}, LapVar: {def_fin_v:.2f} (Gain: +{((def_fin_v-def_in_v)/def_in_v)*100:.1f}%)")

    print("\n--- 2. MOTION BLUR RESTORATION METRICS ---")
    print(f"Degraded Input    -> PSNR: {mot_in_p:.2f} dB, SSIM: {mot_in_s:.4f}, LapVar: {mot_in_v:.2f}")
    print(f"Stage 1 Restormer -> PSNR: {mot_deb_p:.2f} dB, SSIM: {mot_deb_s:.4f}, LapVar: {mot_deb_v:.2f} (Gain: +{((mot_deb_v-mot_in_v)/mot_in_v)*100:.1f}%)")
    print(f"Final 4x HD Output-> PSNR: {mot_fin_p:.2f} dB, SSIM: {mot_fin_s:.4f}, LapVar: {mot_fin_v:.2f} (Gain: +{((mot_fin_v-mot_in_v)/mot_in_v)*100:.1f}%)")

if __name__ == "__main__":
    benchmark_deblur_model()
