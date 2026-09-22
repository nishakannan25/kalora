import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING } from './src/theme';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { LanguageSelectionScreen } from './src/screens/LanguageSelectionScreen';
import { LoginRegisterScreen } from './src/screens/LoginRegisterScreen';
import { ArtisanDashboardScreen } from './src/screens/ArtisanDashboardScreen';
import { AddProductScreen } from './src/screens/AddProductScreen';
import { CameraGalleryScreen } from './src/screens/CameraGalleryScreen';
import { VoiceInputScreen } from './src/screens/VoiceInputScreen';
import { AIProcessingScreen } from './src/screens/AIProcessingScreen';
import { ExtractedProductInfoScreen } from './src/screens/ExtractedProductInfoScreen';
import { MissingInfoQuestionsScreen } from './src/screens/MissingInfoQuestionsScreen';
import { CatalogPreviewScreen } from './src/screens/CatalogPreviewScreen';
import { PriceAdvisorScreen } from './src/screens/PriceAdvisorScreen';
import { QualityMarketReadinessScreen } from './src/screens/QualityMarketReadinessScreen';
import { DigitalCraftPassportScreen } from './src/screens/DigitalCraftPassportScreen';
import { QRCodeScreen } from './src/screens/QRCodeScreen';
import { ProductHistoryScreen } from './src/screens/ProductHistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export const SCREENS = {
  Welcome: WelcomeScreen,
  LanguageSelection: LanguageSelectionScreen,
  LoginRegister: LoginRegisterScreen,
  ArtisanDashboard: ArtisanDashboardScreen,
  AddProduct: AddProductScreen,
  CameraGallery: CameraGalleryScreen,
  VoiceInput: VoiceInputScreen,
  AIProcessing: AIProcessingScreen,
  ExtractedProductInfo: ExtractedProductInfoScreen,
  MissingInfoQuestions: MissingInfoQuestionsScreen,
  CatalogPreview: CatalogPreviewScreen,
  PriceAdvisor: PriceAdvisorScreen,
  QualityMarketReadiness: QualityMarketReadinessScreen,
  DigitalCraftPassport: DigitalCraftPassportScreen,
  QRCode: QRCodeScreen,
  ProductHistory: ProductHistoryScreen,
  Settings: SettingsScreen,
};

const SCREEN_KEYS = Object.keys(SCREENS);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Welcome');

  const navigate = useCallback((screenName) => {
    if (SCREENS[screenName]) {
      setCurrentScreen(screenName);
    }
  }, []);

  const navigation = { navigate };
  const ScreenComponent = SCREENS[currentScreen] || WelcomeScreen;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Top Persistent Web Navigation Bar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>KALORA ({currentScreen})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollNav}>
          {SCREEN_KEYS.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.navTab, currentScreen === key && styles.activeNavTab]}
              onPress={() => navigate(key)}
            >
              <Text style={[styles.navTabText, currentScreen === key && styles.activeNavTabText]}>
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.body}>
        <ScreenComponent navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  navbar: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 12 },
  navTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  scrollNav: { flexDirection: 'row' },
  navTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 6 },
  activeNavTab: { backgroundColor: COLORS.white },
  navTabText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  activeNavTabText: { color: COLORS.primary, fontWeight: '700' },
  body: { flex: 1 }
});
