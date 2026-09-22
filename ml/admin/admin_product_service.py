"""
KALORA — Phase 10: Admin Product Management & Verification Service
Provides search, filter, inspection, review/edit, approval/rejection, and publishing workflows.
"""

from typing import Dict, List, Any, Optional
import copy

from ml.admin.schemas import AdminProductReviewRecord, AdminActionType
from ml.admin.audit_service import AuditService

class AdminProductService:
    def __init__(self, audit_service: Optional[AuditService] = None):
        self.audit_service = audit_service or AuditService()
        self._records: Dict[str, AdminProductReviewRecord] = {}

    def register_product(
        self,
        product_id: str,
        current_catalog: Dict[str, Any],
        original_artisan_input: Dict[str, Any],
        extraction_metadata: Dict[str, Any],
        quality_audit: Dict[str, Any]
    ) -> AdminProductReviewRecord:
        sector = current_catalog.get("sector", "Handlooms & Textiles")
        category = current_catalog.get("category", "Unspecified")
        title = current_catalog.get("title", "Handcrafted Item")
        status = current_catalog.get("publication_status", "Draft")

        record = AdminProductReviewRecord(
            product_id=product_id,
            sector=sector,
            category=category,
            title=title,
            current_catalog=copy.deepcopy(current_catalog),
            original_artisan_input=copy.deepcopy(original_artisan_input),
            extraction_metadata=copy.deepcopy(extraction_metadata),
            quality_audit=copy.deepcopy(quality_audit),
            publication_status=status
        )
        self._records[product_id] = record
        return record

    def search_and_filter(
        self,
        query: Optional[str] = None,
        sector: Optional[str] = None,
        publication_status: Optional[str] = None,
        uncertain_only: bool = False
    ) -> List[Dict[str, Any]]:
        results = []
        for r in self._records.values():
            cat = r.current_catalog

            # Sector filter
            if sector and r.sector != sector:
                continue

            # Status filter
            if publication_status and r.publication_status != publication_status:
                continue

            # Uncertain filter
            if uncertain_only:
                is_unc = cat.get("category") == "UNCERTAIN" or cat.get("confidence", {}).get("category", 1.0) < 0.60
                if not is_unc:
                    continue

            # Query match
            if query:
                q_lower = query.lower()
                matches = (
                    q_lower in r.product_id.lower() or
                    q_lower in r.title.lower() or
                    q_lower in (cat.get("artisan_name") or "").lower() or
                    q_lower in r.category.lower()
                )
                if not matches:
                    continue

            results.append(r.to_dict())
        return results

    def inspect_product(self, product_id: str) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")
        return self._records[product_id].to_dict()

    def edit_product(
        self,
        product_id: str,
        edits: Dict[str, Any],
        performed_by: str,
        user_role: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")

        record = self._records[product_id]
        changed_fields = {}

        for k, new_val in edits.items():
            old_val = record.current_catalog.get(k)
            if old_val != new_val:
                changed_fields[k] = {"old_value": old_val, "new_value": new_val}
                record.current_catalog[k] = new_val

        log_entry = self.audit_service.create_log_entry(
            product_id=product_id,
            action=AdminActionType.EDIT,
            performed_by=performed_by,
            user_role=user_role,
            changed_fields=changed_fields,
            reason=reason or "Admin product review edit"
        )
        record.audit_history.append(log_entry)
        return record.to_dict()

    def approve_product(
        self,
        product_id: str,
        performed_by: str,
        user_role: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")

        record = self._records[product_id]
        old_status = record.publication_status
        new_status = "Ready for Market"

        record.publication_status = new_status
        record.current_catalog["publication_status"] = new_status

        log_entry = self.audit_service.create_log_entry(
            product_id=product_id,
            action=AdminActionType.APPROVE,
            performed_by=performed_by,
            user_role=user_role,
            changed_fields={"publication_status": {"old_value": old_status, "new_value": new_status}},
            reason=reason or "Product approved by admin"
        )
        record.audit_history.append(log_entry)
        return record.to_dict()

    def reject_product(
        self,
        product_id: str,
        performed_by: str,
        user_role: str,
        reason: str
    ) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")

        record = self._records[product_id]
        old_status = record.publication_status
        new_status = "Needs Information"

        record.publication_status = new_status
        record.current_catalog["publication_status"] = new_status

        log_entry = self.audit_service.create_log_entry(
            product_id=product_id,
            action=AdminActionType.REJECT,
            performed_by=performed_by,
            user_role=user_role,
            changed_fields={"publication_status": {"old_value": old_status, "new_value": new_status}},
            reason=reason
        )
        record.audit_history.append(log_entry)
        return record.to_dict()

    def publish_product(
        self,
        product_id: str,
        performed_by: str,
        user_role: str,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")

        record = self._records[product_id]
        old_status = record.publication_status
        new_status = "Published"

        record.publication_status = new_status
        record.current_catalog["publication_status"] = new_status

        log_entry = self.audit_service.create_log_entry(
            product_id=product_id,
            action=AdminActionType.PUBLISH,
            performed_by=performed_by,
            user_role=user_role,
            changed_fields={"publication_status": {"old_value": old_status, "new_value": new_status}},
            reason=reason or "Published to marketplace"
        )
        record.audit_history.append(log_entry)
        return record.to_dict()

    def unpublish_product(
        self,
        product_id: str,
        performed_by: str,
        user_role: str,
        reason: str
    ) -> Dict[str, Any]:
        if product_id not in self._records:
            raise KeyError(f"Product ID '{product_id}' not found.")

        record = self._records[product_id]
        old_status = record.publication_status
        new_status = "Draft"

        record.publication_status = new_status
        record.current_catalog["publication_status"] = new_status

        log_entry = self.audit_service.create_log_entry(
            product_id=product_id,
            action=AdminActionType.UNPUBLISH,
            performed_by=performed_by,
            user_role=user_role,
            changed_fields={"publication_status": {"old_value": old_status, "new_value": new_status}},
            reason=reason
        )
        record.audit_history.append(log_entry)
        return record.to_dict()
