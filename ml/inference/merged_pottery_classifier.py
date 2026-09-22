"""
KALORA — Unified Merged Pottery & Planter Classifier Inference Module
Model: MobileNetV3-Small (Pretrained ImageNet)
Categories: 10 Unified Pottery & Planter Classes
Dataset Size: 11,734 Verified Image-Product Pairs
"""

import os
import json
import torch
import torchvision.transforms as transforms
from PIL import Image

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models", "merged_pottery")
CONFIG_PATH = os.path.join(MODEL_DIR, "config.json")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "best_model.pth")

CONFIDENCE_THRESHOLD = 0.60

class UnifiedPotteryClassifier:
    def __init__(self, config_path=CONFIG_PATH, weights_path=WEIGHTS_PATH):
        if not os.path.exists(config_path) or not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model artifacts not found in {MODEL_DIR}. Please run training first.")

        with open(config_path, "r") as f:
            self.config = json.load(f)

        self.idx2class = {int(k): v for k, v in self.config["idx2class"].items()}
        self.num_classes = self.config["num_classes"]

        # Load MobileNetV3-Small architecture
        from torchvision.models import mobilenet_v3_small
        self.model = mobilenet_v3_small(weights=None)
        self.model.classifier[3] = torch.nn.Linear(self.model.classifier[3].in_features, self.num_classes)

        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def predict(self, image_path):
        if not os.path.exists(image_path):
            return {"error": f"Image file not found: {image_path}"}

        try:
            image = Image.open(image_path).convert("RGB")
            tensor = self.transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
                conf, pred_idx = torch.max(probabilities, dim=0)

            confidence = conf.item()
            predicted_class = self.idx2class[pred_idx.item()]

            if confidence < CONFIDENCE_THRESHOLD:
                status = "UNCERTAIN"
                final_label = "UNCERTAIN — Below Confidence Threshold"
            else:
                status = "CONFIDENT"
                final_label = predicted_class

            return {
                "predicted_class": final_label,
                "raw_class": predicted_class,
                "confidence": round(confidence, 4),
                "status": status,
                "threshold": CONFIDENCE_THRESHOLD,
                "all_probabilities": {
                    self.idx2class[i]: round(probabilities[i].item(), 4)
                    for i in range(self.num_classes)
                }
            }
        except Exception as e:
            return {"error": f"Failed to process image: {str(e)}"}

if __name__ == "__main__":
    classifier = UnifiedPotteryClassifier()
    print("Unified Pottery Classifier Loaded Successfully.")
    print(f"Supported Classes ({classifier.num_classes}): {list(classifier.idx2class.values())}")
