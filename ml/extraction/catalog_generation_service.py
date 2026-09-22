"""
KALORA — Phase 6: Catalog Generation Service
Generates structured product titles, descriptions, key specs, artisan story, and care instructions.
"""

from typing import Dict, List, Any, Optional
from ml.extraction.schemas import ProductCatalogItem, SectorType

CARE_INSTRUCTIONS_DEFAULTS = {
    SectorType.HANDLOOMS: "Dry clean recommended for silk items. Gentle hand wash in cold water with mild detergent for cotton. Store in a cool, dry place.",
    SectorType.POTTERY: "Handle with care. Hand wash with warm water and soft sponge. Avoid sudden thermal shocks or aggressive chemical cleaners.",
    SectorType.FURNITURE: "Wipe with a soft dry cloth. Avoid direct long exposure to water or direct sunlight. Apply wood polish periodically."
}

MULTILINGUAL_LABELS = {
    "en": {"specifications": "Key Specifications", "care": "Care Instructions", "artisan": "Artisan Note", "price": "Price"},
    "hi": {"specifications": "प्रमुख विवरण", "care": "रखरखाव निर्देश", "artisan": "कारीगर नोट", "price": "मूल्य"},
    "ta": {"specifications": "முக்கிய அம்சங்கள்", "care": "பராமரிப்பு அறிவுறுத்தல்கள்", "artisan": "கைவினைஞர் குறிப்பு", "price": "விலை"},
    "bn": {"specifications": "মূল বৈশিষ্ট্য", "care": "রক্ষণাবেক্ষণ নির্দেশাবলী", "artisan": "কারিগর বার্তা", "price": "মূল্য"},
    "te": {"specifications": "ముఖ్యమైన వివరాలు", "care": "సంరక్షణ సూచనలు", "artisan": "కళాకారుని గమనిక", "price": "ధర"},
    "mr": {"specifications": "प्रमुख तपशील", "care": "काळजी घेण्याच्या सूचना", "artisan": "कारगीर नोंद", "price": "किंमत"},
    "kn": {"specifications": "ముఖ్య వివరగళు", "care": "అరకేయ సూచనెగళు", "artisan": "నిర్మాతృటిప్పణి", "price": "బెలె"}
}

class CatalogGenerationService:
    def generate_catalog(self, item: ProductCatalogItem, target_languages: Optional[List[str]] = None) -> Dict[str, Any]:
        langs = target_languages or item.languages or ["en"]

        # Step 1: Construct Title
        title_parts = []
        if item.region and item.region != "UNCERTAIN":
            title_parts.append(item.region)
        if item.craft_technique and item.craft_technique != "UNCERTAIN":
            title_parts.append(item.craft_technique)
        if item.material and item.material != "UNCERTAIN":
            title_parts.append(item.material)
        if item.category and item.category != "UNCERTAIN":
            title_parts.append(item.category)
        else:
            title_parts.append("Handcrafted Product")
            
        title = " ".join(title_parts)
        item.title = title

        # Step 2: Construct Descriptions
        short_desc = f"Handcrafted {item.category or 'item'} in {item.sector}"
        if item.material:
            short_desc += f" made from premium {item.material}"
        if item.region:
            short_desc += f" originating from {item.region}"
        short_desc += "."
        item.description = short_desc

        detailed_desc_lines = [
            f"This authentic {item.category or 'creation'} belongs to the {item.sector} sector.",
            f"Crafted with meticulous attention to detail."
        ]
        if item.craft_technique:
            detailed_desc_lines.append(f"Craft Technique: {item.craft_technique}.")
        if item.color:
            detailed_desc_lines.append(f"Primary Color palette: {item.color}.")
        if item.dimensions:
            detailed_desc_lines.append(f"Dimensions: {item.dimensions}.")
        if item.weight:
            detailed_desc_lines.append(f"Weight: {item.weight}.")
            
        detailed_description = " ".join(detailed_desc_lines)

        # Step 3: Key Specifications Dict
        key_specs = {
            "Sector": item.sector,
            "Category": item.category if item.category != "UNCERTAIN" else "Under Review",
            "Material": item.material or "Specified by artisan upon confirmation",
            "Color": item.color or "As shown in image",
            "Craft Technique": item.craft_technique or "Traditional Handmade",
            "Region": item.region or "Traditional Rural Craft Cluster",
            "Dimensions": item.dimensions or "Standard Size",
            "Price": f"{item.currency} {item.price:,.2f}" if item.price else "Price on Request"
        }

        # Step 4: Care Instructions
        care = item.care_instructions or CARE_INSTRUCTIONS_DEFAULTS.get(item.sector, "Handle with care.")
        item.care_instructions = care

        # Step 5: Artisan Story
        story = item.artisan_story
        if not story:
            artisan = item.artisan_name or "A dedicated rural artisan"
            region_str = f" from {item.region}" if item.region else ""
            story = f"Handcrafted by {artisan}{region_str}, preserving traditional Indian heritage craftsmanship."
        item.artisan_story = story

        # Step 6: Multilingual Catalog Object
        multilingual_catalog = {}
        for lang in langs:
            labels = MULTILINGUAL_LABELS.get(lang, MULTILINGUAL_LABELS["en"])
            multilingual_catalog[lang] = {
                "title": title,
                "short_description": short_desc,
                "detailed_description": detailed_description,
                "key_specifications_header": labels["specifications"],
                "key_specifications": key_specs,
                "care_instructions_header": labels["care"],
                "care_instructions": care,
                "artisan_story_header": labels["artisan"],
                "artisan_story": story
            }

        return {
            "title": title,
            "short_description": short_desc,
            "detailed_description": detailed_description,
            "key_specifications": key_specs,
            "care_instructions": care,
            "artisan_story": story,
            "multilingual_catalog": multilingual_catalog
        }
