# KALORA — SIH Demo Presentation Script & Checklist

## Smart India Hackathon (SIH) Demo Script (5-Minute Walkthrough)

### 1. Introduction & Problem Statement (0:00 - 0:45)
- **Presenter**: "Rural artisans in India struggle to catalog their handcrafted products for digital e-commerce due to language barriers, complex UI forms, and lack of digital literacy."
- **Key Value**: KALORA provides a voice-first, multi-modal, non-hallucinating AI cataloging assistant in 7 regional languages.

### 2. Multi-Modal Product Capture & Extraction (0:45 - 2:00)
- **Live Demo**: Open React Native Expo app on mobile.
- **Action**: Select Hindi / Tamil language -> Tap 'Voice Input' -> Speak product details (*"Kanjeevaram silk saree with zari border from Kanchipuram"*).
- **Showcase**: Real-time STT, vision classifier, and instant structured catalog generation.
- **Highlight**: Point out non-hallucination handling — missing price/dimensions dynamically trigger artisan confirmation prompts.

### 3. Fair Price Advisor & Quality Scoring (2:00 - 3:15)
- **Action**: View 'Price Advisor' breakdown (Material Cost + Artisan Labor Hours + Regional Skill Premium).
- **Action**: View 'Catalog Quality & Market Readiness' screen.
- **Highlight**: Explain rule-based transparency: Critical blockers explicitly prevent publishing incomplete listings.

### 4. Digital Craft Passport & QR Code (3:15 - 4:15)
- **Action**: Tap 'Generate Craft Passport'.
- **Action**: Display scannable vector QR code and public shareable product page (`public/passports/[product_id].html`).
- **Highlight**: Scan QR code on physical mobile device to open live public product page.

### 5. Admin Dashboard & Governance (4:15 - 5:00)
- **Action**: Switch to Admin Dashboard (`public/admin/dashboard.html`).
- **Highlight**: Real-time sector analytics, audit log diffs, and supervisor verification workflow.

---

## Pre-Demo Technical Checklist

- [x] All 3 sector models initialized (Handlooms, Pottery, Furniture).
- [x] Mobile Expo dev server running on port `8081` (`npx expo start`).
- [x] Backend master orchestrator & APIs responding on port `3000`.
- [x] Sample test images & voice scripts prepared for all 3 sectors.
- [x] Public passports directory (`public/passports/`) writeable.
- [x] Admin dashboard page (`public/admin/dashboard.html`) loaded.
