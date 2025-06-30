import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import * as Haptics from 'expo-haptics';
import { usePostHog } from 'posthog-react-native';

export default function EditMoneySpendingScreen() {
  const router = useRouter();
  const { dailySpending, setDailySpending, currency, isConfigured } = useMoneySavedStore();
  const [customAmount, setCustomAmount] = useState(isConfigured ? dailySpending.toString() : '');
  const posthog = usePostHog();

  const handleBack = () => {
    router.back();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      const wasInitialSetup = !isConfigured;
      setDailySpending(amount);
      
      // Track money tracker setup
      if (wasInitialSetup) {
        posthog.capture('money_tracker_setup_completed', {
          daily_amount: amount,
          currency: currency,
          source: 'home_screen',
        });
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (wasInitialSetup) {
        // Navigate to money-saved screen after initial setup
        router.replace('/money-saved');
      } else {
        // Go back to previous screen for edits
        router.back();
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  const hasValidSelection = customAmount && parseFloat(customAmount) > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack.Screen 
        options={{
          title: "Edit Daily Spending",
          headerShown: false,
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>
            {isConfigured ? 'Edit Daily Spending' : 'Set Up Money Tracking'}
          </Text>
          <Text style={styles.subtitle}>
            {isConfigured 
              ? `Currently set to ${formatCurrency(dailySpending)} per day`
              : 'Track your financial progress in recovery'
            }
          </Text>
        </View>

        {!isConfigured && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>What you'll get:</Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>💰 See total money saved</Text>
              <Text style={styles.benefitItem}>📊 Track your progress</Text>
              <Text style={styles.benefitItem}>📈 Visualize your growth</Text>
            </View>
          </View>
        )}

        <View style={styles.inputSection}>
          <Text style={styles.questionText}>
            How much per day?
          </Text>

          <View style={styles.customInputContainer}>
            <View style={styles.customInputRow}>
              <Text style={styles.currencySymbol}>{currency}</Text>
              <TextInput
                style={styles.customInput}
                value={customAmount}
                onChangeText={(text) => {
                  // Only allow whole numbers, no decimal points
                  const numericText = text.replace(/[^0-9]/g, '');
                  setCustomAmount(numericText);
                }}
                placeholder="0"
                keyboardType="number-pad"
              />
              <Text style={styles.perDayLabel}>per day</Text>
            </View>
          </View>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !hasValidSelection && styles.saveButtonDisabled
            ]}
            onPress={handleSave}
            disabled={!hasValidSelection}
          >
            <Text style={[
              styles.saveButtonText,
              !hasValidSelection && styles.saveButtonTextDisabled
            ]}>
              {isConfigured ? 'Save Changes' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  inputSection: {
    gap: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  customInputContainer: {
    gap: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  customInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: colors.cardBackground,
  },
  perDayLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 4,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#FFFFFF',
  },
}); 