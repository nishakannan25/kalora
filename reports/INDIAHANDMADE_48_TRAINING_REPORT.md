# INDIAHANDMADE 48-PRODUCT TRAINING REPORT — KALORA (SIH26090)

**Project**: SIH26090 — AI-Driven Market Linkage & Smart Cataloging Mobile App for Marginalized Artisans  
**Application**: KALORA ("Your Craft. Your Story. Your Market.")  
**Sector**: Handlooms & Textiles  
**Date**: September 12, 2026  
**Dataset**: `indiahandmade.csv` (48 products) + 48 downloaded product images under `downloaded_images/`

---

## 1. Dataset Description & Verification

- **Total Records**: 48
- **Total Images**: 48 (All verified 100% readable JPEG/PNG images, zero missing or corrupted files).
- **Product Domain**: Handloom Sarees (Cotton, Silk, Muslin, Silk-Cotton) across traditional weaving clusters (Santipuri, Tangail, Molakalmuru, Maheshwari, Madhubani).
- **Target Selected**: `derived_material` (Fabric Material Classification: `Cotton Handloom` vs `Silk / Fine Weaver`).
- **Class Distribution**:
  - `Cotton Handloom`: 35 products (72.9%)
  - `Silk / Fine Weaver`: 13 products (27.1%)

---

## 2. Train / Validation / Test Split

- **Train Split**: 33 records (68.75%)
- **Validation Split**: 7 records (14.58%)
- **Test Split**: 8 records (16.67%)
- **Stratification**: Preserved class ratios across splits. Zero cross-split product/image path overlap.

---

## 3. Marketplace Listed Price Analysis

- **Minimum Price**: ₹750.00
- **Maximum Price**: ₹43,500.00
- **Median Price**: ₹2,940.00
- **Mean Price**: ₹7,837.19
- **Mean Price by Material**:
  - `Cotton Handloom`: ₹3,044.74
  - `Silk / Fine Weaver`: ₹20,739.92

> [!IMPORTANT]
> These prices are **MARKETPLACE LISTED PRICES** and do **NOT** represent ground-truth artisan fair prices.

---

## 4. Experiment Results & Ablation Analysis

| Experiment | Architecture | Input Data | Test Accuracy | Diagnosis / Leakage Analysis |
|---|---|---|---|---|
| **Exp A: Text Baseline** | TF-IDF + LogisticRegression | Product Title | **1.0000 (100%)** | Title explicitly contains material words ("Cotton", "Silk", "Muslin"). |
| **Exp B: Ablated Text** | TF-IDF + LogisticRegression | Stripped Title (No "cotton"/"silk") | **1.0000 (100%)** | Craft cluster names ("Santipuri", "Tangail") correlate 1:1 with fabric material. |
| **Exp C: Pure Vision Model** | MobileNetV3-Small (Pretrained) | Product Images (224x224) | **0.8750 (87.5%)** | **Best Trustworthy Model**. Visual features classify handloom weave texture without text shortcut. |

---

## 5. Vision Model Test Performance (8 Test Images)

- **Test Accuracy**: `0.8750` (87.5%)
- **Test Balanced Accuracy**: `0.7500` (75.0%)
- **Test Macro Precision**: `0.9286`
- **Test Macro Recall**: `0.7500`
- **Test Macro F1 Score**: `0.7949`
- **Test Weighted F1 Score**: `0.8590`

---

## 6. Uncertainty Threshold & Inference Output

The inference script `ml/inference/indiahandmade_48_classifier.py` incorporates an **uncertainty threshold of 0.60**. If model prediction confidence drops below 60%, the classifier returns `"UNCERTAIN"` instead of forcing an incorrect label.

Sample Inference Result:
```json
{
  "prediction": "Cotton Handloom",
  "confidence": 0.9611,
  "raw_class": "Cotton Handloom",
  "uncertainty_threshold": 0.6
}
```

---

## 7. Limitations & Final Status Classification

- **Dataset Size**: 48 records is too small for production deep learning.
- **Sector Coverage**: Handlooms & Textiles only. Pottery/Terracotta and Woodcraft are NOT supported.
- **Final Classification**: **B. BASELINE** (Promising Handloom vision baseline; NOT production ready).
