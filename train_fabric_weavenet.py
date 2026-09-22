import os
import json
import time
from PIL import Image
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix
)

# Set deterministic random seeds
np.random.seed(42)
torch.manual_seed(42)

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
DATASET_DIR = os.path.join(BASE_DIR, "fabric_weavenet", "FinalFabric")

MODEL_DIR = os.path.join(BASE_DIR, "models", "fabric_weavenet")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# 1. AUDIT DATASET FILES & LABELS
# -------------------------------------------------------------
classes = sorted([d for d in os.listdir(os.path.join(DATASET_DIR, "train")) if os.path.isdir(os.path.join(DATASET_DIR, "train", d))])
class_to_idx = {c: i for i, c in enumerate(classes)}
idx_to_class = {i: c for i, c in enumerate(classes)}

def collect_split_data(split_name):
    split_dir = os.path.join(DATASET_DIR, split_name)
    records = []
    for cls in classes:
        cls_dir = os.path.join(split_dir, cls)
        if not os.path.exists(cls_dir):
            continue
        for fname in os.listdir(cls_dir):
            fpath = os.path.join(cls_dir, fname)
            if os.path.isfile(fpath):
                records.append({
                    "split": split_name,
                    "class_name": cls,
                    "label": class_to_idx[cls],
                    "file_name": fname,
                    "file_path": fpath
                })
    return pd.DataFrame(records)

df_train = collect_split_data("train")
df_val = collect_split_data("val")
df_test = collect_split_data("test")

df_full = pd.concat([df_train, df_val, df_test], ignore_index=True)

print("=== DATASET AUDIT SUMMARY ===")
print("Classes:", classes)
print("Train Records:", len(df_train))
print("Val Records:", len(df_val))
print("Test Records:", len(df_test))
print("Total Records:", len(df_full))
print("\nClass Distribution per Split:")
print(df_full.groupby(["split", "class_name"]).size().unstack(fill_value=0))

# Image Integrity Audit
corrupt_files = []
modes = {}
formats = {}

for fpath in df_full["file_path"]:
    try:
        with Image.open(fpath) as img:
            modes[img.mode] = modes.get(img.mode, 0) + 1
            formats[img.format] = formats.get(img.format, 0) + 1
    except Exception:
        corrupt_files.append(fpath)

print("\nImage Modes:", modes)
print("Image Formats:", formats)
print("Corrupt Files Count:", len(corrupt_files))

# -------------------------------------------------------------
# 2. PYTORCH DATASET & DATALOADERS
# -------------------------------------------------------------
class FabricWeaveDataset(Dataset):
    def __init__(self, df_sub, transform=None):
        self.df_sub = df_sub.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df_sub)

    def __getitem__(self, idx):
        row = self.df_sub.iloc[idx]
        try:
            img = Image.open(row["file_path"]).convert("RGB")
        except Exception:
            img = Image.new("RGB", (224, 224), (0, 0, 0))
        label = row["label"]
        if self.transform:
            img = self.transform(img)
        return img, label

train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.1, contrast=0.1),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

eval_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

ds_tr = FabricWeaveDataset(df_train, transform=train_tf)
ds_val = FabricWeaveDataset(df_val, transform=eval_tf)
ds_te = FabricWeaveDataset(df_test, transform=eval_tf)

loader_tr = DataLoader(ds_tr, batch_size=16, shuffle=True)
loader_val = DataLoader(ds_val, batch_size=16, shuffle=False)
loader_te = DataLoader(ds_te, batch_size=16, shuffle=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"\nTraining MobileNetV3-Small on device: {device}")

# -------------------------------------------------------------
# 3. MODEL INITIALIZATION & TRAINING
# -------------------------------------------------------------
img_model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

for param in img_model.parameters():
    param.requires_grad = False

num_ftrs = img_model.classifier[3].in_features
img_model.classifier[3] = nn.Linear(num_ftrs, len(classes))
img_model = img_model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(img_model.classifier[3].parameters(), lr=1e-3, weight_decay=1e-4)

best_val_acc = 0.0
best_weights_path = os.path.join(MODEL_DIR, "best_vision_model.pt")

start_time = time.time()
history = []
for epoch in range(15):
    img_model.train()
    running_loss = 0.0
    for imgs, lbls in loader_tr:
        imgs, lbls = imgs.to(device), lbls.to(device)
        optimizer.zero_grad()
        loss = criterion(img_model(imgs), lbls)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * imgs.size(0)

    img_model.eval()
    val_preds, val_targets = [], []
    with torch.no_grad():
        for imgs, lbls in loader_val:
            imgs = imgs.to(device)
            outputs = img_model(imgs)
            _, preds = torch.max(outputs, 1)
            val_preds.extend(preds.cpu().numpy())
            val_targets.extend(lbls.numpy())

    val_acc = float(accuracy_score(val_targets, val_preds))
    epoch_loss = float(running_loss / len(ds_tr))
    history.append({"epoch": epoch + 1, "loss": round(epoch_loss, 4), "val_acc": round(val_acc, 4)})
    print(f"Epoch {epoch+1:02d}/15 - Loss: {epoch_loss:.4f} - Val Acc: {val_acc:.4f}")

    if val_acc >= best_val_acc:
        best_val_acc = val_acc
        torch.save(img_model.state_dict(), best_weights_path)

training_duration_sec = round(time.time() - start_time, 2)
print(f"\nTraining Complete in {training_duration_sec}s. Best Val Acc: {best_val_acc:.4f}")

# -------------------------------------------------------------
# 4. EVALUATION ON TEST SET
# -------------------------------------------------------------
img_model.load_state_dict(torch.load(best_weights_path))
img_model.eval()

img_test_preds, img_test_targets, img_test_probs = [], [], []
with torch.no_grad():
    for imgs, lbls in loader_te:
        imgs = imgs.to(device)
        outputs = img_model(imgs)
        probs = torch.softmax(outputs, dim=1)
        _, preds = torch.max(outputs, 1)
        img_test_preds.extend(preds.cpu().numpy())
        img_test_targets.extend(lbls.numpy())
        img_test_probs.extend(probs.cpu().numpy())

test_acc = float(accuracy_score(img_test_targets, img_test_preds))
test_bacc = float(balanced_accuracy_score(img_test_targets, img_test_preds))
p_mac, r_mac, f1_mac, _ = precision_recall_fscore_support(img_test_targets, img_test_preds, average="macro", zero_division=0)
_, _, f1_wei, _ = precision_recall_fscore_support(img_test_targets, img_test_preds, average="weighted", zero_division=0)

cm = confusion_matrix(img_test_targets, img_test_preds).tolist()
cls_report = classification_report(img_test_targets, img_test_preds, target_names=classes, output_dict=True, zero_division=0)

# Failure Cases
failure_cases = []
for i in range(len(img_test_targets)):
    if img_test_targets[i] != img_test_preds[i]:
        row = df_test.iloc[i]
        failure_cases.append({
            "file_name": str(row["file_name"]),
            "true_label": classes[img_test_targets[i]],
            "predicted_label": classes[img_test_preds[i]],
            "confidence": float(img_test_probs[i][img_test_preds[i]])
        })
        if len(failure_cases) >= 10:
            break

# -------------------------------------------------------------
# 5. SAVE ARTIFACTS & CONFIGS
# -------------------------------------------------------------
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(idx_to_class, f, indent=2)

model_config = {
    "model_name": "FabricWeaveNetClassifier",
    "dataset_name": "Fabric WeaveNet Dataset (FinalFabric)",
    "total_images": len(df_full),
    "classes": classes,
    "num_classes": len(classes),
    "backbone": "MobileNetV3-Small",
    "splits": {
        "train": len(df_train),
        "val": len(df_val),
        "test": len(df_test)
    },
    "uncertainty_threshold": 0.60
}

with open(os.path.join(MODEL_DIR, "model_config.json"), "w", encoding="utf-8") as f:
    json.dump(model_config, f, indent=2)

metrics_payload = {
    "dataset_name": "Fabric WeaveNet Dataset (FinalFabric)",
    "total_images": len(df_full),
    "class_counts": df_full["class_name"].value_counts().to_dict(),
    "splits": {
        "train": len(df_train),
        "val": len(df_val),
        "test": len(df_test)
    },
    "training_duration_seconds": training_duration_sec,
    "val_best_accuracy": round(best_val_acc, 4),
    "test_accuracy": round(test_acc, 4),
    "balanced_accuracy": round(test_bacc, 4),
    "macro_precision": round(float(p_mac), 4),
    "macro_recall": round(float(r_mac), 4),
    "macro_f1": round(float(f1_mac), 4),
    "weighted_f1": round(float(f1_wei), 4),
    "confusion_matrix": cm,
    "classification_report": cls_report,
    "training_history": history,
    "failure_cases_sample": failure_cases
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
    json.dump(metrics_payload, f, indent=2)

print("\nFabric WeaveNet Model Training & Serialization Complete.")
