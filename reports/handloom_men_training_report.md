# Dataset 5 Training Report: Handloom Textiles Men (`handloom_textiles_men_full.csv` & `handloom_men`)

## 1. Dataset Overview
- **Dataset Name**: Dataset 5 (`handloom_textiles_men_full.csv` & `handloom_men` directory)
- **Metadata Records**: **2,080**
- **Total Image Files**: **868**
- **Isolation Guarantee**: Processed and evaluated **100% independently**. No merging with Datasets 1–4, no fallback image assignment, and no synthetic image generation.

---

## 2. Quick Data & Image Audit
- **Metadata Fields**: `sector`, `product_name`, `price`, `image_url`, `source_page`
- **Missing Values**: 0 missing values across all columns
- **Duplicate Rows**: 0 complete duplicate rows
- **Image Formats**: JPEG / PNG RGB images (224x224 to high resolution e-commerce graphics)
- **Corrupted Images**: 0 corrupted image files

---

## 3. Reliable Image-Product Matching
Matching was restricted strictly to exact filename lookups derived from `image_url`:
- **Verified Matched Pairs**: **1,586** metadata records (admitted to Vision Dataset)
- **Unmatched Metadata Records**: **494** (excluded from vision training; used in text experiments)
- **Unmatched Image Files**: **192**
- **Duplicate Image Assignments**: **718** (multiple metadata records referencing identical image files)
- **Sequential / Cyclic Fallback**: **DISABLED (0 records)**

---

## 4. Target Selection & Derived Labels
- **Selected Task**: Supervised Classification of Men's Garment & Craft Type across 4 classes:
  1. `Kurta & Men Shirt`
  2. `General Men Handloom Craft`
  3. `Dhoti & Ethnic Bottomwear`
  4. `Stole & Angavastram`
- **Label Status**: **DERIVED / HEURISTIC LABEL — NOT GROUND TRUTH** (parsed via keyword rules on `product_name`).

### Class Distributions

| Class Name | Metadata Count | Vision Count | Proportion (Vision) |
| :--- | :--- | :--- | :--- |
| **Kurta & Men Shirt** | 716 | 620 | 39.1% |
| **General Men Handloom Craft** | 744 | 506 | 31.9% |
| **Dhoti & Ethnic Bottomwear** | 534 | 398 | 25.1% |
| **Stole & Angavastram** | 86 | 62 | 3.9% |
| **Total** | **2,080** | **1,586** | **100.0%** |

---

## 5. Group-Aware Splitting Methodology
Splitting was performed at the product title / group key level to prevent near-duplicate leakage across splits:
- **Split Ratio**: 70% Train, 15% Validation, 15% Test
- **Metadata Dataset Split**: 1,548 Train / 260 Validation / 272 Test
- **Vision Dataset Split**: 1,174 Train / 198 Validation / 214 Test

---

## 6. Experimental Results

| Experiment | Accuracy | Balanced Acc | Macro F1 | Weighted F1 |
| :--- | :--- | :--- | :--- | :--- |
| **Exp A: Full Text Baseline (TF-IDF + LR)** | **99.26%** | **99.49%** | **0.9951** | **0.9926** |
| **Exp B: Ablated Text Model** | **86.03%** | **73.93%** | **0.7467** | **0.8580** |
| **Exp C: Vision Model (MobileNetV3-Small)** | **72.90%** | **66.06%** | **0.6543** | **0.7299** |

> **Leakage Investigation Notice (Exp A = 99.26%)**: Exp A performance is expected because derived target labels were constructed directly from keywords in `product_name`. When target keywords were removed in Exp B (Ablation), performance dropped to 86.03% (Macro F1: 0.7467), proving that remaining text context provides genuine auxiliary signals.

---

## 7. Confusion Matrix (Vision Model)

Rows = True Label, Columns = Predicted Class
Order: `[Dhoti & Ethnic Bottomwear, General Men Handloom Craft, Kurta & Men Shirt, Stole & Angavastram]`

```
            [Dhoti] [General] [Kurta] [Stole]
[Dhoti]        34        4       0       0
[General]      10       50       8       2
[Kurta]         6       24      70       0
[Stole]         0        2       2       2
```

---

## 8. Price Analysis
- **Price Type**: **MARKETPLACE LISTED PRICE (NOT FAIR PRICE GROUND TRUTH)**
- **Min Price**: ₹20.00 | **Max Price**: ₹43,500.00 | **Median Price**: ₹799.00 | **Mean Price**: ₹1,554.31 (std: ₹3,056.57)

---

## 9. Limitations & Production-Readiness Assessment
1. **Heuristic Labels**: Target labels are string-derived and require artisan verification.
2. **Minority Class Support**: `Stole & Angavastram` has only 6 test samples, producing lower recall.
3. **Uncertainty Fallback**: MobileNetV3 vision classifier rejects low-confidence predictions (< 0.60 threshold) by returning `UNCERTAIN`.

- **FINAL STATUS**: **PROMISING BUT NOT PRODUCTION-READY**
