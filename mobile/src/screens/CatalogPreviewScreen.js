import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const CatalogPreviewScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('catalogPreview')}</Text>

    <View style={styles.catalogCard}>
      <Text style={[TYPOGRAPHY.header, { fontSize: 20 }]}>Authentic Banarasi Silk Saree</Text>
      <Text style={[TYPOGRAPHY.bodyBold, { color: COLORS.secondary, marginVertical: 4 }]}>₹5,500.00</Text>
      <Text style={TYPOGRAPHY.body}>Handcrafted in Varanasi by Sita Devi using traditional Zardozi weaving technique.</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('PriceAdvisor')}
    >
      <Text style={TYPOGRAPHY.badge}>Check Price Advisor</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  catalogCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACING.md },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', marginBottom: SPACING.lg }
});
