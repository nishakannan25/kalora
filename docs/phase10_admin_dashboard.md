# KALORA — Phase 10: Admin Dashboard Documentation

## Overview

Phase 10 introduces the **Admin Management Dashboard**, verification workflow engine, real-time catalog analytics, and role-protected audit logging for KALORA products and artisans across Handlooms, Pottery, and Furniture sectors.

---

## Core Features & Functionality

1. **Real-time Catalog Analytics (`AnalyticsService`)**:
   - `total_artisans` (unique verified artisans).
   - `total_products` (total registered products).
   - `products_by_sector` (Handlooms & Textiles, Pottery & Terracotta, Furniture / Woodcraft).
   - Status metrics: Drafts, Verified, Needs Information, Ready for Market, Published.
   - Quality & Classification alerts: Uncertain predictions, Low-quality catalogs.

2. **Product Review & Inspection (`AdminProductService`)**:
   - Multi-criteria search and filter (sector, status, query string, uncertainty flag).
   - Complete product inspection: image list, extracted attributes, missing fields, ML confidence scores, quality score, original artisan submission payload.
   - Multi-state verification actions: Approve, Reject (with reason), Publish, Unpublish.

3. **Audit History & Original Input Preservation (`AuditService`)**:
   - **Artisan Input Protection**: Admin edits modify `current_catalog` while keeping `original_artisan_input` untouched.
   - **Audit Trail**: Every modification, state transition, approval, rejection, or publishing action is appended to `audit_history` with timestamps, performing admin user ID, role, changed field diffs (`old_value` -> `new_value`), and reason.

4. **Role Protection Security**:
   - Enforces role authorization (`ADMIN`, `SUPERVISOR`). Unprivileged user roles (e.g. `USER`, `GUEST`) attempting state mutations automatically trigger a `PermissionError`.

5. **Interactive Dashboard UI (`DashboardUIGenerator`)**:
   - Fast-loading, responsive HTML interface generated at `public/admin/dashboard.html`.

---

## Created Files & Components

- `ml/admin/schemas.py`: Data models (`AuditLogEntry`, `AdminAnalyticsSummary`, `AdminProductReviewRecord`, `AdminActionType`).
- `ml/admin/analytics_service.py`: Real-time analytics aggregation service.
- `ml/admin/audit_service.py`: Audit history tracker and role permission validator.
- `ml/admin/admin_product_service.py`: Product search/filter, inspection, review/edit, approval/rejection, publish/unpublish workflow service.
- `ml/admin/dashboard_ui.py`: HTML Dashboard UI generator.
- `ml/admin/pipeline.py`: Reusable unified entry point `AdminDashboardPipeline`.
- `tests/test_phase10_admin.py`: Unit test suite (5/5 tests passed).
- `docs/phase10_admin_dashboard.md`: Technical documentation.

---

## Usage Example

```python
from ml.admin.pipeline import AdminDashboardPipeline

pipeline = AdminDashboardPipeline()

# 1. Register Product
pipeline.register_product(
    product_id="PROD-501",
    current_catalog={"title": "Teak Wood Chair", "sector": "Furniture / Woodcraft", "publication_status": "Draft"},
    original_artisan_input={"title": "Teak Wood Chair"},
    extraction_metadata={},
    quality_audit={}
)

# 2. Admin Edit (Role Protected)
edited = pipeline.product_service.edit_product(
    product_id="PROD-501",
    edits={"material": "Teak Wood"},
    performed_by="admin_user_1",
    user_role="ADMIN",
    reason="Added verified material specification"
)

# 3. Generate Dashboard Page
dashboard_path = pipeline.generate_dashboard_page()
print("Dashboard HTML saved at:", dashboard_path)
```
