"""
KALORA — Phase 7: Reusable Unified Fair Price Advisor Pipeline
"""

from typing import Dict, List, Any, Optional

from ml.pricing.schemas import PricingFactorInput, PriceRecommendation
from ml.pricing.fair_price_advisor_service import FairPriceAdvisorService
from ml.pricing.price_explanation_service import PriceExplanationService

class FairPriceAdvisorPipeline:
    def __init__(self):
        self.advisor_service = FairPriceAdvisorService()
        self.explanation_service = PriceExplanationService()

    def evaluate_fair_price(
        self,
        sector: str,
        category: str,
        material: Optional[str] = None,
        craft_technique: Optional[str] = None,
        dimensions: Optional[str] = None,
        complexity: str = "Medium",
        customization: bool = False,
        labor_hours: Optional[float] = None,
        material_cost: Optional[float] = None,
        artisan_base_cost: Optional[float] = None,
        region: Optional[str] = None,
        quality_tier: str = "Standard",
        marketplace_reference_price: Optional[float] = None,
        languages: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        factor_input = PricingFactorInput(
            sector=sector,
            category=category,
            material=material,
            craft_technique=craft_technique,
            dimensions=dimensions,
            complexity=complexity,
            customization=customization,
            labor_hours=labor_hours,
            material_cost=material_cost,
            artisan_base_cost=artisan_base_cost,
            region=region,
            quality_tier=quality_tier,
            marketplace_reference_price=marketplace_reference_price
        )

        rec = self.advisor_service.calculate_fair_price(factor_input)
        rec_with_exp = self.explanation_service.generate_explanation(
            rec, factor_input, target_languages=languages
        )

        return rec_with_exp.to_dict()
