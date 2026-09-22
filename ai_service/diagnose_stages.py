import cv2
import numpy as np
import os
import torch
from model_deblur import PyTorchRestormerDebblurEngine
from model_restoration import PyTorchRealESRGANEngine

def calc_blur_score(img_bgr: np.ndarray) -> float:
  gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
  return float(cv2.Laplacian(gray, cv2.CV_64F).var())

def print_stats(name: str, img: np.ndarray):
  h, w, c = img.shape
  blur = calc_blur_score(img)
  print(f"[{name}] Shape: {w}x{h}x{c}, Range: [{img.min()}, {img.max()}], Mean: {img.mean():.2f}, Blur Score (Laplacian): {blur:.2f}")

def main():
  print("=" * 75)
  print("DIAGNOSTIC STAGE QUALITY AUDIT (ORIGINAL vs DEBLURRED vs SUPER-RES vs FINAL)")
  print("=" * 75)

  diag_dir = os.path.join(os.path.dirname(__file__), "diagnostic_outputs")
  os.makedirs(diag_dir, exist_ok=True)

  # Check for existing saree test images or generate saree test image
  artifacts_dir = r"C:\Users\nisha\.gemini\antigravity\brain\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc"
  sample_saree_path = os.path.join(artifacts_dir, "clear_beige_saree_hd_1789916990357.png")

  if os.path.exists(sample_saree_path):
    print(f"[Audit] Loading actual saree artifact: {sample_saree_path}")
    raw_img = cv2.imread(sample_saree_path)
    # Resize to realistic photo resolution and add realistic camera blur
    raw_img = cv2.resize(raw_img, (640, 480))
    blurry_input = cv2.GaussianBlur(raw_img, (11, 11), 3.5)
  else:
    print("[Audit] Generating realistic blurry saree texture image...")
    blurry_input = np.full((480, 640, 3), (120, 140, 200), dtype=np.uint8)
    cv2.rectangle(blurry_input, (80, 80), (560, 400), (50, 70, 210), -1)
    cv2.putText(blurry_input, "HANDLOOM SAREE PATTERN", (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
    blurry_input = cv2.GaussianBlur(blurry_input, (11, 11), 3.5)

  p1 = os.path.join(diag_dir, "01_original.png")
  p2 = os.path.join(diag_dir, "02_deblurred.png")
  p3 = os.path.join(diag_dir, "03_super_resolution.png")
  p4 = os.path.join(diag_dir, "04_final.png")

  # Save Stage 01: Original Blurry Image
  cv2.imwrite(p1, blurry_input)
  print_stats("01_original", blurry_input)

  # Run Stage 1: Restormer Deblurring
  print("\n--- Running Stage 1: PyTorch Restormer Motion Deblurring ---")
  deblur_engine = PyTorchRestormerDebblurEngine()
  
  # Stage 1 inference
  deblurred_img = deblur_engine.process(blurry_input)
  cv2.imwrite(p2, deblurred_img)
  print_stats("02_deblurred", deblurred_img)

  # Run Stage 2: Real-ESRGAN 4x Super Resolution
  print("\n--- Running Stage 2: PyTorch Real-ESRGAN 4x Neural Super Resolution ---")
  full_engine = PyTorchRealESRGANEngine(scale=4)
  res = full_engine.process(blurry_input, clarity_strength=90.0)

  super_res_img = res['enhanced_bgr']
  cv2.imwrite(p3, super_res_img)
  print_stats("03_super_resolution", super_res_img)

  # Final output
  final_img = res['enhanced_bgr']
  cv2.imwrite(p4, final_img)
  print_stats("04_final", final_img)

  print("\n" + "=" * 75)
  print("STAGE DIAGNOSIS SUMMARY:")
  print("=" * 75)
  print(f"1. 01_original.png          : Saved to {p1}")
  print(f"2. 02_deblurred.png         : Saved to {p2}")
  print(f"3. 03_super_resolution.png  : Saved to {p3}")
  print(f"4. 04_final.png             : Saved to {p4}")
  print("=" * 75)

if __name__ == "__main__":
  main()
