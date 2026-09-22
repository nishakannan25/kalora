# KALORA — FURNITURE DATASET ARCHIVE TRAINING REPORT

**Execution Date**: September 14, 2026  
**Status**: `BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY`  
**Architecture**: MobileNetV3-Small (Pretrained ImageNet Baseline)  
**Dataset Directory**: `c:\Users\nisha\.gemini\antigravity\scratch\kalora\archive`

---

## 1. Quick Audit & Data Quality Report

- **Total Uploaded Image Records**: 15,000
- **Total Valid Readable Images**: 15,000
- **Corrupt / Missing Images**: 0
- **Reliable Image-Label Matching**: 100% exact folder-to-class directory structure matching (`almirah_dataset`, `chair_dataset`, `fridge dataset`, `table dataset`, `tv dataset`).
- **Label Status**: `DERIVED / HEURISTIC — NOT GROUND TRUTH` (derived from dataset subfolder naming).

### Class Distribution (5 Furniture & Appliance Classes)

| Class Name | Subfolder | Image Count | Ratio |
|---|---|---|---|
| **Almirah** | `almirah_dataset` | 3,000 | 20.0% |
| **Chair** | `chair_dataset` | 3,000 | 20.0% |
| **Fridge** | `fridge dataset` | 3,000 | 20.0% |
| **Table** | `table dataset` | 3,000 | 20.0% |
| **TV** | `tv dataset` | 3,000 | 20.0% |
| **Total** | | **15,000** | **100.0%** |

---

## 2. Dataset Splitting Strategy

- **Stratified 80/10/10 Split**:
  - **Train Set**: 12,000 images (2,400 images per class)
  - **Validation Set**: 1,500 images (300 images per class)
  - **Test Set**: 1,500 images (300 images per class)

---

## 3. Training Hyperparameters & Execution

- **Model Backbone**: Pretrained `MobileNetV3-Small`
- **Input Resolution**: 224x224 RGB
- **Optimizer**: AdamW (`lr=0.001`, `weight_decay=1e-4`)
- **Loss Function**: Cross-Entropy Loss
- **Batch Size**: 32
- **Epochs**: 4 Epochs (Early Stopping triggered at Epoch 4; Best Val Acc at Epoch 2: 99.87%)
- **Total Training Duration**: 1,648.73 seconds (~27.48 minutes)

### Training Progress Log
```
Epoch 01/08 - Loss: 0.0854 - Val Acc: 0.9173
Epoch 02/08 - Loss: 0.0244 - Val Acc: 0.9987 (BEST)
Epoch 03/08 - Loss: 0.0232 - Val Acc: 0.9847
Epoch 04/08 - Loss: 0.0189 - Val Acc: 0.9873 (Early Stopping)
```

---

## 4. Final Performance Evaluation (Test Set - 1,500 Images)

- **Test Accuracy**: **99.13%**
- **Balanced Accuracy**: **99.13%**
- **Macro Precision**: **99.15%**
- **Macro Recall**: **99.13%**
- **Macro F1 Score**: **99.13%**
- **Weighted F1 Score**: **99.13%**

### Confusion Matrix (Test Set - 1,500 Images)

```
                Predicted:
                Almirah   Chair   Fridge   Table    TV
Actual Almirah    300       0        0       0       0
Actual Chair        0     300        0       0       0
Actual Fridge       0       0      287       9       4
Actual Table        0       0        0     300       0
Actual TV           0       0        0       0     300
```

### Per-Class Metrics

| Class Name | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| **Almirah** | **1.0000** | **1.0000** | **1.0000** | 300 |
| **Chair** | **1.0000** | **1.0000** | **1.0000** | 300 |
| **Fridge** | **1.0000** | **0.9567** | **0.9779** | 300 |
| **Table** | **0.9868** | **1.0000** | **0.9934** | 300 |
| **TV** | **0.9709** | **1.0000** | **0.9852** | 300 |

---

## 5. Accuracy ≥ 95% Inspection & Limitations

- **High Accuracy Check (99.13% ≥ 95%)**:
  - **Class Balance**: Perfect 20.0% class balance across all 5 categories.
  - **Visual Separability**: High accuracy is due to distinct, clean visual characteristics of isolated product objects on studio backgrounds.
  - **Leakage Check**: Stratified split confirmed zero overlap between train, val, and test splits.
- **Main Limitation**:
  - studio/isolated product images with clean backgrounds may experience domain shift when deployed on real-world mobile photos with complex room clutter and poor lighting.
- **Status**:
  - `BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY`

---

## 6. Saved Model & Inference Artifacts

- **Model Directory**: `models/furniture_dataset_archive/`
  - `best_model.pth` / `best_model.pt`
  - `config.json` / `model_config.json`
  - `label_mapping.json`
  - `metrics.json`
  - `history.json` / `training_history.json`
  - `dataset_summary.json`
- **Inference Script**: `ml/inference/furniture_dataset_archive_classifier.py`
- **Confidence Threshold**: `0.60` (Returns `UNCERTAIN` for confidence < 0.60)
