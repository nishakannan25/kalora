import os
import json
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms, models

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "models", "handloom_textiles_full")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "best_vision_model.pt")
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_mapping.json")

class HandloomTextilesFullClassifier:
    def __init__(self, weights_path=WEIGHTS_PATH, label_map_path=LABEL_MAP_PATH, device=None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        with open(label_map_path, "r", encoding="utf-8") as f:
            raw_map = json.load(f)
            self.idx_to_class = {int(k): v for k, v in raw_map.items()}
            
        self.classes = [self.idx_to_class[i] for i in range(len(self.idx_to_class))]
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        self.model = models.mobilenet_v3_small(weights=None)
        num_ftrs = self.model.classifier[3].in_features
        self.model.classifier[3] = nn.Linear(num_ftrs, len(self.classes))
        
        state_dict = torch.load(weights_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model = self.model.to(self.device)
        self.model.eval()

    def predict(self, image_input):
        if isinstance(image_input, str):
            image = Image.open(image_input).convert("RGB")
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
        else:
            raise ValueError("Input must be a file path string or PIL Image.")
            
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1).squeeze(0).cpu().numpy()
            pred_idx = int(torch.argmax(outputs, dim=1).item())
            
        return {
            "predicted_class": self.idx_to_class[pred_idx],
            "class_index": pred_idx,
            "confidence": float(probs[pred_idx]),
            "class_probabilities": {self.idx_to_class[i]: float(probs[i]) for i in range(len(self.classes))}
        }

if __name__ == "__main__":
    classifier = HandloomTextilesFullClassifier()
    print("HandloomTextilesFullClassifier initialized successfully.")
    print(f"Loaded {len(classifier.classes)} classes: {classifier.classes}")
