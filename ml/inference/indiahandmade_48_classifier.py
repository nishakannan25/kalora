import os
import json
import torch
from torchvision import transforms, models
from PIL import Image

class IndiaHandmade48ClassifierInference:
    def __init__(self, model_dir=None, uncertainty_threshold=0.60):
        if model_dir is None:
            base_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
            model_dir = os.path.join(base_dir, "models", "indiahandmade_48")
            
        weights_path = os.path.join(model_dir, "best_vision_model.pt")
        label_path = os.path.join(model_dir, "label_mapping.json")
        
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Weights file not found at {weights_path}")
            
        with open(label_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
            self.idx_to_class = {int(k): v for k, v in mapping.items()}
            
        self.uncertainty_threshold = uncertainty_threshold
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.model = models.mobilenet_v3_small(weights=None)
        num_features = self.model.classifier[3].in_features
        self.model.classifier[3] = torch.nn.Linear(num_features, len(self.idx_to_class))
        
        self.model.load_state_dict(torch.load(weights_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_path: str):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")
            
        image = Image.open(image_path).convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            top_prob, top_idx = torch.max(probs, dim=0)
            confidence = round(float(top_prob.item()), 4)
            
        if confidence < self.uncertainty_threshold:
            prediction = "UNCERTAIN"
        else:
            prediction = self.idx_to_class[top_idx.item()]
            
        return {
            "prediction": prediction,
            "confidence": confidence,
            "raw_class": self.idx_to_class[top_idx.item()],
            "uncertainty_threshold": self.uncertainty_threshold
        }

if __name__ == "__main__":
    classifier = IndiaHandmade48ClassifierInference()
    base_dir = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
    sample_img = os.path.join(base_dir, "downloaded_images", "downloaded_images", "product_0000.jpg")
    if os.path.exists(sample_img):
        res = classifier.predict(sample_img)
        print("Inference Test Sample Output:")
        print(res)
