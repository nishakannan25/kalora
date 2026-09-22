import os
import json
import time
import random
import numpy as np
import pandas as pd
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights

from datasets import load_dataset
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, precision_recall_fscore_support, confusion_matrix
)

# 1. Reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# 2. Output Directory
MODEL_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\models\furniture_synthetic"
os.makedirs(MODEL_DIR, exist_ok=True)

# 3. Load Dataset from HuggingFace
print("Loading HuggingFace dataset filnow/furniture-synthetic-dataset...")
ds = load_dataset("filnow/furniture-synthetic-dataset")

train_hf = ds['train']
test_hf = ds['test']

print(f"Loaded {len(train_hf)} synthetic training samples and {len(test_hf)} real test samples.")

# Map target 4 categories: Bed, Chair, Sofa, Table
def map_category(raw_type):
    if not raw_type or not isinstance(raw_type, str):
        return 'Chair'
    t = raw_type.lower().strip()
    if 'bed' in t:
        return 'Bed'
    elif 'chair' in t or 'stool' in t:
        return 'Chair'
    elif 'sofa' in t or 'couch' in t or 'ottoman' in t or 'lounge' in t:
        return 'Sofa'
    elif 'table' in t or 'desk' in t or 'cabinet' in t:
        return 'Table'
    else:
        return 'Chair'

classes = ['Bed', 'Chair', 'Sofa', 'Table']
class2idx = {c: i for i, c in enumerate(classes)}
idx2class = {i: c for i, c in enumerate(classes)}

# Process Train Dataset (Synthetic)
train_records = []
for idx, item in enumerate(train_hf):
    cat = map_category(item.get('type'))
    train_records.append({
        'index': idx,
        'category': cat,
        'label': class2idx[cat]
    })
train_df = pd.DataFrame(train_records)

# Process Test Dataset (Real)
test_records = []
for idx, item in enumerate(test_hf):
    cat = map_category(item.get('type'))
    test_records.append({
        'index': idx,
        'category': cat,
        'label': class2idx[cat]
    })
test_df = pd.DataFrame(test_records)

print("\nSynthetic Train Class Distribution:")
print(train_df['category'].value_counts())

print("\nReal Test Class Distribution:")
print(test_df['category'].value_counts())

# Split Synthetic Train into Train (90%) and Val (10%)
from sklearn.model_selection import train_test_split
train_split_df, val_split_df = train_test_split(
    train_df, test_size=0.10, random_state=SEED, stratify=train_df['label']
)

print(f"\nFinal Splits: Train (Synthetic): {len(train_split_df)}, Val (Synthetic): {len(val_split_df)}, Test (Real): {len(test_df)}")

# 4. PyTorch Dataset Wrapper
class HFSyntheticDataset(Dataset):
    def __init__(self, hf_split, df_meta, transform=None):
        self.hf_split = hf_split
        self.df_meta = df_meta.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df_meta)

    def __getitem__(self, idx):
        row = self.df_meta.iloc[idx]
        hf_idx = int(row['index'])
        item = self.hf_split[hf_idx]
        
        img = item['image']
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        label = int(row['label'])
        
        if self.transform:
            img = self.transform(img)
            
        return img, label

# Transforms
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
    transforms.RandomAffine(degrees=10, translate=(0.05, 0.05)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

eval_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

train_loader = DataLoader(HFSyntheticDataset(train_hf, train_split_df, train_transform), batch_size=32, shuffle=True)
val_loader = DataLoader(HFSyntheticDataset(train_hf, val_split_df, eval_transform), batch_size=32, shuffle=False)
test_loader = DataLoader(HFSyntheticDataset(test_hf, test_df, eval_transform), batch_size=32, shuffle=False)

# 5. Model Architecture & Loss
model = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.DEFAULT)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(classes))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4)

# 6. Training Loop
best_val_acc = 0.0
patience = 2
patience_counter = 0
epochs = 8
history = []

start_time = time.time()

for epoch in range(epochs):
    model.train()
    running_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * images.size(0)

    epoch_loss = running_loss / len(train_split_df)

    # Validation
    model.eval()
    val_preds, val_targets = [], []
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            val_preds.extend(preds.cpu().numpy())
            val_targets.extend(labels.cpu().numpy())

    val_acc = accuracy_score(val_targets, val_preds)
    print(f"Epoch {epoch+1:02d}/{epochs:02d} - Loss: {epoch_loss:.4f} - Val Acc: {val_acc:.4f}")

    history.append({'epoch': epoch + 1, 'loss': round(float(epoch_loss), 4), 'val_acc': round(float(val_acc), 4)})

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), os.path.join(MODEL_DIR, "best_model.pth"))
        torch.save(model.state_dict(), os.path.join(MODEL_DIR, "best_model.pt"))
        patience_counter = 0
    else:
        patience_counter += 1
        if patience_counter >= patience:
            print(f"Early stopping triggered at epoch {epoch+1}")
            break

training_duration = time.time() - start_time
print(f"\nTraining Complete in {training_duration:.2f}s. Best Val Acc (Synthetic): {best_val_acc:.4f}")

# 7. Evaluation ONLY on Provided Real Test Set
best_weights_path = os.path.join(MODEL_DIR, "best_model.pth")
model.load_state_dict(torch.load(best_weights_path, map_location=device))
model.eval()

test_preds, test_targets = [], []
with torch.no_grad():
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        _, preds = torch.max(outputs, 1)
        test_preds.extend(preds.cpu().numpy())
        test_targets.extend(labels.cpu().numpy())

test_acc = accuracy_score(test_targets, test_preds)
bal_acc = balanced_accuracy_score(test_targets, test_preds)
p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(test_targets, test_preds, average='macro', zero_division=0)
p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(test_targets, test_preds, average='weighted', zero_division=0)

cm = confusion_matrix(test_targets, test_preds)

precision_cls, recall_cls, f1_cls, support_cls = precision_recall_fscore_support(
    test_targets, test_preds, labels=list(range(len(classes))), zero_division=0
)

class_report = {}
for i, c in enumerate(classes):
    class_report[c] = {
        'precision': float(precision_cls[i]),
        'recall': float(recall_cls[i]),
        'f1-score': float(f1_cls[i]),
        'support': int(support_cls[i])
    }

metrics = {
    'dataset_name': 'HuggingFace_Furniture_Synthetic_Dataset',
    'total_synthetic_train_samples': len(train_hf),
    'total_real_test_samples': len(test_hf),
    'splits': {
        'synthetic_train': len(train_split_df),
        'synthetic_val': len(val_split_df),
        'real_test': len(test_df)
    },
    'training_duration_seconds': round(training_duration, 2),
    'val_best_accuracy_synthetic': round(float(best_val_acc), 4),
    'test_accuracy_real': round(float(test_acc), 4),
    'balanced_accuracy_real': round(float(bal_acc), 4),
    'macro_precision_real': round(float(p_macro), 4),
    'macro_recall_real': round(float(r_macro), 4),
    'macro_f1_real': round(float(f1_macro), 4),
    'weighted_f1_real': round(float(f1_weighted), 4),
    'confusion_matrix_real': cm.tolist(),
    'classification_report_real': class_report,
    'data_type_note': 'Training data are synthetic images; Test data are real-world images.'
}

config = {
    'model_architecture': 'MobileNetV3-Small',
    'input_resolution': '224x224',
    'num_classes': len(classes),
    'class2idx': class2idx,
    'idx2class': idx2class,
    'dataset_source': 'https://huggingface.co/datasets/filnow/furniture-synthetic-dataset',
    'status': 'BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY'
}

dataset_summary = {
    'dataset_source': 'filnow/furniture-synthetic-dataset',
    'synthetic_train_images': len(train_hf),
    'real_test_images': len(test_hf),
    'categories': classes,
    'train_class_distribution': train_df['category'].value_counts().to_dict(),
    'test_class_distribution': test_df['category'].value_counts().to_dict()
}

with open(os.path.join(MODEL_DIR, "config.json"), "w") as f:
    json.dump(config, f, indent=2)

with open(os.path.join(MODEL_DIR, "model_config.json"), "w") as f:
    json.dump(config, f, indent=2)

with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w") as f:
    json.dump(idx2class, f, indent=2)

with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
    json.dump(metrics, f, indent=2)

with open(os.path.join(MODEL_DIR, "history.json"), "w") as f:
    json.dump(history, f, indent=2)

with open(os.path.join(MODEL_DIR, "training_history.json"), "w") as f:
    json.dump(history, f, indent=2)

with open(os.path.join(MODEL_DIR, "dataset_summary.json"), "w") as f:
    json.dump(dataset_summary, f, indent=2)

print("\nModel training and serialization complete.")
print(f"Real Test Accuracy: {test_acc:.4f}, Balanced Acc: {bal_acc:.4f}, Macro F1: {f1_macro:.4f}, Weighted F1: {f1_weighted:.4f}")
