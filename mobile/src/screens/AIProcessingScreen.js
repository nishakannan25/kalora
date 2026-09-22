import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { t } from '../i18n';

export const AIProcessingScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ExtractedProductInfo');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[TYPOGRAPHY.header, { marginTop: SPACING.lg }]}>{t('processing')}</Text>
      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.xs }]}>Extracting sector, material, craft, and attributes...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center', alignItems: 'center' }
});
