"""
KALORA — Phase 6: Sector-Specific Attribute Configuration & Rules
"""

from typing import Dict, List, Any
from ml.extraction.schemas import SectorType

SECTOR_CONFIGS: Dict[str, Dict[str, Any]] = {
    SectorType.HANDLOOMS: {
        "sector_name": SectorType.HANDLOOMS,
        "primary_classifier_module": "ml.inference.handloom_textiles_full_classifier",
        "primary_classifier_class": "HandloomTextilesFullClassifier",
        "required_fields": [
            "sector", "category", "material", "color", "craft_technique", "region", "price"
        ],
        "sector_specific_fields": [
            "weave", "fabric_type", "pattern", "garment_type", "craft_technique", "dimensions", "care_instructions"
        ],
        "allowed_materials": [
            "Cotton", "Silk", "Kanjeevaram Silk", "Tussar Silk", "Muga Silk",
            "Chanderi Silk", "Pashmina Wool", "Jute", "Linen", "Khadi"
        ],
        "allowed_craft_techniques": [
            "Handloom Weaving", "Block Printing", "Batik", "Kalamkari", "Chikankari",
            "Bandhani / Tie & Dye", "Ikat / Patola", "Zardozi Embroidery", "Kantha Stitch"
        ],
        "allowed_regions": [
            "Varanasi (UP)", "Kanchipuram (TN)", "Chanderi (MP)", "Pachampally (Telangana)",
            "Phulia (West Bengal)", "Kutch (Gujarat)", "Srinagar (J&K)", "Assam"
        ]
    },
    SectorType.POTTERY: {
        "sector_name": SectorType.POTTERY,
        "primary_classifier_module": "ml.inference.merged_pottery_classifier",
        "primary_classifier_class": "MergedPotteryClassifier",
        "required_fields": [
            "sector", "category", "material", "color", "craft_technique", "dimensions", "price"
        ],
        "sector_specific_fields": [
            "pottery_type", "finish", "shape", "technique", "capacity", "care_instructions"
        ],
        "allowed_materials": [
            "Terracotta", "Clay", "Ceramic", "Porcelain", "Stoneware", "Cement"
        ],
        "allowed_craft_techniques": [
            "Wheel Throwing", "Coil Pottery", "Hand Modeling", "Glaze Firing",
            "Pit Firing", "Terracotta Molding", "Black Pottery"
        ],
        "allowed_regions": [
            "Nizamabad (UP)", "Khurja (UP)", "Kutch (Gujarat)", "Bankura (West Bengal)",
            "Molela (Rajasthan)", "Manamadurai (Tamil Nadu)"
        ]
    },
    SectorType.FURNITURE: {
        "sector_name": SectorType.FURNITURE,
        "primary_classifier_module": "ml.inference.furniture_dataset_archive_classifier",
        "primary_classifier_class": "FurnitureDatasetArchiveClassifier",
        "secondary_classifier_module": "ml.inference.furniture_woodcraft_classifier",
        "secondary_classifier_class": "FurnitureWoodcraftClassifier",
        "required_fields": [
            "sector", "category", "material", "color", "dimensions", "price"
        ],
        "sector_specific_fields": [
            "furniture_type", "wood_type", "craft_technique", "style", "finish", "weight", "care_instructions"
        ],
        "allowed_materials": [
            "Wood", "Teak Wood", "Sheesham Wood", "Mango Wood", "Rosewood (Sissoo)",
            "Bamboo", "Rattan / Cane", "Metal / Iron", "Terracotta / Cement Decor"
        ],
        "allowed_craft_techniques": [
            "Hand Carving", "Wood Inlay (Tarkashi)", "Lacquered Woodcraft",
            "Jali Work", "Joinery & Assembly", "Hand Polishing"
        ],
        "allowed_regions": [
            "Saharanpur (UP)", "Sankheda (Gujarat)", "Jodhpur (Rajasthan)",
            "Channapatna (Karnataka)", "Bastar (Chhattisgarh)", "Kashmir"
        ]
    }
}

CONFIDENCE_THRESHOLD = 0.60
