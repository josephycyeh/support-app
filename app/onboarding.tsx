import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Heart, User, Check, ArrowRight, ArrowLeft, DollarSign, TrendingUp } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { MoneyProjectionChart } from '@/components/MoneyProjectionChart';
import * as Haptics from 'expo-haptics';

enum OnboardingStep {
  WELCOME = 0,
  NAME = 1,
  AGE = 2,
  SOBRIETY_DATE = 3,
  REASONS = 4,
  MONEY = 5,
  MONEY_PROJECTION = 6,
  COMPLETE = 7,
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { setName, setStartDate, setAge, completeOnboarding } = useSobrietyStore();
  const { addReason } = useReasonsStore();
  const { setDailySpending } = useMoneySavedStore();
  
  const [currentStep, setCurrentStep] = useState(OnboardingStep.WELCOME);
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date());
  const [currentReason, setCurrentReason] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [dailySpending, setDailySpendingInput] = useState('');

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Save data immediately when moving to next step
    switch (currentStep) {
      case OnboardingStep.NAME:
        if (userName.trim()) {
          setName(userName.trim());
        }
        break;
      case OnboardingStep.AGE:
        if (userAge.trim()) {
          setAge(parseInt(userAge));
        }
        break;
      case OnboardingStep.SOBRIETY_DATE:
        setStartDate(sobrietyDate.toISOString());
        break;
      case OnboardingStep.MONEY:
        if (dailySpending.trim()) {
          setDailySpending(parseFloat(dailySpending));
        }
        break;
    }
    
    if (currentStep < OnboardingStep.COMPLETE) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > OnboardingStep.WELCOME) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddReason = () => {
    if (currentReason.trim()) {
      const newReason = currentReason.trim();
      setReasons([...reasons, newReason]);
      // Save reason immediately to store
      addReason(newReason);
      setCurrentReason('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleRemoveReason = (index: number) => {
    const reasonToRemove = reasons[index];
    setReasons(reasons.filter((_, i) => i !== index));
    // Note: We'd need a way to remove from store, but for now just update local state
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComplete = () => {
    // All data should already be saved, just complete onboarding
    completeOnboarding();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/(tabs)');
  };

  const canProceedFromStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return true;
      case OnboardingStep.NAME:
        return userName.trim().length > 0;
      case OnboardingStep.AGE:
        return userAge.trim().length > 0 && parseInt(userAge) >= 13 && parseInt(userAge) <= 100;
      case OnboardingStep.SOBRIETY_DATE:
        return true;
      case OnboardingStep.REASONS:
        return reasons.length > 0;
      case OnboardingStep.MONEY:
        return dailySpending.trim().length > 0 && parseFloat(dailySpending) >= 0;
      case OnboardingStep.MONEY_PROJECTION:
        return true;
      default:
        return true;
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[0, 1, 2, 3, 4, 5, 6].map((step) => (
        <View
          key={step}
          style={[
            styles.progressDot,
            currentStep >= step && styles.progressDotActive
          ]}
        />
      ))}
    </View>
  );

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeTitle}>Welcome to Sushi 🍣</Text>
      <Text style={styles.welcomeSubtitle}>Your Recovery Companion</Text>
      
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeDescription}>
          I'm here to support you on your recovery journey. Together, we'll build lasting sobriety habits.
        </Text>
        
        <View style={styles.featureList}>
          <FeatureItem icon={<Heart size={20} color={colors.primary} />} text="Track your sobriety progress" />
          <FeatureItem icon={<User size={20} color={colors.primary} />} text="Get personalized recovery support" />
          <FeatureItem icon={<Calendar size={20} color={colors.primary} />} text="Daily goals & motivation" />
        </View>
      </View>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What should I call you?</Text>
      <Text style={styles.stepSubtitle}>Let's personalize your recovery experience</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={userName}
          onChangeText={setUserName}
          placeholder="Enter your first name"
          placeholderTextColor={colors.textMuted}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
        />
      </View>
    </View>
  );

  const renderAgeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How old are you?</Text>
      <Text style={styles.stepSubtitle}>This helps me provide age-appropriate support</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={userAge}
          onChangeText={(text) => {
            // Only allow numbers
            const numericText = text.replace(/[^0-9]/g, '');
            setUserAge(numericText);
          }}
          placeholder="Enter your age"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
        />
        {userAge && (parseInt(userAge) < 13 || parseInt(userAge) > 100) && (
          <Text style={styles.errorText}>Please enter a valid age (13-100)</Text>
        )}
      </View>
    </View>
  );

  const renderSobrietyDateStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>When did your sobriety begin? 🌅</Text>
      <Text style={styles.stepSubtitle}>Set your sobriety start date to track your progress</Text>
      
      <View style={styles.datePickerContainer}>
        <DateTimePicker
          value={sobrietyDate}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setSobrietyDate(selectedDate);
            }
          }}
          maximumDate={new Date()}
          style={styles.datePicker}
        />
      </View>
    </View>
  );

  const renderReasonsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Why did you choose recovery?</Text>
      <Text style={styles.stepSubtitle}>Your reasons will help keep you motivated during challenges</Text>
      
      <View style={styles.reasonsInputContainer}>
        <TextInput
          style={styles.reasonInput}
          value={currentReason}
          onChangeText={setCurrentReason}
          placeholder="What motivates your recovery? (e.g., 'Better health for my family')"
          placeholderTextColor={colors.textMuted}
          multiline
          returnKeyType="done"
          onSubmitEditing={handleAddReason}
        />
        <TouchableOpacity
          style={[styles.addReasonButton, !currentReason.trim() && styles.addReasonButtonDisabled]}
          onPress={handleAddReason}
          disabled={!currentReason.trim()}
        >
          <Text style={styles.addReasonButtonText}>Add Reason</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.reasonsList}>
        {reasons.map((reason, index) => (
          <View key={index} style={styles.reasonItem}>
            <Heart size={16} color={colors.primary} />
            <Text style={styles.reasonText}>{reason}</Text>
            <TouchableOpacity onPress={() => handleRemoveReason(index)}>
              <Text style={styles.removeReasonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {reasons.length === 0 && (
        <View style={styles.emptyReasonsContainer}>
          <Text style={styles.emptyReasonsText}>Add your first reason to continue</Text>
        </View>
      )}
    </View>
  );

  const renderMoneyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Track your financial recovery 💰</Text>
      <Text style={styles.stepSubtitle}>How much did you spend daily on substances?</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={dailySpending}
          onChangeText={(text) => {
            // Allow numbers and decimal point
            const numericText = text.replace(/[^0-9.]/g, '');
            setDailySpendingInput(numericText);
          }}
          placeholder="$25.00"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric-pad"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
        />
        {dailySpending && parseFloat(dailySpending) < 0 && (
          <Text style={styles.errorText}>Please enter a valid amount</Text>
        )}
      </View>
    </View>
  );

  const renderMoneyProjectionStep = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Your Recovery Savings</Text>
        <Text style={styles.stepSubtitle}>See how much you'll save staying sober</Text>
        
        <View style={styles.projectionContent}>
          <View style={styles.projectionSummary}>
            <View style={styles.projectionCard}>
              <View style={styles.projectionIconContainer}>
                <DollarSign size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.projectionValue}>${(parseFloat(dailySpending || '0') * 30).toFixed(0)}</Text>
              <Text style={styles.projectionLabel}>per month</Text>
            </View>
            
            <View style={styles.projectionCard}>
              <View style={styles.projectionIconContainer}>
                <TrendingUp size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.projectionValue}>${(parseFloat(dailySpending || '0') * 365).toFixed(0)}</Text>
              <Text style={styles.projectionLabel}>per year</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            {dailySpending ? (
              <MoneyProjectionChart />
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.placeholderText}>Chart will appear here</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeIcon}>
        <Check size={40} color="#FFFFFF" />
      </View>
      <Text style={styles.completeTitle}>Setup Complete!</Text>
      <Text style={styles.completeSubtitle}>
        Welcome to your recovery journey, {userName}
      </Text>
      
      <View style={styles.completeSummary}>
        <Text style={styles.summaryText}>Your recovery profile:</Text>
        <View style={styles.summaryItem}>
          <Calendar size={16} color={colors.primary} />
          <Text style={styles.summaryValue}>
            Sober since {sobrietyDate.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Heart size={16} color={colors.primary} />
          <Text style={styles.summaryValue}>
            {reasons.length} reason{reasons.length !== 1 ? 's' : ''} for staying sober
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return renderWelcome();
      case OnboardingStep.NAME:
        return renderNameStep();
      case OnboardingStep.AGE:
        return renderAgeStep();
      case OnboardingStep.SOBRIETY_DATE:
        return renderSobrietyDateStep();
      case OnboardingStep.REASONS:
        return renderReasonsStep();
      case OnboardingStep.MONEY:
        return renderMoneyStep();
      case OnboardingStep.MONEY_PROJECTION:
        return renderMoneyProjectionStep();
      case OnboardingStep.COMPLETE:
        return renderComplete();
      default:
        return renderWelcome();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          {renderProgressBar()}
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > OnboardingStep.WELCOME && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ArrowLeft size={20} color={colors.textLight} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          {currentStep < OnboardingStep.COMPLETE ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                !canProceedFromStep() && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={!canProceedFromStep()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === OnboardingStep.WELCOME ? 'Get Started' : 
                 currentStep === OnboardingStep.MONEY_PROJECTION ? 'Begin Recovery' :
                 'Continue'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>Start My Recovery</Text>
              <Check size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={styles.featureItem}>
    {icon}
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  welcomeContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  welcomeDescription: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featureList: {
    gap: 16,
    alignSelf: 'stretch',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  textInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    fontSize: 18,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  datePickerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePicker: {
    height: 200,
    width: '100%',
  },
  reasonsInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  reasonInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  addReasonButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addReasonButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  addReasonButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reasonsList: {
    width: '100%',
    maxHeight: 200,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
  },
  removeReasonText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyReasonsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyReasonsText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  completeSummary: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  completeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  projectionContent: {
    width: '100%',
    alignItems: 'center',
  },
  projectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  projectionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  projectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  projectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
  },
  chartContainer: {
    width: '100%',

    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
}); 