"""
KALORA — Phase 9: Unit Test Suite for Digital Craft Passport Pipeline
"""

import unittest
import os
import sys
import shutil

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.passport.schemas import DigitalCraftPassport, PassportPublicationStatus
from ml.passport.qr_generator import QRCodeGenerator
from ml.passport.passport_service import PassportService
from ml.passport.pipeline import DigitalCraftPassportPipeline

class TestPhase9Passport(unittest.TestCase):
    def setUp(self):
        self.test_public_dir = os.path.join(base_dir, "tmp_test_public_passports")
        self.pipeline = DigitalCraftPassportPipeline(public_dir=self.test_public_dir)

    def tearDown(self):
        if os.path.exists(self.test_public_dir):
            shutil.rmtree(self.test_public_dir)

    def test_qr_code_generation(self):
        qr_gen = QRCodeGenerator()
        svg = qr_gen.generate_qr_svg("http://localhost:3000/passports/PROD-1.html")
        data_url = qr_gen.generate_qr_data_url("http://localhost:3000/passports/PROD-1.html")

        self.assertIn("<svg", svg)
        self.assertTrue(data_url.startswith("data:image/svg+xml;base64,"))

    def test_passport_creation_and_privacy_controls(self):
        item_dict = {
            "product_id": "PROD-900",
            "sector": "Handlooms & Textiles",
            "category": "Saree",
            "title": "Kanjeevaram Silk Saree",
            "material": "Silk",
            "price": 8500.0,
            "artisan_name": "Lakshmi Ammal",
            "artisan_story": "Master weaver with 30 years experience.",
            "region": "Kanchipuram",
            # PRIVATE DATA (MUST BE FILTERED OUT)
            "artisan_phone": "+91 9876543210",
            "artisan_bank": "SBIN0001234",
            "raw_model_confidence": 0.9876
        }

        passport_dict = self.pipeline.generate_passport(
            item_dict=item_dict,
            quality_score=90.0,
            is_market_ready=True,
            publish_now=True
        )

        self.assertTrue(passport_dict["passport_id"].startswith("KALORA-PASSPORT-"))
        self.assertEqual(passport_dict["publication_status"], PassportPublicationStatus.PUBLISHED)
        self.assertEqual(passport_dict["artisan"]["artisan_name"], "Lakshmi Ammal")

        # Verify privacy filtering (Private keys must not exist in public payload)
        self.assertNotIn("artisan_phone", passport_dict["artisan"])
        self.assertNotIn("artisan_bank", passport_dict["artisan"])

        # Check HTML file creation
        html_file = os.path.join(self.test_public_dir, "PROD-900.html")
        self.assertTrue(os.path.exists(html_file))
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("Kanjeevaram Silk Saree", content)
            self.assertIn("Lakshmi Ammal", content)

    def test_publication_status_transitions(self):
        # 1. Critical blocker -> Needs Information
        pass_needs_info = self.pipeline.generate_passport(
            item_dict={"product_id": "PROD-901", "category": "UNCERTAIN"},
            critical_blockers=["price_missing"]
        )
        self.assertEqual(pass_needs_info["publication_status"], PassportPublicationStatus.NEEDS_INFORMATION)

        # 2. Market Ready -> Ready for Market
        pass_ready = self.pipeline.generate_passport(
            item_dict={"product_id": "PROD-902", "category": "Chair", "verification_status": "PROVISIONAL"},
            quality_score=80.0,
            is_market_ready=True
        )
        self.assertEqual(pass_ready["publication_status"], PassportPublicationStatus.READY_FOR_MARKET)

if __name__ == "__main__":
    unittest.main()
