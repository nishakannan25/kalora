"""
KALORA — Phase 11: Unit Test Suite for React Native Mobile App
"""

import unittest
import os
import sys

# Ensure project root is in python path
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

class TestPhase11MobileApp(unittest.TestCase):
    def test_mobile_files_exist(self):
        expected_files = [
            "mobile/package.json",
            "mobile/app.json",
            "mobile/App.js",
            "mobile/src/theme.js",
            "mobile/src/i18n.js",
            "mobile/src/services/api.js",
            "mobile/src/screens/WelcomeScreen.js",
            "mobile/src/screens/LanguageSelectionScreen.js",
            "mobile/src/screens/LoginRegisterScreen.js",
            "mobile/src/screens/ArtisanDashboardScreen.js",
            "mobile/src/screens/AddProductScreen.js",
            "mobile/src/screens/CameraGalleryScreen.js",
            "mobile/src/screens/VoiceInputScreen.js",
            "mobile/src/screens/AIProcessingScreen.js",
            "mobile/src/screens/ExtractedProductInfoScreen.js",
            "mobile/src/screens/MissingInfoQuestionsScreen.js",
            "mobile/src/screens/CatalogPreviewScreen.js",
            "mobile/src/screens/PriceAdvisorScreen.js",
            "mobile/src/screens/QualityMarketReadinessScreen.js",
            "mobile/src/screens/DigitalCraftPassportScreen.js",
            "mobile/src/screens/QRCodeScreen.js",
            "mobile/src/screens/ProductHistoryScreen.js",
            "mobile/src/screens/SettingsScreen.js"
        ]

        for file_rel in expected_files:
            file_abs = os.path.join(base_dir, file_rel)
            self.assertTrue(os.path.exists(file_abs), f"File {file_rel} is missing!")

    def test_theme_and_touch_targets(self):
        theme_path = os.path.join(base_dir, "mobile", "src", "theme.js")
        with open(theme_path, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("minHeight: 52", content)
            self.assertIn("primary: '#8b4513'", content)

    def test_i18n_translations(self):
        i18n_path = os.path.join(base_dir, "mobile", "src", "i18n.js")
        with open(i18n_path, "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("welcome", content)
            self.assertIn("कलौरा", content)  # Hindi translation present
            self.assertIn("கலோராவிற்கு", content)  # Tamil translation present

    def test_all_17_screens_registered_in_app(self):
        app_path = os.path.join(base_dir, "mobile", "App.js")
        with open(app_path, "r", encoding="utf-8") as f:
            content = f.read()
            screens = [
                "Welcome", "LanguageSelection", "LoginRegister", "ArtisanDashboard",
                "AddProduct", "CameraGallery", "VoiceInput", "AIProcessing",
                "ExtractedProductInfo", "MissingInfoQuestions", "CatalogPreview",
                "PriceAdvisor", "QualityMarketReadiness", "DigitalCraftPassport",
                "QRCode", "ProductHistory", "Settings"
            ]
            for s in screens:
                self.assertIn(s, content, f"Screen {s} not registered in App.js")

if __name__ == "__main__":
    unittest.main()
