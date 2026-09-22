import cv2
import numpy as np
import json
from pattern_analyzer import PatternAnalyzer

def main():
  print("=" * 70)
  print("TESTING SHOE PAIR PATTERN & COLOR MISMATCH ANALYSIS")
  print("=" * 70)

  # Create a synthetic image of two mismatched shoes side by side
  # Left Shoe: Pink/Multicolor floral (HSV pattern)
  # Right Shoe: Black/White polka-dot pattern
  img = np.zeros((400, 600, 3), dtype=np.uint8)

  # Left Shoe region (Pink / Magenta background with cyan stripes)
  img[:, :270, 0] = 200 # B
  img[:, :270, 1] = 50  # G
  img[:, :270, 2] = 250 # R
  cv2.circle(img, (130, 200), 60, (255, 255, 0), -1)

  # Right Shoe region (Black background with white dots)
  cv2.rectangle(img, (330, 0), (600, 400), (20, 20, 20), -1)
  for cx in range(360, 580, 50):
    for cy in range(50, 380, 50):
      cv2.circle(img, (cx, cy), 15, (240, 240, 240), -1)

  cv2.imwrite("diagnostic_outputs/mismatched_shoes_test.png", img)

  analyzer = PatternAnalyzer()
  res = analyzer.analyze(img, forced_category="shoes")

  print("\n--- STRUCTURED SHOE PAIR MISMATCH ANALYSIS JSON OUTPUT ---")
  print(json.dumps(res, indent=2))
  print("=" * 70)

  assert res["object"]["category"] == "shoes", "Category must be shoes"
  assert "pair_analysis" in res, "Must contain pair_analysis"
  assert res["pair_analysis"]["mismatch_detected"] == True, "Mismatch MUST be detected for different left/right patterns!"

  print("\n[VERIFICATION PASSED] Shoe Pair Mismatch Analyzer 100% OPERATIONAL! 🎉")

if __name__ == "__main__":
  main()
