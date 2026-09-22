import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const ExtractedProductInfoScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('extractedInfo')}</Text>

    <View style={styles.badgeBox}>
      <Text style={TYPOGRAPHY.badge}>CONFIDENCE: 92% (PROVISIONAL)</Text>
    </View>

    <View style={styles.specCard}>
      <Text style={TYPOGRAPHY.caption}>SECTOR</Text>
      <Text style={TYPOGRAPHY.bodyBold}>Handlooms & Textiles</Text>
      
      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.sm }]}>CATEGORY</Text>
      <Text style={TYPOGRAPHY.bodyBold}>Banarasi Silk Saree</Text>

      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.sm }]}>MATERIAL</Text>
      <Text style={TYPOGRAPHY.bodyBold}>Pure Silk</Text>

      <Text style={[TYPOGRAPHY.caption, { marginTop: SPACING.sm }]}>TECHNIQUE</Text>
      <Text style={TYPOGRAPHY.bodyBold}>Zardozi Embroidery</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('MissingInfoQuestions')}
    >
      <Text style={TYPOGRAPHY.badge}>{t('save')}</Text>
    </TouchableOpacity>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  badgeBox: { backgroundColor: COLORS.accent, padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginVertical: SPACING.sm },
  specCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginVertical: SPACING.md },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%', marginBottom: SPACING.lg }
});
