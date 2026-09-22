"""
KALORA — AI Cultural Heritage Story Generator (#15)
Crafts compelling heritage stories for artisan products based on regional lineage, materials, and traditional motifs.
Includes mandatory artisan review and approval state tracking.
"""

class CulturalStoryteller:
    HERITAGE_KNOWLEDGE_BASE = {
        "Handlooms & Textiles": {
            "kanjeevaram": "Handwoven in the ancient temple city of Kanchipuram, Tamil Nadu. Known for pure mulberry silk, gold zari borders, and interlocking Korvai weaving technique passed down through generations of master weavers.",
            "chanderi": "Crafted in the historic town of Chanderi, Madhya Pradesh. Famed for its lightweight sheer texture, fine silk and cotton yarns, and traditional coin (ashrafi) motifs.",
            "banarasi": "Woven in the spiritual hub of Varanasi. Celebrated for intricate brocades, floral metallic motifs, and rich royal heritage tracing back to Mughal artisans.",
            "default": "Handcrafted on traditional wooden handlooms using time-tested weaving techniques. Every thread preserves centuries of Indian textile heritage and artisan craftsmanship."
        },
        "Pottery & Terracotta": {
            "khurja": "Sourced from Khurja, Uttar Pradesh — the ceramic city of India. Hand-turned on potter's wheels, glazed with eco-friendly natural pigments, and fired in traditional kilns.",
            "bankura": "Sculpted in the Bankura district of West Bengal. Renowned for traditional terracotta horses and clay pottery representing indigenous folk art and sacred rituals.",
            "default": "Hand-molded from natural terracotta clay harvested from fertile riverbeds. Finished using traditional wood-fired kilns and organic natural glazes."
        },
        "Furniture / Woodcraft": {
            "saharanpur": "Carved by master woodworkers in Saharanpur, Uttar Pradesh. Featuring hand-chiseled floral lattice work (jaali) and rich seasoned teak wood built to endure for generations.",
            "jodhpur": "Hand-crafted in Jodhpur, Rajasthan. Reflecting royal Marwar woodwork traditions with solid Sheesham wood and rustic brass inlay accents.",
            "default": "Hand-carved from sustainably sourced seasoned hardwood. Crafted using traditional joinery methods without modern synthetic shortcuts."
        }
    }

    def generate_story(
        self,
        artisan_name: str,
        sector: str,
        category: str,
        material: str,
        region: str = None
    ) -> dict:
        """
        Generates a heritage story draft for the product.
        Returns draft story object requiring artisan approval.
        """
        sector_dict = self.HERITAGE_KNOWLEDGE_BASE.get(sector, self.HERITAGE_KNOWLEDGE_BASE["Handlooms & Textiles"])
        
        # Search for region/category matching key
        matched_key = "default"
        search_text = f"{category} {material} {region or ''}".lower()
        for key in sector_dict:
            if key != "default" and key in search_text:
                matched_key = key
                break

        heritage_snippet = sector_dict[matched_key]
        artisan_title = artisan_name if artisan_name and artisan_name.strip() else "Master Artisan"

        headline = f"The Timeless Craft of {artisan_title}"
        region_text = f" originating from {region}" if region else ""
        narrative = (
            f"This handcrafted {category.lower()} is a proud expression of Indian artisanal lineage{region_text}. "
            f"Crafted from genuine {material.lower()}, it embodies {heritage_snippet} "
            f"By bringing this piece into your home, you directly support {artisan_title}'s craft and help preserve living heritage."
        )

        return {
            "headline": headline,
            "narrative": narrative,
            "heritage_key": matched_key,
            "sector": sector,
            "approval_status": "PENDING_ARTISAN_APPROVAL",  # Mandatory artisan approval step (#15)
            "is_approved": False
        }

    def approve_story(self, story_obj: dict, edited_narrative: str = None) -> dict:
        """
        Marks story as approved by artisan, optionally with artisan edits.
        """
        updated = dict(story_obj)
        if edited_narrative:
            updated["narrative"] = edited_narrative
        updated["approval_status"] = "APPROVED_BY_ARTISAN"
        updated["is_approved"] = True
        return updated

if __name__ == "__main__":
    storyteller = CulturalStoryteller()
    story = storyteller.generate_story("Lakshmi Ammal", "Handlooms & Textiles", "Saree", "Silk", "Kanchipuram")
    print("Cultural Story Draft:", story)
    approved = storyteller.approve_story(story)
    print("Approved Story:", approved)
