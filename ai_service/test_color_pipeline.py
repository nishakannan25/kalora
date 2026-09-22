import cv2
import numpy as np
import os
from model_restoration import PyTorchRealESRGANEngine

def create_color_palette_test_image():
  """Creates a multi-color reference image with Red, Green, Blue, Yellow, Skin Tone, and Craft Textures."""
  img = np.zeros((240, 320, 3), dtype=np.uint8)

  # Color blocks in BGR order for OpenCV
  img[0:80, 0:106] = [0, 0, 255]       # Bright Red
  img[0:80, 106:212] = [0, 255, 0]     # Bright Green
  img[0:80, 212:320] = [255, 0, 0]     # Bright Blue

  img[80:160, 0:106] = [0, 255, 255]    # Bright Yellow
  img[80:160, 106:212] = [180, 150, 220] # Indian Craft Saree Pink
  img[80:160, 212:320] = [140, 180, 210] # Warm Skin Tone

  img[160:240, 0:160] = [255, 255, 255] # Pure White
  img[160:240, 160:320] = [30, 40, 60]  # Deep Terracotta Clay

  # Add text labels
  cv2.putText(img, "RED", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
  cv2.putText(img, "GREEN", (120, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
  cv2.putText(img, "BLUE", (230, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
  cv2.putText(img, "YELLOW", (15, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
  cv2.putText(img, "SAREE PINK", (110, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
  cv2.putText(img, "SKIN TONE", (220, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

  # Apply slight blur to test restoration
  img_blurred = cv2.GaussianBlur(img, (7, 7), 2.0)
  return img_blurred

def main():
  print("=" * 70)
  print("REAL-ESRGAN COLOR INTEGRITY & TENSOR PIPELINE VERIFICATION")
  print("=" * 70)

  outputs_dir = os.path.join(os.path.dirname(__file__), "test_outputs")
  os.makedirs(outputs_dir, exist_ok=True)

  input_path = os.path.join(outputs_dir, "test_color_input.png")
  output_path = os.path.join(outputs_dir, "test_color_output.png")

  # 1. Create color reference image
  img_input = create_color_palette_test_image()
  cv2.imwrite(input_path, img_input)
  print(f"[Test Step 1] Created multi-color reference image: {input_path}")

  # 2. Initialize Real-ESRGAN model engine
  print("[Test Step 2] Loading Official Real-ESRGAN Pretrained Model...")
  engine = PyTorchRealESRGANEngine(scale=4)

  # 3. Perform PyTorch model inference
  print("[Test Step 3] Executing PyTorch Deep Neural Network Model Inference...")
  res = engine.process(img_input, clarity_strength=90.0)

  img_output = res['enhanced_bgr']
  cv2.imwrite(output_path, img_output)
  print(f"[Test Step 4] Saved Real-ESRGAN restored image: {output_path}")

  # 5. Verify Color Channels Programmatically
  # Check Red block top-left pixel color in output (BGR format: index 2 should be > 180, index 0 should be < 50)
  red_block_pixel = img_output[100, 100] # Inside Red block at scale 4 (40*4, 25*4)
  green_block_pixel = img_output[100, 500] # Inside Green block at scale 4 (40*4, 125*4)
  blue_block_pixel = img_output[100, 900] # Inside Blue block at scale 4 (40*4, 225*4)

  print("\n" + "=" * 70)
  print("COLOR VERIFICATION RESULTS:")
  print("=" * 70)
  print(f"- Red Block Pixel (BGR)   : {red_block_pixel.tolist()} (Expected Red component BGR[2] high)")
  print(f"- Green Block Pixel (BGR) : {green_block_pixel.tolist()} (Expected Green component BGR[1] high)")
  print(f"- Blue Block Pixel (BGR)  : {blue_block_pixel.tolist()} (Expected Blue component BGR[0] high)")
  print("----------------------------------------------------------------------")
  print(f"- Original Dimensions     : {res['original_dimensions']['width']} x {res['original_dimensions']['height']}")
  print(f"- Enhanced Dimensions     : {res['enhanced_dimensions']['width']} x {res['enhanced_dimensions']['height']} (4x Super-Resolution)")
  print(f"- Original SHA256 Hash    : {res['original_sha256']}")
  print(f"- Enhanced SHA256 Hash    : {res['enhanced_sha256']}")
  print(f"- Genuinely Different     : {res['is_genuinely_different']}")
  print("=" * 70)

  # Assertions
  assert res['enhanced_dimensions']['width'] == 1280, "Width must be 1280 (320 * 4)"
  assert res['enhanced_dimensions']['height'] == 960, "Height must be 960 (240 * 4)"
  assert res['is_genuinely_different'] is True, "Hashes must be genuinely different"

  # Verify Red block is actually RED (Red > Blue and Red > 150)
  assert red_block_pixel[2] > red_block_pixel[0] + 80, "Red channel must dominate in Red block (no blue artifacting!)"
  assert green_block_pixel[1] > green_block_pixel[0] + 80, "Green channel must dominate in Green block"
  assert blue_block_pixel[0] > blue_block_pixel[2] + 80, "Blue channel must dominate in Blue block"

  print("\n[VERIFICATION PASSED] Real-ESRGAN Model Color Integrity & 4x Super-Resolution 100% SUCCESS! 🎉")

if __name__ == "__main__":
  main()
