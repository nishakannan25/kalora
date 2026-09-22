import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

export default function App() {
  const [lang, setLang] = useState<'EN' | 'TA' | 'HI'>('EN');

  const taglines = {
    EN: 'Your Craft. Your Story. Your Market.',
    TA: 'உங்கள் கைவினை. உங்கள் கதை. உங்கள் சந்தை.',
    HI: 'आपकी कला। आपकी कहानी। आपका बाज़ार।'
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>KALORA</Text>
      <Text style={styles.tagline}>{taglines[lang]}</Text>

      <View style={styles.langContainer}>
        {(['EN', 'TA', 'HI'] as const).map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.langBtn, lang === item && styles.langBtnActive]}
            onPress={() => setLang(item)}
          >
            <Text style={[styles.langText, lang === item && styles.langTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  brand: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#c2410c',
    letterSpacing: 2,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#292524',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
  },
  langContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  langBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c2410c',
  },
  langBtnActive: {
    backgroundColor: '#c2410c',
  },
  langText: {
    color: '#c2410c',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
  },
});
