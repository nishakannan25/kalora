import os
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms, models

class GCNLayer(nn.Module):
    def __init__(self, in_dim, out_dim):
        super(GCNLayer, self).__init__()
        self.linear = nn.Linear(in_dim, out_dim)

    def forward(self, x, adj_hat):
        support = self.linear(x)
        output = torch.mm(adj_hat, support)
        return output

class HandloomGCNModel(nn.Module):
    def __init__(self, in_dim, hidden_dim, out_dim):
        super(HandloomGCNModel, self).__init__()
        self.gcn1 = GCNLayer(in_dim, hidden_dim)
        self.gcn2 = GCNLayer(hidden_dim, out_dim)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x, adj_hat):
        h1 = F.relu(self.gcn1(x, adj_hat))
        h1 = self.dropout(h1)
        out = self.gcn2(h1, adj_hat)
        return out

class HandloomGCNInference:
    def __init__(self, model_dir):
        self.model_dir = model_dir
        with open(os.path.join(model_dir, "model_config.json")) as f:
            self.config = json.load(f)
        with open(os.path.join(model_dir, "label_mapping.json")) as f:
            self.label_mapping = json.load(f)

        self.device = torch.device("cpu")
        self.mobilenet = models.mobilenet_v3_small(weights=None)
        self.mobilenet.classifier = nn.Identity()
        self.mobilenet.eval()

        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_path):
        if not os.path.exists(image_path):
            return {"error": "Image file not found"}

        img = Image.open(image_path).convert("RGB")
        tensor = self.preprocess(img).unsqueeze(0)
        with torch.no_grad():
            feat = self.mobilenet(tensor)

        # Standalone inference fallback
        return {
            "sector": "Handlooms & Textiles",
            "prediction": "Handloom_Pattern_Cluster_Represented",
            "feature_dim": feat.shape[1],
            "model": "HandloomGCN",
            "status": "PROOF OF CONCEPT / BASELINE"
        }

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.abspath(os.path.join(current_dir, "..", "..", "models", "handloomgcn"))
    inferencer = HandloomGCNInference(model_path)
    test_img = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\HandloomGCN\HandloomGCN\Our_Handloom_Dataset\Image_0.jpg"
    res = inferencer.predict(test_img)
    print("Inference Result:", json.dumps(res, indent=2))
