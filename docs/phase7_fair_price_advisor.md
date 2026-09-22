# KALORA — Phase 7: Fair Price Advisor Documentation

## Overview

Phase 7 introduces an explainable, cost-plus Fair Price Advisor for rural Indian artisans on KALORA. It provides fair, transparent price recommendations based on material costs, artisan living-wage labor hours, craft skill premiums, complexity factors, and regional heritage multipliers.

---

## Supported Sectors

1. **Handlooms & Textiles**
2. **Pottery & Terracotta**
3. **Furniture / Woodcraft**

---

## Key Principles & Safety Constraints

- **Explainable Cost-Plus Pricing**: Uses transparent, auditable cost equations instead of black-box opaque pricing models.
- **No False Claims**: Dataset prices are treated as marketplace reference benchmarks, NOT verified fair prices.
- **No Arbitrary Multipliers**: All multipliers (craft skill, complexity, regional heritage) are explicitly declared in configuration.
- **Disclaimers Included**: Every price recommendation includes an explicit disclaimer stating it is an estimate, not a guaranteed selling price or government-mandated price.

---

## Input Factors

- `sector`, `category`, `material`, `craft_technique`, `dimensions`, `complexity` (Low/Medium/High/Intricate), `customization` (bool), `labor_hours`, `material_cost`, `artisan_base_cost`, `region`, `quality_tier` (Standard/Premium/Masterpiece), `marketplace_reference_price`.

---

## Missing-Data & Confidence Logic

- **Confidence Score**:
  - `0.90`: Explicit labor hours and material cost provided by artisan.
  - `0.75`: Derived using sector baseline + partial artisan input.
  - `0.60`: Derived entirely using sector defaults.
- **Artisan Prompts**: Missing critical inputs automatically trigger artisan-friendly questions in multiple Indian languages (English, Hindi, Tamil, Bengali).

---

## Created Files & Components

- `ml/pricing/schemas.py`: Core data schemas (`PricingFactorInput`, `PriceBreakdown`, `PriceRecommendation`).
- `ml/pricing/sector_pricing_config.py`: Sector-specific living-wage labor rates, baseline material costs, complexity multipliers, and regional heritage parameters.
- `ml/pricing/fair_price_advisor_service.py`: Fair price calculation engine & missing factor prompt generator.
- `ml/pricing/price_explanation_service.py`: Multilingual price explanation generator & disclaimer validator.
- `ml/pricing/pipeline.py`: Reusable unified entry point `FairPriceAdvisorPipeline`.
- `tests/test_phase7_pricing.py`: Unit test suite (4/4 tests passed).
- `docs/phase7_fair_price_advisor.md`: Phase 7 technical documentation.

---

## Usage Example

```python
from ml.pricing.pipeline import FairPriceAdvisorPipeline

pipeline = FairPriceAdvisorPipeline()

result = pipeline.evaluate_fair_price(
    sector="Furniture / Woodcraft",
    category="Dining Table",
    material="Teak Wood",
    craft_technique="Hand Carving",
    labor_hours=36.0,
    material_cost=4500.0,
    region="Saharanpur",
    languages=["en", "hi"]
)

print("Suggested Fair Price:", result["suggested_price"])
print("Explanation:", result["explanation"])
```
