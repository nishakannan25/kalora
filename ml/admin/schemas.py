"""
KALORA — Phase 10: Admin Dashboard & Audit Trail Schemas
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field, asdict
import json

class AdminActionType:
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    EDIT = "EDIT"
    PUBLISH = "PUBLISH"
    UNPUBLISH = "UNPUBLISH"

@dataclass
class AuditLogEntry:
    log_id: str
    product_id: str
    action: str
    performed_by: str
    user_role: str
    timestamp: str
    changed_fields: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AdminAnalyticsSummary:
    total_artisans: int = 0
    total_products: int = 0
    products_by_sector: Dict[str, int] = field(default_factory=dict)
    drafts_count: int = 0
    verified_count: int = 0
    needs_information_count: int = 0
    market_ready_count: int = 0
    published_count: int = 0
    uncertain_classifications_count: int = 0
    low_quality_catalogs_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AdminProductReviewRecord:
    product_id: str
    sector: str
    category: str
    title: str
    current_catalog: Dict[str, Any]
    original_artisan_input: Dict[str, Any]
    extraction_metadata: Dict[str, Any]
    quality_audit: Dict[str, Any]
    publication_status: str
    audit_history: List[AuditLogEntry] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d
