import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Heart, ArrowRight, ArrowLeft, Check, Sparkles, Star } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useMoneySavedStore } from '@/store/moneySavedStore';
import { MoneyProjectionChart } from '@/components/MoneyProjectionChart';
import * as Haptics from 'expo-haptics';

enum OnboardingStep {
  WELCOME = 0,             
  NAME = 1,                  
  SUBSTANCES = 2,           
  SUBSTANCE_FREQUENCY = 3,   
  SOBRIETY_DATE = 4,        
  TRIGGERS = 5,            
  HARDEST_PART = 6,      
  ENGAGEMENT_SUPPORT = 7,    // "You're not alone" engagement screen
  GOALS = 8,   
  SOBRIETY_IMPORTANCE = 9, 
  REASONS = 10,             
  MONEY_INTEREST = 11,       // Ask if they want to track money             
  MONEY = 12,                
  MONEY_PROJECTION = 13,    
  STRUGGLE_TIMES = 14,    
  LOADING_PLAN = 15,         // Loading screen - tailoring their plan
  REVIEW_REQUEST = 16,       // Ask for app store review
  ENGAGEMENT_READY = 17      // "Ready to begin" engagement screen - final step               
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { setName, setStartDate, completeOnboarding } = useSobrietyStore();
  const { addReason } = useReasonsStore();
  const { setDailySpending } = useMoneySavedStore();
  
  const [currentStep, setCurrentStep] = useState(OnboardingStep.WELCOME);
  const [userName, setUserName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date());
  const [currentReason, setCurrentReason] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);
  const [dailySpending, setDailySpendingInput] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [sobrietyImportance, setSobrietyImportance] = useState('');
  const [selectedSubstance, setSelectedSubstance] = useState('');
  const [substanceFrequency, setSubstanceFrequency] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [struggleTimes, setStruggleTimes] = useState<string[]>([]);
  const [hardestPart, setHardestPart] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing your responses...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [interestedInMoney, setInterestedInMoney] = useState<boolean | null>(null);

  // Animation values for welcome screen
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Animation values for engagement screen testimonials
  const [testimonial1Anim] = useState(new Animated.Value(-30));
  const [testimonial2Anim] = useState(new Animated.Value(30));
  const [testimonial3Anim] = useState(new Animated.Value(-30));
  const [testimonial1Opacity] = useState(new Animated.Value(0));
  const [testimonial2Opacity] = useState(new Animated.Value(0));
  const [testimonial3Opacity] = useState(new Animated.Value(0));

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
      
      const loadingSteps = [
        { text: 'Analyzing your responses...', progress: 12, duration: 2500 },
        { text: 'Processing your goals...', progress: 25, duration: 2000 },
        { text: 'Understanding your recovery journey...', progress: 45, duration: 3000 },
        { text: 'Identifying your support needs...', progress: 65, duration: 2500 },
        { text: 'Customizing your experience...', progress: 80, duration: 3500 },
        { text: 'Building your recovery toolkit...', progress: 90, duration: 2000 },
        { text: 'Finalizing personalization...', progress: 95, duration: 1800 },
        { text: 'Ready to begin your journey!', progress: 100, duration: 1000 }
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
    
    // Save data immediately when moving to next step
    switch (currentStep) {
      case OnboardingStep.NAME:
        if (userName.trim()) {
          setName(userName.trim());
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
        return reasons.length > 0;
      case OnboardingStep.MONEY_INTEREST:
        return interestedInMoney !== null;
      case OnboardingStep.MONEY:
        return dailySpending.trim().length > 0 && parseFloat(dailySpending) >= 0;
      case OnboardingStep.MONEY_PROJECTION:
        return true;
      case OnboardingStep.SOBRIETY_IMPORTANCE:
        return sobrietyImportance.trim().length > 0;
      case OnboardingStep.STRUGGLE_TIMES:
        return struggleTimes.length > 0;
      case OnboardingStep.LOADING_PLAN:
        return !isLoading;
      case OnboardingStep.REVIEW_REQUEST:
        return true;
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
    );
  };

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
            ✨ You're not alone in this.
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
        />
      </View>
    </View>
  );

  const renderReasonsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>Why did you choose recovery?</Text>
      <Text style={styles.onboardingSubtitle}>Your reasons will help keep you motivated during challenges</Text>
      
      <View style={styles.reasonsInputContainer}>
        <TextInput
          style={styles.reasonInput}
          value={currentReason}
          onChangeText={setCurrentReason}
          placeholder="For example: 'Being present for my family', 'My daughter'"
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
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>How important is sobriety to you right now?</Text>
        
        <View style={styles.optionsContainer}>
          {importanceLevels.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButtonWithIcon,
                sobrietyImportance === `${item.emoji} ${item.level} - ${item.description}` && styles.optionButtonWithIconSelected
              ]}
              onPress={() => {
                setSobrietyImportance(`${item.emoji} ${item.level} - ${item.description}`);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => handleNext(), 500);
              }}
            >
              <View style={styles.optionContentWithIcon}>
                <Text style={styles.optionEmoji}>{item.emoji}</Text>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionTitle,
                    sobrietyImportance === `${item.emoji} ${item.level} - ${item.description}` && styles.optionTitleSelected
                  ]}>
                    {item.level}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    sobrietyImportance === `${item.emoji} ${item.level} - ${item.description}` && styles.optionDescriptionSelected
                  ]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
      'Social media/Internet',
      'Shopping',
      'Food/Eating',
      'Caffeine',
      'Gaming',
      'Other'
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>What are you working on?</Text>
        
        <View style={styles.optionsContainer}>
          {commonSubstances.map((substance, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedSubstance === substance && styles.optionButtonSelected
              ]}
              onPress={() => {
                setSelectedSubstance(substance);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => handleNext(), 500);
              }}
            >
              <Text style={[
                styles.optionText,
                selectedSubstance === substance && styles.optionTextSelected
              ]}>
                {substance}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSubstanceFrequencyStep = () => {
    const frequencies = [
      'Daily',
      'Several times a week',
      'Weekly',
      'A few times a month',
      'Monthly or less'
    ];

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>How often do you use {selectedSubstance.toLowerCase()}?</Text>
        
        <View style={styles.optionsContainer}>
          {frequencies.map((frequency, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                substanceFrequency === frequency && styles.optionButtonSelected
              ]}
              onPress={() => {
                setSubstanceFrequency(frequency);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => handleNext(), 500);
              }}
            >
              <Text style={[
                styles.optionText,
                substanceFrequency === frequency && styles.optionTextSelected
              ]}>
                {frequency}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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

    const toggleTrigger = (trigger: string) => {
      if (selectedTriggers.includes(trigger)) {
        setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
      } else {
        setSelectedTriggers([...selectedTriggers, trigger]);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>What are your main triggers?</Text>
        <Text style={styles.onboardingSubtitle}>Select all situations that commonly trigger you</Text>
        
        <View style={styles.optionsContainer}>
          {triggers.map((trigger, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedTriggers.includes(trigger) && styles.optionButtonSelected
              ]}
              onPress={() => toggleTrigger(trigger)}
            >
              <Text style={[
                styles.optionText,
                selectedTriggers.includes(trigger) && styles.optionTextSelected
              ]}>
                {trigger}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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

    const toggleTime = (time: string) => {
      if (struggleTimes.includes(time)) {
        setStruggleTimes(struggleTimes.filter(t => t !== time));
      } else {
        setStruggleTimes([...struggleTimes, time]);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>When do you struggle the most?</Text>
        <Text style={styles.onboardingSubtitle}>We'll check in with you during these times</Text>
        
        <View style={styles.optionsContainer}>
          {times.map((time, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                struggleTimes.includes(time) && styles.optionButtonSelected
              ]}
              onPress={() => toggleTime(time)}
            >
              <Text style={[
                styles.optionText,
                struggleTimes.includes(time) && styles.optionTextSelected
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>What's been the hardest part for you so far?</Text>
        
        <View style={styles.optionsContainer}>
          {challenges.map((challenge, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                hardestPart === challenge && styles.optionButtonSelected
              ]}
              onPress={() => {
                setHardestPart(challenge);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTimeout(() => handleNext(), 500);
              }}
            >
              <Text style={[
                styles.optionText,
                hardestPart === challenge && styles.optionTextSelected
              ]}>
                {challenge}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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

    const toggleGoal = (goal: string) => {
      if (selectedGoals.includes(goal)) {
        setSelectedGoals(selectedGoals.filter(g => g !== goal));
      } else {
        setSelectedGoals([...selectedGoals, goal]);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View style={styles.stepContainer}>
        <Text style={styles.onboardingTitle}>What are your recovery goals?</Text>
        <Text style={styles.onboardingSubtitle}>Select all that apply to you</Text>
        
        <View style={styles.optionsContainer}>
          {goals.map((goal, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedGoals.includes(goal) && styles.optionButtonSelected
              ]}
              onPress={() => toggleGoal(goal)}
            >
              <Text style={[
                styles.optionText,
                selectedGoals.includes(goal) && styles.optionTextSelected
              ]}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
            <Text style={styles.testimonialAuthor}>— Sarah, 6 months sober</Text>
          </Animated.View>
          
          <Animated.View style={[styles.testimonialCard, {
            transform: [{ translateX: testimonial2Anim }],
            opacity: testimonial2Opacity
          }]}>
            <Text style={styles.testimonialText}>
              "The daily check-ins keep me accountable. I finally feel in control."
            </Text>
            <Text style={styles.testimonialAuthor}>— Mike, 1 year sober</Text>
          </Animated.View>

          <Animated.View style={[styles.testimonialCard, {
            transform: [{ translateX: testimonial3Anim }],
            opacity: testimonial3Opacity
          }]}>
            <Text style={styles.testimonialText}>
              "I thought I had to do this alone. Having Sobi as my companion changed everything."
            </Text>
            <Text style={styles.testimonialAuthor}>— Alex, 3 months sober</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );

  const renderEngagementReadyScreen = () => (
    <View style={[styles.stepContainer, { justifyContent: 'flex-start', paddingTop: 20 }]}>
      <View style={[styles.engagementHeader, { marginBottom: 20 }]}>
        <Text style={[styles.engagementTitle, { fontSize: 26, marginBottom: 8 }]}>You're Ready! 🚀</Text>
        <Text style={[styles.engagementSubtitle, { fontSize: 15 }]}>Your personalized recovery plan is ready</Text>
      </View>
      
      <View style={styles.engagementContent}>
        <Text style={[styles.engagementDescription, { fontSize: 15, marginBottom: 20, lineHeight: 22 }]}>
          Here's what you can expect:
        </Text>
        
        <View style={[styles.featuresSection, { marginBottom: 20 }]}>
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>✅</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Smart Check-ins</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Daily support when you need it most</Text>
            </View>
          </View>
          
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>💝</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Your Why</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Motivation based on your goals</Text>
            </View>
          </View>
          
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>📈</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Progress Tracking</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Celebrate every milestone</Text>
            </View>
          </View>
          
          <View style={[styles.featureCard, { padding: 14, marginBottom: 10 }]}>
            <View style={[styles.featureIconContainer, { backgroundColor: 'transparent' }]}>
              <Text style={{ fontSize: 24 }}>🛡️</Text>
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={[styles.featureTitle, { fontSize: 15 }]}>Trigger Support</Text>
              <Text style={[styles.featureDescription, { fontSize: 13, lineHeight: 18 }]}>Help during challenging times</Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.readyBox, { padding: 16 }]}>
          <Text style={[styles.readyText, { fontSize: 15, lineHeight: 22 }]}>
            Your journey starts now. Let's do this! 💪
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMoneyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>Track your financial recovery 💰</Text>
      <Text style={styles.onboardingSubtitle}>How much did you spend daily on substances?</Text>
      
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
        {dailySpending && parseFloat(dailySpending) < 0 && (
          <Text style={styles.errorText}>Please enter a valid amount</Text>
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

  const renderMoneyInterestStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.onboardingTitle}>Track your financial progress? 💰</Text>
      <Text style={styles.onboardingSubtitle}>See how much money you save by staying sober</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            interestedInMoney === true && styles.optionButtonSelected
          ]}
          onPress={() => {
            setInterestedInMoney(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(() => {
              setCurrentStep(OnboardingStep.MONEY);
            }, 500);
          }}
        >
          <Text style={[
            styles.optionText,
            interestedInMoney === true && styles.optionTextSelected
          ]}>
            Yes, I'd like to track my savings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            interestedInMoney === false && styles.optionButtonSelected
          ]}
          onPress={() => {
            setInterestedInMoney(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTimeout(() => {
              setCurrentStep(OnboardingStep.STRUGGLE_TIMES);
            }, 500);
          }}
        >
          <Text style={[
            styles.optionText,
            interestedInMoney === false && styles.optionTextSelected
          ]}>
            No, skip financial tracking
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewRequestScreen = () => (
    <View style={styles.stepContainer}>
      <View style={styles.engagementHeader}>
        <Text style={styles.engagementTitle}>Help Others Find Hope 💙</Text>
        <Text style={styles.engagementSubtitle}>Your journey can inspire someone else to start theirs</Text>
      </View>
      
      <View style={styles.engagementContent}>
        <Text style={styles.reviewSimpleText}>
          Thank you for choosing Sobi as your recovery companion. 
          {'\n\n'}
          Together, we're building a supportive community for everyone on their recovery journey.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case OnboardingStep.WELCOME:
        return renderWelcome();
      case OnboardingStep.NAME:
        return renderNameStep();
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
      case OnboardingStep.LOADING_PLAN:
        return renderLoadingPlanScreen();
      case OnboardingStep.REVIEW_REQUEST:
        return renderReviewRequestScreen();
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
            {currentStep > OnboardingStep.WELCOME && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <ArrowLeft size={20} color={colors.textLight} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            <View style={styles.spacer} />
            
            {/* Hide Continue button for auto-advancing screens */}
            {currentStep !== OnboardingStep.SUBSTANCES &&
             currentStep !== OnboardingStep.SUBSTANCE_FREQUENCY &&
             currentStep !== OnboardingStep.SOBRIETY_IMPORTANCE &&
             currentStep !== OnboardingStep.HARDEST_PART &&
             currentStep !== OnboardingStep.MONEY_INTEREST &&
             currentStep !== OnboardingStep.LOADING_PLAN &&
             currentStep < OnboardingStep.ENGAGEMENT_READY ? (
              <TouchableOpacity
                style={[styles.nextButton, !canProceedFromStep() && styles.nextButtonDisabled]}
                onPress={handleNext}
                disabled={!canProceedFromStep()}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : currentStep === OnboardingStep.ENGAGEMENT_READY ? (
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <Text style={styles.completeButtonText}>Get Started</Text>
                <Check size={20} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
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
    paddingHorizontal: 0,
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
    paddingTop: 20,
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
  onboardingSubtitleMuted: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
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
    backgroundColor: colors.primary,
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
  optionsContainer: {
    width: '100%',
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
  chartPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  optionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'left',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  engagementContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  engagementDescription: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 12,
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
  successMetrics: {
    width: '100%',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 6,
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 85,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  metricEmoji: {
    fontSize: 16,
    marginBottom: 6,
    opacity: 0.8,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: 0.2,
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
    marginBottom: 8,
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
  readyBox: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  readyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
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
    color: colors.primary,
    marginBottom: 0,
    letterSpacing: -1,
    textAlign: 'center',
  },
  welcomeHeroContainer: {
    alignItems: 'center',
    marginBottom: 0,
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
  welcomeSecondaryMessage: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  welcomeFeatureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  welcomeFeatureCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeFeatureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeFeatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeFeatureDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
  },
  welcomeEncouragementContainer: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginHorizontal: 0,
    width: '100%',
    maxWidth: 320,
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
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '80%',
    maxWidth: 280,
  },
  getStartedButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  welcomeEncouragementInline: {
    alignItems: 'center',
    padding: 16,
  },
  // Option styles with icons (for importance step)
  optionButtonWithIcon: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  optionButtonWithIconSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionContentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  reviewSimpleText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 