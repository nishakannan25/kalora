"""
KALORA — Test Suite for Tier 4 Roadmap Features
Validates Craft Vocabulary Intelligence (#7), Code-Mixed Parsing (#5), and Visual Similarity Engine (#33, #34).
"""

import unittest
import os
import sys

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.extraction.craft_dictionary import CraftVocabularyIntelligence
from ml.vision.similarity_engine import VisualSimilarityEngine

class TestTier4Features(unittest.TestCase):

    def test_craft_vocabulary_intelligence(self):
        vocab = CraftVocabularyIntelligence()
        sample = "idhu kanjeevaram silk saree me pure zari border irukku with korvai weave"
        res = vocab.normalize_craft_text(sample)
        
        self.assertTrue(res["term_count"] >= 3)
        terms = [t["term"] for t in res["detected_terms"]]
        self.assertIn("Kanjeevaram Silk", terms)
        self.assertIn("Zari", terms)
        self.assertIn("Korvai", terms)
        self.assertEqual(res["sector_hint"], "Handlooms & Textiles")

    def test_visual_similarity_engine(self):
        engine = VisualSimilarityEngine()
        target = {"id": "101", "sector": "Handlooms & Textiles", "category": "Saree", "material": "Silk", "price": 8500}
        catalog = [
            {"id": "102", "sector": "Handlooms & Textiles", "category": "Saree", "material": "Pure Mulberry Silk", "price": 9000, "title": "Kanjeevaram Silk Saree"},
            {"id": "103", "sector": "Furniture / Woodcraft", "category": "Chair", "material": "Teak", "price": 4500, "title": "Saharanpur Teak Armchair"}
        ]

        similar_items = engine.find_similar_products(target, catalog, top_k=2)
        self.assertEqual(len(similar_items), 1)
        self.assertEqual(similar_items[0]["id"], "102")
        self.assertTrue(similar_items[0]["similarity_score"] > 0.70)

if __name__ == "__main__":
    unittest.main()
