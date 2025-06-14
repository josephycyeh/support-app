import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, DollarSign, Edit3, Calendar, Clock, Target } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { calculateDaysSober } from '@/utils/dateUtils';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { MoneyProjectionChart } from '@/components/MoneyProjectionChart';
import * as Haptics from 'expo-haptics';

export default function MoneySavedScreen() {
  const router = useRouter();
  const { dailySpending, isConfigured, calculateTotalSaved, currency } = useMoneySavedStore();
  const { startDate } = useSobrietyStore();

  // Calculate days sober using utility function
  const daysSober = calculateDaysSober(startDate);

  const totalSaved = calculateTotalSaved(daysSober);

  useEffect(() => {
    if (!isConfigured) {
      router.replace('/edit-money-spending');
    }
  }, [isConfigured, router]);

  const handleBack = () => {
    router.back();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  const renderMainContent = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Money Saved</Text>
        <Text style={styles.headerSubtitle}>Your financial recovery progress</Text>
      </View>

      {/* Total Saved Card */}
      <View style={styles.totalCardContainer}>
        <View style={styles.totalCard}>
          <View style={styles.totalCardHeader}>
            <View style={styles.totalIconContainer}>
              <DollarSign size={28} color="#FFFFFF" />
            </View>
          </View>
          
          <View style={styles.totalAmountSection}>
            <Text style={styles.totalAmount}>{formatCurrency(totalSaved)}</Text>
            <Text style={styles.totalLabel}>Total saved in recovery</Text>
          </View>
        </View>
      </View>

      {/* Progress Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Calendar size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{daysSober}</Text>
          <Text style={styles.statLabel}>Days Sober</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Clock size={20} color={colors.success} />
          </View>
          <Text style={styles.statValue}>{formatCurrency(dailySpending)}</Text>
          <Text style={styles.statLabel}>Daily Savings</Text>
        </View>
      </View>

      {/* Money Projection Chart */}
      <MoneyProjectionChart />

      {/* Breakdown Card */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownHeader}>
          <View style={styles.breakdownTitleContainer}>
            <Target size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Savings Breakdown</Text>
          </View>
        </View>
        
        <View style={styles.breakdownContent}>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeftSection}>
              <Text style={styles.breakdownLabel}>Weekly savings</Text>
              <Text style={styles.breakdownPeriod}>7 days</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatCurrency(dailySpending * 7)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeftSection}>
              <Text style={styles.breakdownLabel}>Monthly savings</Text>
              <Text style={styles.breakdownPeriod}>30 days</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatCurrency(dailySpending * 30)}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeftSection}>
              <Text style={styles.breakdownLabel}>Yearly projection</Text>
              <Text style={styles.breakdownPeriod}>365 days</Text>
            </View>
            <Text style={styles.breakdownValue}>{formatCurrency(dailySpending * 365)}</Text>
          </View>
        </View>
      </View>

      {/* Edit Daily Spending Button */}
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => {
          router.push('/edit-money-spending');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.editButtonContent}>
          <Edit3 size={20} color={colors.primary} />
          <View style={styles.editButtonTextContainer}>
            <Text style={styles.editButtonTitle}>Edit Daily Spending</Text>
            <Text style={styles.editButtonSubtitle}>Currently set to {formatCurrency(dailySpending)} per day</Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Stack.Screen 
        options={{
          title: "Money Saved",
          headerShown: false,
        }} 
      />
      
      {renderMainContent()}
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
    paddingBottom: 32,
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
    marginBottom: 28,
  },
  headerTitle: {
    ...typography.h1,
    marginBottom: 6,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
    fontWeight: '500',
  },
  // Total saved card
  totalCardContainer: {
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: colors.success,
    borderRadius: 24,
    padding: 28,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  totalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  totalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalAmountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  // Stats cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.progressBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Breakdown card
  breakdownCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 24
  },
  breakdownHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    ...typography.h2,
  },
  breakdownContent: {
    padding: 24,
    paddingTop: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLeftSection: {
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  breakdownPeriod: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  editButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  editButtonTextContainer: {
    flex: 1,
  },
  editButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  editButtonSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
}); 