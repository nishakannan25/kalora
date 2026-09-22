# KALORA — FURNITURE SYNTHETIC DATASET TRAINING REPORT

**Execution Date**: September 14, 2026  
**Status**: `BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY`  
**Architecture**: MobileNetV3-Small (Pretrained ImageNet Baseline)  
**Dataset Source**: [HuggingFace filnow/furniture-synthetic-dataset](https://huggingface.co/datasets/filnow/furniture-synthetic-dataset)

---

## 1. Quick Audit & Data Quality Report

- **Total Synthetic Training Images**: 9,000
- **Total Real Test Images**: 1,000
- **Dataset Structure**: Original dataset train/test structure strictly preserved.
- **Data Type Segmentation**:
  - **Training Data**: 100% Synthetic 3D Rendered / Generated Furniture Images (9,000 samples).
  - **Testing Data**: 100% Real-World Furniture Images (1,000 samples). No real images mixed into training.
- **Corrupt / Missing Files**: 0

### Target Class Distribution (4 Main Furniture Classes)

| Class Name | Synthetic Train Count | Real Test Count | Real Test Ratio |
|---|---|---|---|
| **Bed** | 2,250 (25.0%) | 181 | 18.1% |
| **Chair** | 2,250 (25.0%) | 303 | 30.3% |
| **Sofa** | 2,250 (25.0%) | 277 | 27.7% |
| **Table** | 2,250 (25.0%) | 239 | 23.9% |
| **Total** | **9,000** | **1,000** | **100.0%** |

---

## 2. Dataset Splitting Strategy

- **Synthetic Training Split**: 8,100 synthetic images (90%) for model fitting
- **Synthetic Validation Split**: 900 synthetic images (10%) for early stopping & hyperparameter verification
- **Evaluation Split**: 1,000 real-world images (100% real evaluation test set)

---

## 3. Training Hyperparameters & Execution

- **Model Backbone**: Pretrained `MobileNetV3-Small`
- **Input Resolution**: 224x224 RGB
- **Optimizer**: AdamW (`lr=0.001`, `weight_decay=1e-4`)
- **Loss Function**: Cross-Entropy Loss
- **Batch Size**: 32
- **Epochs**: 6 Epochs (Early Stopping triggered at Epoch 6; Best Val Acc at Epoch 4: 98.89%)
- **Total Training Duration**: 2,113.54 seconds (~35.22 minutes)

### Training Progress Log
```
Epoch 01/08 - Loss: 0.1177 - Val Acc (Synthetic): 0.9756
Epoch 02/08 - Loss: 0.0605 - Val Acc (Synthetic): 0.9689
Epoch 03/08 - Loss: 0.0360 - Val Acc (Synthetic): 0.9856
Epoch 04/08 - Loss: 0.0302 - Val Acc (Synthetic): 0.9889 (BEST)
Epoch 05/08 - Loss: 0.0259 - Val Acc (Synthetic): 0.9844
Epoch 06/08 - Loss: 0.0211 - Val Acc (Synthetic): 0.9822 (Early Stopping)
```

---

## 4. Final Performance Evaluation (ONLY on 1,000 Real Test Images)

- **Best Synthetic Validation Accuracy**: **98.89%**
- **Real Test Accuracy**: **78.40%**
- **Real Balanced Accuracy**: **79.76%**
- **Real Macro Precision**: **80.25%**
- **Real Macro Recall**: **79.76%**
- **Real Macro F1 Score**: **77.56%**
- **Real Weighted F1 Score**: **78.20%**

### Confusion Matrix (Real Test Set - 1,000 Images)

```
                Predicted:
                Bed    Chair   Sofa   Table
Actual Bed       161      3       1     16
Actual Chair      12    248       9     34
Actual Sofa       78     10     151     38
Actual Table      14      1       0    224
```

### Class-Wise Metrics on Real Test Set

| Class Name | Precision | Recall | F1-Score | Support (Real Images) |
|---|---|---|---|---|
| **Chair** | **0.9466** | **0.8185** | **0.8779** | 303 |
| **Table** | **0.7179** | **0.9372** | **0.8131** | 239 |
| **Bed** | 0.6075 | **0.8895** | 0.7220 | 181 |
| **Sofa** | **0.9379** | 0.5451 | 0.6895 | 277 |

---

## 5. Main Limitations & Domain Shift Observations

1. **Synthetic-to-Real Domain Gap**:
   - The model achieves **98.89%** accuracy on synthetic validation images, but drops to **78.40%** accuracy when evaluated on real-world photos.
   - **78 Sofa images** were misclassified as **Bed** due to synthetic sofa textures lacking complex real-world room backgrounds, upholstery patterns, and shadows.

2. **Status**:
   - `BASELINE / PROOF OF CONCEPT / PROMISING BUT NOT PRODUCTION-READY`
   - Serves as a strong proof-of-concept for synthetic data transferability in KALORA vision tasks.

---

## 6. Saved Model & Inference Artifacts

- **Model Directory**: `models/furniture_synthetic/`
  - `best_model.pth` / `best_model.pt`
  - `config.json` / `model_config.json`
  - `label_mapping.json`
  - `metrics.json`
  - `history.json` / `training_history.json`
  - `dataset_summary.json`
- **Inference Script**: `ml/inference/furniture_synthetic_classifier.py`
- **Confidence Threshold**: `0.60` (Returns `UNCERTAIN` for confidence < 0.60)
