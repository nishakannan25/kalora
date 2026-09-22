"""
KALORA — Phase 8: Market Readiness Scoring Service
Measures whether a product listing is ready for marketplace publication with strict critical-field blockers.
"""

from typing import Dict, List, Any

from ml.quality.schemas import MarketReadinessResult, CatalogQualityResult
from ml.quality.sector_rules import MARKET_READINESS_WEIGHTS, SECTOR_CRITICAL_FIELDS, calculate_grade

class MarketReadinessService:
    def evaluate_market_readiness(
        self,
        item_dict: Dict[str, Any],
        catalog_quality: CatalogQualityResult
    ) -> MarketReadinessResult:
        completed_factors = []
        missing_factors = []
        critical_blockers = []
        warnings = []
        recommendations = []
        breakdown = {}

        sector = item_dict.get("sector", "Handlooms & Textiles")

        # 1. Catalog Completeness (20 pts)
        breakdown["catalog_completeness"] = (catalog_quality.score / 100.0) * 20.0
        if catalog_quality.score >= 75.0:
            completed_factors.append("catalog_completeness")
        else:
            missing_factors.append("catalog_completeness")
            warnings.append(f"Catalog quality score ({catalog_quality.score:.1f}) is below 75.")

        # 2. Category Confidence (15 pts)
        category = item_dict.get("category", "")
        conf_dict = item_dict.get("confidence", {})
        cat_conf = conf_dict.get("category", 1.0)
        if category and category != "UNCERTAIN" and cat_conf >= 0.60:
            breakdown["category_confidence"] = 15.0
            completed_factors.append("category_confidence")
        else:
            breakdown["category_confidence"] = 0.0
            critical_blockers.append("category_uncertain")
            missing_factors.append("category_confidence")
            recommendations.append("Confirm the product category before publishing.")

        # 3. Price Availability (20 pts)
        price = item_dict.get("price")
        if price is not None and float(price) > 0:
            breakdown["price_availability"] = 20.0
            completed_factors.append("price_availability")
        else:
            breakdown["price_availability"] = 0.0
            critical_blockers.append("price_missing")
            missing_factors.append("price_availability")
            recommendations.append("Set a selling price or fair price estimate.")

        # 4. Required Fields Present (15 pts)
        required = SECTOR_CRITICAL_FIELDS.get(sector, ["category", "material", "price", "images"])
        missing_reqs = []
        for req in required:
            val = item_dict.get(req)
            if val is None or val == "" or val == "UNCERTAIN":
                missing_reqs.append(req)

        if not missing_reqs:
            breakdown["required_fields_present"] = 15.0
            completed_factors.append("required_fields_present")
        else:
            ratio = (len(required) - len(missing_reqs)) / len(required)
            breakdown["required_fields_present"] = ratio * 15.0
            missing_factors.append("required_fields_present")
            for m in missing_reqs:
                if m == "material":
                    critical_blockers.append("required_material_missing")
                warnings.append(f"Required field '{m}' is missing for sector {sector}.")

        # 5. Image Quality & Availability (15 pts)
        images = item_dict.get("images", [])
        if images and len(images) >= 1:
            breakdown["image_quality"] = 15.0
            completed_factors.append("image_quality")
        else:
            breakdown["image_quality"] = 0.0
            critical_blockers.append("images_missing")
            missing_factors.append("image_quality")
            recommendations.append("Upload at least one clear product image.")

        # 6. Artisan Verification (10 pts)
        artisan = item_dict.get("artisan_name")
        status = item_dict.get("verification_status", "UNVERIFIED")
        if artisan and status != "UNCERTAIN":
            breakdown["artisan_verification"] = 10.0
            completed_factors.append("artisan_verification")
        else:
            breakdown["artisan_verification"] = 5.0
            warnings.append("Artisan profile is unverified.")

        # 7. Publication Readiness (5 pts)
        if not critical_blockers and catalog_quality.score >= 70.0:
            breakdown["publication_readiness"] = 5.0
            completed_factors.append("publication_readiness")
        else:
            breakdown["publication_readiness"] = 0.0
            missing_factors.append("publication_readiness")

        raw_score = sum(breakdown.values())

        # CRITICAL BLOCKER RULE: If any critical blocker exists, cap score at 59.0 (F) and set ready=False
        if critical_blockers:
            is_ready = False
            final_score = min(raw_score, 59.0)
            warnings.append(f"Publication BLOCKED due to critical issues: {', '.join(critical_blockers)}.")
        else:
            is_ready = raw_score >= 75.0
            final_score = raw_score

        grade = calculate_grade(final_score)

        return MarketReadinessResult(
            score=round(final_score, 1),
            grade=grade,
            is_ready_for_publication=is_ready,
            critical_blockers=critical_blockers,
            completed_factors=completed_factors,
            missing_factors=missing_factors,
            warnings=warnings,
            recommendations=recommendations,
            factor_breakdown=breakdown
        )
