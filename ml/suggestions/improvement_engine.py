"""
KALORA — Product Improvement Suggestions Engine (#26)
Generates targeted, actionable listing recommendations for artisans based on catalog extraction, quality score, and pricing benchmark analysis.
"""

class ProductImprovementEngine:
    def __init__(self):
        pass

    def generate_suggestions(
        self,
        extracted_catalog: dict,
        quality_audit: dict,
        pricing_info: dict
    ) -> list[dict]:
        """
        Generates 3 concrete, high-impact suggestions for the artisan.
        """
        suggestions = []

        missing_fields = extracted_catalog.get("missing_fields", [])
        quality_score = quality_audit.get("catalog_quality", {}).get("score", 70)
        grade = quality_audit.get("catalog_quality", {}).get("grade", "B")
        market_ready = quality_audit.get("market_readiness", {}).get("is_ready_for_publication", True)
        suggested_price = pricing_info.get("suggested_price", 0.0)
        artisan_price = extracted_catalog.get("price") or pricing_info.get("artisan_price")

        # 1. Missing Attributes & Completeness Tip
        if missing_fields:
            field_names = ", ".join(missing_fields[:3])
            suggestions.append({
                "id": "add_missing_attributes",
                "category": "Completeness",
                "impact": "HIGH",
                "title": f"Add missing details ({field_names})",
                "description": f"Providing complete information for {field_names} increases buyer conversion by up to 35%."
            })
        elif quality_score < 85:
            suggestions.append({
                "id": "enhance_description",
                "category": "Completeness",
                "impact": "MEDIUM",
                "title": "Add craft process description",
                "description": "Mentioning the traditional weaving/carving technique used will highlight your item's authenticity to international buyers."
            })

        # 2. Pricing Optimization Tip
        if artisan_price and suggested_price > 0:
            diff_ratio = (artisan_price - suggested_price) / suggested_price
            if diff_ratio < -0.20:
                suggestions.append({
                    "id": "price_underpriced",
                    "category": "Pricing",
                    "impact": "HIGH",
                    "title": "Underpriced relative to fair market value",
                    "description": f"Your price of ₹{artisan_price:,.0f} is lower than the recommended fair value ₹{suggested_price:,.0f}. You can safely increase price to earn higher fair profit."
                })
            elif diff_ratio > 0.30:
                suggestions.append({
                    "id": "price_overpriced",
                    "category": "Pricing",
                    "impact": "MEDIUM",
                    "title": "Price above market benchmark",
                    "description": f"Suggested fair value is ₹{suggested_price:,.0f}. Adding a craft provenance passport can help justify your premium pricing to collectors."
                })

        # 3. Photography & Visual Trust Tip
        if grade in ["B", "C"]:
            suggestions.append({
                "id": "add_detail_photo",
                "category": "Photography",
                "impact": "HIGH",
                "title": "Upload a close-up texture photo",
                "description": "Including 1 high-resolution close-up photo of the fabric weave, pottery glaze, or wood grain improves catalog quality grade to A."
            })

        # Default fallback high-impact suggestion if list is under 3
        if len(suggestions) < 3:
            suggestions.append({
                "id": "attach_craft_passport",
                "category": "Provenance",
                "impact": "HIGH",
                "title": "Attach Digital Craft Passport",
                "description": "Generating a QR craft passport guarantees GI authenticity and builds premium trust with buyers."
            })

        if len(suggestions) < 3:
            suggestions.append({
                "id": "enable_multilingual",
                "category": "Reach",
                "impact": "MEDIUM",
                "title": "Enable automatic Hindi & Tamil translation",
                "description": "Multilingual listings expand your market reach across pan-India buyer bases."
            })

        return suggestions[:3]

if __name__ == "__main__":
    engine = ProductImprovementEngine()
    sample_cat = {"missing_fields": ["dimensions"]}
    sample_qual = {"catalog_quality": {"score": 75, "grade": "B"}, "market_readiness": {"is_ready_for_publication": True}}
    sample_price = {"suggested_price": 4500.0, "artisan_price": 3000.0}
    res = engine.generate_suggestions(sample_cat, sample_qual, sample_price)
    print("Improvement Suggestions Test:", res)
