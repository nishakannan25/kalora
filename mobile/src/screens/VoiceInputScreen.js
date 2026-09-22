import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const VoiceInputScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={TYPOGRAPHY.header}>{t('voiceInput')}</Text>
      <Text style={[TYPOGRAPHY.body, { textAlign: 'center', marginVertical: SPACING.md }]}>
        {isRecording ? "Listening... Speak product details (material, region, craft)..." : "Tap microphone button to start speaking."}
      </Text>

      <TouchableOpacity 
        style={[styles.micButton, isRecording && styles.recordingButton]}
        onPress={() => {
          setIsRecording(!isRecording);
          if (isRecording) {
            navigation.navigate('AIProcessing');
          }
        }}
      >
        <Text style={{ fontSize: 56 }}>🎙️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center', alignItems: 'center' },
  micButton: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginVertical: SPACING.xl },
  recordingButton: { backgroundColor: COLORS.danger }
});
