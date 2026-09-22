"""
KALORA — Phase 6: Validation & Provenance Tracking Service
Validates required fields, flags uncertain/missing fields, and verifies source provenance.
"""

from typing import Dict, List, Any
from ml.extraction.schemas import ProductCatalogItem, VerificationStatus
from ml.extraction.sector_config import SECTOR_CONFIGS, CONFIDENCE_THRESHOLD

class ValidationService:
    def validate_catalog_item(self, item: ProductCatalogItem) -> Dict[str, Any]:
        config = SECTOR_CONFIGS.get(item.sector)
        if not config:
            return {"is_valid": False, "errors": [f"Unknown sector: {item.sector}"]}

        errors = []
        warnings = []
        missing_fields = []
        uncertain_fields = []

        # Check required fields
        for req in config["required_fields"]:
            val = getattr(item, req, None)
            if val is None or val == "" or val == "UNCERTAIN":
                missing_fields.append(req)
                errors.append(f"Required field '{req}' is missing or uncertain.")

        # Check confidence scores
        for field_name, conf in item.confidence.items():
            if conf < CONFIDENCE_THRESHOLD:
                if field_name not in uncertain_fields:
                    uncertain_fields.append(field_name)
                warnings.append(f"Field '{field_name}' confidence ({conf:.2f}) is below threshold {CONFIDENCE_THRESHOLD}.")

        item.missing_fields = list(set(missing_fields))
        item.uncertain_fields = list(set(uncertain_fields))

        # Determine verification status
        if item.missing_fields or item.uncertain_fields:
            item.verification_status = VerificationStatus.UNCERTAIN
        elif any(p.get("source") == "artisan_confirmation" for p in item.provenance.values()):
            item.verification_status = VerificationStatus.ARTISAN_CONFIRMED
        else:
            item.verification_status = VerificationStatus.PROVISIONAL

        # Provenance verification summary
        provenance_summary = {}
        for f, prov in item.provenance.items():
            provenance_summary[f] = {
                "source": prov.get("source", "unknown"),
                "confidence": prov.get("confidence", 0.0),
                "raw_input": prov.get("raw_input")
            }

        is_valid = len(errors) == 0

        return {
            "is_valid": is_valid,
            "product_id": item.product_id,
            "verification_status": item.verification_status,
            "errors": errors,
            "warnings": warnings,
            "missing_fields": item.missing_fields,
            "uncertain_fields": item.uncertain_fields,
            "provenance_summary": provenance_summary
        }
