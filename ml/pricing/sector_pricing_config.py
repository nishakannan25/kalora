"""
KALORA — Phase 7: Sector-Specific Pricing Configurations and Baseline Parameters
"""

from typing import Dict, Any

SECTOR_PRICING_CONFIGS: Dict[str, Dict[str, Any]] = {
    "Handlooms & Textiles": {
        "base_labor_rate_per_hour": 150.0,  # Fair artisan living wage rate (INR/hr)
        "default_labor_hours": {
            "Saree": 24.0,
            "Dupatta": 8.0,
            "Stole / Scarf": 6.0,
            "Kurta / Fabric": 12.0,
            "Shawl": 30.0,
            "Default": 10.0
        },
        "material_base_cost": {
            "Kanjeevaram Silk": 2500.0,
            "Banarasi Silk": 2000.0,
            "Tussar Silk": 1500.0,
            "Chanderi Silk": 1200.0,
            "Pashmina Wool": 3000.0,
            "Silk": 1200.0,
            "Cotton": 400.0,
            "Khadi": 350.0,
            "Linen": 500.0,
            "Jute": 250.0,
            "Default": 500.0
        },
        "craft_technique_premium": {
            "Zardozi Embroidery": 1.40,
            "Kalamkari": 1.30,
            "Ikat / Patola": 1.35,
            "Chikankari": 1.25,
            "Block Printing": 1.15,
            "Bandhani / Tie & Dye": 1.20,
            "Handloom Weaving": 1.10,
            "Default": 1.0
        }
    },
    "Pottery & Terracotta": {
        "base_labor_rate_per_hour": 120.0,
        "default_labor_hours": {
            "Vase / Planter": 4.0,
            "Clay Pot / Matka": 3.0,
            "Decorative Sculpture": 8.0,
            "Terracotta Diya Set": 2.0,
            "Ceramic Tableware Set": 6.0,
            "Default": 4.0
        },
        "material_base_cost": {
            "Porcelain": 350.0,
            "Ceramic": 250.0,
            "Stoneware": 200.0,
            "Terracotta": 100.0,
            "Clay": 80.0,
            "Cement": 90.0,
            "Default": 120.0
        },
        "craft_technique_premium": {
            "Black Pottery": 1.35,
            "Glaze Firing": 1.25,
            "Molela Relief Work": 1.30,
            "Pit Firing": 1.20,
            "Wheel Throwing": 1.10,
            "Hand Modeling": 1.15,
            "Default": 1.0
        }
    },
    "Furniture / Woodcraft": {
        "base_labor_rate_per_hour": 180.0,
        "default_labor_hours": {
            "Almirah / Cabinet": 36.0,
            "Dining Table": 30.0,
            "Chair / Armchair": 16.0,
            "Coffee Table": 12.0,
            "Swing / Jhula": 40.0,
            "Decorative Box / Handicraft": 6.0,
            "Default": 16.0
        },
        "material_base_cost": {
            "Teak Wood": 3500.0,
            "Rosewood (Sissoo)": 4000.0,
            "Sheesham Wood": 2500.0,
            "Mango Wood": 1500.0,
            "Wood": 1800.0,
            "Rattan / Cane": 1000.0,
            "Bamboo": 600.0,
            "Default": 1500.0
        },
        "craft_technique_premium": {
            "Hand Carving": 1.45,
            "Wood Inlay (Tarkashi)": 1.50,
            "Lacquered Woodcraft": 1.30,
            "Jali Work": 1.35,
            "Joinery & Assembly": 1.15,
            "Default": 1.0
        }
    }
}

COMPLEXITY_MULTIPLIERS = {
    "Low": 1.0,
    "Medium": 1.20,
    "High": 1.50,
    "Intricate": 2.0
}

QUALITY_TIER_MULTIPLIERS = {
    "Standard": 1.0,
    "Premium": 1.30,
    "Masterpiece": 1.75
}

REGIONAL_HERITAGE_MULTIPLIERS = {
    "Varanasi": 1.20,
    "Kanchipuram": 1.25,
    "Chanderi": 1.15,
    "Pochampally": 1.15,
    "Srinagar": 1.25,
    "Nizamabad": 1.20,
    "Khurja": 1.15,
    "Molela": 1.20,
    "Saharanpur": 1.20,
    "Jodhpur": 1.15,
    "Sankheda": 1.15,
    "Channapatna": 1.15,
    "Default": 1.0
}

CUSTOMIZATION_SURCHARGE_RATIO = 0.15  # +15% for custom work
OVERHEAD_AND_PACKAGING_RATIO = 0.08    # 8% overhead
RANGE_VARIANCE_RATIO = 0.12            # ±12% for min/max fair price range
