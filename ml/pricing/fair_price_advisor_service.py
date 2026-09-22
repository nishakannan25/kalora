"""
KALORA — Phase 7: Fair Price Advisor Service
Calculates explainable cost-plus fair price estimates and identifies missing cost inputs.
"""

from typing import Dict, List, Any, Optional

from ml.pricing.schemas import PricingFactorInput, PriceRecommendation, PriceBreakdown
from ml.pricing.sector_pricing_config import (
    SECTOR_PRICING_CONFIGS,
    COMPLEXITY_MULTIPLIERS,
    QUALITY_TIER_MULTIPLIERS,
    REGIONAL_HERITAGE_MULTIPLIERS,
    CUSTOMIZATION_SURCHARGE_RATIO,
    OVERHEAD_AND_PACKAGING_RATIO,
    RANGE_VARIANCE_RATIO
)

QUESTION_TEMPLATES = {
    "labor_hours": {
        "en": "Approximately how many hours or days of handwork did it take to make this product?",
        "hi": "इस उत्पाद को बनाने में लगभग कितने घंटे या दिन की हस्तकला/मेहनत लगी?",
        "ta": "இந்த தயாரிப்பை உருவாக்க தோராயமாக எத்தனை மணிநேரம் அல்லது நாட்கள் கைவேலை தேவைப்பட்டது?",
        "bn": "এই পণ্যটি তৈরি করতে আনুমানিক কত ঘণ্টা বা দিন সময় লেগেছে?"
    },
    "material_cost": {
        "en": "What was the total cost of raw materials (yarn, clay, wood, dyes, metal) used?",
        "hi": "उपयोग किए गए कच्चे माल (धागा, मिट्टी, लकड़ी, रंग) की कुल लागत क्या थी?",
        "ta": "பயன்படுத்தப்பட்ட மூலப்பொருட்களின் மொத்த செலவு என்ன?",
        "bn": "ব্যবহৃত কাঁচামালের মোট খরচ কত ছিল?"
    },
    "artisan_base_cost": {
        "en": "What is your target minimum price to cover costs and earn a fair living wage?",
        "hi": "लागत को पूरा करने और उचित मजदूरी कमाने के लिए आपका न्यूनतम लक्षित मूल्य क्या है?",
        "ta": "உங்கள் குறைந்தபட்ச நியாயமான விலை என்ன?",
        "bn": "আপনার ন্যূনতম ন্যায্য মূল্য কত?"
    }
}

class FairPriceAdvisorService:
    def calculate_fair_price(self, factor_input: PricingFactorInput) -> PriceRecommendation:
        sector_cfg = SECTOR_PRICING_CONFIGS.get(factor_input.sector, SECTOR_PRICING_CONFIGS["Handlooms & Textiles"])
        
        missing_inputs = []
        artisan_questions = []

        # 1. Determine Labor Hours
        is_labor_estimated = False
        if factor_input.labor_hours is not None and factor_input.labor_hours > 0:
            labor_hours = factor_input.labor_hours
        else:
            default_hours_dict = sector_cfg.get("default_labor_hours", {})
            labor_hours = default_hours_dict.get(factor_input.category, default_hours_dict.get("Default", 10.0))
            is_labor_estimated = True
            missing_inputs.append("labor_hours")
            artisan_questions.append({
                "factor": "labor_hours",
                "prompts": QUESTION_TEMPLATES["labor_hours"]
            })

        # 2. Determine Material Cost
        is_material_estimated = False
        if factor_input.material_cost is not None and factor_input.material_cost > 0:
            material_cost = factor_input.material_cost
        else:
            mat_dict = sector_cfg.get("material_base_cost", {})
            material_cost = mat_dict.get(factor_input.material, mat_dict.get("Default", 500.0))
            is_material_estimated = True
            missing_inputs.append("material_cost")
            artisan_questions.append({
                "factor": "material_cost",
                "prompts": QUESTION_TEMPLATES["material_cost"]
            })

        # 3. Calculate Cost Components
        base_labor_rate = sector_cfg.get("base_labor_rate_per_hour", 150.0)
        base_labor_cost = labor_hours * base_labor_rate

        # Craft Technique Premium
        technique_dict = sector_cfg.get("craft_technique_premium", {})
        tech_multiplier = technique_dict.get(factor_input.craft_technique, technique_dict.get("Default", 1.0))
        craft_premium = base_labor_cost * (tech_multiplier - 1.0)

        # Complexity Adjustment
        complexity_mult = COMPLEXITY_MULTIPLIERS.get(factor_input.complexity, COMPLEXITY_MULTIPLIERS["Medium"])
        subtotal_before_complexity = material_cost + base_labor_cost + craft_premium
        complexity_adj = subtotal_before_complexity * (complexity_mult - 1.0)

        # Regional Heritage Multiplier
        region_mult = REGIONAL_HERITAGE_MULTIPLIERS.get(factor_input.region, REGIONAL_HERITAGE_MULTIPLIERS["Default"])
        subtotal_after_region = (subtotal_before_complexity + complexity_adj) * region_mult
        regional_premium = subtotal_after_region - (subtotal_before_complexity + complexity_adj)

        # Overhead & Packaging
        overhead = subtotal_after_region * OVERHEAD_AND_PACKAGING_RATIO

        total_base = subtotal_after_region + overhead

        # Quality Tier Adjustment
        quality_mult = QUALITY_TIER_MULTIPLIERS.get(factor_input.quality_tier, QUALITY_TIER_MULTIPLIERS["Standard"])
        total_base = total_base * quality_mult

        # Customization Surcharge
        if factor_input.customization:
            total_base *= (1.0 + CUSTOMIZATION_SURCHARGE_RATIO)

        # Artisan-Provided Base Cost Floor Check
        if factor_input.artisan_base_cost and factor_input.artisan_base_cost > total_base:
            total_base = factor_input.artisan_base_cost * 1.15  # Ensure at least 15% margin above artisan cost

        # Marketplace Reference Price Calibration (Weighted average if provided)
        if factor_input.marketplace_reference_price and factor_input.marketplace_reference_price > 0:
            # 70% cost-plus fair price, 30% marketplace reference benchmark
            total_base = (0.70 * total_base) + (0.30 * factor_input.marketplace_reference_price)

        suggested_price = round(total_base, -1)  # Round to nearest 10 INR
        if suggested_price <= 0:
            suggested_price = 500.0

        min_price = round(suggested_price * (1.0 - RANGE_VARIANCE_RATIO), -1)
        max_price = round(suggested_price * (1.0 + RANGE_VARIANCE_RATIO), -1)

        # Confidence Score Logic
        if not is_labor_estimated and not is_material_estimated:
            confidence = 0.90
        elif not is_labor_estimated or not is_material_estimated:
            confidence = 0.75
        else:
            confidence = 0.60

        if factor_input.marketplace_reference_price:
            confidence = min(1.0, confidence + 0.05)

        breakdown = PriceBreakdown(
            estimated_material_cost=round(material_cost, 2),
            estimated_labor_cost=round(base_labor_cost, 2),
            craft_skill_premium=round(craft_premium, 2),
            complexity_adjustment=round(complexity_adj, 2),
            regional_heritage_multiplier=round(region_mult, 2),
            overhead_and_packaging=round(overhead, 2),
            total_estimated_base=round(suggested_price, 2)
        )

        return PriceRecommendation(
            sector=factor_input.sector,
            category=factor_input.category,
            suggested_price=suggested_price,
            min_price=min_price,
            max_price=max_price,
            confidence_score=confidence,
            breakdown=breakdown,
            missing_inputs=missing_inputs,
            artisan_questions=artisan_questions
        )
