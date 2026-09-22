# KALORA — Phase 9: Digital Craft Passport Documentation

## Overview

Phase 9 provides every verified artisan product with a unique **Digital Craft Passport** and a mobile-friendly, shareable public product web page.

---

## Core Components & Features

1. **Digital Craft Passport Object**:
   - `passport_id`: Unique identifier (e.g. `KALORA-PASSPORT-XXXXX`).
   - `product_id`: Associated product ID.
   - `public_url`: Shareable link to public passport page.
   - `qr_code_svg` / `qr_code_data_url`: Embedded vector QR code.
   - `catalog_quality_score` & `market_readiness_status`.
   - `publication_status`: Publication workflow state.

2. **Privacy & Public-Field Controls**:
   - **Strict Privacy Sanitization**: Private artisan contact details (phone, email, bank details, home address) are **strictly excluded** from public passport payloads.
   - **No Internal Model Confidence**: Internal raw ML confidence probabilities are hidden from public view.
   - **No Fabricated Claims**: Provenance and craft techniques accurately reflect artisan inputs without false claims.

3. **Publication Status Workflow**:
   - `Draft`: Initial unverified state.
   - `Needs Information`: Critical required fields missing or uncertain.
   - `Verified`: Identity and product details verified.
   - `Ready for Market`: Market readiness score >= 75 with no blockers.
   - `Published`: Live on public web.

4. **Mobile-Friendly Public Product Page**:
   - Responsive HTML/CSS generated and saved to `public/passports/[product_id].html`.
   - Fast-loading, accessible without login.
   - Displays embedded QR code, product specs, artisan story, and verification badge.

---

## Created Files & Components

- `ml/passport/schemas.py`: Data definitions (`DigitalCraftPassport`, `PublicArtisanProfile`, `PassportPublicationStatus`).
- `ml/passport/qr_generator.py`: QR code vector generator (`QRCodeGenerator`).
- `ml/passport/public_page_generator.py`: Mobile-friendly responsive HTML generator (`PublicPageGenerator`).
- `ml/passport/passport_service.py`: Passport creation, privacy filtering, status management, and persistence (`PassportService`).
- `ml/passport/pipeline.py`: Reusable unified entry point `DigitalCraftPassportPipeline`.
- `tests/test_phase9_passport.py`: Unit test suite (3/3 tests passed).
- `docs/phase9_digital_craft_passport.md`: Technical documentation.

---

## Usage Example

```python
from ml.passport.pipeline import DigitalCraftPassportPipeline

pipeline = DigitalCraftPassportPipeline()

passport_dict = pipeline.generate_passport(
    item_dict={
        "product_id": "PROD-301",
        "sector": "Handlooms & Textiles",
        "category": "Saree",
        "title": "Banarasi Silk Saree",
        "material": "Silk",
        "price": 5500.0,
        "artisan_name": "Sita Devi",
        "artisan_story": "Master artisan from Varanasi.",
        "region": "Varanasi"
    },
    quality_score=90.0,
    is_market_ready=True,
    publish_now=True
)

print("Passport ID:", passport_dict["passport_id"])
print("Public Page URL:", passport_dict["public_url"])
print("Status:", passport_dict["publication_status"])
```
