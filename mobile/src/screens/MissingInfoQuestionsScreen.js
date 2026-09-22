import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const MissingInfoQuestionsScreen = ({ navigation }) => {
  const [targetPrice, setTargetPrice] = useState('');

  return (
    <View style={styles.container}>
      <Text style={TYPOGRAPHY.header}>{t('missingInfo')}</Text>

      <View style={styles.questionCard}>
        <Text style={TYPOGRAPHY.bodyBold}>What is your target minimum price (₹)?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5500"
          value={targetPrice}
          onChangeText={setTargetPrice}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('CatalogPreview')}
      >
        <Text style={TYPOGRAPHY.badge}>{t('confirm')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  questionCard: { backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 18, marginTop: SPACING.sm },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%' }
});
