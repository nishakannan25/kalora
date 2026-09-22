"""
KALORA — Phase 12: Master End-to-End Orchestrator Pipeline
Unifies Extraction (P6), Fair Price Advisor (P7), Quality Audit (P8),
Digital Craft Passport (P9), and Admin Management (P10).
"""

from typing import Dict, Any, Optional, List

from ml.extraction.pipeline import ProductExtractionPipeline
from ml.pricing.pipeline import FairPriceAdvisorPipeline
from ml.quality.pipeline import QualityAuditPipeline
from ml.passport.pipeline import DigitalCraftPassportPipeline
from ml.admin.pipeline import AdminDashboardPipeline

class KaloraMasterPipeline:
    def __init__(self, public_dir: Optional[str] = None, admin_dir: Optional[str] = None):
        self.extraction_pipeline = ProductExtractionPipeline()
        self.pricing_pipeline = FairPriceAdvisorPipeline()
        self.quality_pipeline = QualityAuditPipeline()
        self.passport_pipeline = DigitalCraftPassportPipeline(public_dir=public_dir)
        self.admin_pipeline = AdminDashboardPipeline(admin_dir=admin_dir) if admin_dir else AdminDashboardPipeline()
        
        self._seen_products: Dict[str, Dict[str, Any]] = {}  # Duplicate detection registry

    def process_artisan_submission(
        self,
        image_path: Optional[str] = None,
        text_transcript: Optional[str] = None,
        artisan_provided_data: Optional[Dict[str, Any]] = None,
        target_language: str = "en"
    ) -> Dict[str, Any]:
        """
        Full End-to-End Processing Workflow:
        1. Extract product attributes (Non-hallucinating vision + regex parsing).
        2. Detect missing required attributes & generate artisan prompts.
        3. Merge artisan confirmed data.
        4. Check for duplicate submissions.
        5. Run Fair Price Advisor engine.
        6. Compute Catalog Quality & Market Readiness scores.
        7. Issue Digital Craft Passport & QR code.
        8. Register product with Admin Dashboard.
        """
        artisan_data = artisan_provided_data or {}

        # 1 & 2: Product Extraction
        extraction_res = self.extraction_pipeline.process_artisan_input(
            image_path=image_path,
            text_transcript=text_transcript,
            languages=[target_language],
            artisan_confirmations=artisan_data
        )

        catalog = extraction_res.get("product_catalog_item", {})
        
        # Merge artisan confirmed inputs
        for k, v in artisan_data.items():
            if v is not None:
                catalog[k] = v

        # 4: Duplicate Check
        title_str = (catalog.get('title') or '').strip().lower()
        artisan_str = (catalog.get('artisan_name') or '').strip().lower()
        product_key = f"{title_str}_{artisan_str}"
        is_duplicate = product_key in self._seen_products if product_key != "_" else False

        # 5: Fair Price Advisor
        price_res = self.pricing_pipeline.evaluate_fair_price(
            sector=catalog.get("sector", "Handlooms & Textiles"),
            category=catalog.get("category", "Unspecified"),
            material=catalog.get("material"),
            craft_technique=catalog.get("craft_technique"),
            dimensions=catalog.get("dimensions"),
            labor_hours=artisan_data.get("labor_hours"),
            material_cost=artisan_data.get("material_cost"),
            artisan_base_cost=artisan_data.get("artisan_base_cost"),
            region=catalog.get("region"),
            languages=[target_language]
        )
        if "suggested_price" in price_res:
            catalog["price_estimate"] = price_res["suggested_price"]

        # 6: Quality & Market Readiness Audit
        audit_res = self.quality_pipeline.audit_product(catalog)

        # 7: Digital Craft Passport Generation
        is_ready = audit_res["market_readiness"]["is_ready_for_publication"]
        passport_res = self.passport_pipeline.generate_passport(
            item_dict=catalog,
            quality_score=audit_res["catalog_quality"]["score"],
            is_market_ready=is_ready,
            critical_blockers=audit_res["market_readiness"]["critical_blockers"],
            publish_now=is_ready
        )

        # 8: Register with Admin Dashboard
        admin_record = self.admin_pipeline.register_product(
            product_id=catalog.get("product_id", "PROD-000"),
            current_catalog=catalog,
            original_artisan_input=artisan_data or {"text_transcript": text_transcript},
            extraction_metadata=extraction_res.get("extraction_metadata", {}),
            quality_audit=audit_res
        )

        if not is_duplicate and product_key != "_":
            self._seen_products[product_key] = catalog

        return {
            "catalog": catalog,
            "extraction": extraction_res,
            "pricing": price_res,
            "quality_audit": audit_res,
            "passport": passport_res,
            "admin_record": admin_record,
            "is_duplicate": is_duplicate
        }
