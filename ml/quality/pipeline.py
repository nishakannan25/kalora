"""
KALORA — Phase 8: Reusable Unified Quality & Market Readiness Pipeline
"""

from typing import Dict, Any

from ml.quality.schemas import CombinedQualityAudit
from ml.quality.catalog_quality_service import CatalogQualityService
from ml.quality.market_readiness_service import MarketReadinessService

class QualityAuditPipeline:
    def __init__(self):
        self.quality_service = CatalogQualityService()
        self.readiness_service = MarketReadinessService()

    def audit_product(self, item_dict: Dict[str, Any]) -> Dict[str, Any]:
        product_id = item_dict.get("product_id", "UNKNOWN-PROD")
        sector = item_dict.get("sector", "Handlooms & Textiles")
        category = item_dict.get("category", "Unspecified")

        catalog_quality = self.quality_service.evaluate_catalog_quality(item_dict)
        market_readiness = self.readiness_service.evaluate_market_readiness(item_dict, catalog_quality)

        audit = CombinedQualityAudit(
            product_id=product_id,
            sector=sector,
            category=category,
            catalog_quality=catalog_quality,
            market_readiness=market_readiness
        )

        return audit.to_dict()
