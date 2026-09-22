# KALORA — Phase 11: Mobile App Documentation

## Overview

Phase 11 converts the KALORA artisan experience into a **React Native + Expo** mobile application with 17 dedicated screens designed specifically for rural artisans (large touch targets >= 52px, bold typography, multilingual voice-first input, and low-bandwidth/offline queueing).

---

## 17 Core Screens Implemented

1. **Welcome (`WelcomeScreen.js`)**: App introduction & entry point.
2. **Language Selection (`LanguageSelectionScreen.js`)**: 7-language selector (English, Hindi, Tamil, Bengali, Telugu, Marathi, Kannada).
3. **Login / Register (`LoginRegisterScreen.js`)**: Passwordless phone OTP authentication.
4. **Artisan Dashboard (`ArtisanDashboardScreen.js`)**: Main hub with quick actions.
5. **Add Product (`AddProductScreen.js`)**: Multi-modal trigger (Camera vs Voice).
6. **Camera / Gallery (`CameraGalleryScreen.js`)**: Product photo capture & selection.
7. **Voice Input (`VoiceInputScreen.js`)**: Tap-to-speak product details.
8. **AI Processing (`AIProcessingScreen.js`)**: Visual loading & pipeline status indicator.
9. **Extracted Product Info (`ExtractedProductInfoScreen.js`)**: Review provisional attributes & ML confidence.
10. **Missing Info Questions (`MissingInfoQuestionsScreen.js`)**: Artisan confirmation for required fields.
11. **Catalog Preview (`CatalogPreviewScreen.js`)**: Structured product catalog listing.
12. **Price Advisor (`PriceAdvisorScreen.js`)**: Explainable cost breakdown & fair price range.
13. **Quality & Market Readiness (`QualityMarketReadinessScreen.js`)**: Score breakdown (Catalog Quality & Market Readiness).
14. **Digital Craft Passport (`DigitalCraftPassportScreen.js`)**: Public passport ID & web page link.
15. **QR Code (`QRCodeScreen.js`)**: Scannable vector QR code for physical tagging.
16. **Product History (`ProductHistoryScreen.js`)**: Artisan's catalog archive & publication statuses.
17. **Settings (`SettingsScreen.js`)**: Language switching & session management.

---

## Multi-Modal Flows & Features

- **Image Flow**: Camera Capture → Processing → Classification → Attribute Extraction → Confirmation → Catalog.
- **Voice Flow**: Tap Microphone → Speech-to-Text → Language Detection → Structured Field Extraction → Confirmation.
- **Offline & Low-Bandwidth Handling**: `OfflineQueueManager` (`mobile/src/services/api.js`) automatically queues pending product submissions when disconnected and syncs seamlessly when connectivity resumes.
- **Rural Artisan Design System**: Built with `COLORS`, `TYPOGRAPHY`, and `TOUCH_TARGET` tokens in `mobile/src/theme.js` enforcing large touch targets (52px minimum) and minimal typing.

---

## Created Files & Components

- `mobile/package.json` & `mobile/app.json`: Expo project configurations.
- `mobile/src/theme.js`: Rural-artisan UI design system tokens.
- `mobile/src/i18n.js`: Multilingual translations dictionary.
- `mobile/src/services/api.js`: API bridge & offline queue manager.
- `mobile/src/screens/*.js`: 17 React Native screen components.
- `mobile/App.js`: Main Expo entry point and screen navigation container.
- `tests/test_phase11_mobile.py`: Test suite (4/4 tests passed).
- `docs/phase11_mobile_app.md`: Technical documentation.
