# Fabric WeaveNet Training Report (`FinalFabric`)

## 1. Dataset Overview
- **Dataset Name**: `Fabric WeaveNet Dataset` (`FinalFabric` zip release)
- **Total Images**: **2,000**
- **Total Weave Classes**: **5** (`Banarasi`, `Bandhani`, `Kanjeevaram`, `Patola`, `Tussar`)
- **Dataset Structure**: Perfectly balanced 400 images per class across pre-defined train/val/test splits.
- **Isolation Guarantee**: Evaluated 100% independently from Datasets 1–5.

---

## 2. Dataset & Image Audit
- **Class Counts**:
  - `Banarasi`: 400 images
  - `Bandhani`: 400 images
  - `Kanjeevaram`: 400 images
  - `Patola`: 400 images
  - `Tussar`: 400 images
- **Image Integrity**: 2,000 valid RGB images (1,496 JPEG, 504 PNG). **0 corrupt files**.

---

## 3. Data Splitting
- **Train Split**: 1,600 images (320 per class, 80%)
- **Validation Split**: 200 images (40 per class, 10%)
- **Test Split**: 200 images (40 per class, 10%)

---

## 4. Model Architecture & Experimental Results
- **Backbone**: `MobileNetV3-Small` (PyTorch Pretrained Transfer Learning)
- **Epochs**: 15 Epochs with Adam Optimizer & Moderate Augmentation
- **Training Time**: ~17.7 minutes (CPU)

### Key Metrics Summary

| Metric | Score |
| :--- | :--- |
| **Best Validation Accuracy** | **75.50%** |
| **Test Accuracy** | **70.50%** |
| **Balanced Accuracy** | **70.50%** |
| **Macro Precision** | **0.7125** |
| **Macro Recall** | **0.7050** |
| **Macro F1-Score** | **0.7045** |
| **Weighted F1-Score** | **0.7045** |

---

## 5. Class-Wise Performance Breakdown

| Fabric Class | Support | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- |
| **Banarasi** | 40 | 0.7333 | 0.5500 | 0.6286 |
| **Bandhani** | 40 | 0.5800 | 0.7250 | 0.6444 |
| **Kanjeevaram** | 40 | 0.7436 | 0.7250 | 0.7342 |
| **Patola** | 40 | 0.7250 | 0.7250 | 0.7250 |
| **Tussar** | 40 | 0.7805 | 0.8000 | **0.7901** |

---

## 6. Confusion Matrix

Rows = Ground Truth, Columns = Prediction
Order: `[Banarasi, Bandhani, Kanjeevaram, Patola, Tussar]`

```
              [Banarasi] [Bandhani] [Kanjeevaram] [Patola] [Tussar]
[Banarasi]        22          6           4          3        5
[Bandhani]         3         29           1          4        3
[Kanjeevaram]      5          2          29          3        1
[Patola]           0          9           2         29        0
[Tussar]           0          4           3          1       32
```

---

## 7. Failure Case Analysis & Key Observations
1. **Zari & Metallic Weave Confusion**: `Banarasi` and `Kanjeevaram` exhibit mutual confusion (4 to 5 misclassifications) due to shared heavy gold zari border patterns.
2. **Tie-Dye vs Geometric Weave**: `Patola` and `Bandhani` share geometric dot grid aesthetics causing 9 Patola images to be predicted as Bandhani.
3. **High Tussar Distinctiveness**: `Tussar` achieves the highest F1-score (0.7901) due to its unique coarse silk texture.

---

## 8. Saved Artifacts & Modular Inference
- **Saved Model Weights**: `models/fabric_weavenet/best_vision_model.pt`
- **Label Mapping**: `models/fabric_weavenet/label_mapping.json`
- **Model Config**: `models/fabric_weavenet/model_config.json`
- **Metrics Payload**: `models/fabric_weavenet/metrics.json`
- **Inference Script**: `ml/inference/fabric_weavenet_classifier.py`
  - Rejects predictions with confidence < 0.60 by returning `UNCERTAIN`.

- **FINAL STATUS**: **BASELINE CANDIDATE — WEAVE CLASSIFIER OPERATIONAL**
