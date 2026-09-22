# KALORA — Known System Limitations & Non-Hallucination Boundaries

## System Boundaries & Design Principles

KALORA enforces strict transparency and privacy guarantees across all 3 sectors (Handlooms, Pottery, Furniture). Below are the explicit operational limitations and system safeguards:

### 1. Non-Hallucination Policy
- **Unverified Attributes**: The system NEVER fabricates or guesses material, dimensions, craft technique, price, or historical origin.
- **UNCERTAIN Threshold**: Any vision classification with model confidence < 0.60 is flagged as `UNCERTAIN` and requires explicit artisan confirmation.
- **Provenance Tagging**: Attributes extracted from product titles or descriptions are explicitly marked `DERIVED / HEURISTIC — NOT GROUND TRUTH`.

### 2. Fair Price Advisor Disclaimer
- **Not Guaranteed Market Price**: The price advisor output is an explainable estimate based on artisan labor hours, material cost, and market reference data.
- **No Binding Valuation**: The system strictly disclaims that estimates are not government-mandated prices or guaranteed selling prices.

### 3. Data Privacy Controls
- **Private Artisan Data**: Artisan phone numbers, home addresses, and bank details are strictly isolated in secure backend records and never published on public Craft Passports.
- **Public Passport Visibility**: Only public fields (artisan name, craft story, region, craft technique, catalog quality score, QR code) are exposed on shareable web pages.

### 4. Hardware & Edge Deployment
- **Mobile Vision**: On low-spec devices, MobileNetV3 inference is performed server-side or fallback text-regex heuristics are used to maintain responsive UX.
- **Speech-to-Text**: Offline voice input relies on local mobile device STT capabilities or buffers audio payloads until network connectivity resumes.
