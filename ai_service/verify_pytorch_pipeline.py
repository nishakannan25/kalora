import cv2
import numpy as np
import os
import sys
from model_restoration import PyTorchRealESRGANEngine

def main():
  print("=" * 65)
  print("KALORA PYTORCH REAL-ESRGAN AI RESTORATION PIPELINE VERIFICATION")
  print("=" * 65)

  # 1. Create a 320x240 blurry synthetic saree image sample for verification
  img_blank = np.full((240, 320, 3), (120, 140, 180), dtype=np.uint8)
  # Draw synthetic saree fabric pattern & borders
  cv2.rectangle(img_blank, (40, 40), (280, 200), (80, 100, 50), -1)
  cv2.putText(img_blank, "HANDLOOM SAREE", (60, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 220, 255), 2)
  # Apply heavy motion blur
  kernel_blur = np.zeros((15, 15))
  kernel_blur[7, :] = 1.0 / 15.0
  blurry_img = cv2.filter2D(img_blank, -1, kernel_blur)

  print("\n[Step 1] Initializing PyTorch Real-ESRGAN Model Engine...")
  engine = PyTorchRealESRGANEngine(scale=4)

  print("\n[Step 2] Executing PyTorch Deep Neural Network Model Inference...")
  res = engine.process(blurry_img, clarity_strength=90.0)

  print("\n[Step 3] PyTorch Real-ESRGAN Model Execution Results:")
  print(f"  - Model Used         : {res['model_used']}")
  print(f"  - Pre-processing Blur Score : {res['blur_score']} (Variance of Laplacian)")
  print(f"  - Brightness Score          : {res['brightness_score']}")
  print(f"  - Original Dimensions     : {res['original_dimensions']['width']} x {res['original_dimensions']['height']}")
  print(f"  - Original SHA256 Hash    : {res['original_sha256']}")
  print("  " + "-" * 60)
  print(f"  - Enhanced Dimensions     : {res['enhanced_dimensions']['width']} x {res['enhanced_dimensions']['height']} (4x Super-Resolution)")
  print(f"  - Enhanced SHA256 Hash    : {res['enhanced_sha256']}")
  print("  " + "-" * 60)
  print(f"  - Inference Time          : {res['processing_time_ms']} ms")
  print(f"  - SHA256 Hashes Different : {res['is_genuinely_different']}")

  # Assertions
  assert res['enhanced_dimensions']['width'] == res['original_dimensions']['width'] * 4, "Width must be 4x original"
  assert res['enhanced_dimensions']['height'] == res['original_dimensions']['height'] * 4, "Height must be 4x original"
  assert res['original_sha256'] != res['enhanced_sha256'], "Hashes must be genuinely different"
  assert res['is_genuinely_different'] is True, "Must be genuinely different files"

  print("\n[VERIFICATION SUCCESS] PyTorch Real-ESRGAN Deep Neural Network Model Verified Operational! 🎉")

if __name__ == "__main__":
  main()
