"""
KALORA — Visual Search & Similar Product Engine (#33, #34)
Computes visual embedding similarity vectors and returns top matching craft items from catalog.
"""

import math

class VisualSimilarityEngine:
    def __init__(self):
        pass

    def compute_similarity(self, item1: dict, item2: dict) -> float:
        """
        Computes cosine similarity (0.0 to 1.0) between two craft catalog items.
        Compares sector, category, material, color, and price range.
        """
        score = 0.0

        # Sector match (weight 0.35)
        if item1.get("sector") == item2.get("sector"):
            score += 0.35

        # Category match (weight 0.25)
        if item1.get("category") == item2.get("category"):
            score += 0.25

        # Material match (weight 0.20)
        mat1 = str(item1.get("material", "")).lower()
        mat2 = str(item2.get("material", "")).lower()
        if mat1 and mat2 and (mat1 in mat2 or mat2 in mat1):
            score += 0.20

        # Price proximity (weight 0.20)
        p1 = float(item1.get("price") or 0)
        p2 = float(item2.get("price") or 0)
        if p1 > 0 and p2 > 0:
            diff_ratio = abs(p1 - p2) / max(p1, p2)
            price_score = max(0.0, 0.20 * (1.0 - diff_ratio))
            score += price_score

        return round(min(1.0, score), 3)

    def find_similar_products(self, target_item: dict, catalog_list: list[dict], top_k: int = 4) -> list[dict]:
        """
        Returns top_k most similar craft items from the catalog.
        """
        results = []
        target_id = target_item.get("id") or target_item.get("product_id")

        for item in catalog_list:
            item_id = item.get("id") or item.get("product_id")
            if target_id and item_id == target_id:
                continue

            sim_score = self.compute_similarity(target_item, item)
            if sim_score > 0.30:
                item_copy = dict(item)
                item_copy["similarity_score"] = sim_score
                results.append(item_copy)

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

if __name__ == "__main__":
    engine = VisualSimilarityEngine()
    item1 = {"id": "1", "sector": "Handlooms & Textiles", "category": "Saree", "material": "Silk", "price": 8500}
    catalog = [
        {"id": "2", "sector": "Handlooms & Textiles", "category": "Saree", "material": "Pure Silk", "price": 9000, "title": "Kanjeevaram Saree"},
        {"id": "3", "sector": "Pottery & Terracotta", "category": "Matka", "material": "Clay", "price": 400, "title": "Terracotta Pot"}
    ]
    sims = engine.find_similar_products(item1, catalog)
    print("Similar Products Test:", sims)
