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

# Set seeds
np.random.seed(42)
torch.manual_seed(42)

BASE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora"
CSV_PATH = os.path.join(BASE_DIR, "indiahandmade.csv")
IMAGES_DIR = os.path.join(BASE_DIR, "downloaded_images", "downloaded_images")
if not os.path.exists(IMAGES_DIR):
    IMAGES_DIR = os.path.join(BASE_DIR, "downloaded_images")

MODEL_DIR = os.path.join(BASE_DIR, "models", "indiahandmade_48")
REPORTS_DIR = os.path.join(BASE_DIR, "reports")
INFERENCE_DIR = os.path.join(BASE_DIR, "ml", "inference")

for d in [MODEL_DIR, REPORTS_DIR, INFERENCE_DIR]:
    os.makedirs(d, exist_ok=True)

df = pd.read_csv(CSV_PATH)
df["id"] = range(len(df))

# Match images
img_files_available = sorted([os.path.join(IMAGES_DIR, f) for f in os.listdir(IMAGES_DIR) if f.startswith("product_")])
if not img_files_available:
    raise FileNotFoundError(f"No product_ image files found in {IMAGES_DIR}")
df["image_full_path"] = [img_files_available[i % len(img_files_available)] for i in range(len(df))]
df["image_file"] = df["image_full_path"].apply(os.path.basename)

# Clean Prices
def clean_price(p_str):
    if pd.isna(p_str):
        return np.nan
    clean = re.sub(r"[^\d.]", "", str(p_str))
    return float(clean) if clean else np.nan

df["price_clean"] = df["price"].apply(clean_price)
df["original_price_clean"] = df["price 2"].apply(clean_price)

# Derive Target Label: Fabric Material (Cotton vs Silk vs Muslin)
def derive_material(title):
    t = str(title).lower()
    if "silk" in t or "muslin" in t:
        return "Silk / Fine Weaver"
    elif "cotton" in t:
        return "Cotton Handloom"
    else:
        return "Cotton Handloom"

title_col = "product title" if "product title" in df.columns else df.columns[0]
df["derived_material"] = df[title_col].apply(derive_material)
df["title_text"] = df[title_col]

print("=== MATERIAL TARGET DISTRIBUTION (48 Records) ===")
mat_dist = df["derived_material"].value_counts()
print(mat_dist)

# Price Statistics
print("\n=== MARKETPLACE LISTED PRICE STATISTICS ===")
price_stats = {
    "min_price": float(df["price_clean"].min()),
    "max_price": float(df["price_clean"].max()),
    "median_price": float(df["price_clean"].median()),
    "mean_price": float(round(df["price_clean"].mean(), 2)),
    "price_by_material": df.groupby("derived_material")["price_clean"].mean().to_dict()
}
print(price_stats)

# Stratified Split (70% Train, 15% Val, 15% Test)
X_idx = df["id"].values
y_mat = df["derived_material"].values

train_idx, temp_idx, y_train, y_temp = train_test_split(
    X_idx, y_mat, test_size=0.30, random_state=42, stratify=y_mat
)

val_idx, test_idx, y_val, y_test = train_test_split(
    temp_idx, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

df["split"] = "train"
df.loc[df["id"].isin(val_idx), "split"] = "val"
df.loc[df["id"].isin(test_idx), "split"] = "test"

print("\n--- SPLIT SIZES ---")
print(df["split"].value_counts())

# Save Splits Mapping
classes = sorted(list(df["derived_material"].unique()))
class_to_idx = {c: i for i, c in enumerate(classes)}

# ==========================================
# EXPERIMENT A: TEXT BASELINE (TF-IDF + LR)
# ==========================================
print("\n=== EXPERIMENT A: TEXT BASELINE (TF-IDF + Logistic Regression) ===")
train_df = df[df["split"] == "train"]
val_df = df[df["split"] == "val"]
test_df = df[df["split"] == "test"]

tfidf = TfidfVectorizer(ngram_range=(1, 2))
X_tr_tfidf = tfidf.fit_transform(train_df["title_text"])
X_te_tfidf = tfidf.transform(test_df["title_text"])

text_model = LogisticRegression(class_weight="balanced", random_state=42)
text_model.fit(X_tr_tfidf, train_df["derived_material"])
text_preds = text_model.predict(X_te_tfidf)
text_acc = accuracy_score(test_df["derived_material"], text_preds)
print(f"Text Model Test Accuracy: {round(text_acc, 4)}")

# ==========================================
# EXPERIMENT B: FEATURE ABLATION (No 'silk'/'cotton' keywords in text)
# ==========================================
print("\n=== EXPERIMENT B: TEXT ABLATION (Stripping Material Keywords) ===")
def strip_material_words(text):
    return re.sub(r"\b(silk|cotton|muslin|pure|handloom|saree)\b", "", str(text), flags=re.IGNORECASE)

train_df_ab = train_df["title_text"].apply(strip_material_words)
test_df_ab = test_df["title_text"].apply(strip_material_words)

tfidf_ab = TfidfVectorizer()
X_tr_ab = tfidf_ab.fit_transform(train_df_ab)
X_te_ab = tfidf_ab.transform(test_df_ab)

text_model_ab = LogisticRegression(class_weight="balanced", random_state=42)
text_model_ab.fit(X_tr_ab, train_df["derived_material"])
text_preds_ab = text_model_ab.predict(X_te_ab)
text_acc_ab = accuracy_score(test_df["derived_material"], text_preds_ab)
print(f"Ablated Text Model Test Accuracy (Without direct material keywords): {round(text_acc_ab, 4)}")

# ==========================================
# EXPERIMENT C: IMAGE MODEL (MobileNetV3-Small)
# ==========================================
print("\n=== EXPERIMENT C: PURE IMAGE CLASSIFIER (MobileNetV3-Small) ===")

class IHDataset(Dataset):
    def __init__(self, sub_df, transform=None):
        self.sub_df = sub_df
        self.transform = transform

    def __len__(self):
        return len(self.sub_df)

    def __getitem__(self, idx):
        row = self.sub_df.iloc[idx]
        img = Image.open(row["image_full_path"]).convert("RGB")
        label = class_to_idx[row["derived_material"]]
        if self.transform:
            img = self.transform(img)
        return img, label

train_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

eval_tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

ds_tr = IHDataset(train_df, transform=train_tf)
ds_val = IHDataset(val_df, transform=eval_tf)
ds_te = IHDataset(test_df, transform=eval_tf)

loader_tr = DataLoader(ds_tr, batch_size=8, shuffle=True)
loader_val = DataLoader(ds_val, batch_size=8, shuffle=False)
loader_te = DataLoader(ds_te, batch_size=8, shuffle=False)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
img_model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

# Initially freeze backbone as required by Step 7
for param in img_model.parameters():
    param.requires_grad = False

num_ftrs = img_model.classifier[3].in_features
img_model.classifier[3] = nn.Linear(num_ftrs, len(classes))
img_model = img_model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(img_model.classifier[3].parameters(), lr=1e-3, weight_decay=1e-4)

best_val_acc = 0.0
for epoch in range(20):
    img_model.train()
    for imgs, lbls in loader_tr:
        imgs, lbls = imgs.to(device), lbls.to(device)
        optimizer.zero_grad()
        loss = criterion(img_model(imgs), lbls)
        loss.backward()
        optimizer.step()
        
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
    if val_acc >= best_val_acc:
        best_val_acc = val_acc
        torch.save(img_model.state_dict(), os.path.join(MODEL_DIR, "best_vision_model.pt"))

print(f"Vision Model Best Validation Accuracy: {round(best_val_acc, 4)}")

# Evaluate Vision Model on Test Set
img_model.load_state_dict(torch.load(os.path.join(MODEL_DIR, "best_vision_model.pt")))
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

img_test_acc = accuracy_score(img_test_targets, img_test_preds)
print(f"Vision Model Test Accuracy: {round(img_test_acc, 4)}")

# Save Model Artifacts & Labels
idx_to_class = {i: c for i, c in enumerate(classes)}
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(idx_to_class, f, indent=2)

metrics_report = {
    "price_statistics": price_stats,
    "class_distribution": mat_dist.to_dict(),
    "split_counts": df["split"].value_counts().to_dict(),
    "experiment_a_text_accuracy": round(float(text_acc), 4),
    "experiment_b_ablated_text_accuracy": round(float(text_acc_ab), 4),
    "experiment_c_vision_val_accuracy": round(float(best_val_acc), 4),
    "experiment_c_vision_test_accuracy": round(float(img_test_acc), 4),
    "test_classification_report": classification_report(
        img_test_targets, img_test_preds, target_names=classes, output_dict=True, zero_division=0
    )
}

with open(os.path.join(MODEL_DIR, "metrics.json"), "w", encoding="utf-8") as f:
    json.dump(metrics_report, f, indent=2)

print("\nPipeline execution complete. Metrics saved to models/indiahandmade_48/metrics.json.")
