import cv2
import numpy as np
import os
from model_restoration import PyTorchRealESRGANEngine

def main():
  print("=" * 70)
  print("TWO-STAGE PIPELINE VERIFICATION: STAGE 1 (RESTORMER) + STAGE 2 (REAL-ESRGAN)")
  print("=" * 70)

  outputs_dir = os.path.join(os.path.dirname(__file__), "test_debug_outputs")
  os.makedirs(outputs_dir, exist_ok=True)

  # 1. Create blurry saree sample image
  img_blank = np.full((240, 320, 3), (120, 140, 200), dtype=np.uint8)
  cv2.rectangle(img_blank, (40, 40), (280, 200), (50, 70, 210), -1)
  cv2.putText(img_blank, "HANDLOOM SAREE WEAVE", (50, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
  blurry_input = cv2.GaussianBlur(img_blank, (9, 9), 3.0)

  p1 = os.path.join(outputs_dir, "1_original.png")
  p2 = os.path.join(outputs_dir, "2_deblurred_stage1.png")
  p3 = os.path.join(outputs_dir, "3_super_resolved_stage2.png")
  p4 = os.path.join(outputs_dir, "4_final.png")

  cv2.imwrite(p1, blurry_input)

  # 2. Initialize Two-Stage PyTorch Engine
  print("\n[Step 1] Loading Two-Stage PyTorch Engine (Restormer + Real-ESRGAN)...")
  engine = PyTorchRealESRGANEngine(scale=4)

  # 3. Process image through Two-Stage Pipeline
  print("[Step 2] Executing Two-Stage PyTorch Inference...")
  res = engine.process(blurry_input, clarity_strength=90.0)

  cv2.imwrite(p2, res['deblurred_stage1_bgr'])
  cv2.imwrite(p3, res['enhanced_bgr'])
  cv2.imwrite(p4, res['enhanced_bgr'])

  orig_score = cv2.Laplacian(cv2.cvtColor(blurry_input, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
  stage1_score = cv2.Laplacian(cv2.cvtColor(res['deblurred_stage1_bgr'], cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
  stage2_score = cv2.Laplacian(cv2.cvtColor(res['enhanced_bgr'], cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()

  print("\n" + "=" * 70)
  print("TWO-STAGE PIPELINE RESULTS:")
  print("=" * 70)
  print(f"- 1. Original Image Saved        : {p1}")
  print(f"  * Dimensions                   : {res['original_dimensions']['width']} x {res['original_dimensions']['height']}")
  print(f"  * Blur Score (Laplacian)      : {orig_score:.2f}")
  print("----------------------------------------------------------------------")
  print(f"- 2. Stage 1 (Restormer Deblur) : {p2}")
  print(f"  * Stage 1 Restored Blur Score : {stage1_score:.2f} (Clarity Increase!)")
  print("----------------------------------------------------------------------")
  print(f"- 3. Stage 2 (Real-ESRGAN 4x)   : {p3}")
  print(f"  * Final Dimensions             : {res['enhanced_dimensions']['width']} x {res['enhanced_dimensions']['height']} (4x Neural Super-Res)")
  print(f"  * Stage 2 Blur Score           : {stage2_score:.2f}")
  print(f"  * SHA256 Hashes Different      : {res['is_genuinely_different']}")
  print("=" * 70)

  # Assertions
  assert stage1_score > orig_score, "Stage 1 Restormer must increase sharpness"
  assert res['enhanced_dimensions']['width'] == 1280, "Stage 2 must upscale width to 1280 (320 * 4)"
  assert res['is_genuinely_different'] is True, "Original and final image hashes must differ"

  print("\n[VERIFICATION PASSED] Two-Stage PyTorch Restoration Pipeline 100% OPERATIONAL! 🎉")

if __name__ == "__main__":
  main()
