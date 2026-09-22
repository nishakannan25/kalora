# KALORA — Phase 8: Quality + Market Readiness Documentation

## Overview

Phase 8 introduces two separate, transparent, rule-based scoring engines for artisan product listings on KALORA:

1. **Catalog Quality Score (0–100)**: Evaluates completeness and quality of product information (title, description, category, material, dimensions, color, craft technique, region, care instructions, artisan info, images, translation completeness).
2. **Market Readiness Score (0–100)**: Evaluates whether a product listing is ready for marketplace publication (catalog completeness, category confidence, price availability, required fields, image quality, artisan verification, publication readiness).

---

## Sector Support

1. **Handlooms & Textiles**
2. **Pottery & Terracotta**
3. **Furniture / Woodcraft**

---

## Critical-Field Rule & Blocker Enforcement

- **Uncertainty Transparency**: High overall catalog quality scores **CANNOT** override critical missing or uncertain fields.
- **Critical Blockers**:
  - `price_missing` (Price is missing or <= 0)
  - `category_uncertain` (Category is UNCERTAIN or vision confidence < 0.60)
  - `required_material_missing` (Material is unspecified or UNCERTAIN)
  - `images_missing` (Product image list is empty)
- **Effect**: If ANY critical blocker is triggered:
  - `is_ready_for_publication = False`
  - Market Readiness Score is capped at **59.0 / Grade F** regardless of points earned on other factors.

---

## Created Files & Components

- `ml/quality/schemas.py`: Data definitions (`CatalogQualityResult`, `MarketReadinessResult`, `CombinedQualityAudit`).
- `ml/quality/sector_rules.py`: Sector-specific required & critical fields, factor weights, and grade mappings.
- `ml/quality/catalog_quality_service.py`: Transparent rule-based catalog quality evaluator.
- `ml/quality/market_readiness_service.py`: Market readiness evaluator with critical blocker logic.
- `ml/quality/pipeline.py`: Reusable unified entry point `QualityAuditPipeline`.
- `tests/test_phase8_quality.py`: Unit test suite (3/3 tests passed).
- `docs/phase8_quality_and_readiness.md`: Technical documentation.

---

## Usage Example

```python
from ml.quality.pipeline import QualityAuditPipeline

pipeline = QualityAuditPipeline()

item_dict = {
    "product_id": "PROD-201",
    "sector": "Handlooms & Textiles",
    "category": "Saree",
    "title": "Authentic Banarasi Silk Saree",
    "description": "Handcrafted silk saree made in Varanasi with traditional zari border.",
    "material": "Silk",
    "price": 5500.0,
    "images": ["saree.jpg"],
    "confidence": {"category": 0.95}
}

audit = pipeline.audit_product(item_dict)

print("Catalog Quality Score:", audit["catalog_quality"]["score"], "Grade:", audit["catalog_quality"]["grade"])
print("Market Readiness Score:", audit["market_readiness"]["score"], "Ready?:", audit["market_readiness"]["is_ready_for_publication"])
```
