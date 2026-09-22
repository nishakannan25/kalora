import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const PriceAdvisorScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('priceAdvisor')}</Text>

    <View style={styles.priceCard}>
      <Text style={TYPOGRAPHY.caption}>SUGGESTED FAIR STARTING PRICE</Text>
      <Text style={[TYPOGRAPHY.header, { color: COLORS.primary, fontSize: 32 }]}>₹5,500</Text>
      <Text style={TYPOGRAPHY.caption}>Fair Range: ₹4,840 – ₹6,160</Text>
    </View>

    <View style={styles.breakdownCard}>
      <Text style={TYPOGRAPHY.bodyBold}>Explainable Cost Breakdown:</Text>
      <Text style={styles.factorItem}>• Raw Materials: ₹2,000</Text>
      <Text style={styles.factorItem}>• Artisan Living Labor (24 hrs): ₹2,400</Text>
      <Text style={styles.factorItem}>• Zardozi Craft Premium: ₹600</Text>
      <Text style={styles.factorItem}>• Overhead & Packaging: ₹500</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('QualityMarketReadiness')}
    >
      <Text style={TYPOGRAPHY.badge}>Check Quality & Readiness</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  priceCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderLeftWidth: 6, borderLeftColor: COLORS.primary, marginVertical: SPACING.md },
  breakdownCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  factorItem: { fontSize: 16, color: COLORS.text, marginTop: 6 },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', marginBottom: SPACING.lg }
});
