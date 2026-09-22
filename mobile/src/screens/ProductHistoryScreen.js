import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

const DUMMY_PRODUCTS = [
  { id: 'PROD-1001', title: 'Banarasi Silk Saree', status: 'Published', price: '₹5,500' },
  { id: 'PROD-1002', title: 'Clay Water Pot', status: 'Verified', price: '₹450' },
  { id: 'PROD-1003', title: 'Teak Armchair', status: 'Needs Info', price: '₹4,500' }
];

export const ProductHistoryScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('history')}</Text>

    {DUMMY_PRODUCTS.map((prod) => (
      <TouchableOpacity key={prod.id} style={styles.prodCard}>
        <Text style={TYPOGRAPHY.bodyBold}>{prod.title}</Text>
        <Text style={TYPOGRAPHY.caption}>ID: {prod.id} • {prod.price}</Text>
        <Text style={[TYPOGRAPHY.caption, { color: COLORS.primary, marginTop: 4 }]}>Status: {prod.status}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  prodCard: { backgroundColor: COLORS.cardBg, padding: SPACING.md, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACING.xs }
});
