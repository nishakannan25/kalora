import cv2
import numpy as np
import os
from model_deblur import PyTorchRestormerDebblurEngine

def main():
  print("=" * 65)
  print("STAGE 1: PYTORCH RESTORMER MOTION DEBLURRING TEST")
  print("=" * 65)

  outputs_dir = os.path.join(os.path.dirname(__file__), "test_stage1_outputs")
  os.makedirs(outputs_dir, exist_ok=True)

  # 1. Create a synthetic blurry saree texture sample
  img_blank = np.full((240, 320, 3), (110, 130, 190), dtype=np.uint8)
  cv2.rectangle(img_blank, (50, 50), (270, 190), (60, 80, 220), -1)
  cv2.putText(img_blank, "SAREE FABRIC BORDER", (60, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

  # Apply heavy camera blur (Gaussian blur 9x9)
  blurry_img = cv2.GaussianBlur(img_blank, (9, 9), 3.0)

  orig_path = os.path.join(outputs_dir, "original_blurry.png")
  deblur_path = os.path.join(outputs_dir, "deblurred_restormer.png")
  cv2.imwrite(orig_path, blurry_img)

  # Calculate initial blur score (Variance of Laplacian)
  orig_gray = cv2.cvtColor(blurry_img, cv2.COLOR_BGR2GRAY)
  orig_blur_score = cv2.Laplacian(orig_gray, cv2.CV_64F).var()

  print(f"[Stage 1 Test] Original Image Saved: {orig_path}")
  print(f"[Stage 1 Test] Original Blur Score (Variance of Laplacian): {orig_blur_score:.2f}")

  # 2. Run Stage 1 PyTorch Restormer Motion Deblurring
  print("\n[Stage 1 Test] Initializing PyTorch Restormer Deblurring Engine...")
  restormer_engine = PyTorchRestormerDebblurEngine()

  print("[Stage 1 Test] Executing Restormer Motion Deblurring Transformer...")
  deblurred_bgr = restormer_engine.process(blurry_img)

  cv2.imwrite(deblur_path, deblurred_bgr)

  # Calculate restored blur score
  deblur_gray = cv2.cvtColor(deblurred_bgr, cv2.COLOR_BGR2GRAY)
  deblur_blur_score = cv2.Laplacian(deblur_gray, cv2.CV_64F).var()

  print(f"[Stage 1 Test] Restormer Deblurred Image Saved: {deblur_path}")
  print(f"[Stage 1 Test] Restored Blur Score: {deblur_blur_score:.2f}")
  print(f"[Stage 1 Test] Clarity Improvement Factor: {(deblur_blur_score / orig_blur_score):.2f}x sharper!")

  assert deblur_blur_score > orig_blur_score, "Restormer must increase sharpness score"
  print("\n[VERIFICATION PASSED] Stage 1 PyTorch Restormer Deblurring 100% SUCCESS! 🎉")

if __name__ == "__main__":
  main()
