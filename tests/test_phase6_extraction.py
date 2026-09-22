"""
KALORA — Phase 6: Unit Test Suite for Intelligent Product Information Extraction Pipeline
"""

import unittest
import os
import sys

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.extraction.schemas import ProductCatalogItem, SectorType, VerificationStatus
from ml.extraction.product_extraction_service import ProductExtractionService
from ml.extraction.missing_field_service import MissingFieldService
from ml.extraction.catalog_generation_service import CatalogGenerationService
from ml.extraction.validation_service import ValidationService
from ml.extraction.pipeline import ProductExtractionPipeline

class TestPhase6Extraction(unittest.TestCase):
    def setUp(self):
        self.pipeline = ProductExtractionPipeline()
        self.extractor = ProductExtractionService()
        self.missing_service = MissingFieldService()
        self.catalog_service = CatalogGenerationService()
        self.validator = ValidationService()

    def test_sector_detection(self):
        self.assertEqual(self.extractor.detect_sector(text_transcript="Authentic Banarasi Silk Saree with zari weave"), SectorType.HANDLOOMS)
        self.assertEqual(self.extractor.detect_sector(text_transcript="Clay terracotta planter pot for garden"), SectorType.POTTERY)
        self.assertEqual(self.extractor.detect_sector(text_transcript="Handcarved teak wood chair with lacquer finish"), SectorType.FURNITURE)

    def test_no_hallucination_rule(self):
        # Input has only color and price; material, region, dimensions must remain None
        item = self.extractor.extract_from_input(
            text_transcript="Red colored handcrafted item priced at Rs 1500."
        )
        self.assertEqual(item.color, "Red")
        self.assertEqual(item.price, 1500.0)
        self.assertIsNone(item.material)
        self.assertIsNone(item.region)
        self.assertIsNone(item.dimensions)
        self.assertIn("material", item.missing_fields)
        self.assertIn("region", item.missing_fields)

    def test_missing_field_questions_multilingual(self):
        item = ProductCatalogItem(
            product_id="TEST-01",
            sector=SectorType.POTTERY,
            category="Pot",
            missing_fields=["material", "dimensions", "price"]
        )
        questions = self.missing_service.generate_artisan_questions(
            item, languages=["en", "hi", "ta", "bn"]
        )
        self.assertTrue(len(questions) >= 3)
        for q in questions:
            self.assertIn("en", q["prompts"])
            self.assertIn("hi", q["prompts"])
            self.assertIn("ta", q["prompts"])
            self.assertIn("bn", q["prompts"])

    def test_catalog_generation(self):
        item = ProductCatalogItem(
            product_id="TEST-02",
            sector=SectorType.FURNITURE,
            category="Chair",
            material="Teak Wood",
            color="Brown",
            craft_technique="Hand Carving",
            region="Saharanpur",
            price=4500.0,
            artisan_name="Ramesh Kumar",
            languages=["en", "hi"]
        )
        catalog = self.catalog_service.generate_catalog(item, target_languages=["en", "hi"])
        self.assertIn("Saharanpur", catalog["title"])
        self.assertIn("Teak Wood", catalog["title"])
        self.assertEqual(catalog["key_specifications"]["Material"], "Teak Wood")
        self.assertIn("hi", catalog["multilingual_catalog"])

    def test_end_to_end_pipeline(self):
        result = self.pipeline.process_artisan_input(
            text_transcript="Banarasi Silk Saree in Red color from Varanasi. Price: Rs 5500.",
            sector_hint=SectorType.HANDLOOMS,
            artisan_name="Sita Devi",
            languages=["en", "hi", "te"]
        )
        self.assertEqual(result["sector"], SectorType.HANDLOOMS)
        self.assertIsNotNone(result["generated_catalog"])
        self.assertEqual(result["product_catalog_item"]["material"], "Silk")
        self.assertEqual(result["product_catalog_item"]["price"], 5500.0)

if __name__ == "__main__":
    unittest.main()
