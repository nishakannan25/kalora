# Pottery Cement Pots Training Report (`05_Cement_Pots`)

## 1. Dataset Overview
- **Dataset Name**: `05_Cement_Pots`
- **Total Metadata Records**: **525**
- **Total Images in Folder**: **525**
- **Verified Matched Pairs**: **525**
- **Corrupted Images**: **0**
- **Label Status**: `DERIVED / HEURISTIC — NOT GROUND TRUTH`

---

## 2. Dataset Splitting & Class Distribution
- **Train Split (80%)**: 420 images
- **Validation Split (10%)**: 52 images
- **Test Split (10%)**: 53 images
- **Classes**: `Cement Planter & Pot` (525 images)

---

## 3. Model Architecture & Experimental Results
- **Backbone**: `MobileNetV3-Small` (PyTorch ImageNet Transfer Learning)
- **Optimizer**: `AdamW` (lr=0.001, weight_decay=1e-4)
- **Batch Size**: 32
- **Epochs**: 2 (Early stopping triggered at Epoch 2)
- **Training Time**: **98.99 seconds**

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
- **Saved Model Weights**: `models/pottery_cement_pots/best_model.pt`
- **Label Mapping**: `models/pottery_cement_pots/label_mapping.json`
- **Model Config**: `models/pottery_cement_pots/model_config.json`
- **Metrics Payload**: `models/pottery_cement_pots/metrics.json`
- **Training History**: `models/pottery_cement_pots/training_history.json`
- **Inference Script**: `ml/inference/pottery_cement_pots_classifier.py`

- **STATUS**: **BASELINE**
