import os
import json
import glob
import re
import time
import pandas as pd
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix
)

# Set deterministic random seeds
np.random.seed(42)
torch.manual_seed(42)

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
POTTERY_DIR = os.path.join(BASE_DIR, "03_Plastic_Pots")
IMAGES_DIR = os.path.join(POTTERY_DIR, "images")
META_CSV = os.path.join(POTTERY_DIR, "metadata.csv")

MODEL_DIR = os.path.join(BASE_DIR, "models", "pottery_plastic_pots")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# STEP 1: AUDIT DATASET & EXACT MATCHING
# -------------------------------------------------------------
df = pd.read_csv(META_CSV)
total_records = len(df)
available_images = set(os.listdir(IMAGES_DIR)) if os.path.exists(IMAGES_DIR) else set()

def extract_filename(val):
    if pd.isna(val):
        return None
    s = str(val).split("?")[0]
    return os.path.basename(s)

image_col = "product_image" if "product_image" in df.columns else ("image_url" if "image_url" in df.columns else df.columns[2])
df["image_filename"] = df[image_col].apply(extract_filename)
df["image_exists"] = df["image_filename"].apply(lambda fn: fn in available_images if fn else False)
df["image_full_path"] = df.apply(
    lambda r: os.path.join(IMAGES_DIR, r["image_filename"]) if r["image_exists"] else None, axis=1
)

df_vision = df[df["image_exists"]].copy()
matched_pairs = len(df_vision)

# Check image corruption
corrupt_count = 0
valid_rows = []
for idx, row in df_vision.iterrows():
    try:
        with Image.open(row["image_full_path"]) as img:
            img.verify()
        valid_rows.append(row)
    except Exception:
        corrupt_count += 1

df_vision = pd.DataFrame(valid_rows).reset_index(drop=True)

def derive_plastic_category(row):
    title = str(row.get("product_name", row.get("title", ""))).lower()
    cat = str(row.get("category", "")).lower()
    ptype = str(row.get("product_type", "")).lower()
    mat = str(row.get("material", "")).lower()

    full_text = f"{title} {cat} {ptype} {mat}"

    if any(w in full_text for w in ["hanging", "hanger", "wall hanging"]):
        return "Plastic Hanging Planter"
    elif any(w in full_text for w in ["planter", "pot", "planters", "pots", "container"]):
        return "Plastic Planter & Pot"
    elif any(w in full_text for w in ["vase", "vases"]):
        return "Plastic Decorative Vase"
    elif any(w in full_text for w in ["tray", "saucer", "stand", "spray", "watering", "tool"]):
        return "Plastic Gardening & Accessories"
    else:
        return "General Plastic Pot & Nursery Craft"

df_vision["category_label"] = df_vision.apply(derive_plastic_category, axis=1)
label_status = "DERIVED / HEURISTIC — NOT GROUND TRUTH"

classes = sorted(list(df_vision["category_label"].unique()))
class_to_idx = {c: i for i, c in enumerate(classes)}
idx_to_class = {i: c for i, c in enumerate(classes)}

class_dist = df_vision["category_label"].value_counts().to_dict()

print("=== STEP 1: AUDIT & MATCHING SUMMARY ===")
print(f"Total Metadata Records: {total_records}")
print(f"Total Images in Folder: {len(available_images)}")
print(f"Verified Matched Image Pairs: {matched_pairs}")
print(f"Corrupted Images Count: {corrupt_count}")
print(f"Label Status: {label_status}")
print(f"Classes ({len(classes)}): {classes}")
print("Class Distribution:", class_dist)

# -------------------------------------------------------------
# STEP 2: STRATIFIED SPLIT (80 / 10 / 10)
# -------------------------------------------------------------
sampled_df = df_vision.sample(min(20000, len(df_vision)), random_state=42).reset_index(drop=True)

df_tr, df_temp = train_test_split(
    sampled_df, test_size=0.20, random_state=42, stratify=sampled_df["category_label"]
)
df_val, df_te = train_test_split(
    df_temp, test_size=0.50, random_state=42, stratify=df_temp["category_label"]
)

print(f"\nTrain Set Size: {len(df_tr)} (80%)")
print(f"Val Set Size: {len(df_val)} (10%)")
print(f"Test Set Size: {len(df_te)} (10%)")

# -------------------------------------------------------------
# STEP 3: DATASET & DATALOADERS
# -------------------------------------------------------------
class PlasticPotDataset(Dataset):
    def __init__(self, sub_df, transform=None):
        self.sub_df = sub_df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.sub_df)

    def __getitem__(self, idx):
        row = self.sub_df.iloc[idx]
        try:
            img = Image.open(row["image_full_path"]).convert("RGB")
        except Exception:
            img = Image.new("RGB", (224, 224), (0, 0, 0))
        label = class_to_idx[row["category_label"]]
        if self.transform:
            img = self.transform(img)
        return img, label

train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

eval_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

ds_tr = PlasticPotDataset(df_tr, transform=train_tf)
ds_val = PlasticPotDataset(df_val, transform=eval_tf)
ds_te = PlasticPotDataset(df_te, transform=eval_tf)

loader_tr = DataLoader(ds_tr, batch_size=32, shuffle=True)
loader_val = DataLoader(ds_val, batch_size=32, shuffle=False)
loader_te = DataLoader(ds_te, batch_size=32, shuffle=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"\nTraining MobileNetV3-Small on device: {device}")

# -------------------------------------------------------------
# STEP 4: MODEL & ADAMW TRAINING (MAX 8 EPOCHS, PATIENCE=2)
# -------------------------------------------------------------
img_model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

for param in img_model.parameters():
    param.requires_grad = False

num_ftrs = img_model.classifier[3].in_features
img_model.classifier[3] = nn.Linear(num_ftrs, len(classes))
img_model = img_model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(img_model.classifier[3].parameters(), lr=1e-3, weight_decay=1e-4)

best_val_acc = 0.0
best_weights_path = os.path.join(MODEL_DIR, "best_model.pt")

patience = 2
patience_counter = 0

start_time = time.time()
history = []
for epoch in range(8):
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
    print(f"Epoch {epoch+1:02d}/08 - Loss: {epoch_loss:.4f} - Val Acc: {val_acc:.4f}")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(img_model.state_dict(), best_weights_path)
        patience_counter = 0
    else:
        patience_counter += 1
        if patience_counter >= patience:
            print(f"Early stopping triggered at Epoch {epoch+1:02d}")
            break

training_duration_sec = round(time.time() - start_time, 2)
print(f"\nTraining Complete in {training_duration_sec}s. Best Val Acc: {best_val_acc:.4f}")

# -------------------------------------------------------------
# STEP 5: EVALUATION ON TEST SET
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

print(f"\nTest Accuracy: {test_acc:.4f}, Balanced Acc: {test_bacc:.4f}, Macro F1: {f1_mac:.4f}, Weighted F1: {f1_wei:.4f}")

# -------------------------------------------------------------
# STEP 6: SAVE ARTIFACTS & CONFIGS
# -------------------------------------------------------------
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(idx_to_class, f, indent=2)

model_config = {
    "model_name": "PotteryPlasticPotsClassifier",
    "dataset_name": "03_Plastic_Pots",
    "total_records": total_records,
    "matched_pairs": matched_pairs,
    "corrupt_images": corrupt_count,
    "label_status": label_status,
    "classes": classes,
    "num_classes": len(classes),
    "backbone": "MobileNetV3-Small",
    "batch_size": 32,
    "optimizer": "AdamW",
    "learning_rate": 0.001,
    "max_epochs": 8,
    "early_stopping_patience": 2,
    "splits": {
        "train": len(df_tr),
        "val": len(df_val),
        "test": len(df_te)
    },
    "uncertainty_threshold": 0.60
}

with open(os.path.join(MODEL_DIR, "model_config.json"), "w", encoding="utf-8") as f:
    json.dump(model_config, f, indent=2)

metrics_payload = {
    "dataset_name": "03_Plastic_Pots",
    "total_records": total_records,
    "matched_pairs": matched_pairs,
    "corrupt_images": corrupt_count,
    "label_status": label_status,
    "class_counts": class_dist,
    "splits": {
        "train": len(df_tr),
        "val": len(df_val),
        "test": len(df_te)
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
    "classification_report": cls_report
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
    json.dump(metrics_payload, f, indent=2)

with open(os.path.join(MODEL_DIR, "training_history.json"), "w", encoding="utf-8") as f:
    json.dump(history, f, indent=2)

print("\nModel training and serialization complete.")
