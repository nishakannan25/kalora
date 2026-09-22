"""
KALORA — Phase 9: Reusable Unified Digital Craft Passport Pipeline
"""

from typing import Dict, Any, Optional

from ml.passport.schemas import DigitalCraftPassport
from ml.passport.passport_service import PassportService

class DigitalCraftPassportPipeline:
    def __init__(self, public_dir: Optional[str] = None):
        if public_dir:
            self.service = PassportService(public_dir=public_dir)
        else:
            self.service = PassportService()

    def generate_passport(
        self,
        item_dict: Dict[str, Any],
        quality_score: float = 0.0,
        is_market_ready: bool = False,
        critical_blockers: Optional[list] = None,
        publish_now: bool = False
    ) -> Dict[str, Any]:
        passport = self.service.create_passport(
            item_dict=item_dict,
            quality_score=quality_score,
            is_market_ready=is_market_ready,
            critical_blockers=critical_blockers,
            publish_now=publish_now
        )
        return passport.to_public_dict()
