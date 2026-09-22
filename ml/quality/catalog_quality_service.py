"""
KALORA — Phase 8: Catalog Quality Scoring Service
Evaluates completeness and quality of product catalog information.
"""

from typing import Dict, List, Any

from ml.quality.schemas import CatalogQualityResult
from ml.quality.sector_rules import QUALITY_FACTOR_WEIGHTS, calculate_grade

class CatalogQualityService:
    def evaluate_catalog_quality(self, item_dict: Dict[str, Any]) -> CatalogQualityResult:
        completed_factors = []
        missing_factors = []
        uncertain_factors = []
        warnings = []
        recommendations = []
        breakdown = {}

        # 1. Title Quality (10 pts)
        title = item_dict.get("title", "")
        if title and len(title) >= 10:
            breakdown["title_quality"] = 10.0
            completed_factors.append("title_quality")
        elif title:
            breakdown["title_quality"] = 5.0
            completed_factors.append("title_quality")
            warnings.append("Product title is very short.")
            recommendations.append("Expand title to include region, craft, or material (e.g. Banarasi Silk Saree).")
        else:
            breakdown["title_quality"] = 0.0
            missing_factors.append("title_quality")
            recommendations.append("Add a descriptive product title.")

        # 2. Description Quality (15 pts)
        desc = item_dict.get("description", "")
        if desc and len(desc) >= 40:
            breakdown["description_quality"] = 15.0
            completed_factors.append("description_quality")
        elif desc:
            breakdown["description_quality"] = 8.0
            completed_factors.append("description_quality")
            warnings.append("Description is brief.")
        else:
            breakdown["description_quality"] = 0.0
            missing_factors.append("description_quality")
            recommendations.append("Provide a short product description.")

        # 3. Category Confidence (10 pts)
        category = item_dict.get("category", "")
        conf_dict = item_dict.get("confidence", {})
        cat_conf = conf_dict.get("category", 1.0)
        if category and category != "UNCERTAIN" and cat_conf >= 0.60:
            breakdown["category_confidence"] = 10.0
            completed_factors.append("category_confidence")
        elif category == "UNCERTAIN" or cat_conf < 0.60:
            breakdown["category_confidence"] = 0.0
            uncertain_factors.append("category_confidence")
            warnings.append("Category prediction is uncertain.")
            recommendations.append("Confirm the product category with the artisan.")
        else:
            breakdown["category_confidence"] = 0.0
            missing_factors.append("category_confidence")

        # 4. Material Information (10 pts)
        mat = item_dict.get("material")
        if mat and mat != "UNCERTAIN":
            breakdown["material_information"] = 10.0
            completed_factors.append("material_information")
        else:
            breakdown["material_information"] = 0.0
            missing_factors.append("material_information")
            recommendations.append("Specify the raw material used (e.g. Cotton, Silk, Teak Wood).")

        # 5. Dimensions Information (10 pts)
        dim = item_dict.get("dimensions")
        if dim and dim != "UNCERTAIN":
            breakdown["dimensions_information"] = 10.0
            completed_factors.append("dimensions_information")
        else:
            breakdown["dimensions_information"] = 0.0
            missing_factors.append("dimensions_information")
            recommendations.append("Provide dimensions (length, width, height or size).")

        # 6. Color Information (5 pts)
        col = item_dict.get("color")
        if col:
            breakdown["color_information"] = 5.0
            completed_factors.append("color_information")
        else:
            breakdown["color_information"] = 0.0
            missing_factors.append("color_information")

        # 7. Craft Technique (10 pts)
        tech = item_dict.get("craft_technique")
        if tech and tech != "UNCERTAIN":
            breakdown["craft_technique"] = 10.0
            completed_factors.append("craft_technique")
        else:
            breakdown["craft_technique"] = 0.0
            missing_factors.append("craft_technique")
            recommendations.append("Specify the craft or weaving technique.")

        # 8. Region Information (5 pts)
        reg = item_dict.get("region")
        if reg and reg != "UNCERTAIN":
            breakdown["region_information"] = 5.0
            completed_factors.append("region_information")
        else:
            breakdown["region_information"] = 0.0
            missing_factors.append("region_information")

        # 9. Care Instructions (5 pts)
        care = item_dict.get("care_instructions")
        if care:
            breakdown["care_instructions"] = 5.0
            completed_factors.append("care_instructions")
        else:
            breakdown["care_instructions"] = 0.0
            missing_factors.append("care_instructions")

        # 10. Artisan Information (5 pts)
        artisan = item_dict.get("artisan_name")
        if artisan:
            breakdown["artisan_information"] = 5.0
            completed_factors.append("artisan_information")
        else:
            breakdown["artisan_information"] = 0.0
            missing_factors.append("artisan_information")

        # 11. Image Availability (10 pts)
        imgs = item_dict.get("images", [])
        if imgs and len(imgs) >= 1:
            breakdown["image_availability"] = 10.0
            completed_factors.append("image_availability")
        else:
            breakdown["image_availability"] = 0.0
            missing_factors.append("image_availability")
            recommendations.append("Upload at least one high-resolution product image.")

        # 12. Translation Completeness (5 pts)
        langs = item_dict.get("languages", ["en"])
        if len(langs) >= 2:
            breakdown["translation_completeness"] = 5.0
            completed_factors.append("translation_completeness")
        else:
            breakdown["translation_completeness"] = 2.5
            completed_factors.append("translation_completeness")

        total_score = sum(breakdown.values())
        grade = calculate_grade(total_score)

        return CatalogQualityResult(
            score=round(total_score, 1),
            grade=grade,
            completed_factors=completed_factors,
            missing_factors=missing_factors,
            uncertain_factors=uncertain_factors,
            warnings=warnings,
            recommendations=recommendations,
            factor_breakdown=breakdown
        )
