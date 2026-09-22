import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const QualityMarketReadinessScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('qualityReadiness')}</Text>

    <View style={styles.scoreCard}>
      <Text style={TYPOGRAPHY.caption}>CATALOG QUALITY SCORE</Text>
      <Text style={[TYPOGRAPHY.header, { fontSize: 32, color: COLORS.accent }]}>88 / 100 (Grade A)</Text>
    </View>

    <View style={styles.scoreCard}>
      <Text style={TYPOGRAPHY.caption}>MARKET READINESS STATUS</Text>
      <Text style={[TYPOGRAPHY.header, { fontSize: 24, color: COLORS.primary }]}>READY FOR MARKET (A+)</Text>
      <Text style={[TYPOGRAPHY.caption, { marginTop: 4 }]}>All required fields & photos verified. No blockers.</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('DigitalCraftPassport')}
    >
      <Text style={TYPOGRAPHY.badge}>Generate Craft Passport</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  scoreCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACING.md },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', marginBottom: SPACING.lg }
});
