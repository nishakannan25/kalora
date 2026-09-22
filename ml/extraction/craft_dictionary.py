"""
KALORA — Craft Vocabulary Intelligence & Code-Mixed Parser (#7, #5)
Normalizes regional Indian craft terms (e.g. Korvai, Ashrafi, Zari, Jaali, Khurja, Sheesham)
and handles code-mixed Hinglish ("saree me pure zari border hai") and Tanglish ("silk saree gold border irukku").
"""

import re

class CraftVocabularyIntelligence:
    CRAFT_VOCABULARY = {
        # Weaving & Textiles
        "korvai": {"term": "Korvai", "category": "Technique", "sector": "Handlooms & Textiles", "desc": "Traditional Tamil interlock handloom weaving"},
        "zari": {"term": "Zari", "category": "Material", "sector": "Handlooms & Textiles", "desc": "Fine gold or silver metallic thread weaving"},
        "ashrafi": {"term": "Ashrafi Motif", "category": "Motif", "sector": "Handlooms & Textiles", "desc": "Traditional coin-shaped royal motif"},
        "ikat": {"term": "Ikat", "category": "Technique", "sector": "Handlooms & Textiles", "desc": "Resist-dyeing pattern technique"},
        "kanjeevaram": {"term": "Kanjeevaram Silk", "category": "Material", "sector": "Handlooms & Textiles", "desc": "Pure mulberry silk from Kanchipuram"},
        "banarasi": {"term": "Banarasi Brocade", "category": "Style", "sector": "Handlooms & Textiles", "desc": "Rich silk brocade with metallic zari"},

        # Pottery & Terracotta
        "khurja": {"term": "Khurja Pottery", "category": "Origin/Style", "sector": "Pottery & Terracotta", "desc": "Glazed ceramic pottery from Khurja"},
        "terracotta": {"term": "Terracotta Clay", "category": "Material", "sector": "Pottery & Terracotta", "desc": "Fired natural red clay"},
        "matka": {"term": "Water Matka", "category": "Product Type", "sector": "Pottery & Terracotta", "desc": "Traditional clay water vessel"},

        # Furniture & Woodcraft
        "jaali": {"term": "Jaali Lattice Carving", "category": "Technique", "sector": "Furniture / Woodcraft", "desc": "Intricate hand-chiseled wooden lattice pattern"},
        "sheesham": {"term": "Sheesham Wood", "category": "Material", "sector": "Furniture / Woodcraft", "desc": "Indian Rosewood hardwood"},
        "saharanpur": {"term": "Saharanpur Woodcraft", "category": "Origin/Style", "sector": "Furniture / Woodcraft", "desc": "Master teak & sheesham wood carving"}
    }

    # Code-mixed language filler removal
    CODE_MIX_STOPWORDS = [
        "me", "hai", "hain", "irukku", "idhu", "aana", "aur", "ka", "ki", "ke", "woh", "la", "le", "bhi", "thi", "tha"
    ]

    def normalize_craft_text(self, raw_text: str) -> dict:
        """
        Extracts verified craft terms, sector, and cleans code-mixed noise.
        """
        if not raw_text:
            return {"cleaned_text": "", "detected_terms": [], "sector_hint": None}

        text_lower = raw_text.lower()
        found_terms = []
        sector_counts = {}

        for key, info in self.CRAFT_VOCABULARY.items():
            if re.search(r'\b' + re.escape(key) + r'\b', text_lower):
                found_terms.append(info)
                sec = info["sector"]
                sector_counts[sec] = sector_counts.get(sec, 0) + 1

        # Determine sector hint
        sector_hint = max(sector_counts, key=sector_counts.get) if sector_counts else None

        # Clean code-mixed filler words
        words = raw_text.split()
        cleaned_words = [w for w in words if w.lower() not in self.CODE_MIX_STOPWORDS]
        cleaned_text = " ".join(cleaned_words)

        return {
            "cleaned_text": cleaned_text,
            "detected_terms": found_terms,
            "sector_hint": sector_hint,
            "term_count": len(found_terms)
        }

if __name__ == "__main__":
    vocab = CraftVocabularyIntelligence()
    sample = "idhu kanjeevaram silk saree me pure zari border irukku with korvai weave"
    res = vocab.normalize_craft_text(sample)
    print("Craft Vocabulary Test:", res)
