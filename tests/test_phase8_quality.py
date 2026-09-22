"""
KALORA — Phase 8: Unit Test Suite for Catalog Quality & Market Readiness Pipeline
"""

import unittest
import os
import sys

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.quality.catalog_quality_service import CatalogQualityService
from ml.quality.market_readiness_service import MarketReadinessService
from ml.quality.pipeline import QualityAuditPipeline

class TestPhase8Quality(unittest.TestCase):
    def setUp(self):
        self.pipeline = QualityAuditPipeline()
        self.quality_service = CatalogQualityService()
        self.readiness_service = MarketReadinessService()

    def test_complete_catalog_high_scores(self):
        item_dict = {
            "product_id": "PROD-100",
            "sector": "Handlooms & Textiles",
            "category": "Saree",
            "title": "Authentic Banarasi Silk Saree with Zari Weave",
            "description": "Handcrafted silk saree made by master weavers in Varanasi with traditional zari border.",
            "material": "Silk",
            "dimensions": "5.5 meters",
            "color": "Red & Gold",
            "craft_technique": "Zardozi Embroidery",
            "region": "Varanasi",
            "care_instructions": "Dry clean only.",
            "artisan_name": "Sita Devi",
            "price": 5500.0,
            "images": ["path/to/saree.jpg"],
            "languages": ["en", "hi"],
            "confidence": {"category": 0.95},
            "verification_status": "PROVISIONAL"
        }
        result = self.pipeline.audit_product(item_dict)

        cat_q = result["catalog_quality"]
        mkt_r = result["market_readiness"]

        self.assertGreaterEqual(cat_q["score"], 90.0)
        self.assertIn(cat_q["grade"], ["A+", "A"])
        self.assertTrue(mkt_r["is_ready_for_publication"])
        self.assertEqual(len(mkt_r["critical_blockers"]), 0)

    def test_critical_blocker_overrides_high_quality_score(self):
        # Item has rich descriptions and details but missing PRICE
        item_dict = {
            "product_id": "PROD-101",
            "sector": "Furniture / Woodcraft",
            "category": "Chair",
            "title": "Handcarved Saharanpur Teak Wood Chair",
            "description": "Intricately carved teak wood armchair crafted by traditional woodcraft artisans.",
            "material": "Teak Wood",
            "dimensions": "36x24x24 inches",
            "color": "Natural Wood",
            "craft_technique": "Hand Carving",
            "region": "Saharanpur",
            "care_instructions": "Wipe with dry cloth.",
            "artisan_name": "Ramesh Kumar",
            "price": None,  # MISSING PRICE
            "images": ["path/to/chair.jpg"],
            "languages": ["en", "hi"],
            "confidence": {"category": 0.90}
        }
        result = self.pipeline.audit_product(item_dict)

        cat_q = result["catalog_quality"]
        mkt_r = result["market_readiness"]

        # Catalog quality score can be high
        self.assertGreaterEqual(cat_q["score"], 80.0)

        # Market readiness MUST be blocked & score capped at 59.0 / F
        self.assertFalse(mkt_r["is_ready_for_publication"])
        self.assertIn("price_missing", mkt_r["critical_blockers"])
        self.assertLessEqual(mkt_r["score"], 59.0)
        self.assertEqual(mkt_r["grade"], "F")

    def test_uncertain_category_blocker(self):
        item_dict = {
            "product_id": "PROD-102",
            "sector": "Pottery & Terracotta",
            "category": "UNCERTAIN",  # UNCERTAIN CATEGORY
            "title": "Crafted item",
            "price": 450.0,
            "images": ["path/to/pot.jpg"],
            "confidence": {"category": 0.40}
        }
        result = self.pipeline.audit_product(item_dict)
        mkt_r = result["market_readiness"]

        self.assertFalse(mkt_r["is_ready_for_publication"])
        self.assertIn("category_uncertain", mkt_r["critical_blockers"])

if __name__ == "__main__":
    unittest.main()
