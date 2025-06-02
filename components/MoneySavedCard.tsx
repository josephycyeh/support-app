import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, ArrowRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import * as Haptics from 'expo-haptics';

export const MoneySavedCard = () => {
  const router = useRouter();
  const { dailySpending, isConfigured, calculateTotalSaved, currency } = useMoneySavedStore();
  const { startDate } = useSobrietyStore();

  // Calculate days sober
  const now = new Date();
  const start = new Date(startDate);
  const daysSober = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const totalSaved = calculateTotalSaved(daysSober);

  const handlePress = () => {
    router.push('/money-saved');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  if (!isConfigured) {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.setupBackground}>
          <View style={styles.setupContent}>
            <Text style={styles.setupLabel}>Money Saved</Text>
            <View style={styles.amountContainer}>
            <Text style={styles.setupTitle}>Set Up</Text>
            </View>
            <Text style={styles.setupSubtitle}>Track progress</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.gradientBackground}>
        <View style={styles.content}>
          <Text style={styles.titleLabel}>Money Saved</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.amount}>{formatCurrency(totalSaved)}</Text>
          </View>
          <Text style={styles.subtitle}>in recovery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    height: 120,
  },
  gradientBackground: {
    backgroundColor: colors.success,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  titleLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  amountContainer: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  amountLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  // Setup card styles
  setupCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    height: 120,
    maxWidth: '48%',
  },
  setupBackground: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  setupContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  setupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.progressBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  setupTextContainer: {
    alignItems: 'center',
  },
  setupLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  setupArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.progressBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  spacer: {
    height: 12,
  },
}); 