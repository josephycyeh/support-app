import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, ArrowRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import { calculateDaysSober } from '@/utils/dateUtils';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import * as Haptics from 'expo-haptics';
import Superwall from 'expo-superwall/compat';

export const MoneySavedCard = () => {
  const router = useRouter();
  const { dailySpending, isConfigured, calculateTotalSaved, currency } = useMoneySavedStore();
  const { startDate } = useSobrietyStore();

  // Calculate days sober using utility function
  const daysSober = calculateDaysSober(startDate);

  const totalSaved = calculateTotalSaved(daysSober);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Register paywall for money tracker feature
    Superwall.shared.register({
      placement: 'money_tracker',
      feature: () => {
        // This runs when user has access (premium user or after payment)
        if (!isConfigured) {
          // Navigate directly to edit spending if not configured
          router.push('/edit-money-spending');
        } else {
          // Navigate to money saved screen if already configured
          router.push('/money-saved');
        }
      }
    });
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
    height: 140,
  },
  gradientBackground: {
    backgroundColor: '#6B9B77',
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    flex: 1,
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
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    textAlign: 'center',
  },
  amountContainer: {
    height: 72,
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
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
    textAlign: 'center',
  },
}); 