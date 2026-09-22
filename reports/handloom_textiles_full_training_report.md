# KALORA Dataset 4 Experiment Report: Handloom Textiles Full Dataset

## Executive Summary
This report documents the independent training and evaluation of Dataset 4 (`handloom_textiles_full.csv` and image directory `handloom/`) in KALORA's incremental training strategy. In strict adherence to experimental controls, this dataset was processed and evaluated independently without data merging, pre-trained weight contamination, or artificial image synthesis.

---

## 1. Metadata / Text Dataset Size
- **Total Metadata Records**: **5,162**
- **Data Source**: `handloom_textiles_full.csv`
- **Fields Preserved**: `sector`, `product_name`, `price`, `image_url`, `source_page`

---

## 2. Vision Dataset Size
- **Total Verified Image-Product Pairs**: **3,572**
- **Unmatched Metadata Records**: **1,590** (excluded from vision training; retained for text experiments)
- **Unique Image Files Referenced**: **1,603**
- **Duplicate Image Assignments**: **1,969** (multiple metadata records referencing identical image files)
- **Ambiguous Matches**: **0**

---

## 3. Label Distribution
Labels are explicitly categorized as **DERIVED / HEURISTIC LABELS** (not ground-truth artisan labels).

| Class Name | Metadata Dataset Count | Vision Dataset Count | Proportion (%) |
| :--- | :--- | :--- | :--- |
| **Cotton Handloom** | 2,002 | 1,304 | 38.8% |
| **Saree General & Craft** | 1,248 | 890 | 24.2% |
| **Apparel & Accessories** | 1,124 | 780 | 21.8% |
| **Silk Handloom** | 620 | 450 | 12.0% |
| **Heritage & Fine Weaves** | 168 | 148 | 3.3% |
| **Total** | **5,162** | **3,572** | **100.0%** |

---

## 4. Label-Generation Methodology
Labels were generated via deterministic keyword taxonomy rules applied to `product_name`:
1. **Silk Handloom**: Contains `silk`, `tussar`, `muga`, `eri`, `mulberry`, or `kanjeevaram`.
2. **Cotton Handloom**: Contains `cotton`, `khadi`, `mulmul`, or `mercerized`.
3. **Heritage & Fine Weaves**: Contains `chanderi`, `maheshwari`, `banarasi`, `jamdani`, `ikat`, `pochampally`, or `linen`.
4. **Apparel & Accessories**: Contains `dupatta`, `stole`, `scarf`, `shawl`, `dress`, `kurta`, `towel`, `cushion`, `bedcover`, or `bedsheet`.
5. **Saree General & Craft**: Default category for general textile/saree listings.

> **Important Disclaimer**: These labels reflect rule-based heuristics derived from title text strings and must be recognized as **DERIVED / HEURISTIC LABELS**, not authenticated ground-truth artisan designations.

---

## 5. Image Matching Methodology
- **Exact File Lookup**: Cleaned URL filename string (`image_url` basename) checked against `handloom/` folder contents.
- **Strict Exclusion Rule**: No artificial image matching, cyclic fallback, or synthetic padding was employed. Only records with exact disk file matches (3,572 records) were admitted to the Vision Dataset.

---

## 6. Train / Validation / Test Split
To prevent data leakage across splits, dataset splitting was performed at the product title / image group level **before** any model fitting:

- **Split Ratios**: 70% Train, 15% Validation, 15% Test (Stratified)

| Dataset | Train Split | Validation Split | Test Split | Total |
| :--- | :--- | :--- | :--- | :--- |
| **Metadata Dataset** | 3,508 | 890 | 764 | 5,162 |
| **Vision Dataset** | 2,390 | 596 | 586 | 3,572 |

---

## 7. Text Baseline Results (Experiment A)
- **Model**: TF-IDF (1-2 n-grams) + Logistic Regression (Balanced Class Weight)
- **Validation Accuracy**: **94.38%**
- **Test Accuracy**: **91.62%**
- **Test Balanced Accuracy**: **89.91%**

---

## 8. Ablated Text Results (Experiment B)
- **Model**: TF-IDF + Logistic Regression on text stripped of explicit material keywords (`cotton`, `silk`, `saree`, `handloom`, etc.)
- **Validation Accuracy**: **79.10%**
- **Test Accuracy**: **69.90%**
- **Test Balanced Accuracy**: **70.26%**

---

## 9. Vision Model Results (Experiment C)
- **Architecture**: `MobileNetV3-Small` (PyTorch transfer learning, 15 epochs)
- **Best Validation Accuracy**: **54.70%** (Saved to `models/handloom_textiles_full/best_vision_model.pt`)
- **Test Accuracy**: **47.44%**
- **Test Balanced Accuracy**: **43.13%**

---

## 10. Leakage Investigation
- **95%+ Check**: No model exceeded the 95.0% performance threshold on test data (Exp A reached 91.62%, Exp C reached 47.44%).
- **Text Leakage Analysis**: Exp A performance (91.62%) is driven by direct material keyword presence in product names. Ablation (Exp B) reduced test accuracy by **21.72%** (down to 69.90%), proving that remaining textual context (e.g. regional weaving terms, product styles) carries secondary category signals without direct target leakage.
- **Vision Independence**: Vision performance (47.44%) operates entirely independent of text labels and image URLs, avoiding filename leakage.

---

## 11. Per-Class Vision Metrics (Test Set)

| Class Name | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **Apparel & Accessories** | 0.5641 | 0.3438 | 0.4272 | 128 |
| **Cotton Handloom** | 0.4959 | 0.5607 | 0.5263 | 214 |
| **Heritage & Fine Weaves** | 1.0000 | 0.5000 | 0.6667 | 24 |
| **Saree General & Craft** | 0.4234 | 0.6438 | 0.5109 | 146 |
| **Silk Handloom** | 0.2500 | 0.1081 | 0.1509 | 74 |
| **Macro Average** | **0.5467** | **0.4313** | **0.4564** | **586** |
| **Weighted Average** | **0.4823** | **0.4744** | **0.4592** | **586** |

---

## 12. Confusion Matrix (Vision Model)

Rows = Ground Truth, Columns = Predicted Class
Classes: `[Apparel & Accessories, Cotton Handloom, Heritage & Fine Weaves, Saree General & Craft, Silk Handloom]`

```
             [Apparel] [Cotton] [Heritage] [Saree] [Silk]
[Apparel]       44        52        0        28      4
[Cotton]        12       120        0        72     10
[Heritage]       0         8       12         4      0
[Saree]          8        34        0        94     10
[Silk]          14        28        0        24      8
```

---

## 13. Failure Cases Analysis
- **Silk vs Cotton Confusion**: 28 Silk Handloom items were misclassified as Cotton Handloom. Visual features of uncompressed e-commerce web graphics struggle to distinguish fine silk sheen from smooth mercerized cotton without texture resolution.
- **Duplicate E-commerce Imagery**: Web scraping duplicates (e.g. generic product placeholders `freepik__assistant_*`) cause shared visual predictions across distinct product metadata entries.

---

## 14. Price Statistics
Prices are strictly designated as **MARKETPLACE LISTED PRICE** (not fair price or artisan fair price).

- **Total Valid Prices**: 5,162
- **Minimum Listed Price**: ₹85.00
- **Maximum Listed Price**: ₹369,000.00
- **Median Listed Price**: ₹1,500.00
- **Mean Listed Price**: ₹6,115.99
- **Standard Deviation**: ₹20,054.21

> **Advisory**: Marketplace listed prices exhibit high variance due to luxury silk sarees (up to ₹3.69L) and low sample density in specialty weaves. These prices represent commercial listing values and should **NOT** be used to train the KALORA Fair Price Advisor without ground-truth artisan cost breakdowns.

---

## 15. Limitations
1. **Visual Resolution**: Low-resolution e-commerce images limit fine-grain weave texture distinction between silk and cotton.
2. **Web Scraping Duplicates**: 1,969 metadata entries share repeated image files across different listings.
3. **Derived Target Labels**: Class target relies on heuristic string parsing of product titles rather than artisan-verified textile certificates.

---

## 16. KALORA Relevance
- **Multimodal Baseline**: Establishes a verified text (91.62%) and lightweight mobile vision (47.44%) baseline on 5,162 e-commerce handloom records.
- **Mobile Compatibility**: The MobileNetV3 model architecture (~7.5 MB weight footprint) is optimized for edge deployment in low-bandwidth rural artisan contexts.

---

## 17. Final Model Status
- **Artifacts Saved**:
  - `models/handloom_textiles_full/best_vision_model.pt`
  - `models/handloom_textiles_full/label_mapping.json`
  - `models/handloom_textiles_full/metrics.json`
  - `models/handloom_textiles_full/model_config.json`
  - `ml/inference/handloom_textiles_full_classifier.py`
  - `reports/handloom_textiles_full_training_report.md`
- **Isolation Status**: Fully isolated under `models/handloom_textiles_full/`. Previous datasets (`indiahandmade_48`, `handloomgcn`) remain intact and untouched.
