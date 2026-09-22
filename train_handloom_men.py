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
CSV_PATH = os.path.join(BASE_DIR, "handloom_textiles_men_full.csv")
IMAGES_DIR = os.path.join(BASE_DIR, "handloom_men")

MODEL_DIR = os.path.join(BASE_DIR, "models", "handloom_men")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

# -------------------------------------------------------------
# STEP 1: QUICK DATASET AUDIT & EXACT MATCHING
# -------------------------------------------------------------
df = pd.read_csv(CSV_PATH)
total_csv_records = len(df)
available_images = set(os.listdir(IMAGES_DIR)) if os.path.exists(IMAGES_DIR) else set()

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

# Derived label & group key before split
def derive_men_category(title):
    t = str(title).lower()
    if any(w in t for w in ["kurta", "shirt", "pyjama", "waistcoat", "jacket", "kurtas"]):
        return "Kurta & Men Shirt"
    elif any(w in t for w in ["dhoti", "veshti", "lungi", "panche"]):
        return "Dhoti & Ethnic Bottomwear"
    elif any(w in t for w in ["dupatta", "stole", "scarf", "shawl", "angavastram", "towel"]):
        return "Stole & Angavastram"
    elif any(w in t for w in ["saree", "sari"]):
        return "Saree & Traditional Wrap"
    else:
        return "General Men Handloom Craft"

df["derived_label"] = df["product_name"].apply(derive_men_category)
df["group_key"] = df["product_name"].apply(lambda x: str(x).strip().lower())

df_vision = df[df["image_exists"]].copy()
matched_pairs = len(df_vision)
unmatched_metadata = total_csv_records - matched_pairs
unmatched_images = len(available_images - set(df_vision["image_filename"]))

print(f"=== STEP 1: AUDIT SUMMARY ===")
print(f"Total Metadata Records: {total_csv_records}")
print(f"Total Image Files: {len(available_images)}")
print(f"Verified Matched Pairs: {matched_pairs}")
print(f"Unmatched Metadata: {unmatched_metadata}")
print(f"Unmatched Images: {unmatched_images}")

# Listed Price Audit
def clean_price(p):
    if pd.isna(p): return np.nan
    s = re.sub(r"[^\d.]", "", str(p))
    try:
        v = float(s)
        return v if v > 0 else np.nan
    except:
        return np.nan

df["price_clean"] = df["price"].apply(clean_price)
prices = df["price_clean"].dropna()

price_stats = {
    "price_type": "MARKETPLACE LISTED PRICE (NOT FAIR PRICE GROUND TRUTH)",
    "valid_prices_count": int(len(prices)),
    "min": float(prices.min()) if len(prices) else 0.0,
    "max": float(prices.max()) if len(prices) else 0.0,
    "median": float(prices.median()) if len(prices) else 0.0,
    "mean": float(round(prices.mean(), 2)) if len(prices) else 0.0,
    "std": float(round(prices.std(), 2)) if len(prices) else 0.0
}

# -------------------------------------------------------------
# STEP 2: SELECT BEST ML TASK (DERIVED LABELS)
# -------------------------------------------------------------
label_status = "DERIVED / HEURISTIC LABEL — NOT GROUND TRUTH"
classes = sorted(list(df["derived_label"].unique()))
class_to_idx = {c: i for i, c in enumerate(classes)}
idx_to_class = {i: c for i, c in enumerate(classes)}

class_dist_meta = df["derived_label"].value_counts().to_dict()
class_dist_vision = df_vision["derived_label"].value_counts().to_dict()

print(f"\n=== STEP 2: TARGET CLASS DISTRIBUTION ({label_status}) ===")
print("Metadata Distribution:", class_dist_meta)
print("Vision Distribution:", class_dist_vision)

# -------------------------------------------------------------
# STEP 3: GROUP-AWARE SPLITTING (70/15/15)
# -------------------------------------------------------------
unique_groups = df[["group_key", "derived_label"]].drop_duplicates()

g_train, g_temp = train_test_split(
    unique_groups, test_size=0.30, random_state=42, stratify=unique_groups["derived_label"]
)
g_val, g_test = train_test_split(
    g_temp, test_size=0.50, random_state=42, stratify=g_temp["derived_label"]
)

train_groups = set(g_train["group_key"])
val_groups = set(g_val["group_key"])
test_groups = set(g_test["group_key"])

def assign_split(gk):
    if gk in train_groups: return "train"
    if gk in val_groups: return "val"
    if gk in test_groups: return "test"
    return "train"

df["split"] = df["group_key"].apply(assign_split)
df_vision["split"] = df_vision["group_key"].apply(assign_split)

metadata_split = df["split"].value_counts().to_dict()
vision_split = df_vision["split"].value_counts().to_dict()

print("\n=== SPLIT COUNTS ===")
print("Metadata Split:", metadata_split)
print("Vision Split:", vision_split)

# -------------------------------------------------------------
# STEP 4: TRAIN TEXT MODELS (Exp A & Exp B)
# -------------------------------------------------------------
train_meta = df[df["split"] == "train"]
val_meta = df[df["split"] == "val"]
test_meta = df[df["split"] == "test"]

# Exp A: Full Text
tfidf_a = TfidfVectorizer(ngram_range=(1, 2))
X_tr_a = tfidf_a.fit_transform(train_meta["product_name"])
X_val_a = tfidf_a.transform(val_meta["product_name"])
X_te_a = tfidf_a.transform(test_meta["product_name"])

clf_a = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
clf_a.fit(X_tr_a, train_meta["derived_label"])
preds_a_test = clf_a.predict(X_te_a)

acc_a = float(accuracy_score(test_meta["derived_label"], preds_a_test))
bacc_a = float(balanced_accuracy_score(test_meta["derived_label"], preds_a_test))
p_a, r_a, f1_a, _ = precision_recall_fscore_support(test_meta["derived_label"], preds_a_test, average="macro", zero_division=0)
_, _, wf1_a, _ = precision_recall_fscore_support(test_meta["derived_label"], preds_a_test, average="weighted", zero_division=0)

# Exp B: Ablated Text
def strip_keywords(t):
    p = r"\b(kurta|kurtas|shirt|pyjama|waistcoat|jacket|dhoti|veshti|lungi|panche|dupatta|stole|scarf|shawl|angavastram|towel|saree|sari|handloom|cotton|silk|men|mens)\b"
    return re.sub(p, "", str(t), flags=re.IGNORECASE).strip()

train_meta_ab = train_meta["product_name"].apply(strip_keywords)
test_meta_ab = test_meta["product_name"].apply(strip_keywords)

tfidf_b = TfidfVectorizer()
X_tr_b = tfidf_b.fit_transform(train_meta_ab)
X_te_b = tfidf_b.transform(test_meta_ab)

clf_b = LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000)
clf_b.fit(X_tr_b, train_meta["derived_label"])
preds_b_test = clf_b.predict(X_te_b)

acc_b = float(accuracy_score(test_meta["derived_label"], preds_b_test))
bacc_b = float(balanced_accuracy_score(test_meta["derived_label"], preds_b_test))
p_b, r_b, f1_b, _ = precision_recall_fscore_support(test_meta["derived_label"], preds_b_test, average="macro", zero_division=0)
_, _, wf1_b, _ = precision_recall_fscore_support(test_meta["derived_label"], preds_b_test, average="weighted", zero_division=0)

print(f"\nText Model (Exp A) Test Acc: {acc_a:.4f}, Macro F1: {f1_a:.4f}")
print(f"Ablated Text Model (Exp B) Test Acc: {acc_b:.4f}, Macro F1: {f1_b:.4f}")

# -------------------------------------------------------------
# STEP 5: TRAIN VISION MODEL (Exp C)
# -------------------------------------------------------------
train_vis = df_vision[df_vision["split"] == "train"]
val_vis = df_vision[df_vision["split"] == "val"]
test_vis = df_vision[df_vision["split"] == "test"]

class MenHandloomDataset(Dataset):
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
        label = class_to_idx[row["derived_label"]]
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

ds_tr = MenHandloomDataset(train_vis, transform=train_tf)
ds_val = MenHandloomDataset(val_vis, transform=eval_tf)
ds_te = MenHandloomDataset(test_vis, transform=eval_tf)

loader_tr = DataLoader(ds_tr, batch_size=16, shuffle=True)
loader_val = DataLoader(ds_val, batch_size=16, shuffle=False)
loader_te = DataLoader(ds_te, batch_size=16, shuffle=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
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
for epoch in range(12):
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
    print(f"Vision Epoch {epoch+1:02d}/12 - Loss: {epoch_loss:.4f} - Val Acc: {val_acc:.4f}")

    if val_acc >= best_val_acc:
        best_val_acc = val_acc
        torch.save(img_model.state_dict(), best_weights_path)

# Evaluate Vision Model on Test Split
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

acc_c = float(accuracy_score(img_test_targets, img_test_preds))
bacc_c = float(balanced_accuracy_score(img_test_targets, img_test_preds))
p_c, r_c, f1_c, _ = precision_recall_fscore_support(img_test_targets, img_test_preds, average="macro", zero_division=0)
_, _, wf1_c, _ = precision_recall_fscore_support(img_test_targets, img_test_preds, average="weighted", zero_division=0)

cm_c = confusion_matrix(img_test_targets, img_test_preds).tolist()
cls_report_c = classification_report(img_test_targets, img_test_preds, target_names=classes, output_dict=True, zero_division=0)

print(f"\nVision Model (Exp C) Test Acc: {acc_c:.4f}, Balanced Acc: {bacc_c:.4f}, Macro F1: {f1_c:.4f}")

# -------------------------------------------------------------
# STEP 6: SAVE ARTIFACTS & CONFIGS
# -------------------------------------------------------------
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(idx_to_class, f, indent=2)

model_config = {
    "model_name": "HandloomMenClassifier",
    "dataset_name": "handloom_textiles_men_full.csv",
    "total_metadata_records": total_csv_records,
    "verified_vision_records": len(df_vision),
    "label_status": label_status,
    "num_classes": len(classes),
    "classes": classes,
    "backbone": "MobileNetV3-Small",
    "uncertainty_threshold": 0.60
}

with open(os.path.join(MODEL_DIR, "model_config.json"), "w", encoding="utf-8") as f:
    json.dump(model_config, f, indent=2)

metrics_payload = {
    "dataset_size_metadata": total_csv_records,
    "dataset_size_vision": len(df_vision),
    "image_matching": {
        "metadata_records": total_csv_records,
        "image_files": len(available_images),
        "verified_matched_pairs": matched_pairs,
        "unmatched_metadata": unmatched_metadata,
        "unmatched_images": unmatched_images
    },
    "price_statistics": price_stats,
    "label_status": label_status,
    "class_distribution_metadata": class_dist_meta,
    "class_distribution_vision": class_dist_vision,
    "splits": {
        "metadata": metadata_split,
        "vision": vision_split
    },
    "experiment_a_text": {
        "test_accuracy": round(acc_a, 4),
        "balanced_accuracy": round(bacc_a, 4),
        "macro_precision": round(float(p_a), 4),
        "macro_recall": round(float(r_a), 4),
        "macro_f1": round(float(f1_a), 4),
        "weighted_f1": round(float(wf1_a), 4)
    },
    "experiment_b_ablated_text": {
        "test_accuracy": round(acc_b, 4),
        "balanced_accuracy": round(bacc_b, 4),
        "macro_precision": round(float(p_b), 4),
        "macro_recall": round(float(r_b), 4),
        "macro_f1": round(float(f1_b), 4),
        "weighted_f1": round(float(wf1_b), 4)
    },
    "experiment_c_vision": {
        "val_best_accuracy": round(best_val_acc, 4),
        "test_accuracy": round(acc_c, 4),
        "balanced_accuracy": round(bacc_c, 4),
        "macro_precision": round(float(p_c), 4),
        "macro_recall": round(float(r_c), 4),
        "macro_f1": round(float(f1_c), 4),
        "weighted_f1": round(float(wf1_c), 4),
        "confusion_matrix": cm_c,
        "classification_report": cls_report_c,
        "training_history": history
    }
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
    json.dump(metrics_payload, f, indent=2)

print("\nModel training and serialization complete.")
