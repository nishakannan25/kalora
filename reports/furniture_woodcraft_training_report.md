# KALORA — FURNITURE / WOODCRAFT DATASET TRAINING REPORT

**Execution Date**: September 14, 2026  
**Status**: COMPLETE  
**Architecture**: MobileNetV3-Small (Pretrained ImageNet Baseline)  
**Dataset**: `furniture_full.csv` & `downloaded_images_furniture`

---

## 1. Quick Audit & Data Quality Report

- **Total Records (CSV)**: 990
- **Total Image Files**: 483
- **Valid Image-Product Matches**: 483 (100% Exact 0-indexed Filename-to-Row Matching)
- **Unmatched CSV Rows**: 507 (CSV rows without downloaded images)
- **Corrupt / Unreadable Images**: 0
- **Labeling Protocol**: `DERIVED / HEURISTIC — NOT GROUND TRUTH` (derived from `product_name` keywords)

### Class Distribution (483 Matched Images)

| # | Class Name | Image Count | Split Ratio |
|---|---|---|---|
| 1 | **Wooden Decor & Handicrafts** | 308 | 63.77% |
| 2 | **Chairs & Stools** | 67 | 13.87% |
| 3 | **Tables & Desks** | 54 | 11.18% |
| 4 | **Storage & Cabinets** | 29 | 6.00% |
| 5 | **Swings & Jhulas** | 15 | 3.11% |
| 6 | **Sofas & Loungers** | 10 | 2.07% |

---

## 2. Dataset Splitting Strategy

- **Train / Validation / Test Split**: 80% / 10% / 10% (Stratified by product class)
- **Training Samples**: 386 images
- **Validation Samples**: 48 images
- **Test Samples**: 49 images
- **Reproducibility**: Fixed Random Seed `42`

---

## 3. Training & Performance Baseline Results

### Training Hyperparameters
- **Model Backbone**: Pretrained `MobileNetV3-Small`
- **Input Resolution**: 224x224 RGB
- **Optimizer**: AdamW (`lr=0.001`, `weight_decay=1e-4`)
- **Loss Function**: Cross-Entropy Loss with Class Weights
- **Batch Size**: 32
- **Epochs**: 2 Epochs (Best Val Acc at Epoch 1: 62.50%)
- **Total Training Duration**: 47.22 seconds (CPU)

### Final Evaluation Metrics (Test Set - 49 Images)
- **Best Validation Accuracy**: **62.50%**
- **Test Accuracy**: **77.55%**
- **Balanced Accuracy**: **55.81%**
- **Macro Precision**: **50.00%**
- **Macro Recall**: **55.81%**
- **Macro F1 Score**: **51.82%**
- **Weighted F1 Score**: **72.41%**

---

## 4. Class-Wise Classification Performance

| Class Name | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Swings & Jhulas** | **1.0000** | **1.0000** | **1.0000** | 1 |
| **Wooden Decor & Handicrafts** | **0.8333** | **0.9677** | **0.8955** | 31 |
| **Chairs & Stools** | **0.8333** | **0.7143** | **0.7692** | 7 |
| **Storage & Cabinets** | 0.3333 | 0.6667 | 0.4444 | 3 |
| **Tables & Desks** | 0.0000 | 0.0000 | 0.0000 | 6 |
| **Sofas & Loungers** | 0.0000 | 0.0000 | 0.0000 | 1 |

---

## 5. Main Limitation

- **Sample Size Imbalance**: The dataset contains 308 images in *Wooden Decor & Handicrafts* but relatively few images for minority classes like *Sofas & Loungers* (10 total) and *Swings & Jhulas* (15 total).
- **Label Origin**: Labels are derived heuristically from product titles rather than human-annotated ground truth.

---

## 6. Saved Model & Inference Artifacts

- **Saved Model Directory**: `models/furniture_woodcraft/`
  - `best_model.pth` / `best_model.pt`
  - `config.json` / `model_config.json`
  - `label_mapping.json`
  - `metrics.json`
  - `history.json` / `training_history.json`
- **Inference Module**: `ml/inference/furniture_woodcraft_classifier.py`
- **Confidence Threshold**: `0.60` (Returns `UNCERTAIN` for low-confidence predictions)
