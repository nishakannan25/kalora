"""
KALORA — Phase 10: Admin Analytics Service
Aggregates catalog, artisan, sector, status, and quality metrics.
"""

from typing import Dict, List, Any
from ml.admin.schemas import AdminAnalyticsSummary

class AnalyticsService:
    def compute_analytics(self, product_records: List[Dict[str, Any]]) -> AdminAnalyticsSummary:
        total_products = len(product_records)
        artisans = set()
        by_sector = {
            "Handlooms & Textiles": 0,
            "Pottery & Terracotta": 0,
            "Furniture / Woodcraft": 0,
            "Other": 0
        }

        drafts = 0
        verified = 0
        needs_info = 0
        market_ready = 0
        published = 0
        uncertain_classifications = 0
        low_quality_catalogs = 0

        for p in product_records:
            current_cat = p.get("current_catalog", p)
            artisan_name = current_cat.get("artisan_name")
            if artisan_name:
                artisans.add(artisan_name.strip().lower())

            sec = current_cat.get("sector", "Other")
            if sec in by_sector:
                by_sector[sec] += 1
            else:
                by_sector["Other"] += 1

            status = p.get("publication_status", current_cat.get("publication_status", "Draft"))
            if status == "Draft":
                drafts += 1
            elif status == "Verified":
                verified += 1
            elif status == "Needs Information":
                needs_info += 1
            elif status == "Ready for Market":
                market_ready += 1
            elif status == "Published":
                published += 1

            # Uncertain classification check
            cat = current_cat.get("category")
            conf = current_cat.get("confidence", {}).get("category", 1.0)
            if cat == "UNCERTAIN" or conf < 0.60:
                uncertain_classifications += 1

            # Quality check
            q_score = current_cat.get("catalog_quality_score", current_cat.get("quality_score", 100.0))
            if q_score < 65.0:
                low_quality_catalogs += 1

        return AdminAnalyticsSummary(
            total_artisans=len(artisans),
            total_products=total_products,
            products_by_sector=by_sector,
            drafts_count=drafts,
            verified_count=verified,
            needs_information_count=needs_info,
            market_ready_count=market_ready,
            published_count=published,
            uncertain_classifications_count=uncertain_classifications,
            low_quality_catalogs_count=low_quality_catalogs
        )
