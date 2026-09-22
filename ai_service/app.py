import base64
import os
import cv2
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model_restoration import PyTorchRealESRGANEngine
from pattern_analyzer import PatternAnalyzer

app = FastAPI(title="KALORA PyTorch Real-ESRGAN AI Service")

# Enable CORS for Next.js & Node.js
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Initialize PyTorch AI Model Inference Engine & Pattern Analyzer
print("[FastAPI AI Server] Loading PyTorch Real-ESRGAN Model & Pattern Analyzer...")
pytorch_engine = PyTorchRealESRGANEngine(scale=4)
pattern_analyzer = PatternAnalyzer()

# Create outputs directory for saving images
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUTS_DIR, exist_ok=True)

class EnhanceRequest(BaseModel):
  image: str
  clarityStrength: float = 90.0

@app.get("/health")
def health():
  return {
    "status": "ok",
    "service": "KALORA PyTorch Real-ESRGAN AI Restoration Service",
    "model": "PyTorch Restormer + Real-ESRGAN (4x Super-Resolution)",
    "device": str(pytorch_engine.device),
  }

@app.post("/analyze")
def analyze(req: EnhanceRequest):
  try:
    raw_base64 = req.image
    if "," in raw_base64:
      raw_base64 = raw_base64.split(",")[1]

    img_bytes = base64.b64decode(raw_base64)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img_bgr is None:
      raise HTTPException(status_code=400, detail="Invalid image input data")

    analysis_res = pattern_analyzer.analyze(img_bgr)
    return analysis_res
  except Exception as e:
    print(f"[FastAPI AI Analyze Error] {e}")
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
def enhance(req: EnhanceRequest):
  try:
    # 1. Decode base64 image input
    raw_base64 = req.image
    if "," in raw_base64:
      raw_base64 = raw_base64.split(",")[1]

    img_bytes = base64.b64decode(raw_base64)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if img_bgr is None:
      raise HTTPException(status_code=400, detail="Invalid image input data")

    # 2. Run Pattern & Quality Analysis
    analysis_res = pattern_analyzer.analyze(img_bgr)

    # 3. PyTorch Deep Neural Network Model Inference (Stage 1 Restormer + Stage 2 Real-ESRGAN)
    mode = getattr(req, 'mode', 'FAITHFUL_RESTORATION')
    result = pytorch_engine.process(img_bgr, clarity_strength=req.clarityStrength, restoration_mode=mode)

    # 4. Save 4 Intermediate Diagnostic Stage Files as requested
    timestamp = int(cv2.getTickCount())
    
    path_01 = os.path.abspath(os.path.join(OUTPUTS_DIR, f"01_original_{timestamp}.png"))
    path_02 = os.path.abspath(os.path.join(OUTPUTS_DIR, f"02_deblurred_{timestamp}.png"))
    path_03 = os.path.abspath(os.path.join(OUTPUTS_DIR, f"03_super_resolved_{timestamp}.png"))
    path_04 = os.path.abspath(os.path.join(OUTPUTS_DIR, f"04_final_{timestamp}.png"))

    cv2.imwrite(path_01, img_bgr)
    cv2.imwrite(path_02, result["deblurred_stage1_bgr"])
    cv2.imwrite(path_03, result["super_resolved_bgr"])
    cv2.imwrite(path_04, result["enhanced_bgr"])

    # Calculate metrics for stages
    def get_stage_metrics(img):
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        tenengrad = float(np.mean(cv2.magnitude(sobelx, sobely)**2))
        edge_density = float(np.mean(cv2.Canny(gray, 50, 150) > 0)) * 100.0
        return round(lap_var, 2), round(tenengrad, 2), round(edge_density, 2)

    m01 = get_stage_metrics(img_bgr)
    m02 = get_stage_metrics(result["deblurred_stage1_bgr"])
    m03 = get_stage_metrics(result["super_resolved_bgr"])
    m04 = get_stage_metrics(result["enhanced_bgr"])

    # 5. Encode PyTorch enhanced image back to base64
    _, enh_encoded = cv2.imencode(".png", result["enhanced_bgr"])
    enhanced_base64 = f"data:image/png;base64,{base64.b64encode(enh_encoded).decode('utf-8')}"

    return {
      "originalImage": req.image,
      "enhancedImage": enhanced_base64,
      "analysis": analysis_res,
      "metrics": {
        "originalDimensions": result["original_dimensions"],
        "enhancedDimensions": result["enhanced_dimensions"],
        "scaleFactor": result["scale_factor"],
        "blurMetrics": {
          "stage01_original_laplacian_var": m01[0],
          "stage02_deblurred_laplacian_var": m02[0],
          "stage03_super_resolved_laplacian_var": m03[0],
          "stage04_final_laplacian_var": m04[0],
          "deblur_detail_gain_pct": round(((m02[0] - m01[0]) / max(0.1, m01[0])) * 100, 2)
        },
        "stageFiles": {
          "01_original": path_01,
          "02_deblurred": path_02,
          "03_super_resolved": path_03,
          "04_final": path_04
        },
        "originalSha256": result["original_sha256"],
        "enhancedSha256": result["enhanced_sha256"],
        "isGenuinelyDifferent": result["is_genuinely_different"],
        "processingTimeMs": result["processing_time_ms"],
        "modeUsed": result.get("mode_used", mode),
        "modelUsed": result["model_used"]
      }
    }

  except Exception as e:
    print(f"[FastAPI PyTorch AI] Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="127.0.0.1", port=8000)
