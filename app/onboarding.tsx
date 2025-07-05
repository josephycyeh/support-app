import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Heart, ArrowRight, ArrowLeft, Check, Sparkles, Star } from 'lucide-react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { MoneyProjectionChart } from '@/components/MoneyProjectionChart';
import * as Haptics from 'expo-haptics';
import { OnboardingStep as OnboardingStepComponent } from '@/components/onboarding/OnboardingStep';
import { OptionButton, OptionsContainer } from '@/components/onboarding/OptionButton';
import { SingleSelectOptions, MultiSelectOptions } from '@/components/onboarding/MultiSelectOptions';
import { requestNotificationPermissions } from '@/services/NotificationService';
import Superwall from 'expo-superwall/compat';
import { usePostHog } from 'posthog-react-native';

enum OnboardingStep {
  WELCOME = 0,
  NAME = 1,
  SOURCE = 2,
  SUBSTANCES = 3,
  SUBSTANCE_FREQUENCY = 4,
  SOBRIETY_DATE = 5,
  TRIGGERS = 6,
  HARDEST_PART = 7,
  ENGAGEMENT_SUPPORT = 8,    // "You're not alone" engagement screen
  GOALS = 9,
  SOBRIETY_IMPORTANCE = 10,
  REASONS = 11,
  MONEY_INTEREST = 12,       // Ask if they want to track money             
  MONEY = 13,
  MONEY_PROJECTION = 14,
  STRUGGLE_TIMES = 15,
  REVIEW_REQUEST = 16,       // Ask for app store review
  XP_EXPLANATION = 17,       // Explain how XP and leveling works
  AGE = 18,                  // Collect user's age
  LOADING_PLAN = 19,         // Loading screen - tailoring their plan
  ENGAGEMENT_READY = 20      // "Ready to begin" engagement screen - final step               
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { 
    setName, 
    setStartDate, 
    completeOnboarding,
    setSubstance: saveSubstance,
    setSubstanceFrequency: saveSubstanceFrequency,
    setTriggers: saveTriggers,
    setRecoveryGoals: saveRecoveryGoals,
    setHardestChallenge: saveHardestChallenge,
    setSobrietyImportance: saveSobrietyImportance,
    setStruggleTimes: saveStruggleTimes,
    setAcquisitionSource: saveAcquisitionSource,
    setAge: saveAge
  } = useSobrietyStore();
  const { addReason } = useReasonsStore();
  const { setDailySpending } = useMoneySavedStore();

  const [currentStep, setCurrentStep] = useState(OnboardingStep.WELCOME);
  const [userName, setUserName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date());
  const [currentReason, setCurrentReason] = useState('');

  const [dailySpending, setDailySpendingInput] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [sobrietyImportance, setSobrietyImportance] = useState('');
  const [selectedSubstance, setSelectedSubstance] = useState('');
  const [substanceFrequency, setSubstanceFrequency] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [struggleTimes, setStruggleTimes] = useState<string[]>([]);
  const [hardestPart, setHardestPart] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing your responses...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [interestedInMoney, setInterestedInMoney] = useState<boolean | null>(null);
  const [userAge, setUserAge] = useState('');

  // Animation values for welcome screen
  const [fadeAnim] = useState(new Animated.Value(0));

  // Animation values for engagement screen testimonials
  const [testimonial1Anim] = useState(new Animated.Value(-30));
  const [testimonial2Anim] = useState(new Animated.Value(30));
  const [testimonial3Anim] = useState(new Animated.Value(-30));
  const [testimonial1Opacity] = useState(new Animated.Value(0));
  const [testimonial2Opacity] = useState(new Animated.Value(0));
  const [testimonial3Opacity] = useState(new Animated.Value(0));

  const posthog = usePostHog();


  // Animate welcome screen on mount
  useEffect(() => {
    if (currentStep === OnboardingStep.WELCOME) {
      // Reset animation
      fadeAnim.setValue(0);

      // Simple fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep]);

  // Animate engagement screen testimonials
  useEffect(() => {
    if (currentStep === OnboardingStep.ENGAGEMENT_SUPPORT) {
      // Reset animations
      testimonial1Anim.setValue(-30);
      testimonial2Anim.setValue(30);
      testimonial3Anim.setValue(-30);
      testimonial1Opacity.setValue(0);
      testimonial2Opacity.setValue(0);
      testimonial3Opacity.setValue(0);

      // Soft staggered slide-in animations
      Animated.stagger(300, [
        Animated.parallel([
          Animated.timing(testimonial1Anim, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(testimonial1Opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(testimonial2Anim, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(testimonial2Opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(testimonial3Anim, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(testimonial3Opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === OnboardingStep.LOADING_PLAN) {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingText('Analyzing your responses...');

      // Request notification permissions when loading starts (independent of loading sequence)
      const requestPermissions = async () => {
        try {
          await requestNotificationPermissions();
          console.log('✅ Notification permissions requested during onboarding');
        } catch (error) {
          console.error('❌ Failed to request notification permissions during onboarding:', error);
        }
      };

      // Trigger permission request after a short delay
      setTimeout(requestPermissions, 1000);

      const loadingSteps = [
        { text: 'Analyzing your responses...', progress: 8, duration: 1000 },
        { text: 'Processing your goals...', progress: 20, duration: 800 },
        { text: 'Understanding your recovery journey...', progress: 30, duration: 1800 },
        { text: 'Identifying your support needs...', progress: 45, duration: 800 },
        { text: 'Customizing your experience...', progress: 55, duration: 2200 },
        { text: 'Building your recovery toolkit...', progress: 80, duration: 800 },
        { text: 'Finalizing personalization...', progress: 95, duration: 1400 },
        { text: 'Ready to begin your journey!', progress: 100, duration: 500 }
      ];

      let currentLoadingStep = -1;
      const timeouts: number[] = [];
      let isCancelled = false;

      const executeStep = () => {
        if (isCancelled) return;

        if (currentLoadingStep < loadingSteps.length - 1) {
          currentLoadingStep++;
          const step = loadingSteps[currentLoadingStep];
          setLoadingText(step.text);
          setLoadingProgress(step.progress);

          const timeout = setTimeout(executeStep, step.duration);
          timeouts.push(timeout);
        } else {
          setIsLoading(false);
          // Automatically proceed to next step after a brief delay
          const finalTimeout = setTimeout(() => {
            if (!isCancelled) {
              handleNext();
            }
          }, 800);
          timeouts.push(finalTimeout);
        }
      };

      // Start immediately with first step
      const initialTimeout = setTimeout(executeStep, 500);
      timeouts.push(initialTimeout);

      return () => {
        isCancelled = true;
        timeouts.forEach(timeout => clearTimeout(timeout));
        setIsLoading(false);
        setLoadingProgress(0);
        setLoadingText('Analyzing your responses...');
      };
    }
  }, [currentStep]);

  // Automatically request review when reaching review screen
  useEffect(() => {
    if (currentStep === OnboardingStep.REVIEW_REQUEST) {
      const requestReview = async () => {
        try {
          // Small delay to let the screen render
          setTimeout(async () => {
            if (await StoreReview.hasAction()) {
              await StoreReview.requestReview();
            }
          }, 1000);
        } catch (error) {
          console.log('Review request failed:', error);
        }
      };

      requestReview();
    }
  }, [currentStep]);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Track step completion for funnel analysis
    const stepNames = [
      'welcome', 'name', 'source', 'substances', 'substance_frequency', 
      'sobriety_date', 'triggers', 'hardest_part', 'engagement_support', 
      'goals', 'sobriety_importance', 'reasons', 'money_interest', 'money', 
      'money_projection', 'struggle_times', 'review_request', 'xp_explanation', 
      'age', 'loading_plan', 'engagement_ready'
    ];

    if (currentStep < stepNames.length) {
      posthog.capture('onboarding_step_completed', {
        step_name: stepNames[currentStep],
        step_number: currentStep,
      });
    }

    // Save data immediately when moving to next step
    switch (currentStep) {
      case OnboardingStep.NAME:
        if (userName.trim()) {
          setName(userName.trim());
        }
        break;
      case OnboardingStep.SOURCE:
        if (selectedSource.trim()) {
          saveAcquisitionSource(selectedSource);
          // Set Superwall user attribute for acquisition source
          Superwall.shared.setUserAttributes({
            source: selectedSource,
            name: userName
          });

          posthog.capture('onboarding_source_selected', {
            source: selectedSource,
          });
        }
        break;
      case OnboardingStep.SUBSTANCES:
        if (selectedSubstance.trim()) {
          saveSubstance(selectedSubstance);
          
          posthog.capture('onboarding_addiction_selected', {
            addiction: selectedSubstance,
          });
        }

        break;
      case OnboardingStep.SUBSTANCE_FREQUENCY:
        if (substanceFrequency.trim()) {
          saveSubstanceFrequency(substanceFrequency);
        }
        break;
      case OnboardingStep.SOBRIETY_DATE:
        setStartDate(sobrietyDate.toISOString());

        posthog.capture('onboarding_sobriety_date_selected', {
          date: sobrietyDate.toISOString(),
        });

        break;
      case OnboardingStep.TRIGGERS:
        if (selectedTriggers.length > 0) {
          saveTriggers(selectedTriggers);
        }
        break;
      case OnboardingStep.HARDEST_PART:
        if (hardestPart.trim()) {
          saveHardestChallenge(hardestPart);
        }
        break;
      case OnboardingStep.GOALS:
        if (selectedGoals.length > 0) {
          saveRecoveryGoals(selectedGoals);
        }
        break;
      case OnboardingStep.REASONS:
        if (currentReason.trim()) {
          // Save the single reason to the store
          addReason(currentReason.trim());
        }
        break;
      case OnboardingStep.SOBRIETY_IMPORTANCE:
        if (sobrietyImportance.trim()) {
          saveSobrietyImportance(sobrietyImportance);
        }
        break;
      case OnboardingStep.STRUGGLE_TIMES:
        if (struggleTimes.length > 0) {
          saveStruggleTimes(struggleTimes);
        }
        break;
      case OnboardingStep.MONEY:
        if (dailySpending.trim()) {
          setDailySpending(parseFloat(dailySpending));
          
          // Track money tracker setup completion during onboarding
          posthog.capture('money_tracker_setup_completed', {
            daily_amount: parseFloat(dailySpending),
            currency: '$',
            source: 'onboarding',
          });
        }
        break;
      case OnboardingStep.AGE:
        if (userAge.trim()) {
          saveAge(parseInt(userAge));
          posthog.capture('user_age_set', {
            age: userAge.trim(),
            source: 'onboarding',
          });
        }
        break;
    }

    // Handle conditional navigation
    if (currentStep === OnboardingStep.MONEY_INTEREST) {
      if (interestedInMoney === true) {
        setCurrentStep(OnboardingStep.MONEY);
      } else if (interestedInMoney === false) {
        setCurrentStep(OnboardingStep.STRUGGLE_TIMES);
      }
      return;
    }

    if (currentStep < OnboardingStep.ENGAGEMENT_READY) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > OnboardingStep.WELCOME) {
      // Special handling for backing out of struggle times
      // If user is on struggle times and had selected "No" for money interest,
      // go back to money interest screen instead of money projection
      if (currentStep === OnboardingStep.STRUGGLE_TIMES && interestedInMoney === false) {
        setCurrentStep(OnboardingStep.MONEY_INTEREST);
        return;
      }

      setCurrentStep(currentStep - 1);
    }
  };



  const handleComplete = () => {
    // All data should already be saved, just complete onboarding
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Track onboarding completion
    posthog.capture('onboarding_completed');
    
    // router.replace('/(tabs)');
    completeOnboarding();
  // Register and launch Superwall paywall
  Superwall.shared.register({
    placement: 'onboarding_complete',
    feature: () => {
      // This runs when user has access (premium user or after payment)
      // completeOnboarding();
      router.replace('/(tabs)');
    }
  });
      
  };



  const canProceedFromStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return true;
      case OnboardingStep.NAME:
        return userName.trim().length > 0;
      case OnboardingStep.SOURCE:
        return selectedSource.trim().length > 0;
      case OnboardingStep.SUBSTANCES:
        return selectedSubstance.trim().length > 0;
      case OnboardingStep.SUBSTANCE_FREQUENCY:
        return substanceFrequency.trim().length > 0;
      case OnboardingStep.SOBRIETY_DATE:
        return true;
      case OnboardingStep.TRIGGERS:
        return selectedTriggers.length > 0;
      case OnboardingStep.HARDEST_PART:
        return hardestPart.trim().length > 0;
      case OnboardingStep.ENGAGEMENT_SUPPORT:
        return true;
      case OnboardingStep.GOALS:
        return selectedGoals.length > 0;
      case OnboardingStep.REASONS:
        return currentReason.trim().length > 0;
      case OnboardingStep.MONEY_INTEREST:
        return interestedInMoney !== null;
      case OnboardingStep.MONEY:
        return dailySpending.trim().length > 0 && parseFloat(dailySpending) > 0;
      case OnboardingStep.MONEY_PROJECTION:
        return true;
      case OnboardingStep.SOBRIETY_IMPORTANCE:
        return sobrietyImportance.trim().length > 0;
      case OnboardingStep.STRUGGLE_TIMES:
        return struggleTimes.length > 0;
      case OnboardingStep.REVIEW_REQUEST:
        return true;
      case OnboardingStep.XP_EXPLANATION:
        return true;
      case OnboardingStep.AGE:
        return userAge.trim().length > 0 && parseInt(userAge) >= 13 && parseInt(userAge) <= 120;
      case OnboardingStep.LOADING_PLAN:
        return !isLoading;
      case OnboardingStep.ENGAGEMENT_READY:
        return true;
      default:
        return true;
    }
  };

  const renderProgressBar = () => {
    const progressPercentage = currentStep / OnboardingStep.ENGAGEMENT_READY;

    return (
      <View style={styles.progressContainer}>
        {currentStep > OnboardingStep.WELCOME && (
          <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
            <ArrowLeft size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
        <View style={styles.progressBarContainer}>
          <Progress.Bar
            progress={progressPercentage}
            width={null}
            height={6}
            color={colors.primary}
            unfilledColor={colors.border}
            borderWidth={0}
            borderRadius={2}
          />
        </View>
      </View>
    );
  };

  const renderAgeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>Lastly, what's your age?</Text>
      <Text style={styles.onboardingSubtitle}>This helps us personalize your recovery experience</Text>

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
          keyboardType="numeric"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
          maxLength={3}
        />
        {userAge && (parseInt(userAge) < 13 || parseInt(userAge) > 120) && (
          <Text style={styles.errorText}>Please enter a valid age (13-120)</Text>
        )}
      </View>
    </View>
  );

  const renderXPExplanationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.xpExplanationHeader}>
        <Text style={styles.onboardingTitle}>Earn XP & Level Up! ✨</Text>
        <Text style={styles.onboardingSubtitle}>Stay motivated with our reward system</Text>
      </View>

      <View style={styles.xpExplanationContent}>
        {/* Level System */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardHeader}>
            <View style={styles.xpIconContainer}>
              <Text style={styles.xpEmoji}>⭐</Text>
            </View>
            <Text style={styles.xpCardTitle}>Level Up</Text>
          </View>
          <Text style={styles.xpCardDescription}>
            Complete activities to gain XP and level up! Each level celebrates your growing commitment to recovery.
          </Text>
        </View>

        {/* Daily Activities */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardHeader}>
            <View style={styles.xpIconContainer}>
              <Text style={styles.xpEmoji}>📅</Text>
            </View>
            <Text style={styles.xpCardTitle}>Daily Activities</Text>
          </View>
          <Text style={styles.xpCardDescription}>
            Earn XP by engaging with recovery tools like breathing exercises, mood check-ins, journaling, and completing daily goals.
          </Text>
        </View>

        {/* Milestones */}
        <View style={styles.xpCard}>
          <View style={styles.xpCardHeader}>
            <View style={styles.xpIconContainer}>
              <Text style={styles.xpEmoji}>🏆</Text>
            </View>
            <Text style={styles.xpCardTitle}>Sobriety Milestones</Text>
          </View>
          <Text style={styles.xpCardDescription}>
            Reach major sobriety milestones to unlock big XP rewards that recognize your incredible progress.
          </Text>
        </View>

 
        {/* Pre-level Note */}
        <View style={styles.xpNoteSection}>
          <Text style={styles.xpNoteText}>
            Note: Depending on your sobriety date, you might start at a higher level to recognize your existing progress!
          </Text>
        </View>
      </View>
    </View>
  );

  const renderWelcome = () => (
    <Animated.View style={[styles.stepContainer, {
      opacity: fadeAnim,
    }]}>
      {/* Hero Section with Character */}
      <View style={styles.welcomeHeroContainer}>
        <View style={styles.welcomeCharacterContainer}>
          <LinearGradient
            colors={[colors.primary + '15', colors.secondary + '10', 'transparent']}
            style={styles.welcomeCharacterGradient}
          />
          <Image
            source={require('@/assets/images/Character_PNG.png')}
            style={styles.welcomeCharacterImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.welcomeTitleContainer}>
          <Text style={styles.welcomeTitle}>Meet Sobi 🌟</Text>
          <Text style={styles.welcomeSubtitle}>Your Recovery Companion</Text>
        </View>

        {/* Encouragement moved here */}
        <View style={styles.welcomeEncouragementInline}>
          <Text style={styles.welcomeEncouragementText}>
            You're not alone in this.
          </Text>
        </View>
      </View>

      {/* Simple Message */}
      <View style={styles.welcomeMessageContainer}>
        <Text style={styles.welcomeMainMessage}>
          Ready to start your recovery journey?
        </Text>
      </View>
    </Animated.View>
  );

  const renderSourceStep = () => {
    const sources = [
      { name: 'App Store', icon: 'apple', color: '#000000' },
      { name: 'Facebook', icon: 'facebook', color: '#1877F2' },
      { name: 'Reddit', icon: 'reddit', color: '#FF4500' },
      { name: 'TikTok', icon: 'tiktok', color: '#000000' },
      { name: 'Discord', icon: 'discord', color: '#5865F2' },
      { name: 'Instagram', icon: 'instagram', color: '#E4405F' },
      { name: 'Twitter/X', icon: 'x-twitter', color: '#000000' },
      { name: 'Google', icon: 'google', color: '#4285F4' },
      { name: 'Friend or family', icon: 'users', color: '#F59E0B' },
      { name: 'Other', icon: 'ellipsis', color: '#6B7280' }
    ];

    return (
      <OnboardingStepComponent 
        title="How did you hear about Sobi?"
        
      >
        <OptionsContainer>
          {sources.map((source, index) => (
            <OptionButton
              key={index}
              label={source.name}
              icon={
                <FontAwesome6 
                  name={source.icon as any} 
                  size={20} 
                  color={selectedSource === source.name ? '#FFFFFF' : source.color} 
                />
              }
              isSelected={selectedSource === source.name}
              onPress={() => setSelectedSource(source.name)}
            />
          ))}
        </OptionsContainer>
      </OnboardingStepComponent>
    );
  };

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>What should I call you?</Text>
      <Text style={styles.onboardingSubtitle}>Let's personalize your recovery experience</Text>

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

  const renderSobrietyDateStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>When did your sobriety begin?</Text>

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
        textColor="black"
      />
      </View>
    </View>
  );

  const renderReasonsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>What's your main reason for recovery?</Text>
      <Text style={styles.onboardingSubtitle}>You can add more reasons later</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.reasonInput}
          value={currentReason}
          onChangeText={setCurrentReason}
          placeholder="For example: 'Being present for my family', 'My health', 'My daughter'"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          returnKeyType="done"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
        />
      </View>
    </View>
  );

  const renderSobrietyImportanceStep = () => {
    const importanceLevels = [
      {
        level: 'Extremely important',
        description: 'my top priority',
        emoji: '🔥'
      },
      {
        level: 'Very important',
        description: 'a major focus in my life',
        emoji: '⭐'
      },
      {
        level: 'Important',
        description: 'working hard on it',
        emoji: '💪'
      },
      {
        level: 'Somewhat important',
        description: 'making progress',
        emoji: '🌱'
      }
    ];

    return (
      <OnboardingStepComponent title="How important is sobriety to you right now?">
        <OptionsContainer>
          {importanceLevels.map((item, index) => (
            <OptionButton
              key={index}
              label={item.level}
              description={item.description}
              icon={item.emoji}
              isSelected={sobrietyImportance === `${item.emoji} ${item.level} - ${item.description}`}
              onPress={() => setSobrietyImportance(`${item.emoji} ${item.level} - ${item.description}`)}
            />
          ))}
        </OptionsContainer>
      </OnboardingStepComponent>
    );
  };

  const renderSubstancesStep = () => {
    const commonSubstances = [
      'Alcohol',
      'Nicotine/Tobacco',
      'Cannabis/Marijuana',
      'Cocaine',
      'Prescription drugs',
      'Gambling',
      'Porn',
      'Gaming',
      'Self-harm',
      'Other'
    ];

    return (
      <OnboardingStepComponent title="What are you working on?">
        <SingleSelectOptions
          options={commonSubstances}
          selectedOption={selectedSubstance}
          onSelectionChange={setSelectedSubstance}
        />
      </OnboardingStepComponent>
    );
  };

  const renderSubstanceFrequencyStep = () => {
    const frequencies = [
      'Daily or almost daily',
      'Multiple times per week',
      'Once a week or less',
      'Zero. Currently in recovery'
    ];

    return (
      <OnboardingStepComponent title={`How often do you use ${selectedSubstance.toLowerCase()}?`}>
        <SingleSelectOptions
          options={frequencies}
          selectedOption={substanceFrequency}
          onSelectionChange={setSubstanceFrequency}
        />
      </OnboardingStepComponent>
    );
  };

  const renderTriggersStep = () => {
    const triggers = [
      'Stress or anxiety',
      'Social situations',
      'Loneliness or isolation',
      'Boredom',
      'Certain people or places',
      'Emotional pain or trauma',
      'Work pressure',
      'Financial worries',
      'Relationship problems',
      'Physical pain',
      'I don\'t know yet'
    ];

    return (
      <OnboardingStepComponent 
        title="What are your main triggers?"
        subtitle="Select all situations that apply"
      >
        <MultiSelectOptions
          options={triggers}
          selectedOptions={selectedTriggers}
          onSelectionChange={setSelectedTriggers}
          minSelections={1}
        />
      </OnboardingStepComponent>
    );
  };

  const renderStruggleTimesStep = () => {
    const times = [
      '🌅 Morning (6 AM-12 PM)',
      '🌞 Afternoon (12-4 PM)',
      '🌆 Evening (4-8 PM)',
      '🌙 Night (8 PM-12 AM)',
      '🌃 Late night (12-6 AM)'
    ];

    return (
      <OnboardingStepComponent 
        title="When do you struggle the most?"
        subtitle="We'll check in with you during these times"
      >
        <MultiSelectOptions
          options={times}
          selectedOptions={struggleTimes}
          onSelectionChange={setStruggleTimes}
          minSelections={1}
        />
      </OnboardingStepComponent>
    );
  };

  const renderHardestPartStep = () => {
    const challenges = [
      'Cravings and urges',
      'Breaking old habits',
      'Social pressure',
      'Dealing with emotions',
      'Staying motivated'
    ];

    return (
      <OnboardingStepComponent title="What's been the hardest part for you so far?">
        <SingleSelectOptions
          options={challenges}
          selectedOption={hardestPart}
          onSelectionChange={setHardestPart}
        />
      </OnboardingStepComponent>
    );
  };

  const renderGoalsStep = () => {
    const goals = [
      '🎯 Stay completely sober',
      '💪 Build healthy habits',
      '❤️ Improve my health',
      '👨‍👩‍👧‍👦 Be there for my family',
      '💰 Save money',
      '🧠 Improve mental clarity',
      '🌱 Personal growth'
    ];

    return (
      <OnboardingStepComponent 
        title="What are your recovery goals?"
        subtitle="Select all that apply to you"
      >
        <MultiSelectOptions
          options={goals}
          selectedOptions={selectedGoals}
          onSelectionChange={setSelectedGoals}
          minSelections={1}
        />
      </OnboardingStepComponent>
    );
  };

  const renderEngagementSupportScreen = () => (
    <View style={styles.stepContainer}>
      <View style={styles.engagementHeader}>
        <Text style={styles.engagementTitle}>You're Not Alone 💙</Text>
        <Text style={styles.engagementSubtitle}>Join thousands transforming their lives with Sobi</Text>
      </View>

      <View style={styles.engagementContent}>
        <View style={styles.testimonialsSection}>
          <Animated.View style={[styles.testimonialCard, {
            transform: [{ translateX: testimonial1Anim }],
            opacity: testimonial1Opacity
          }]}>
            <Text style={styles.testimonialText}>
              "Sobi helped me understand my triggers and gave me tools that actually work."
            </Text>
            <Text style={styles.testimonialAuthor}>— Malia, 6 months sober</Text>
          </Animated.View>

          <Animated.View style={[styles.testimonialCard, {
            transform: [{ translateX: testimonial2Anim }],
            opacity: testimonial2Opacity
          }]}>
            <Text style={styles.testimonialText}>
              "The daily check-ins keep me accountable. I finally feel in control."
            </Text>
            <Text style={styles.testimonialAuthor}>— Joseph, 1 year sober</Text>
          </Animated.View>

          <Animated.View style={[styles.testimonialCard, {
            transform: [{ translateX: testimonial3Anim }],
            opacity: testimonial3Opacity
          }]}>
            <Text style={styles.testimonialText}>
              "I thought I had to do this alone. Having Sobi as my companion changed everything. So helpful!"
            </Text>
            <Text style={styles.testimonialAuthor}>— Hugo, 3 months sober</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );

  const renderEngagementReadyScreen = () => (
    <View style={[styles.stepContainer, { justifyContent: 'flex-start', paddingTop: 20 }]}>
      <View style={[styles.engagementHeader, { marginBottom: 0 }]}>
        <Text style={[styles.engagementTitle, { fontSize: 26, marginBottom: 22 }]}>Your personalized recovery plan is ready</Text>
        <Text style={[styles.engagementSubtitle, { fontSize: 15 }]}>Here's what you can expect:</Text>
      </View>

      <View style={styles.engagementContent}>
        <View style={[styles.featuresSection, { marginBottom: 20 }]}>
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>⏰</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Sober Tracker</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Real-time countdown of your sobriety journey with milestones.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>🤖</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>AI Recovery Companion</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Access personalized support and guidance 24/7.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>📝</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Recovery Journaling</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Track your thoughts, feelings, and progress daily.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>✅</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Smart Check-ins</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Get daily support exactly when you need it most.</Text>
            </View>
          </View>
          
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>🧘</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Mindfulness Tools</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Find peace with guided meditation and breathing exercises.</Text>
            </View>
          </View>
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>💝</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Your Why</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Stay motivated with reminders of your personal goals.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>📈</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Progress Tracking</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Celebrate every milestone on your recovery journey.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>🛡️</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Trigger Support</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Get immediate help during your most challenging moments.</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>💰</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Money Saved Tracker</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Watch your savings grow as you stay sober.</Text>
            </View>
          </View>



        </View>

        <View style={styles.readyFooter}>
          <Text style={styles.readyFooterText}>
            and 30+ more features to support your recovery journey! 🌟
          </Text>
        </View>


      </View>
    </View>
  );

  const renderMoneyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>Track your financial recovery 💰</Text>
      <Text style={styles.onboardingSubtitle}>How much did you spend daily?</Text>

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
          keyboardType="decimal-pad"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={canProceedFromStep() ? handleNext : undefined}
        />
        {dailySpending && parseFloat(dailySpending) <= 0 && (
          <Text style={styles.errorText}>Please enter an amount greater than $0</Text>
        )}
      </View>
    </View>
  );

  const renderMoneyProjectionStep = () => {
    const sixMonthSavings = parseFloat(dailySpending || '0') * 180; // 6 months = ~180 days

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>Your Recovery Savings</Text>

        <View style={styles.projectionContent}>
          <View style={styles.heroSavingsCard}>
            <Text style={styles.heroSavingsLabel}>You'll save in 6 months</Text>
            <Text style={styles.heroSavingsAmount}>${sixMonthSavings.toFixed(0)}</Text>
          </View>

          <View>
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

  const renderLoadingPlanScreen = () => {
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>Creating Your Plan ✨</Text>
        <Text style={styles.onboardingSubtitle}>Just a moment while we personalize everything</Text>

        <View style={styles.loadingContent}>
          <Progress.Circle
            size={120}
            indeterminate={false}
            progress={loadingProgress / 100}
            color={colors.primary}
            unfilledColor={colors.border}
            borderWidth={0}
            thickness={10}
            style={styles.loadingSpinner}
          />

          <Text style={styles.loadingText}>{loadingText}</Text>

          <Text style={styles.loadingSubtext}>
            We're tailoring your recovery experience based on your unique needs and goals.
          </Text>
        </View>
      </View>
    );
  };

  const renderMoneyInterestStep = () => {
    const options = [
      "Yes, I'd like to track my savings",
      "No, skip financial tracking"
    ];

    const handleMoneySelection = (selection: string) => {
      setInterestedInMoney(selection === options[0]);
    };

    const currentSelection = interestedInMoney === true ? options[0] : 
                           interestedInMoney === false ? options[1] : '';

    return (
      <OnboardingStepComponent 
        title="Track your financial progress? 💰"
        subtitle="See how much money you save by staying sober"
      >
        <SingleSelectOptions
          options={options}
          selectedOption={currentSelection}
          onSelectionChange={handleMoneySelection}
        />
      </OnboardingStepComponent>
    );
  };

  const renderReviewRequestScreen = () => (
    <View style={styles.stepContainer}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewTitle}>Give us a rating</Text>
        <View style={styles.reviewStarsContainer}>
          <Text style={styles.reviewStarsEmoji}>⭐⭐⭐⭐⭐</Text>
        </View>
        <Text style={styles.reviewSubtitle}>Help us grow and help others find recovery support</Text>
      </View>
      
      <View style={styles.reviewCharacterContainer}>
        <LottieView
          source={require('@/assets/images/getting petted_opt.json')}
          autoPlay
          loop={false}
          style={styles.reviewCharacterLottie}
        />
        
        <View style={styles.reviewBubbleContainer}>
          <View style={styles.reviewBubble}>
            <Text style={styles.reviewCharacterMessage}>
              Your support means everything! A quick rating helps other people find Sobi! 💙
            </Text>
          </View>
          <View style={styles.reviewBubbleTail} />
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
      case OnboardingStep.SOURCE:
        return renderSourceStep();
      case OnboardingStep.SUBSTANCES:
        return renderSubstancesStep();
      case OnboardingStep.SUBSTANCE_FREQUENCY:
        return renderSubstanceFrequencyStep();
      case OnboardingStep.SOBRIETY_DATE:
        return renderSobrietyDateStep();
      case OnboardingStep.TRIGGERS:
        return renderTriggersStep();
      case OnboardingStep.HARDEST_PART:
        return renderHardestPartStep();
      case OnboardingStep.ENGAGEMENT_SUPPORT:
        return renderEngagementSupportScreen();
      case OnboardingStep.GOALS:
        return renderGoalsStep();
      case OnboardingStep.REASONS:
        return renderReasonsStep();
      case OnboardingStep.MONEY_INTEREST:
        return renderMoneyInterestStep();
      case OnboardingStep.MONEY:
        return renderMoneyStep();
      case OnboardingStep.MONEY_PROJECTION:
        return renderMoneyProjectionStep();
      case OnboardingStep.SOBRIETY_IMPORTANCE:
        return renderSobrietyImportanceStep();
      case OnboardingStep.STRUGGLE_TIMES:
        return renderStruggleTimesStep();
      case OnboardingStep.REVIEW_REQUEST:
        return renderReviewRequestScreen();
      case OnboardingStep.XP_EXPLANATION:
        return renderXPExplanationStep();
      case OnboardingStep.AGE:
        return renderAgeStep();
      case OnboardingStep.LOADING_PLAN:
        return renderLoadingPlanScreen();
      case OnboardingStep.ENGAGEMENT_READY:
        return renderEngagementReadyScreen();
      default:
        return renderWelcome();
    }
  };

  // Enhanced "Get Started" button for welcome screen
  const renderWelcomeFooter = () => (
    <View style={styles.welcomeFooter}>
      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Sparkles size={20} color="#FFFFFF" />
        <Text style={styles.getStartedButtonText}>Get Started</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>
      

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          {currentStep > OnboardingStep.WELCOME && renderProgressBar()}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {currentStep === OnboardingStep.WELCOME ? renderWelcomeFooter() : (
          <View style={styles.footer}>
            {/* Centered continue button */}
            {currentStep < OnboardingStep.ENGAGEMENT_READY ? (
              <TouchableOpacity
                style={[styles.getStartedButton, !canProceedFromStep() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!canProceedFromStep()}
              >
                <Text style={styles.getStartedButtonText}>Continue</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : currentStep === OnboardingStep.ENGAGEMENT_READY ? (
              <TouchableOpacity style={styles.getStartedButton} onPress={handleComplete}>
                <Text style={styles.getStartedButtonText}>Get Started</Text>
                <Check size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  headerBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  progressBarContainer: {
    flex: 1,
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
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 30,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardingSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
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

  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  nextButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
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

  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },

  engagementContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },

  engagementHeader: {
    alignItems: 'center',
    maxWidth: 380,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  engagementTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  engagementSubtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  testimonialsSection: {
    width: '100%',
    marginTop: 12,
  },
  testimonialCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  featuresSection: {
    width: '100%',
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  loadingSpinner: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  heroSavingsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
  },
  heroSavingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSavingsAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.success,
    marginBottom: 0,
    letterSpacing: -1,
    textAlign: 'center',
  },
  welcomeHeroContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeCharacterContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  welcomeCharacterImage: {
    width: 140,
    height: 140,
    zIndex: 2,
  },
  welcomeCharacterGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 70,
    zIndex: 1,
  },
  welcomeTitleContainer: {
    alignItems: 'center',
  },
  welcomeMessageContainer: {
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  welcomeMainMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  welcomeEncouragementText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  welcomeFooter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '95%',
  },
  getStartedButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  welcomeEncouragementInline: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  reviewHeader: {
    alignItems: 'center',
    maxWidth: 380,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  reviewTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  reviewStarsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  reviewStarsEmoji: {
    fontSize: 28,
    letterSpacing: 4,
  },
  reviewSubtitle: {
    fontSize: 17,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  readyFooter: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
  },
  readyFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  reviewCharacterContainer: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    position: 'relative',
    minHeight: 120,
   
  },
  reviewCharacterLottie: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  reviewBubbleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  reviewBubble: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewBubbleTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderRightWidth: 0,
    borderBottomWidth: 10,
    borderLeftWidth: 15,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: colors.cardBackground,
    position: 'absolute',
    left: -10,
    top: 15,
    transform: [{rotate: '180deg'}],
  },
  reviewCharacterMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  xpExplanationHeader: {
    alignItems: 'center',
    maxWidth: 380,
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  xpExplanationContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  xpCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  xpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  xpEmoji: {
    fontSize: 24,
    color: colors.text,
  },
  xpCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  xpCardDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  xpMotivationSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  xpMotivationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  xpNoteSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  xpNoteText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 