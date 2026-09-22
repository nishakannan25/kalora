"""
KALORA — Phase 10: Unit Test Suite for Admin Dashboard & Verification Pipeline
"""

import unittest
import os
import sys
import shutil

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

from ml.admin.schemas import AdminActionType
from ml.admin.analytics_service import AnalyticsService
from ml.admin.audit_service import AuditService
from ml.admin.admin_product_service import AdminProductService
from ml.admin.pipeline import AdminDashboardPipeline

class TestPhase10Admin(unittest.TestCase):
    def setUp(self):
        self.test_admin_dir = os.path.join(base_dir, "tmp_test_admin_dir")
        self.pipeline = AdminDashboardPipeline(admin_dir=self.test_admin_dir)
        self.service = self.pipeline.product_service

    def tearDown(self):
        if os.path.exists(self.test_admin_dir):
            shutil.rmtree(self.test_admin_dir)

    def test_product_registration_and_analytics(self):
        self.pipeline.register_product(
            product_id="PROD-A1",
            current_catalog={"title": "Silk Saree", "sector": "Handlooms & Textiles", "category": "Saree", "artisan_name": "Sita Devi", "price": 5000.0, "catalog_quality_score": 90.0, "publication_status": "Published"},
            original_artisan_input={"title": "Silk Saree", "raw_text": "banarasi silk saree"},
            extraction_metadata={},
            quality_audit={}
        )
        self.pipeline.register_product(
            product_id="PROD-A2",
            current_catalog={"title": "Clay Pot", "sector": "Pottery & Terracotta", "category": "UNCERTAIN", "artisan_name": "Ramesh Kumar", "catalog_quality_score": 50.0, "publication_status": "Needs Information"},
            original_artisan_input={"title": "Clay Pot"},
            extraction_metadata={},
            quality_audit={}
        )

        all_prods = self.service.search_and_filter()
        summary = self.pipeline.analytics_service.compute_analytics(all_prods)

        self.assertEqual(summary.total_products, 2)
        self.assertEqual(summary.total_artisans, 2)
        self.assertEqual(summary.published_count, 1)
        self.assertEqual(summary.needs_information_count, 1)
        self.assertEqual(summary.uncertain_classifications_count, 1)
        self.assertEqual(summary.low_quality_catalogs_count, 1)

    def test_original_input_preservation_and_audit_history(self):
        record = self.pipeline.register_product(
            product_id="PROD-B1",
            current_catalog={"title": "Teak Chair", "sector": "Furniture / Woodcraft", "material": "Wood"},
            original_artisan_input={"title": "Teak Chair", "material": "Wood"},
            extraction_metadata={},
            quality_audit={}
        )

        # Admin edits material to "Teak Wood"
        edited = self.service.edit_product(
            product_id="PROD-B1",
            edits={"material": "Teak Wood"},
            performed_by="admin_user_1",
            user_role="ADMIN",
            reason="Corrected wood material specification"
        )

        # 1. Current catalog is updated
        self.assertEqual(edited["current_catalog"]["material"], "Teak Wood")

        # 2. Original artisan input is UNTOUCHED
        self.assertEqual(edited["original_artisan_input"]["material"], "Wood")

        # 3. Audit trail contains change log
        self.assertEqual(len(edited["audit_history"]), 1)
        self.assertEqual(edited["audit_history"][0]["action"], AdminActionType.EDIT)
        self.assertEqual(edited["audit_history"][0]["changed_fields"]["material"]["old_value"], "Wood")
        self.assertEqual(edited["audit_history"][0]["changed_fields"]["material"]["new_value"], "Teak Wood")

    def test_role_protection_security(self):
        self.pipeline.register_product(
            product_id="PROD-C1",
            current_catalog={"title": "Vase", "publication_status": "Draft"},
            original_artisan_input={},
            extraction_metadata={},
            quality_audit={}
        )

        # Attempt edit with unauthorized role 'GUEST' -> MUST raise PermissionError
        with self.assertRaises(PermissionError):
            self.service.edit_product(
                product_id="PROD-C1",
                edits={"title": "Hacked Title"},
                performed_by="guest_user",
                user_role="GUEST"
            )

    def test_verification_workflow_actions(self):
        self.pipeline.register_product(
            product_id="PROD-D1",
            current_catalog={"title": "Table", "publication_status": "Draft"},
            original_artisan_input={},
            extraction_metadata={},
            quality_audit={}
        )

        approved = self.service.approve_product("PROD-D1", performed_by="supervisor", user_role="SUPERVISOR")
        self.assertEqual(approved["publication_status"], "Ready for Market")

        published = self.service.publish_product("PROD-D1", performed_by="admin", user_role="ADMIN")
        self.assertEqual(published["publication_status"], "Published")

        unpublished = self.service.unpublish_product("PROD-D1", performed_by="admin", user_role="ADMIN", reason="Compliance review")
        self.assertEqual(unpublished["publication_status"], "Draft")

    def test_dashboard_ui_generation(self):
        self.pipeline.register_product(
            product_id="PROD-E1",
            current_catalog={"title": "Dupatta", "sector": "Handlooms & Textiles", "artisan_name": "Radha Devi", "publication_status": "Published"},
            original_artisan_input={},
            extraction_metadata={},
            quality_audit={}
        )
        file_path = self.pipeline.generate_dashboard_page()
        self.assertTrue(os.path.exists(file_path))
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("KALORA Admin Dashboard", content)
            self.assertIn("PROD-E1", content)

if __name__ == "__main__":
    unittest.main()
