import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const LoginRegisterScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  return (
    <View style={styles.container}>
      <Text style={TYPOGRAPHY.header}>{t('login')}</Text>
      <Text style={TYPOGRAPHY.caption}>Enter Artisan Phone Number for OTP</Text>
      <TextInput
        style={styles.input}
        placeholder="+91 98765 43210"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ArtisanDashboard')}
      >
        <Text style={TYPOGRAPHY.badge}>{t('confirm')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, justifyContent: 'center' },
  input: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 18, marginVertical: SPACING.md },
  button: { ...TOUCH_TARGET, backgroundColor: COLORS.primary, width: '100%' }
});
