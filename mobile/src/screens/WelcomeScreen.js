import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { setLanguage, t } from '../i18n';

export const WelcomeScreen = ({ navigation }) => {
  const handleLang = (code, nextScreen) => {
    setLanguage(code);
    navigation.navigate(nextScreen);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={TYPOGRAPHY.header}>{t('welcome')}</Text>
      <Text style={[TYPOGRAPHY.body, styles.tagline]}>{t('tagline')}</Text>

      {/* Language Selector Buttons on Welcome Screen */}
      <View style={styles.langRow}>
        <TouchableOpacity 
          style={[styles.langBadge, { backgroundColor: COLORS.primary }]}
          onPress={() => handleLang('en', 'LanguageSelection')}
        >
          <Text style={styles.langTextActive}>EN</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.langBadge}
          onPress={() => handleLang('ta', 'LanguageSelection')}
        >
          <Text style={styles.langText}>TA</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.langBadge}
          onPress={() => handleLang('hi', 'LanguageSelection')}
        >
          <Text style={styles.langText}>HI</Text>
        </TouchableOpacity>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={() => navigation.navigate('LanguageSelection')}
      >
        <Text style={styles.primaryButtonText}>🚀 {t('getStarted')} (Go to Next Page)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.primaryButton, { backgroundColor: COLORS.secondary, marginTop: SPACING.sm }]}
        onPress={() => navigation.navigate('ArtisanDashboard')}
      >
        <Text style={styles.primaryButtonText}>📊 Go to Artisan Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  tagline: { textAlign: 'center', marginVertical: SPACING.md, color: COLORS.muted, fontStyle: 'italic' },
  langRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: SPACING.lg },
  langBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primary, marginHorizontal: 6 },
  langTextActive: { color: COLORS.white, fontWeight: 'bold' },
  langText: { color: COLORS.primary, fontWeight: 'bold' },
  primaryButton: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', borderRadius: 14, marginVertical: SPACING.xs, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 }
});
