"""
KALORA — Phase 9: Digital Craft Passport Service
Handles passport creation, privacy sanitization, publication status workflow, and QR rendering.
"""

import os
import uuid
import datetime
from typing import Dict, Any, Optional

from ml.passport.schemas import DigitalCraftPassport, PublicArtisanProfile, PassportPublicationStatus
from ml.passport.qr_generator import QRCodeGenerator
from ml.passport.public_page_generator import PublicPageGenerator

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "public", "passports")

class PassportService:
    def __init__(self, public_dir: str = PUBLIC_DIR, base_public_url: str = "http://localhost:3000/passports"):
        self.public_dir = public_dir
        self.base_public_url = base_public_url
        self.qr_generator = QRCodeGenerator()
        self.page_generator = PublicPageGenerator()
        os.makedirs(self.public_dir, exist_ok=True)

    def determine_status(
        self,
        item_dict: Dict[str, Any],
        quality_score: float = 0.0,
        is_market_ready: bool = False,
        critical_blockers: Optional[list] = None
    ) -> str:
        if critical_blockers or item_dict.get("category") == "UNCERTAIN":
            return PassportPublicationStatus.NEEDS_INFORMATION
        elif is_market_ready and quality_score >= 75.0:
            return PassportPublicationStatus.READY_FOR_MARKET
        elif item_dict.get("verification_status") in ["PROVISIONAL", "ARTISAN_CONFIRMED"]:
            return PassportPublicationStatus.VERIFIED
        else:
            return PassportPublicationStatus.DRAFT

    def create_passport(
        self,
        item_dict: Dict[str, Any],
        quality_score: float = 0.0,
        is_market_ready: bool = False,
        critical_blockers: Optional[list] = None,
        publish_now: bool = False
    ) -> DigitalCraftPassport:
        product_id = item_dict.get("product_id", f"PROD-{uuid.uuid4().hex[:8].upper()}")
        passport_id = f"KALORA-PASSPORT-{uuid.uuid4().hex[:8].upper()}"

        public_url = f"{self.base_public_url}/{product_id}.html"

        # QR Generation
        qr_svg = self.qr_generator.generate_qr_svg(public_url)
        qr_data_url = self.qr_generator.generate_qr_data_url(public_url)

        # Privacy Sanitization (Strictly exclude private contact info)
        artisan_profile = PublicArtisanProfile(
            artisan_name=item_dict.get("artisan_name", "Traditional Rural Artisan"),
            artisan_story=item_dict.get("artisan_story"),
            region=item_dict.get("region")
        )

        status = self.determine_status(item_dict, quality_score, is_market_ready, critical_blockers)
        if publish_now and status in [PassportPublicationStatus.READY_FOR_MARKET, PassportPublicationStatus.VERIFIED]:
            status = PassportPublicationStatus.PUBLISHED

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        passport = DigitalCraftPassport(
            passport_id=passport_id,
            product_id=product_id,
            public_url=public_url,
            qr_code_svg=qr_svg,
            qr_code_data_url=qr_data_url,
            title=item_dict.get("title", "Handcrafted Item"),
            sector=item_dict.get("sector", "Handlooms & Textiles"),
            category=item_dict.get("category", "Unspecified"),
            artisan=artisan_profile,
            materials=item_dict.get("material"),
            technique=item_dict.get("craft_technique"),
            region=item_dict.get("region"),
            dimensions=item_dict.get("dimensions"),
            price=item_dict.get("price"),
            currency=item_dict.get("currency", "INR"),
            images=item_dict.get("images", []),
            catalog_quality_score=quality_score,
            market_readiness_status="READY" if is_market_ready else "NOT_READY",
            publication_status=status,
            created_at=now_str,
            updated_at=now_str
        )

        # Generate and save Public HTML page
        os.makedirs(self.public_dir, exist_ok=True)
        html_content = self.page_generator.generate_html(passport)
        file_path = os.path.join(self.public_dir, f"{product_id}.html")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        return passport
