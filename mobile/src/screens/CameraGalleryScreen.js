import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const CameraGalleryScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('cameraUpload')}</Text>
    <View style={styles.previewBox}>
      <Text style={{ fontSize: 48 }}>📷</Text>
      <Text style={TYPOGRAPHY.caption}>Tap below to capture product photo</Text>
    </View>

    <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate('AIProcessing')}
    >
      <Text style={TYPOGRAPHY.badge}>Capture & Analyze</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  previewBox: { height: 260, backgroundColor: COLORS.cardBg, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginVertical: SPACING.lg },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%' }
});
