import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const QRCodeScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('qrCode')}</Text>

    <View style={styles.qrCard}>
      <Text style={{ fontSize: 96 }}>🔳</Text>
      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.md }]}>Scan to view public digital craft passport</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('ArtisanDashboard')}
    >
      <Text style={TYPOGRAPHY.badge}>Return to Dashboard</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center', alignItems: 'center' },
  qrCard: { backgroundColor: COLORS.cardBg, padding: SPACING.xl, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', marginVertical: SPACING.xl },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%' }
});
