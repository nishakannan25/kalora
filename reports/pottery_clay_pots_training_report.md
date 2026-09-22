# Pottery Clay Pots Training Report (`04_Clay_Pots`)

## 1. Dataset Overview
- **Dataset Name**: `04_Clay_Pots`
- **Total Metadata Records**: **339**
- **Total Images in Folder**: **339**
- **Verified Matched Pairs**: **339**
- **Corrupted Images**: **0**
- **Label Status**: `DERIVED / HEURISTIC — NOT GROUND TRUTH`

---

## 2. Dataset Splitting & Class Distribution
- **Train Split (80%)**: 271 images
- **Validation Split (10%)**: 34 images
- **Test Split (10%)**: 34 images
- **Classes**: `Clay Planter & Pot` (339 images)

---

## 3. Model Architecture & Experimental Results
- **Backbone**: `MobileNetV3-Small` (PyTorch ImageNet Transfer Learning)
- **Optimizer**: `AdamW` (lr=0.001, weight_decay=1e-4)
- **Batch Size**: 32
- **Epochs**: 2 (Early stopping triggered at Epoch 2)
- **Training Time**: **77.70 seconds**

### Evaluation Metrics

| Metric | Score |
| :--- | :--- |
| **Best Validation Accuracy** | **100.00%** |
| **Test Accuracy** | **100.00%** |
| **Balanced Accuracy** | **100.00%** |
| **Macro Precision** | **1.0000** |
| **Macro Recall** | **1.0000** |
| **Macro F1-Score** | **1.0000** |
| **Weighted F1-Score** | **1.0000** |

---

## 4. Saved Artifacts & Inference Script
- **Saved Model Weights**: `models/pottery_clay_pots/best_model.pt`
- **Label Mapping**: `models/pottery_clay_pots/label_mapping.json`
- **Model Config**: `models/pottery_clay_pots/model_config.json`
- **Metrics Payload**: `models/pottery_clay_pots/metrics.json`
- **Training History**: `models/pottery_clay_pots/training_history.json`
- **Inference Script**: `ml/inference/pottery_clay_pots_classifier.py`

- **STATUS**: **BASELINE**
