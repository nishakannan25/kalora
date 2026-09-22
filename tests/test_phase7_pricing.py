"""
KALORA — Phase 7: Unit Test Suite for Fair Price Advisor Pipeline
"""

import unittest
import os
import sys

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.pricing.schemas import PricingFactorInput, PriceRecommendation
from ml.pricing.fair_price_advisor_service import FairPriceAdvisorService
from ml.pricing.price_explanation_service import PriceExplanationService
from ml.pricing.pipeline import FairPriceAdvisorPipeline

class TestPhase7FairPriceAdvisor(unittest.TestCase):
    def setUp(self):
        self.pipeline = FairPriceAdvisorPipeline()
        self.advisor = FairPriceAdvisorService()

    def test_handloom_pricing_with_full_inputs(self):
        factor_input = PricingFactorInput(
            sector="Handlooms & Textiles",
            category="Saree",
            material="Kanjeevaram Silk",
            craft_technique="Zardozi Embroidery",
            complexity="Intricate",
            labor_hours=36.0,
            material_cost=3000.0,
            region="Kanchipuram",
            quality_tier="Premium"
        )
        rec = self.advisor.calculate_fair_price(factor_input)
        self.assertGreater(rec.suggested_price, 3000.0)
        self.assertGreater(rec.min_price, 0)
        self.assertGreater(rec.max_price, rec.min_price)
        self.assertEqual(rec.confidence_score, 0.90)
        self.assertEqual(len(rec.missing_inputs), 0)

    def test_missing_input_detection(self):
        factor_input = PricingFactorInput(
            sector="Pottery & Terracotta",
            category="Vase / Planter",
            material="Terracotta",
            complexity="Medium"
        )
        rec = self.advisor.calculate_fair_price(factor_input)
        self.assertIn("labor_hours", rec.missing_inputs)
        self.assertIn("material_cost", rec.missing_inputs)
        self.assertLess(rec.confidence_score, 0.80)
        self.assertTrue(len(rec.artisan_questions) >= 2)

    def test_furniture_pricing_and_customization(self):
        standard_res = self.pipeline.evaluate_fair_price(
            sector="Furniture / Woodcraft",
            category="Dining Table",
            material="Teak Wood",
            craft_technique="Hand Carving",
            labor_hours=40.0,
            material_cost=5000.0,
            customization=False
        )
        custom_res = self.pipeline.evaluate_fair_price(
            sector="Furniture / Woodcraft",
            category="Dining Table",
            material="Teak Wood",
            craft_technique="Hand Carving",
            labor_hours=40.0,
            material_cost=5000.0,
            customization=True
        )
        self.assertGreater(custom_res["suggested_price"], standard_res["suggested_price"])

    def test_disclaimer_and_explainability(self):
        res = self.pipeline.evaluate_fair_price(
            sector="Handlooms & Textiles",
            category="Dupatta",
            material="Cotton",
            languages=["en", "hi"]
        )
        self.assertIn("Disclaimer", res["disclaimer"])
        self.assertIn("hi", res["multilingual_explanations"])
        self.assertIn("अस्वीकरण", res["multilingual_explanations"]["hi"])

if __name__ == "__main__":
    unittest.main()
