"""
KALORA — Phase 6: Reusable Unified Product Information Extraction Pipeline
Coordinates Extraction, Missing Field Prompting, Catalog Generation, and Validation.
"""

from typing import Dict, List, Any, Optional

from ml.extraction.schemas import ProductCatalogItem
from ml.extraction.product_extraction_service import ProductExtractionService
from ml.extraction.missing_field_service import MissingFieldService
from ml.extraction.catalog_generation_service import CatalogGenerationService
from ml.extraction.validation_service import ValidationService

class ProductExtractionPipeline:
    def __init__(self):
        self.extractor = ProductExtractionService()
        self.missing_service = MissingFieldService()
        self.catalog_service = CatalogGenerationService()
        self.validator = ValidationService()

    def process_artisan_input(
        self,
        image_path: Optional[str] = None,
        text_transcript: Optional[str] = None,
        sector_hint: Optional[str] = None,
        artisan_name: Optional[str] = None,
        languages: Optional[List[str]] = None,
        artisan_confirmations: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        target_langs = languages or ["en"]

        # Step 1: Extract Initial Product Information
        item = self.extractor.extract_from_input(
            image_path=image_path,
            text_transcript=text_transcript,
            sector_hint=sector_hint,
            artisan_name=artisan_name
        )

        # Step 2: Apply Artisan Confirmations if provided
        if artisan_confirmations:
            for k, v in artisan_confirmations.items():
                if hasattr(item, k):
                    setattr(item, k, v)
                    item.confidence[k] = 1.0
                    item.provenance[k] = {
                        "source": "artisan_confirmation",
                        "confidence": 1.0,
                        "raw_input": str(v)
                    }
                    if k in item.missing_fields:
                        item.missing_fields.remove(k)
                    if k in item.uncertain_fields:
                        item.uncertain_fields.remove(k)

        # Step 3: Validate Catalog Item
        val_result = self.validator.validate_catalog_item(item)

        # Step 4: Generate Artisan Questions for Missing / Uncertain Fields
        questions = self.missing_service.generate_artisan_questions(item, languages=target_langs)

        # Step 5: Generate Catalog Descriptions and Multilingual Data
        catalog_output = self.catalog_service.generate_catalog(item, target_languages=target_langs)

        return {
            "product_id": item.product_id,
            "sector": item.sector,
            "category": item.category,
            "verification_status": item.verification_status,
            "product_catalog_item": item.to_dict(),
            "validation": val_result,
            "artisan_questions": questions,
            "generated_catalog": catalog_output
        }
