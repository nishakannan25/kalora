import os
import json
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

DATASET_CONFIGS = [
    ("01_Ceramic_Pots", os.path.join(BASE_DIR, "01_Ceramic_Pots", "01_Ceramic_Pots"), "Ceramic Pots & Vases"),
    ("02_Terracotta_Pots", os.path.join(BASE_DIR, "02_Terracotta_Pots"), "Terracotta Pots & Craft"),
    ("03_Plastic_Pots", os.path.join(BASE_DIR, "03_Plastic_Pots"), "Plastic Nursery Pots"),
    ("04_Clay_Pots", os.path.join(BASE_DIR, "04_Clay_Pots"), "Clay Earthenware Pots"),
    ("05_Cement_Pots", os.path.join(BASE_DIR, "05_Cement_Pots"), "Cement Garden Pots"),
    ("06_Hanging_Planters", os.path.join(BASE_DIR, "Pottery dataset", "06_Hanging_Planters"), "Hanging Planters"),
    ("07_Bonsai_Pots", os.path.join(BASE_DIR, "Pottery dataset", "07_Bonsai_Pots"), "Bonsai Pots"),
    ("08_Decorative_Planters", os.path.join(BASE_DIR, "Pottery dataset", "08_Decorative_Planters"), "Decorative Planters"),
    ("09_Large_Garden_Pots", os.path.join(BASE_DIR, "Pottery dataset", "09_Large_Garden_Pots"), "Large Garden Pots"),
    ("10_Small_Indoor_Pots", os.path.join(BASE_DIR, "Pottery dataset", "10_Small_Indoor_Pots"), "Small Indoor Pots")
]

MODEL_DIR = os.path.join(BASE_DIR, "models", "merged_pottery")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# STEP 1: MERGE ALL 10 POTTERY DATASETS & EXACT MATCHING
# -------------------------------------------------------------
all_valid_records = []
total_metadata_records = 0
total_corrupt_count = 0

for dataset_name, path, category_label in DATASET_CONFIGS:
    meta_csv = os.path.join(path, "metadata.csv")
    images_dir = os.path.join(path, "images")

    if not os.path.exists(meta_csv) or not os.path.exists(images_dir):
        print(f"Skipping {dataset_name} — Missing CSV or images directory.")
        continue

    df = pd.read_csv(meta_csv)
    total_metadata_records += len(df)
    avail_imgs = set(os.listdir(images_dir))

    def extract_fn(val):
        if pd.isna(val): return None
        return os.path.basename(str(val).split("?")[0])

    image_col = "product_image" if "product_image" in df.columns else ("image_url" if "image_url" in df.columns else df.columns[2])
    df["image_filename"] = df[image_col].apply(extract_fn)
    df["image_exists"] = df["image_filename"].apply(lambda fn: fn in avail_imgs if fn else False)
    df["image_full_path"] = df.apply(
        lambda r: os.path.join(images_dir, r["image_filename"]) if r["image_exists"] else None, axis=1
    )

    df_matched = df[df["image_exists"]].copy()

    for idx, row in df_matched.iterrows():
        full_p = row["image_full_path"]
        try:
            with Image.open(full_p) as img:
                img.verify()
            all_valid_records.append({
                "dataset_source": dataset_name,
                "category_label": category_label,
                "image_full_path": full_p
            })
        except Exception:
            total_corrupt_count += 1

merged_df = pd.DataFrame(all_valid_records)
matched_pairs = len(merged_df)

classes = sorted(list(merged_df["category_label"].unique()))
class_to_idx = {c: i for i, c in enumerate(classes)}
idx_to_class = {i: c for i, c in enumerate(classes)}

class_dist = merged_df["category_label"].value_counts().to_dict()

print("=== STEP 1: MERGED POTTERY AUDIT & MATCHING SUMMARY ===")
print(f"Total Metadata Records across 10 datasets: {total_metadata_records}")
print(f"Verified Matched Image Pairs: {matched_pairs}")
print(f"Corrupted Images Count: {total_corrupt_count}")
print(f"Classes ({len(classes)}): {classes}")
print("Class Distribution:", class_dist)

# -------------------------------------------------------------
# STEP 2: STRATIFIED SPLIT (80 / 10 / 10)
# -------------------------------------------------------------
sampled_df = merged_df.sample(min(20000, len(merged_df)), random_state=42).reset_index(drop=True)

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
class MergedPotteryDataset(Dataset):
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

ds_tr = MergedPotteryDataset(df_tr, transform=train_tf)
ds_val = MergedPotteryDataset(df_val, transform=eval_tf)
ds_te = MergedPotteryDataset(df_te, transform=eval_tf)

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
    "model_name": "MergedPotteryClassifier",
    "dataset_name": "Merged_Pottery_10_Datasets",
    "total_records": total_metadata_records,
    "matched_pairs": matched_pairs,
    "corrupt_images": total_corrupt_count,
    "label_status": "EXACT / DERIVED taxomony across 10 Pottery Datasets",
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
    "dataset_name": "Merged_Pottery_10_Datasets",
    "total_records": total_metadata_records,
    "matched_pairs": matched_pairs,
    "corrupt_images": total_corrupt_count,
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
