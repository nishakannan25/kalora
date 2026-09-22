"""
KALORA — Phase 6: Intelligent Product Extraction Service
Integrates ML inference models with non-hallucinating text/voice transcript parsing.
"""

import os
import re
import uuid
import importlib
from typing import Dict, Any, Optional

from ml.extraction.schemas import ProductCatalogItem, SectorType, VerificationStatus, ProvenanceRecord
from ml.extraction.sector_config import SECTOR_CONFIGS, CONFIDENCE_THRESHOLD

class ProductExtractionService:
    def __init__(self):
        self._classifiers = {}

    def _get_classifier_instance(self, module_name: str, class_name: str):
        key = f"{module_name}.{class_name}"
        if key not in self._classifiers:
            try:
                mod = importlib.import_module(module_name)
                cls = getattr(mod, class_name)
                self._classifiers[key] = cls()
            except Exception as e:
                print(f"Warning: Failed to load classifier {key}: {e}")
                self._classifiers[key] = None
        return self._classifiers[key]

    def detect_sector(self, image_path: Optional[str] = None, text_transcript: Optional[str] = None, sector_hint: Optional[str] = None) -> str:
        if sector_hint in SECTOR_CONFIGS:
            return sector_hint
        
        text_lower = (text_transcript or "").lower()
        if any(w in text_lower for w in ["weave", "saree", "handloom", "dupatta", "silk", "cotton", "textile", "fabric", "kurta", "stole"]):
            return SectorType.HANDLOOMS
        elif any(w in text_lower for w in ["pot", "pottery", "clay", "terracotta", "ceramic", "vase", "planter", "matka", "diya"]):
            return SectorType.POTTERY
        elif any(w in text_lower for w in ["chair", "table", "sofa", "wood", "carving", "almirah", "furniture", "teak", "sheesham", "cabinet", "stool"]):
            return SectorType.FURNITURE
        
        # Default fallback sector if unspecified
        return SectorType.HANDLOOMS

    def extract_from_input(
        self,
        image_path: Optional[str] = None,
        text_transcript: Optional[str] = None,
        sector_hint: Optional[str] = None,
        artisan_name: Optional[str] = None
    ) -> ProductCatalogItem:
        product_id = f"PROD-{uuid.uuid4().hex[:8].upper()}"
        sector = self.detect_sector(image_path, text_transcript, sector_hint)

        item = ProductCatalogItem(
            product_id=product_id,
            sector=sector,
            category="UNCERTAIN",
            verification_status=VerificationStatus.UNVERIFIED
        )
        
        if image_path:
            item.images.append(image_path)

        # Step 1: Vision Model Classification
        config = SECTOR_CONFIGS[sector]
        classifier = self._get_classifier_instance(config["primary_classifier_module"], config["primary_classifier_class"])

        if classifier and image_path and os.path.exists(image_path):
            pred = classifier.predict(image_path)
            if "predicted_class" in pred and "confidence" in pred:
                conf = float(pred["confidence"])
                raw_cls = pred.get("raw_class", pred["predicted_class"])
                
                item.confidence["category"] = conf
                item.provenance["category"] = {
                    "source": "vision_classifier",
                    "confidence": conf,
                    "raw_input": raw_cls
                }

                if conf >= CONFIDENCE_THRESHOLD:
                    item.category = raw_cls
                    item.verification_status = VerificationStatus.PROVISIONAL
                else:
                    item.category = "UNCERTAIN"
                    item.uncertain_fields.append("category")
                    item.verification_status = VerificationStatus.UNCERTAIN

        # Step 2: Non-Hallucinating Text/Voice Transcript Attribute Extraction
        text = text_transcript or ""
        self._extract_text_attributes(item, text, artisan_name)

        # Step 3: Identify Missing & Uncertain Fields
        required = config["required_fields"]
        for req in required:
            val = getattr(item, req, None)
            if val is None or val == "" or val == "UNCERTAIN":
                if req not in item.missing_fields:
                    item.missing_fields.append(req)

        return item

    def _extract_text_attributes(self, item: ProductCatalogItem, text: str, artisan_name: Optional[str] = None):
        text_lower = text.lower()

        # Artisan Name
        if artisan_name:
            item.artisan_name = artisan_name
            item.confidence["artisan_name"] = 1.0
            item.provenance["artisan_name"] = {"source": "artisan_input", "confidence": 1.0, "raw_input": artisan_name}

        # Colors (Exact Keyword Matches Only)
        color_keywords = [
            "red", "blue", "green", "yellow", "black", "white", "brown", "terracotta", "gold", "silver",
            "pink", "purple", "orange", "maroon", "beige", "navy", "turquoise", "grey"
        ]
        found_colors = [c.title() for c in color_keywords if re.search(r'\b' + c + r'\b', text_lower)]
        if found_colors:
            item.color = ", ".join(found_colors)
            item.confidence["color"] = 0.90
            item.provenance["color"] = {"source": "artisan_text", "confidence": 0.90, "raw_input": item.color}

        # Material (Exact Keyword Matches Only)
        material_keywords = [
            "cotton", "silk", "terracotta", "clay", "ceramic", "teak", "sheesham", "mango wood",
            "wood", "bamboo", "porcelain", "wool", "linen", "jute", "brass", "bronze", "stone"
        ]
        found_materials = [m.title() for m in material_keywords if re.search(r'\b' + m + r'\b', text_lower)]
        if found_materials:
            item.material = found_materials[0]
            item.confidence["material"] = 0.95
            item.provenance["material"] = {"source": "artisan_text", "confidence": 0.95, "raw_input": item.material}

        # Price Extraction (Regex)
        price_match = re.search(r'(?:rs\.?|₹|\bprice\b|\brs\b)\s*[:=-]?\s*(\d+(?:,\d+)*(?:\.\d+)?)', text_lower)
        if not price_match:
            price_match = re.search(r'(\d+)\s*(?:rupees|inr)', text_lower)
        if price_match:
            try:
                price_str = price_match.group(1).replace(",", "")
                item.price = float(price_str)
                item.currency = "INR"
                item.confidence["price"] = 1.0
                item.provenance["price"] = {"source": "artisan_text", "confidence": 1.0, "raw_input": price_match.group(0)}
            except ValueError:
                pass

        # Dimensions Extraction (Regex)
        dim_match = re.search(r'(\d+(?:\.\d+)?\s*(?:x|×|\*)\s*\d+(?:\.\d+)?(?:\s*(?:x|×|\*)\s*\d+(?:\.\d+)?)?\s*(?:cm|inch|inches|ft|feet|m|mm)?)', text_lower)
        if dim_match:
            item.dimensions = dim_match.group(1).strip()
            item.confidence["dimensions"] = 0.90
            item.provenance["dimensions"] = {"source": "artisan_text", "confidence": 0.90, "raw_input": dim_match.group(0)}

        # Weight Extraction (Regex)
        weight_match = re.search(r'(\d+(?:\.\d+)?\s*(?:kg|grams|g|lbs))', text_lower)
        if weight_match:
            item.weight = weight_match.group(1).strip()
            item.confidence["weight"] = 0.90
            item.provenance["weight"] = {"source": "artisan_text", "confidence": 0.90, "raw_input": weight_match.group(0)}

        # Region Extraction (Keyword Matches)
        region_keywords = [
            "varanasi", "kanchipuram", "chanderi", "pochampally", "phulia", "kutch", "srinagar", "assam",
            "nizamabad", "khurja", "bankura", "molela", "saharanpur", "jodhpur", "channapatna", "bastar"
        ]
        found_regions = [r.title() for r in region_keywords if re.search(r'\b' + r + r'\b', text_lower)]
        if found_regions:
            item.region = found_regions[0]
            item.confidence["region"] = 0.95
            item.provenance["region"] = {"source": "artisan_text", "confidence": 0.95, "raw_input": item.region}
