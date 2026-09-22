"""
KALORA — Phase 6: Core Product Schemas and Data Definitions
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import json

class VerificationStatus:
    UNVERIFIED = "UNVERIFIED"
    PROVISIONAL = "PROVISIONAL"
    ARTISAN_CONFIRMED = "ARTISAN_CONFIRMED"
    UNCERTAIN = "UNCERTAIN"

class SectorType:
    HANDLOOMS = "Handlooms & Textiles"
    POTTERY = "Pottery & Terracotta"
    FURNITURE = "Furniture / Woodcraft"

@dataclass
class ProvenanceRecord:
    field_name: str
    source: str  # e.g., "vision_classifier", "artisan_text", "artisan_confirmation", "default_null"
    confidence: float
    raw_input: Optional[str] = None

@dataclass
class ProductCatalogItem:
    product_id: str
    sector: str
    category: str
    subcategory: Optional[str] = None
    title: str = ""
    description: str = ""
    material: Optional[str] = None
    color: Optional[str] = None
    pattern: Optional[str] = None
    craft_technique: Optional[str] = None
    region: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None
    quantity: Optional[int] = None
    care_instructions: Optional[str] = None
    artisan_name: Optional[str] = None
    artisan_story: Optional[str] = None
    price: Optional[float] = None
    currency: str = "INR"
    images: List[str] = field(default_factory=list)
    languages: List[str] = field(default_factory=lambda: ["en"])
    confidence: Dict[str, float] = field(default_factory=dict)
    missing_fields: List[str] = field(default_factory=list)
    uncertain_fields: List[str] = field(default_factory=list)
    verification_status: str = VerificationStatus.UNVERIFIED
    provenance: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    sector_attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
