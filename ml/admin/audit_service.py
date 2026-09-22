"""
KALORA — Phase 10: Audit & History Service
Tracks changes, enforces role protection, and preserves original artisan input.
"""

import uuid
import datetime
from typing import Dict, List, Any, Optional

from ml.admin.schemas import AuditLogEntry, AdminActionType

ALLOWED_ADMIN_ROLES = ["ADMIN", "SUPERVISOR"]

class AuditService:
    def check_permission(self, user_role: str):
        if user_role not in ALLOWED_ADMIN_ROLES:
            raise PermissionError(f"Role '{user_role}' is not authorized to perform admin actions. Allowed roles: {ALLOWED_ADMIN_ROLES}")

    def create_log_entry(
        self,
        product_id: str,
        action: str,
        performed_by: str,
        user_role: str,
        changed_fields: Dict[str, Dict[str, Any]],
        reason: Optional[str] = None
    ) -> AuditLogEntry:
        self.check_permission(user_role)
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_id = f"LOG-{uuid.uuid4().hex[:8].upper()}"

        return AuditLogEntry(
            log_id=log_id,
            product_id=product_id,
            action=action,
            performed_by=performed_by,
            user_role=user_role,
            timestamp=now_str,
            changed_fields=changed_fields,
            reason=reason
        )
