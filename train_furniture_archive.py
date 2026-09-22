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

from sklearn.model_selection import train_test_split
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

# 2. Paths
ARCHIVE_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive"
MODEL_DIR = r"c:\Users\nisha\.gemini\antigravity\scratch\kalora\models\furniture_dataset_archive"
os.makedirs(MODEL_DIR, exist_ok=True)

# 3. Load & Structure Records
subdirs = {
    'Almirah': 'almirah_dataset',
    'Chair': 'chair_dataset',
    'Fridge': 'fridge dataset',
    'Table': 'table dataset',
    'TV': 'tv dataset'
}

records = []
corrupt_count = 0

for class_name, folder_name in subdirs.items():
    fp = os.path.join(ARCHIVE_DIR, folder_name)
    if os.path.exists(fp):
        for f in sorted(os.listdir(fp)):
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                img_path = os.path.join(fp, f)
                records.append({
                    'image_path': img_path,
                    'category': class_name
                })

matched_df = pd.DataFrame(records)
print(f"Total verified image-label pairs: {len(matched_df)}")
print("Class distribution:")
print(matched_df['category'].value_counts())

classes = sorted(matched_df['category'].unique())
class2idx = {c: i for i, c in enumerate(classes)}
idx2class = {i: c for i, c in enumerate(classes)}
matched_df['label'] = matched_df['category'].map(class2idx)

# 4. Stratified 80 / 10 / 10 Split
train_df, temp_df = train_test_split(
    matched_df, test_size=0.20, random_state=SEED, stratify=matched_df['label']
)
val_df, test_df = train_test_split(
    temp_df, test_size=0.50, random_state=SEED, stratify=temp_df['label']
)

print(f"Splits -> Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")

# 5. Dataset & DataLoader
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

class FurnitureArchiveDataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = Image.open(row['image_path'])
        if img.mode != 'RGB':
            img = img.convert('RGB')
        label = int(row['label'])
        if self.transform:
            img = self.transform(img)
        return img, label

train_loader = DataLoader(FurnitureArchiveDataset(train_df, train_transform), batch_size=32, shuffle=True)
val_loader = DataLoader(FurnitureArchiveDataset(val_df, eval_transform), batch_size=32, shuffle=False)
test_loader = DataLoader(FurnitureArchiveDataset(test_df, eval_transform), batch_size=32, shuffle=False)

# 6. Model Architecture & Loss
model = mobilenet_v3_small(weights=MobileNet_V3_Small_Weights.DEFAULT)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(classes))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=1e-4)

# 7. Training Loop
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

    epoch_loss = running_loss / len(train_df)

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
print(f"\nTraining Complete in {training_duration:.2f}s. Best Val Acc: {best_val_acc:.4f}")

# 8. Test Set Evaluation
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
    'dataset_name': 'Furniture_Dataset_Archive',
    'total_records': len(matched_df),
    'matched_pairs': len(matched_df),
    'corrupt_images': 0,
    'class_counts': matched_df['category'].value_counts().to_dict(),
    'splits': {'train': len(train_df), 'val': len(val_df), 'test': len(test_df)},
    'training_duration_seconds': round(training_duration, 2),
    'val_best_accuracy': round(float(best_val_acc), 4),
    'test_accuracy': round(float(test_acc), 4),
    'balanced_accuracy': round(float(bal_acc), 4),
    'macro_precision': round(float(p_macro), 4),
    'macro_recall': round(float(r_macro), 4),
    'macro_f1': round(float(f1_macro), 4),
    'weighted_f1': round(float(f1_weighted), 4),
    'confusion_matrix': cm.tolist(),
    'classification_report': class_report
}

config = {
    'model_architecture': 'MobileNetV3-Small',
    'input_resolution': '224x224',
    'num_classes': len(classes),
    'class2idx': class2idx,
    'idx2class': idx2class,
    'derived_labels_status': 'DERIVED / HEURISTIC — NOT GROUND TRUTH',
    'status': 'BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY'
}

dataset_summary = {
    'dataset_name': 'Furniture_Dataset_Archive',
    'total_images': len(matched_df),
    'class_counts': matched_df['category'].value_counts().to_dict(),
    'categories': classes
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
print(f"Test Accuracy: {test_acc:.4f}, Balanced Acc: {bal_acc:.4f}, Macro F1: {f1_macro:.4f}, Weighted F1: {f1_weighted:.4f}")
