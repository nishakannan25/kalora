"""
KALORA — Phase 7: Core Pricing Schemas and Data Definitions
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import json

@dataclass
class PricingFactorInput:
    sector: str
    category: str
    material: Optional[str] = None
    craft_technique: Optional[str] = None
    dimensions: Optional[str] = None
    complexity: str = "Medium"  # Low, Medium, High, Intricate
    customization: bool = False
    labor_hours: Optional[float] = None
    material_cost: Optional[float] = None
    artisan_base_cost: Optional[float] = None
    region: Optional[str] = None
    quality_tier: str = "Standard"  # Standard, Premium, Masterpiece
    marketplace_reference_price: Optional[float] = None

@dataclass
class PriceBreakdown:
    estimated_material_cost: float = 0.0
    estimated_labor_cost: float = 0.0
    craft_skill_premium: float = 0.0
    complexity_adjustment: float = 0.0
    regional_heritage_multiplier: float = 1.0
    overhead_and_packaging: float = 0.0
    total_estimated_base: float = 0.0

@dataclass
class PriceRecommendation:
    sector: str
    category: str
    suggested_price: float
    min_price: float
    max_price: float
    currency: str = "INR"
    confidence_score: float = 0.0
    breakdown: PriceBreakdown = field(default_factory=PriceBreakdown)
    explanation: str = ""
    multilingual_explanations: Dict[str, str] = field(default_factory=dict)
    missing_inputs: List[str] = field(default_factory=list)
    artisan_questions: List[Dict[str, Any]] = field(default_factory=list)
    disclaimer: str = (
        "Disclaimer: This price recommendation is an explainable estimation based on fair "
        "artisan labor rates, material costs, and market references. It is NOT a guaranteed "
        "selling price, binding quote, or government-mandated price."
    )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
