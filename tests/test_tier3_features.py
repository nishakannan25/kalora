"""
KALORA — Test Suite for Tier 3 Differentiator Features
Validates Smart Audio Quality Analyzer (#2), Product Improvement Engine (#26), and Cultural Storyteller (#15).
"""

import unittest
import os
import sys

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.audio.audio_analyzer import AudioQualityAnalyzer
from ml.suggestions.improvement_engine import ProductImprovementEngine
from ml.story.cultural_storyteller import CulturalStoryteller

class TestTier3Features(unittest.TestCase):

    def test_audio_quality_analyzer_pcm(self):
        analyzer = AudioQualityAnalyzer()
        # 16000 samples of quiet audio vs clear sine wave
        quiet_samples = [0.0001] * 16000
        res_quiet = analyzer.analyze_pcm_samples(quiet_samples, 16000)
        self.assertEqual(res_quiet["status"], "POOR")
        self.assertFalse(res_quiet["is_usable"])

        import math
        clear_samples = [0.3 * math.sin(2 * math.pi * 440 * i / 16000) for i in range(16000)]
        res_clear = analyzer.analyze_pcm_samples(clear_samples, 16000)
        self.assertIn(res_clear["status"], ["EXCELLENT", "GOOD"])
        self.assertTrue(res_clear["score"] >= 70)
        self.assertTrue(res_clear["is_usable"])

    def test_product_improvement_engine(self):
        engine = ProductImprovementEngine()
        cat = {"missing_fields": ["dimensions", "weight"], "price": 2000.0}
        qual = {"catalog_quality": {"score": 65, "grade": "C"}, "market_readiness": {"is_ready_for_publication": True}}
        pricing = {"suggested_price": 4000.0}

        suggestions = engine.generate_suggestions(cat, qual, pricing)
        self.assertEqual(len(suggestions), 3)
        self.assertTrue(any(s["id"] == "add_missing_attributes" for s in suggestions))
        self.assertTrue(any(s["category"] == "Pricing" for s in suggestions))

    def test_cultural_storyteller_workflow(self):
        storyteller = CulturalStoryteller()
        story = storyteller.generate_story("Lakshmi Ammal", "Handlooms & Textiles", "Saree", "Silk", "Kanchipuram")
        self.assertEqual(story["approval_status"], "PENDING_ARTISAN_APPROVAL")
        self.assertFalse(story["is_approved"])
        self.assertIn("Kanchipuram", story["narrative"])

        # Approve story
        approved = storyteller.approve_story(story)
        self.assertEqual(approved["approval_status"], "APPROVED_BY_ARTISAN")
        self.assertTrue(approved["is_approved"])

if __name__ == "__main__":
    unittest.main()
