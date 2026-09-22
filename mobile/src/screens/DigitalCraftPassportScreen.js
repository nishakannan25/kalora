import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const DigitalCraftPassportScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('digitalPassport')}</Text>

    <View style={styles.passportCard}>
      <Text style={TYPOGRAPHY.caption}>PASSPORT ID</Text>
      <Text style={[TYPOGRAPHY.bodyBold, { color: COLORS.primary }]}>KALORA-PASSPORT-88F4A2</Text>

      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.sm }]}>PUBLIC SHAREABLE LINK</Text>
      <Text style={TYPOGRAPHY.body}>http://localhost:3000/passports/PROD-1001.html</Text>

      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.sm }]}>STATUS</Text>
      <Text style={[TYPOGRAPHY.bodyBold, { color: COLORS.accent }]}>PUBLISHED</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('QRCode')}
    >
      <Text style={TYPOGRAPHY.badge}>View Product QR Code</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  passportCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACING.md },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', marginBottom: SPACING.lg }
});
