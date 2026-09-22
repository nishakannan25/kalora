# KALORA — Phase 6: Intelligent Product Information Extraction Documentation

## Overview

Phase 6 introduces a modular, non-hallucinating product information extraction pipeline for rural Indian artisans on KALORA. It converts artisan multimodal input (images + optional voice/text transcripts) into a structured, multilingual product catalog.

---

## Supported Sectors & Attribute Schema

1. **Handlooms & Textiles**
   - Core Attributes: Material, Weave, Fabric Type, Pattern, Color, Garment Type, Craft Technique, Region, Dimensions, Care Instructions.
2. **Pottery & Terracotta**
   - Core Attributes: Material, Pottery Type, Finish, Shape, Color, Technique, Region, Dimensions, Capacity, Care Instructions.
3. **Furniture / Woodcraft**
   - Core Attributes: Furniture Type, Material, Wood Type, Craft Technique, Style, Finish, Color, Dimensions, Weight, Region, Care Instructions.

---

## Core Principles & Confidence Rules

- **Pre-Trained Model Integration**: Reuses existing independently trained PyTorch ML vision classifiers without retraining or dataset mixing.
- **Strict No-Hallucination Policy**: If an attribute (material, region, dimensions, artisan name, price, craft technique) is not explicitly present in text or predicted by vision, it is left as `None` / `null`. No cultural or historical claims are fabricated.
- **Confidence Threshold Rule**:
  - `Confidence >= 0.60`: Provisional acceptance.
  - `Confidence < 0.60`: Mark `UNCERTAIN` and trigger artisan prompt.

---

## Created Services & Components

- `ml/extraction/schemas.py`: Data definitions for `ProductCatalogItem`, `VerificationStatus`, `ProvenanceRecord`.
- `ml/extraction/sector_config.py`: Sector-specific attribute lists, required fields, and allowed values.
- `ml/extraction/product_extraction_service.py`: Image sector classification router & transcript attribute extractor.
- `ml/extraction/missing_field_service.py`: Missing/uncertain field detector & artisan-friendly question prompter in 7 regional languages (English, Hindi, Tamil, Bengali, Telugu, Marathi, Kannada).
- `ml/extraction/catalog_generation_service.py`: Multilingual product title, short/detailed descriptions, key specs, artisan story, and care instructions generator.
- `ml/extraction/validation_service.py`: Provenance tracker, field validator, and verification status evaluator.
- `ml/extraction/pipeline.py`: Reusable unified entry point `ProductExtractionPipeline`.
- `tests/test_phase6_extraction.py`: Suite of 5 unit tests covering all 3 sectors, missing field prompter, catalog generation, and pipeline workflow.

---

## Usage Example

```python
from ml.extraction.pipeline import ProductExtractionPipeline

pipeline = ProductExtractionPipeline()

result = pipeline.process_artisan_input(
    image_path="path/to/saree.jpg",
    text_transcript="Authentic Banarasi Silk Saree in Red color from Varanasi. Price: Rs 5500.",
    sector_hint="Handlooms & Textiles",
    artisan_name="Sita Devi",
    languages=["en", "hi"]
)

print(result["generated_catalog"]["multilingual_catalog"]["hi"]["title"])
```
