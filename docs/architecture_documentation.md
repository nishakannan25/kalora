# KALORA — System Architecture Documentation

## Architecture Overview

KALORA is a multi-modal, voice-first, low-bandwidth platform empowering rural artisans to create verified product catalogs, fair price estimations, quality scores, and digital craft passports.

```
                   +------------------------------------+
                   |     React Native Mobile App        |
                   |   (17 Rural Artisan UI Screens)    |
                   +-----------------+------------------+
                                     |
                                     v
                   +-----------------+------------------+
                   |    KaloraMasterPipeline            |
                   | (End-to-End Orchestrator Pipeline) |
                   +-----------------+------------------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+-------+---------------+  +---------+-------------+   +----------+------------+
| Product Extraction    |  | Fair Price Advisor    |   | Quality & Market      |
| Pipeline (Phase 6)    |  | Pipeline (Phase 7)    |   | Audit (Phase 8)       |
| - Handlooms Vision    |  | - Cost-plus breakdown |   | - Catalog Quality     |
| - Pottery Vision      |  | - Skill premium       |   | - Market Readiness    |
| - Furniture Vision    |  | - Non-guaranteed quote|   | - Critical blockers   |
+-------+---------------+  +---------+-------------+   +----------+------------+
        |                            |                            |
        +----------------------------+----------------------------+
                                     |
                                     v
                   +-----------------+------------------+
                   |  Digital Craft Passport & QR       |
                   |   - Passport Generator (Phase 9)   |
                   |   - Vector QR Code Generator       |
                   |   - Shareable Public Page          |
                   +-----------------+------------------+
                                     |
                                     v
                   +-----------------+------------------+
                   |   Admin Dashboard & Verification   |
                   |   - Analytics & Audit Logs (P10)   |
                   |   - Approval/Rejection Workflow    |
                   +------------------------------------+
```

## System Component Breakdown

1. **Mobile Frontend (`mobile/`)**: Built using React Native & Expo, featuring 17 screens, 7-language i18n support, and an offline queue manager for rural connectivity.
2. **Extraction Engine (`ml/extraction/`)**: Sector-specific image classification + non-hallucinating text regex parsing with provenance tracking.
3. **Fair Price Advisor (`ml/pricing/`)**: Rule-based explainable pricing engine calculating fair ranges without claiming guaranteed selling prices.
4. **Quality & Market Readiness (`ml/quality/`)**: Rule-based dual scoring engine enforcing critical blocker rules (`price_missing`, `category_uncertain`, `images_missing`).
5. **Digital Craft Passport (`ml/passport/`)**: Privacy-first passport generator exporting clean public HTML pages and vector QR code SVGs.
6. **Admin Dashboard (`ml/admin/`)**: Role-protected verification engine with audit trail recording all state changes and reasons.
