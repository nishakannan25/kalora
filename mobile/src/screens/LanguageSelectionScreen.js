import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { setLanguage, t } from '../i18n';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'kn', label: 'கன்னட (Kannada)' }
];

export const LanguageSelectionScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('selectLanguage')}</Text>
    <View style={styles.list}>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={styles.langButton}
          onPress={() => {
            setLanguage(lang.code);
            navigation.navigate('LoginRegister');
          }}
        >
          <Text style={TYPOGRAPHY.bodyBold}>{lang.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  list: { marginTop: SPACING.lg },
  langButton: { ...TOUCH_TARGET, backgroundColor: COLORS.cardBg, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, width: '100%' }
});
