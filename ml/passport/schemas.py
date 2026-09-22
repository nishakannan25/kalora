"""
KALORA — Phase 9: Digital Craft Passport Schemas & Privacy Controls
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import json

class PassportPublicationStatus:
    DRAFT = "Draft"
    NEEDS_INFORMATION = "Needs Information"
    VERIFIED = "Verified"
    READY_FOR_MARKET = "Ready for Market"
    PUBLISHED = "Published"

@dataclass
class PublicArtisanProfile:
    artisan_name: str
    artisan_story: Optional[str] = None
    region: Optional[str] = None
    # PRIVATE fields (phone, email, bank details, home address) MUST NEVER be placed in public schema.

@dataclass
class DigitalCraftPassport:
    passport_id: str
    product_id: str
    public_url: str
    qr_code_svg: str
    qr_code_data_url: str
    title: str
    sector: str
    category: str
    artisan: PublicArtisanProfile
    materials: Optional[str] = None
    technique: Optional[str] = None
    region: Optional[str] = None
    dimensions: Optional[str] = None
    price: Optional[float] = None
    currency: str = "INR"
    images: List[str] = field(default_factory=list)
    catalog_quality_score: float = 0.0
    market_readiness_status: str = "NOT_READY"
    publication_status: str = PassportPublicationStatus.DRAFT
    created_at: str = ""
    updated_at: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_public_dict(self) -> Dict[str, Any]:
        d = self.to_dict()
        # Ensure no internal raw ML confidences or private keys are present
        return d

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
