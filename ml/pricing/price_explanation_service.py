"""
KALORA — Phase 7: Price Explanation Service
Generates transparent, human-readable, and multilingual price explanations.
"""

from typing import Dict, List, Any, Optional
from ml.pricing.schemas import PriceRecommendation, PricingFactorInput

MULTILINGUAL_DISCLAIMERS = {
    "en": (
        "Disclaimer: This fair price estimate is generated using transparent cost-plus artisan labor models "
        "and market references. It is NOT a guaranteed selling price, binding quote, or government-mandated price."
    ),
    "hi": (
        "अस्वीकरण: यह उचित मूल्य अनुमान पारदर्शी कारीगर श्रम दरों और सामग्री लागत पर आधारित है। "
        "यह कोई गारंटीकृत बिक्री मूल्य या सरकारी निर्धारित मूल्य नहीं है।"
    ),
    "ta": (
        "மறுப்பு: இந்த நியாயமான விலை மதிப்பீடு வெளிப்படையான கைவினைஞர் உழைப்பு மற்றும் மூலப்பொருள் செலவுகளை அடிப்படையாகக் கொண்டது. "
        "இது உத்தரவாதம் அளிக்கப்பட்ட விற்பனை விலை அல்ல."
    ),
    "bn": (
        "দাবি পরিত্যাগী: এই ন্যায্য মূল্যের অনুমানটি কারিগরের শ্রম ও কাঁচামালের খরচের ওপর ভিত্তি করে তৈরি। "
        "এটি কোনো গ্যারান্টিযুক্ত বিক্রয় মূল্য বা সরকারি নির্ধারিত মূল্য নয়।"
    )
}

class PriceExplanationService:
    def generate_explanation(
        self,
        recommendation: PriceRecommendation,
        factor_input: PricingFactorInput,
        target_languages: Optional[List[str]] = None
    ) -> PriceRecommendation:
        langs = target_languages or ["en"]
        b = recommendation.breakdown

        lines = [
            f"Fair Price Estimation for {recommendation.category} ({recommendation.sector}):",
            f"• Suggested Starting Price: ₹{recommendation.suggested_price:,.2f} (Fair Range: ₹{recommendation.min_price:,.2f} - ₹{recommendation.max_price:,.2f})",
            f"• Confidence Score: {recommendation.confidence_score * 100:.0f}%",
            "",
            "Price Factors Breakdown:",
            f"  1. Raw Material Cost: ₹{b.estimated_material_cost:,.2f}",
            f"  2. Artisan Labor Cost: ₹{b.estimated_labor_cost:,.2f}",
            f"  3. Craft Technique Premium: ₹{b.craft_skill_premium:,.2f}",
            f"  4. Design Complexity Factor: ₹{b.complexity_adjustment:,.2f}",
            f"  5. Regional Heritage Multiplier: {b.regional_heritage_multiplier:.2f}x",
            f"  6. Overhead & Packaging: ₹{b.overhead_and_packaging:,.2f}",
            ""
        ]

        if recommendation.missing_inputs:
            lines.append("Note: The following factor(s) were estimated because explicit input was not provided:")
            for m in recommendation.missing_inputs:
                lines.append(f"  - {m}")
            lines.append("Providing explicit labor hours and material costs will increase confidence.")

        explanation_en = "\n".join(lines)
        recommendation.explanation = explanation_en

        # Multilingual Explicability Dict
        multilingual = {}
        for lang in langs:
            disclaimer_text = MULTILINGUAL_DISCLAIMERS.get(lang, MULTILINGUAL_DISCLAIMERS["en"])
            if lang == "hi":
                header = f"{recommendation.category} के लिए उचित मूल्य अनुमान:"
                details = f"सुझाया गया मूल्य: ₹{recommendation.suggested_price:,.2f} (सीमा: ₹{recommendation.min_price:,.2f} - ₹{recommendation.max_price:,.2f})\n"
                details += f"सामग्री लागत: ₹{b.estimated_material_cost:,.2f} | कारीगर श्रम: ₹{b.estimated_labor_cost:,.2f}"
                multilingual[lang] = f"{header}\n{details}\n\n{disclaimer_text}"
            elif lang == "ta":
                header = f"{recommendation.category}க்கான நியாயமான விலை மதிப்பீடு:"
                details = f"பரிந்துரைக்கப்பட்ட விலை: ₹{recommendation.suggested_price:,.2f}\n"
                multilingual[lang] = f"{header}\n{details}\n\n{disclaimer_text}"
            elif lang == "bn":
                header = f"{recommendation.category}-এর জন্য ন্যায্য মূল্য অনুমান:"
                details = f"সুপারিশকৃত মূল্য: ₹{recommendation.suggested_price:,.2f}\n"
                multilingual[lang] = f"{header}\n{details}\n\n{disclaimer_text}"
            else:
                multilingual[lang] = f"{explanation_en}\n\n{disclaimer_text}"

        recommendation.multilingual_explanations = multilingual
        recommendation.disclaimer = MULTILINGUAL_DISCLAIMERS["en"]

        return recommendation
