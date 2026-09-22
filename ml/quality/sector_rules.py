"""
KALORA — Phase 8: Sector-Specific Quality & Readiness Rules
"""

from typing import Dict, List, Any

QUALITY_FACTOR_WEIGHTS = {
    "title_quality": 10.0,
    "description_quality": 15.0,
    "category_confidence": 10.0,
    "material_information": 10.0,
    "dimensions_information": 10.0,
    "color_information": 5.0,
    "craft_technique": 10.0,
    "region_information": 5.0,
    "care_instructions": 5.0,
    "artisan_information": 5.0,
    "image_availability": 10.0,
    "translation_completeness": 5.0
}

MARKET_READINESS_WEIGHTS = {
    "catalog_completeness": 20.0,
    "category_confidence": 15.0,
    "price_availability": 20.0,
    "required_fields_present": 15.0,
    "image_quality": 15.0,
    "artisan_verification": 10.0,
    "publication_readiness": 5.0
}

SECTOR_CRITICAL_FIELDS: Dict[str, List[str]] = {
    "Handlooms & Textiles": ["category", "material", "price", "color", "images"],
    "Pottery & Terracotta": ["category", "material", "price", "dimensions", "images"],
    "Furniture / Woodcraft": ["category", "material", "price", "dimensions", "images"]
}

def calculate_grade(score: float) -> str:
    if score >= 92.0:
        return "A+"
    elif score >= 85.0:
        return "A"
    elif score >= 75.0:
        return "B"
    elif score >= 65.0:
        return "C"
    elif score >= 60.0:
        return "D"
    else:
        return "F"
