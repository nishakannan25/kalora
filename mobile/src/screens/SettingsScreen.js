import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const SettingsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('settings')}</Text>

    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => navigation.navigate('LanguageSelection')}
    >
      <Text style={TYPOGRAPHY.bodyBold}>Change App Language</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => navigation.navigate('Welcome')}
    >
      <Text style={[TYPOGRAPHY.bodyBold, { color: COLORS.danger }]}>Log Out</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  menuItem: { ...TOUCH_TARGET, backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: SPACING.md, width: '100%' }
});
