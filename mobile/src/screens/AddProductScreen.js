import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const AddProductScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('addProduct')}</Text>

    <TouchableOpacity 
      style={styles.optionButton}
      onPress={() => navigation.navigate('CameraGallery')}
    >
      <Text style={styles.icon}>📷</Text>
      <Text style={TYPOGRAPHY.bodyBold}>{t('cameraUpload')}</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.optionButton, styles.voiceButton]}
      onPress={() => navigation.navigate('VoiceInput')}
    >
      <Text style={styles.icon}>🎙️</Text>
      <Text style={[TYPOGRAPHY.bodyBold, { color: COLORS.textLight }]}>{t('voiceInput')}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  optionButton: { ...TOUCH_TARGET, backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.lg, width: '100%' },
  voiceButton: { backgroundColor: COLORS.primary },
  icon: { fontSize: 36, marginBottom: SPACING.xs }
});
