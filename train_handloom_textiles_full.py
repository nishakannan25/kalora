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

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix
)

# Set deterministic random seeds
np.random.seed(42)
torch.manual_seed(42)

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
CSV_PATH = os.path.join(BASE_DIR, "handloom_textiles_full.csv")
IMAGES_DIR = os.path.join(BASE_DIR, "handloom")

MODEL_DIR = os.path.join(BASE_DIR, "models", "handloom_textiles_full")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# 1. LOAD DATASET & AUDIT
# -------------------------------------------------------------
df = pd.read_csv(CSV_PATH)
df["record_id"] = range(len(df))
total_csv_records = len(df)

# Check available images in handloom folder
available_images = set(os.listdir(IMAGES_DIR)) if os.path.exists(IMAGES_DIR) else set()

# Extract filename from image_url
def get_img_filename(url):
    if pd.isna(url):
        return None
    url_str = str(url).split("?")[0]
    return os.path.basename(url_str)

df["image_filename"] = df["image_url"].apply(get_img_filename)
df["image_exists"] = df["image_filename"].apply(lambda fn: fn in available_images if fn else False)
df["image_full_path"] = df.apply(
    lambda r: os.path.join(IMAGES_DIR, r["image_filename"]) if r["image_exists"] else None, axis=1
)

# Image matching metrics (Correction #1)
matched_df = df[df["image_exists"]].copy()
unmatched_df = df[~df["image_exists"]].copy()

matched_image_records = len(matched_df)
unmatched_records = len(unmatched_df)
unique_matched_images = matched_df["image_filename"].nunique()
duplicate_image_matches = matched_image_records - unique_matched_images
ambiguous_matches = 0 # Exact string matching only

matching_report = {
    "total_csv_records": total_csv_records,
    "matched_image_records": matched_image_records,
    "unmatched_records": unmatched_records,
    "unique_matched_images": unique_matched_images,
    "duplicate_image_matches": duplicate_image_matches,
    "ambiguous_matches": ambiguous_matches
}

print("=== IMAGE MATCHING AUDIT (Correction #1) ===")
for k, v in matching_report.items():
    print(f"  {k}: {v}")

# -------------------------------------------------------------
# 2. PRICE CLEANING & ANALYSIS (Correction #8)
# -------------------------------------------------------------
def clean_price(p):
    if pd.isna(p):
        return np.nan
    s = re.sub(r"[^\d.]", "", str(p))
    try:
        val = float(s)
        return val if val > 0 else np.nan
    except:
        return np.nan

df["marketplace_listed_price"] = df["price"].apply(clean_price)
price_series = df["marketplace_listed_price"].dropna()

price_stats = {
    "price_type": "MARKETPLACE LISTED PRICE",
    "total_valid_prices": int(len(price_series)),
    "min_price": float(price_series.min()) if len(price_series) else 0.0,
    "max_price": float(price_series.max()) if len(price_series) else 0.0,
    "median_price": float(price_series.median()) if len(price_series) else 0.0,
    "mean_price": float(round(price_series.mean(), 2)) if len(price_series) else 0.0,
    "std_price": float(round(price_series.std(), 2)) if len(price_series) else 0.0
}

print("\n=== MARKETPLACE LISTED PRICE STATISTICS (Correction #8) ===")
for k, v in price_stats.items():
    print(f"  {k}: {v}")

# -------------------------------------------------------------
# 3. LABEL DERIVATION & VALIDATION (Correction #2)
# -------------------------------------------------------------
# Labels are DERIVED / HEURISTIC LABELS based on product_name rules
def derive_label(title):
    t = str(title).lower()
    if any(w in t for w in ["silk", "tussar", "muga", "eri", "mulberry", "kanjeevaram"]):
        return "Silk Handloom"
    elif any(w in t for w in ["cotton", "khadi", "mulmul", "mercerized"]):
        return "Cotton Handloom"
    elif any(w in t for w in ["chanderi", "maheshwari", "banarasi", "jamdani", "ikat", "pochampally", "linen"]):
        return "Heritage & Fine Weaves"
    elif any(w in t for w in ["dupatta", "stole", "scarf", "shawl", "dress", "kurta", "towel", "cushion", "bedcover", "bedsheet"]):
        return "Apparel & Accessories"
    else:
        return "Saree General & Craft"

df["derived_material"] = df["product_name"].apply(derive_label)
label_type = "DERIVED / HEURISTIC LABELS"

class_dist_full = df["derived_material"].value_counts().to_dict()
print(f"\n=== METADATA LABEL DISTRIBUTION ({label_type}) ===")
for k, v in class_dist_full.items():
    print(f"  {k}: {v}")

# -------------------------------------------------------------
# 4. DATASET SPLITTING (Correction #5)
# -------------------------------------------------------------
# Grouping: Deduplicate product_name / image_filename groups so near-duplicates stay in same split
df["group_key"] = df["product_name"].apply(lambda x: str(x).strip().lower())

# Perform split on metadata dataset (5,162 records)
unique_groups = df[["group_key", "derived_material"]].drop_duplicates()
g_train, g_temp = train_test_split(
    unique_groups, test_size=0.30, random_state=42, stratify=unique_groups["derived_material"]
)
g_val, g_test = train_test_split(
    g_temp, test_size=0.50, random_state=42, stratify=g_temp["derived_material"]
)

train_groups = set(g_train["group_key"])
val_groups = set(g_val["group_key"])
test_groups = set(g_test["group_key"])

def get_split(gk):
    if gk in train_groups: return "train"
    if gk in val_groups: return "val"
    if gk in test_groups: return "test"
    return "train"

df["split"] = df["group_key"].apply(get_split)

metadata_split_counts = df["split"].value_counts().to_dict()
print("\n=== METADATA DATASET SPLIT COUNTS (Correction #5 & #6) ===")
print(metadata_split_counts)

# Vision dataset (ONLY verified image-product pairs)
df_vision = df[df["image_exists"]].copy()
vision_split_counts = df_vision["split"].value_counts().to_dict()
print(f"\n=== VISION DATASET SPLIT COUNTS (Total {len(df_vision)} Verified Pairs) ===")
print(vision_split_counts)

classes = sorted(list(df["derived_material"].unique()))
class_to_idx = {c: i for i, c in enumerate(classes)}
idx_to_class = {i: c for i, c in enumerate(classes)}

# Save label mapping & config (Correction #10)
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(idx_to_class, f, indent=2)

model_config = {
    "model_name": "HandloomTextilesFullClassifier",
    "dataset_name": "handloom_textiles_full.csv",
    "total_metadata_records": total_csv_records,
    "verified_vision_records": len(df_vision),
    "label_type": label_type,
    "num_classes": len(classes),
    "classes": classes,
    "backbone": "MobileNetV3-Small",
    "image_size": [224, 224],
    "split_ratio": {"train": 0.70, "val": 0.15, "test": 0.15}
}

with open(os.path.join(MODEL_DIR, "model_config.json"), "w", encoding="utf-8") as f:
    json.dump(model_config, f, indent=2)

# -------------------------------------------------------------
# 5. EXPERIMENT A: TEXT BASELINE (TF-IDF + Logistic Regression)
# -------------------------------------------------------------
print("\n=== EXPERIMENT A: TEXT BASELINE (TF-IDF + Logistic Regression) ===")
train_meta = df[df["split"] == "train"]
val_meta = df[df["split"] == "val"]
test_meta = df[df["split"] == "test"]

tfidf_a = TfidfVectorizer(ngram_range=(1, 2))
X_tr_a = tfidf_a.fit_transform(train_meta["product_name"])
X_val_a = tfidf_a.transform(val_meta["product_name"])
X_te_a = tfidf_a.transform(test_meta["product_name"])

clf_a = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
clf_a.fit(X_tr_a, train_meta["derived_material"])

preds_a_val = clf_a.predict(X_val_a)
preds_a_test = clf_a.predict(X_te_a)

acc_a_val = float(accuracy_score(val_meta["derived_material"], preds_a_val))
acc_a_test = float(accuracy_score(test_meta["derived_material"], preds_a_test))
bacc_a_test = float(balanced_accuracy_score(test_meta["derived_material"], preds_a_test))

print(f"Text Model (Exp A) Val Accuracy: {round(acc_a_val, 4)}")
print(f"Text Model (Exp A) Test Accuracy: {round(acc_a_test, 4)}")

# -------------------------------------------------------------
# 6. EXPERIMENT B: FEATURE ABLATION (Correction #3 & #7)
# -------------------------------------------------------------
print("\n=== EXPERIMENT B: ABLATED TEXT MODEL (Material Keywords Stripped) ===")
def strip_keywords(text):
    pattern = r"\b(silk|cotton|khadi|mulmul|mercerized|tussar|muga|eri|kanjeevaram|chanderi|maheshwari|banarasi|jamdani|ikat|pochampally|linen|dupatta|stole|scarf|shawl|dress|kurta|towel|cushion|bedcover|bedsheet|saree|sari|handloom|pure|print|woven)\b"
    return re.sub(pattern, "", str(text), flags=re.IGNORECASE).strip()

train_meta_ab = train_meta["product_name"].apply(strip_keywords)
val_meta_ab = val_meta["product_name"].apply(strip_keywords)
test_meta_ab = test_meta["product_name"].apply(strip_keywords)

tfidf_b = TfidfVectorizer()
X_tr_b = tfidf_b.fit_transform(train_meta_ab)
X_val_b = tfidf_b.transform(val_meta_ab)
X_te_b = tfidf_b.transform(test_meta_ab)

clf_b = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
clf_b.fit(X_tr_b, train_meta["derived_material"])

preds_b_val = clf_b.predict(X_val_b)
preds_b_test = clf_b.predict(X_te_b)

acc_b_val = float(accuracy_score(val_meta["derived_material"], preds_b_val))
acc_b_test = float(accuracy_score(test_meta["derived_material"], preds_b_test))
bacc_b_test = float(balanced_accuracy_score(test_meta["derived_material"], preds_b_test))

print(f"Ablated Text Model (Exp B) Val Accuracy: {round(acc_b_val, 4)}")
print(f"Ablated Text Model (Exp B) Test Accuracy: {round(acc_b_test, 4)}")

# Leakage Flag Check (Correction #7)
exp_a_leakage_flag = acc_a_test >= 0.95
exp_b_leakage_flag = acc_b_test >= 0.95

# -------------------------------------------------------------
# 7. EXPERIMENT C: PURE VISION MODEL (MobileNetV3-Small) (Correction #4)
# -------------------------------------------------------------
print(f"\n=== EXPERIMENT C: PURE VISION CLASSIFIER (MobileNetV3-Small on {len(df_vision)} Verified Images) ===")

train_vis = df_vision[df_vision["split"] == "train"]
val_vis = df_vision[df_vision["split"] == "val"]
test_vis = df_vision[df_vision["split"] == "test"]

class HandloomDataset(Dataset):
    def __init__(self, sub_df, transform=None):
        self.sub_df = sub_df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.sub_df)

    def __getitem__(self, idx):
        row = self.sub_df.iloc[idx]
        img_path = row["image_full_path"]
        try:
            img = Image.open(img_path).convert("RGB")
        except Exception:
            # Fallback black image if corrupt
            img = Image.new("RGB", (224, 224), (0, 0, 0))
        label = class_to_idx[row["derived_material"]]
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

ds_tr = HandloomDataset(train_vis, transform=train_tf)
ds_val = HandloomDataset(val_vis, transform=eval_tf)
ds_te = HandloomDataset(test_vis, transform=eval_tf)

loader_tr = DataLoader(ds_tr, batch_size=16, shuffle=True)
loader_val = DataLoader(ds_val, batch_size=16, shuffle=False)
loader_te = DataLoader(ds_te, batch_size=16, shuffle=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on device: {device}")

img_model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

# Freeze backbone initially for transfer learning
for param in img_model.parameters():
    param.requires_grad = False

num_ftrs = img_model.classifier[3].in_features
img_model.classifier[3] = nn.Linear(num_ftrs, len(classes))
img_model = img_model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(img_model.classifier[3].parameters(), lr=1e-3, weight_decay=1e-4)

best_val_acc = 0.0
best_model_path = os.path.join(MODEL_DIR, "best_vision_model.pt")

start_time = time.time()
for epoch in range(15):
    img_model.train()
    running_loss = 0.0
    for imgs, lbls in loader_tr:
        imgs, lbls = imgs.to(device), lbls.to(device)
        optimizer.zero_grad()
        outputs = img_model(imgs)
        loss = criterion(outputs, lbls)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * imgs.size(0)

    # Validation
    img_model.eval()
    val_preds = []
    val_targets = []
    with torch.no_grad():
        for imgs, lbls in loader_val:
            imgs = imgs.to(device)
            outputs = img_model(imgs)
            _, preds = torch.max(outputs, 1)
            val_preds.extend(preds.cpu().numpy())
            val_targets.extend(lbls.numpy())

    val_acc = accuracy_score(val_targets, val_preds)
    print(f"Epoch {epoch+1:02d}/15 - Loss: {running_loss/len(ds_tr):.4f} - Val Acc: {val_acc:.4f}")

    if val_acc >= best_val_acc:
        best_val_acc = val_acc
        torch.save(img_model.state_dict(), best_model_path)

training_duration_sec = round(time.time() - start_time, 2)
print(f"Vision Model Training Complete in {training_duration_sec}s. Best Val Acc: {best_val_acc:.4f}")

# Evaluate Vision Model on Test Set
img_model.load_state_dict(torch.load(best_model_path))
img_model.eval()

img_test_preds = []
img_test_targets = []
img_test_probs = []

with torch.no_grad():
    for imgs, lbls in loader_te:
        imgs = imgs.to(device)
        outputs = img_model(imgs)
        probs = torch.softmax(outputs, dim=1)
        _, preds = torch.max(outputs, 1)
        img_test_preds.extend(preds.cpu().numpy())
        img_test_targets.extend(lbls.numpy())
        img_test_probs.extend(probs.cpu().numpy())

img_test_acc = float(accuracy_score(img_test_targets, img_test_preds))
img_test_bacc = float(balanced_accuracy_score(img_test_targets, img_test_preds))
print(f"Vision Model Test Accuracy: {round(img_test_acc, 4)}")
print(f"Vision Model Test Balanced Accuracy: {round(img_test_bacc, 4)}")

# Confusion Matrix & Classification Report
cm = confusion_matrix(img_test_targets, img_test_preds)
cls_report = classification_report(
    img_test_targets, img_test_preds, target_names=classes, output_dict=True, zero_division=0
)

# Identify Failure Cases (Correction #10 - item 13)
failure_cases = []
for i in range(len(img_test_targets)):
    if img_test_targets[i] != img_test_preds[i]:
        row = test_vis.iloc[i]
        failure_cases.append({
            "product_name": str(row["product_name"]),
            "true_label": classes[img_test_targets[i]],
            "predicted_label": classes[img_test_preds[i]],
            "predicted_prob": float(img_test_probs[i][img_test_preds[i]]),
            "image_filename": str(row["image_filename"])
        })
        if len(failure_cases) >= 10:
            break

# -------------------------------------------------------------
# 8. SAVE METRICS JSON (Correction #10)
# -------------------------------------------------------------
metrics_payload = {
    "metadata_dataset_size": total_csv_records,
    "vision_dataset_size": len(df_vision),
    "image_matching_audit": matching_report,
    "marketplace_listed_price_stats": price_stats,
    "label_type": label_type,
    "class_distribution_metadata": class_dist_full,
    "split_counts": {
        "metadata_split": metadata_split_counts,
        "vision_split": vision_split_counts
    },
    "experiment_a_text": {
        "val_accuracy": round(acc_a_val, 4),
        "test_accuracy": round(acc_a_test, 4),
        "test_balanced_accuracy": round(bacc_a_test, 4),
        "potential_leakage_flag": exp_a_leakage_flag
    },
    "experiment_b_ablated_text": {
        "val_accuracy": round(acc_b_val, 4),
        "test_accuracy": round(acc_b_test, 4),
        "test_balanced_accuracy": round(bacc_b_test, 4),
        "potential_leakage_flag": exp_b_leakage_flag
    },
    "experiment_c_vision": {
        "val_best_accuracy": round(best_val_acc, 4),
        "test_accuracy": round(img_test_acc, 4),
        "test_balanced_accuracy": round(img_test_bacc, 4),
        "training_duration_seconds": training_duration_sec,
        "confusion_matrix": cm.tolist(),
        "classification_report": cls_report
    },
    "failure_cases_sample": failure_cases
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
    json.dump(metrics_payload, f, indent=2)

print("\nMetrics payload saved to models/handloom_textiles_full/metrics.json.")
