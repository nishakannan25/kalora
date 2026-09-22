import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, TOUCH_TARGET } from '../theme';
import { t } from '../i18n';

export const ArtisanDashboardScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <Text style={TYPOGRAPHY.header}>{t('dashboard')}</Text>
    <Text style={TYPOGRAPHY.subHeader}>Welcome, Sita Devi (Master Weaver)</Text>
    
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.cardIcon}>➕</Text>
        <Text style={TYPOGRAPHY.bodyBold}>{t('addProduct')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('ProductHistory')}
      >
        <Text style={styles.cardIcon}>📦</Text>
        <Text style={TYPOGRAPHY.bodyBold}>{t('history')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.cardIcon}>⚙️</Text>
        <Text style={TYPOGRAPHY.bodyBold}>{t('settings')}</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg },
  cardContainer: { marginTop: SPACING.lg },
  actionCard: { ...TOUCH_TARGET, backgroundColor: COLORS.cardBg, padding: SPACING.lg, borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', justifyContent: 'flex-start' },
  cardIcon: { fontSize: 28, marginRight: SPACING.md }
});
