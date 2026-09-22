"""
KALORA — Phase 6: Missing Information Service
Detects missing/uncertain required fields and generates artisan-friendly multilingual prompts.
"""

from typing import Dict, List, Any, Optional
from ml.extraction.schemas import ProductCatalogItem, SectorType

QUESTION_TEMPLATES = {
    "category": {
        "en": "What type of product is this? (e.g. Saree, Pot, Chair, Almirah)",
        "hi": "यह किस प्रकार का उत्पाद है? (जैसे: साड़ी, मटका, कुर्सी, अलमारी)",
        "ta": "இது என்ன வகையான தயாரிப்பு? (எ.கா. சேலை, பானை, நாற்காலி, அலமாரி)",
        "bn": "এটি কি ধরণের পণ্য? (যেমন: শাড়ি, হাঁড়ি, চেয়ার, আলমারি)",
        "te": "ఇది ఏ రకమైన ఉత్పత్తి? (ఉదా. చీర, కుండ, కుర్చీ, అలమారా)",
        "mr": "हे कोणत्या प्रकारचे उत्पादन आहे? (उदा. साडी, मडके, खुर्ची, कपाट)",
        "kn": "ఇదు యావ రీతియ లుత్పన్న? (లుదా. సీరే, మడకే, కుర్చి, అలమార)"
    },
    "material": {
        "en": "What material is this made of? (e.g. Cotton, Silk, Terracotta, Teak wood)",
        "hi": "यह किस सामग्री/कपड़े/लकड़ी से बना है? (जैसे: सूती, रेशम, टेराकोटा, सागौन)",
        "ta": "இது ಯಾವ பொருட்களால் உருவாக்கப்பட்டது? (எ.கா. பருத்தி, பட்டு, சுடுமண், தேக்கு)",
        "bn": "এটি কি উপাদান দিয়ে তৈরি? (যেমন: সুতি, রেশম, পোড়ামাটি, সেগুন কাঠ)",
        "te": "ఇది ఏ పదార్థంతో తయారు చేయబడింది? (ఉదా. పత్తి, పట్టు, టెర్రాకోటా, టేకు)",
        "mr": "हे कशापासून बनवले आहे? (उदा. सुती, रेशीम, टेराकोटा, सागवान)",
        "kn": "ఇదు యావ సామగ్రయింద మాడలాగిదే? (లుదా. పత్తి, రేష్మే, టెర్రాకోటా, తేగ)"
    },
    "wood_type": {
        "en": "Is this made from Teak, Sheesham, Mango wood, or another wood?",
        "hi": "क्या यह सागौन (Teak), शीशम, आम की लकड़ी या किसी अन्य लकड़ी से बना है?",
        "ta": "இது தேக்கு, ஈட்டி, மா மரம் அல்லது வேறு மரத்தால் செய்யப்பட்டதா?",
        "bn": "এটি কি সেগুন, শিশুম, আম কাঠ বা অন্য কোনো কাঠ দিয়ে তৈরি?",
        "te": "ఇది టేకు, రావి/రావిమ్రాను, మామిడి కర్ర లేదా మరొక కర్రతో తయారు చేయబడిందా?",
        "mr": "हे सागवान, शिसवी, आंब्याचे लाकूड किंवा इतर लाकडापासून बनवले आहे का?",
        "kn": "ఇదు తేగ, శీషం, మావిన మర అథవా బేరే మరదింద మాడలాగిదేయా?"
    },
    "color": {
        "en": "What is the primary color of this item?",
        "hi": "इस वस्तु का मुख्य रंग क्या है?",
        "ta": "இந்த பொருளின் முக்கிய வண்ணம் என்ன?",
        "bn": "এই পণ্যটির প্রধান রঙ কি?",
        "te": "ఈ వస్తువు యొక్క ముఖ్యమైన రంగు ఏమిటి?",
        "mr": "या वस्तूचा मुख्य रंग कोणता आहे?",
        "kn": "ఈ వస్తువిన ముఖ్య బణ్ణ యావుదు?"
    },
    "craft_technique": {
        "en": "What craft or weaving technique was used?",
        "hi": "इसे बनाने में किस शिल्प या बुनाई तकनीक का उपयोग किया गया है?",
        "ta": "இதை உருவாக்க என்ன கைவினை தொழில்நுட்பம் பயன்படுத்தப்பட்டது?",
        "bn": "এটি তৈরিতে কি হস্তশিল্প বা বয়ন কৌশল ব্যবহার করা হয়েছে?",
        "te": "దీనిని తయారు చేయడంలో ఏ చేతివృత్తి లేదా నేత సాంకేతికత ఉపయోగించబడింది?",
        "mr": "हे बनवण्यासाठी कोणती हस्तकला किंवा विणकाम तंत्रज्ञान वापरले गेले?",
        "kn": "ఇదన్ను మాడలు యావ కసేకలేయున్ను బళసలాగిదే?"
    },
    "region": {
        "en": "In which city or traditional craft region was this made?",
        "hi": "यह किस शहर या पार पारंपरिक हस्तशिल्प क्षेत्र में बनाया गया है?",
        "ta": "இது எந்த நகரம் அல்லது பாரம்பரிய கைவினைப் பகுதியில் செய்யப்பட்டது?",
        "bn": "এটি কোন শহর বা ঐতিহ্যবাহী হস্তশিল্প অঞ্চলে তৈরি?",
        "te": "ఇది ఏ నగరం లేదా సాంప్రదాయ చేతివృత్తుల ప్రాంతంలో తయారు చేయబడింది?",
        "mr": "हे कोणत्या शहरात किंवा पारंपरिक हस्तकला क्षेत्रात बनवले गेले?",
        "kn": "ఇదు యావ నగర అథవా పారంపరికా కలారంగదల్లి మాడలాగిదే?"
    },
    "dimensions": {
        "en": "What are the dimensions (length x width x height)?",
        "hi": "इसका माप या आकार (लंबाई x चौड़ाई x ऊंचाई) क्या है?",
        "ta": "இதன் அளவுகள் (நீளம் x அகலம் x உயரம்) என்ன?",
        "bn": "এর পরিমাপ বা আকার (দৈর্ঘ্য x প্রস্থ x উচ্চতা) কত?",
        "te": "దీని కొలతలు (పొడవు x వెడల్పు x ఎత్తు) ఏమిటి?",
        "mr": "याचे माप (लांबी x रुंदी x उंची) काय आहे?",
        "kn": "ఇదర అళతెగళు (లద్ద x లగల x ఎత్తర) యావువు?"
    },
    "price": {
        "en": "What is the selling price for this product in INR?",
        "hi": "इस उत्पाद का बिक्री मूल्य (रुपये में) क्या है?",
        "ta": "இந்த தயாரிப்பின் விற்பனை விலை ரூபாயில் என்ன?",
        "bn": "এই পণ্যটির বিক্রয় মূল্য কত рублей?",
        "te": "ఈ ఉత్పత్తి యొక్క అమ్మకం ధర ఎంత?",
        "mr": "या उत्पादनाची विक्री किंमत रुपये मध्ये किती आहे?",
        "kn": "ఈ ఉత్పన్నద మారాతద బెలే రూపా యల్లి ఎష్టు?"
    }
}

class MissingFieldService:
    def identify_missing_and_uncertain(self, item: ProductCatalogItem) -> Dict[str, List[str]]:
        missing = [f for f in item.missing_fields if getattr(item, f, None) is None or getattr(item, f, None) == ""]
        uncertain = list(set(item.uncertain_fields))
        return {
            "missing_fields": missing,
            "uncertain_fields": uncertain
        }

    def generate_artisan_questions(
        self,
        item: ProductCatalogItem,
        languages: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        target_langs = languages or item.languages or ["en"]
        field_status = self.identify_missing_and_uncertain(item)
        fields_to_ask = list(set(field_status["missing_fields"] + field_status["uncertain_fields"]))

        # Special check for furniture wood_type if material is generic 'Wood'
        if item.sector == SectorType.FURNITURE and item.material in ["Wood", "Timber"]:
            if "wood_type" not in item.sector_attributes:
                fields_to_ask.append("wood_type")

        questions = []

        for field in fields_to_ask:
            # Do NOT ask if already confidently extracted
            conf = item.confidence.get(field, 0.0)
            if conf >= 0.60 and getattr(item, field, None) not in [None, "", "UNCERTAIN"]:
                continue

            if field in QUESTION_TEMPLATES:
                q_dict = {
                    "field_name": field,
                    "is_required": field in ["category", "material", "price"],
                    "prompts": {}
                }
                for lang in target_langs:
                    prompt_text = QUESTION_TEMPLATES[field].get(lang, QUESTION_TEMPLATES[field]["en"])
                    q_dict["prompts"][lang] = prompt_text
                questions.append(q_dict)

        return questions
