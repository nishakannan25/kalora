"""
KALORA — Phase 10: Reusable Unified Admin Dashboard Pipeline
"""

import os
from typing import Dict, List, Any, Optional

from ml.admin.schemas import AdminAnalyticsSummary
from ml.admin.analytics_service import AnalyticsService
from ml.admin.audit_service import AuditService
from ml.admin.admin_product_service import AdminProductService
from ml.admin.dashboard_ui import DashboardUIGenerator

ADMIN_PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "admin")

class AdminDashboardPipeline:
    def __init__(self, admin_dir: str = ADMIN_PUBLIC_DIR):
        self.admin_dir = admin_dir
        self.analytics_service = AnalyticsService()
        self.audit_service = AuditService()
        self.product_service = AdminProductService(audit_service=self.audit_service)
        self.ui_generator = DashboardUIGenerator()
        os.makedirs(self.admin_dir, exist_ok=True)

    def register_product(
        self,
        product_id: str,
        current_catalog: Dict[str, Any],
        original_artisan_input: Dict[str, Any],
        extraction_metadata: Dict[str, Any],
        quality_audit: Dict[str, Any]
    ) -> Dict[str, Any]:
        record = self.product_service.register_product(
            product_id=product_id,
            current_catalog=current_catalog,
            original_artisan_input=original_artisan_input,
            extraction_metadata=extraction_metadata,
            quality_audit=quality_audit
        )
        return record.to_dict()

    def get_analytics() -> Dict[str, Any]:
        all_prods = self.product_service.search_and_filter()
        summary = self.analytics_service.compute_analytics(all_prods)
        return summary.to_dict()

    def generate_dashboard_page(self) -> str:
        all_prods = self.product_service.search_and_filter()
        summary = self.analytics_service.compute_analytics(all_prods)
        html_str = self.ui_generator.generate_dashboard_html(summary, all_prods)

        file_path = os.path.join(self.admin_dir, "dashboard.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_str)
        return file_path
