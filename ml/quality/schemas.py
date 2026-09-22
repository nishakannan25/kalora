"""
KALORA — Phase 8: Quality & Market Readiness Schemas
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import json

@dataclass
class CatalogQualityResult:
    score: float  # 0 to 100
    grade: str    # A+, A, B, C, D, F
    completed_factors: List[str] = field(default_factory=list)
    missing_factors: List[str] = field(default_factory=list)
    uncertain_factors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    factor_breakdown: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class MarketReadinessResult:
    score: float  # 0 to 100
    grade: str
    is_ready_for_publication: bool
    critical_blockers: List[str] = field(default_factory=list)
    completed_factors: List[str] = field(default_factory=list)
    missing_factors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)
    factor_breakdown: Dict[str, float] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class CombinedQualityAudit:
    product_id: str
    sector: str
    category: str
    catalog_quality: CatalogQualityResult
    market_readiness: MarketReadinessResult

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
