# Pottery Plastic Pots Training Report (`03_Plastic_Pots`)

## 1. Dataset Overview
- **Dataset Name**: `03_Plastic_Pots`
- **Total Metadata Records**: **2,913**
- **Total Images in Folder**: **3,317**
- **Verified Matched Pairs**: **2,913**
- **Corrupted Images**: **0**
- **Label Status**: `DERIVED / HEURISTIC — NOT GROUND TRUTH`

---

## 2. Dataset Splitting & Class Distribution
- **Train Split (80%)**: 2,330 images
- **Validation Split (10%)**: 291 images
- **Test Split (10%)**: 292 images
- **Classes**:
  - `Plastic Planter & Pot`: 2,512 images (86.2%)
  - `Plastic Hanging Planter`: 401 images (13.8%)

---

## 3. Model Architecture & Experimental Results
- **Backbone**: `MobileNetV3-Small` (PyTorch ImageNet Transfer Learning)
- **Optimizer**: `AdamW` (lr=0.001, weight_decay=1e-4)
- **Batch Size**: 32
- **Epochs**: 4 (Early stopping triggered at Epoch 4)
- **Training Time**: **2952.74 seconds**

### Evaluation Metrics

| Metric | Score |
| :--- | :--- |
| **Best Validation Accuracy** | **86.60%** |
| **Test Accuracy** | **85.96%** |
| **Balanced Accuracy** | **52.96%** |
| **Macro Precision** | **0.6494** |
| **Macro Recall** | **0.5296** |
| **Macro F1-Score** | **0.5257** |
| **Weighted F1-Score** | **0.8146** |

---

## 4. Confusion Matrix

```
                          [Plastic Hanging Planter]  [Plastic Planter & Pot]
[Plastic Hanging Planter]             3                         37
[Plastic Planter & Pot]               4                        248
```

---

## 5. Saved Artifacts & Inference Script
- **Saved Model Weights**: `models/pottery_plastic_pots/best_model.pt`
- **Label Mapping**: `models/pottery_plastic_pots/label_mapping.json`
- **Model Config**: `models/pottery_plastic_pots/model_config.json`
- **Metrics Payload**: `models/pottery_plastic_pots/metrics.json`
- **Training History**: `models/pottery_plastic_pots/training_history.json`
- **Inference Script**: `ml/inference/pottery_plastic_pots_classifier.py`

- **STATUS**: **BASELINE**
