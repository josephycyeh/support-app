import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  BackHandler,
  StatusBar,
  Animated as RNAnimated
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Check, Heart, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { Header } from '@/components/ui/Header';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { useActivityStore } from '@/store/activityStore';

// Breathing pattern for crisis moments (simplified to just inhale and exhale)
const BREATHING_PATTERN = {
  inhale: 4,
  exhale: 6
};

// States for the breathing cycle - removed REST state
enum BreathingState {
  INHALE = 'Breathe In',
  EXHALE = 'Breathe Out',
  READY = 'Get Ready',
}

// Add affirmations phase
enum SOSPhase {
  AFFIRMATIONS = 'affirmations',
  BREATHING = 'breathing'
}

// Affirmations for immediate relief
const AFFIRMATIONS = [
  "This craving is temporary, but your strength is permanent",
  "You've survived every difficult moment so far",
  "Your recovery matters more than this feeling",
  "Each breath you take is a victory", 
  "You are worthy of the life you're building",
  "This moment will pass, your progress won't",
  "Your future self is cheering you on right now"
];

// Motivational quotes and reminders
const MOTIVATIONAL_QUOTES = [
  "This craving will pass. You are stronger than you think.",
  "Remember why you started this journey.",
  "Every moment of resistance builds your strength.",
  "You've already come so far. Keep going.",
  "Your future self will thank you for staying strong right now.",
  "This difficult moment is temporary, but your progress is lasting.",
  "Focus on how good you'll feel tomorrow having overcome this challenge.",
  "You are breaking free from old patterns with every choice you make.",
  "Your health and wellbeing are worth this struggle.",
  "You deserve the freedom that comes with sobriety."
];

export default function SOSScreen() {
  const router = useRouter();
  const { addXP, startDate } = useSobrietyStore();
  const { reasons } = useReasonsStore();
  const { incrementCravingsOvercome } = useActivityStore();
  const [currentPhase, setCurrentPhase] = useState<SOSPhase>(SOSPhase.AFFIRMATIONS);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);
  const [affirmationOpacity] = useState(new RNAnimated.Value(0));
  const [affirmationTimer, setAffirmationTimer] = useState(10); // 10 seconds total
  const [currentState, setCurrentState] = useState<BreathingState>(BreathingState.READY);
  const [timer, setTimer] = useState(3); // Start with 3 second countdown
  const [isActive, setIsActive] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  
  // Reanimated values for circle animation
  const circleSize = useSharedValue(100);
  const circleOpacity = useSharedValue(0.3);
  
  // Get a random motivational quote
  const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  
  // Calculate days sober for motivation
  const daysSober = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  
  const handleExit = useCallback(() => {
    // Award XP if they completed at least one cycle
    if (cyclesCompleted > 0) {
      addXP(15); // Award XP for using the SOS feature
    }
    router.back();
  }, [cyclesCompleted, addXP, router]);
  
  // Provide haptic feedback on state changes
  useEffect(() => {
    if (currentState !== BreathingState.READY) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentState]);
  
  // Provide emergency haptic feedback on mount
  useEffect(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);
  
  // Affirmations effect - simplified: cycle through 3 affirmations over 10 seconds
  useEffect(() => {
    if (currentPhase === SOSPhase.AFFIRMATIONS) {
      let affirmationCount = 0;
      
      // Start with first affirmation fading in
      RNAnimated.timing(affirmationOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Change affirmations every ~3 seconds
      const affirmationInterval = setInterval(() => {
        affirmationCount++;
        
        if (affirmationCount < 4) {
          // Fade out and change to next affirmation
          RNAnimated.timing(affirmationOpacity, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }).start(() => {
            setCurrentAffirmationIndex(prev => (prev + 1) % AFFIRMATIONS.length);
            
            RNAnimated.timing(affirmationOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }).start();
          });
        }
      }, 2500);

      // Transition to breathing after 10 seconds
      const transitionTimer = setTimeout(() => {
        setCurrentPhase(SOSPhase.BREATHING);
        setIsActive(true);
        setTimer(3);
        setCurrentState(BreathingState.READY);
      }, 10000);

      // Main timer countdown for display
      const timerInterval = setInterval(() => {
        setAffirmationTimer(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => {
        clearInterval(affirmationInterval);
        clearInterval(timerInterval);
        clearTimeout(transitionTimer);
      };
    }
  }, [currentPhase, affirmationOpacity]);
  
  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });
    
    return () => backHandler.remove();
  }, [handleExit]);
  
  // Provide countdown haptic feedback
  useEffect(() => {
    if (isActive && timer > 0 && timer <= 3) {
      // Provide light haptic feedback for countdown
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [timer, isActive]);
  
  // Main breathing cycle effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && currentPhase === SOSPhase.BREATHING) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          // Provide haptic feedback for last 3 seconds of each phase
          if (prevTimer <= 3 && prevTimer > 0) {
            Haptics.impactAsync(
              prevTimer === 1 
                ? Haptics.ImpactFeedbackStyle.Medium 
                : Haptics.ImpactFeedbackStyle.Light
            );
          }
          
          if (prevTimer <= 1) {
            // Move to next state when timer reaches 0
            switch (currentState) {
              case BreathingState.READY:
                setCurrentState(BreathingState.INHALE);
                animateCircle(220, BREATHING_PATTERN.inhale * 1000);
                return BREATHING_PATTERN.inhale;
              
              case BreathingState.INHALE:
                // Go directly to EXHALE
                setCurrentState(BreathingState.EXHALE);
                animateCircle(100, BREATHING_PATTERN.exhale * 1000);
                return BREATHING_PATTERN.exhale;
              
              case BreathingState.EXHALE:
                // After 3 cycles, pause breathing and show motivation
                if (cyclesCompleted >= 2) {
                  setIsActive(false);
                  setShowMotivation(true);
                  
                  // Provide success haptic feedback
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  
                  return 0;
                }
                
                // Go directly back to INHALE (no REST state)
                setCurrentState(BreathingState.INHALE);
                setCyclesCompleted(prev => prev + 1);
                animateCircle(220, BREATHING_PATTERN.inhale * 1000);
                return BREATHING_PATTERN.inhale;
              
              default:
                return prevTimer;
            }
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentState, cyclesCompleted, currentPhase]);
  
  // Animation function for the breathing circle using Reanimated
  const animateCircle = (toSize: number, duration: number) => {
    // Use withTiming for smooth animations
    circleSize.value = withTiming(toSize, {
      duration: duration,
      easing: Easing.inOut(Easing.ease),
    });
    
    circleOpacity.value = withTiming(toSize > 150 ? 0.7 : 0.3, {
      duration: duration,
      easing: Easing.inOut(Easing.ease),
    });
  };
  
  // Animated styles for the breathing circle
  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      width: circleSize.value,
      height: circleSize.value,
      opacity: circleOpacity.value,
      borderRadius: circleSize.value / 2,
    };
  });
  
  const handleCrisisOvercome = () => {
    // Award XP for overcoming the crisis
    addXP(30);
    
    // Increment cravings overcome count
    incrementCravingsOvercome();
    
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    router.back();
  };
  
  const handleContinueBreathing = () => {
    // Reset to continue breathing
    setShowMotivation(false);
    setCyclesCompleted(0);
    setCurrentState(BreathingState.INHALE);
    setIsActive(true);
    animateCircle(220, BREATHING_PATTERN.inhale * 1000);
    setTimer(BREATHING_PATTERN.inhale);
  };
  
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(800)}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Stack.Screen 
        options={{
          title: "Crisis Support",
          headerShown: false,
        }} 
      />
      
      <Header onBack={handleExit} variant="floating" />
      
      {currentPhase === SOSPhase.AFFIRMATIONS ? (
        <View style={styles.affirmationsContainer}>
          <Text style={styles.affirmationsTitle}>Take a Deep Breath</Text>
          
          <View style={styles.affirmationWrapper}>
            <RNAnimated.Text 
              style={[
                styles.affirmationText,
                { opacity: affirmationOpacity }
              ]}
            >
              {AFFIRMATIONS[currentAffirmationIndex]}
            </RNAnimated.Text>
          </View>
          
          <Text style={styles.affirmationSubtext}>
            Breathing exercises in {affirmationTimer} seconds
          </Text>
        </View>
      ) : showMotivation ? (
        <View 
          style={styles.motivationContainer}
        >
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>You're Doing Great</Text>
            
            <View style={styles.sobrietyCard}>
              <Text style={styles.sobrietyLabel}>Your Sobriety Streak</Text>
              <Text style={styles.sobrietyValue}>{daysSober} days</Text>
              <Text style={styles.sobrietySubtext}>That's an incredible achievement!</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Remember Your Reasons for Change</Text>
            
            <View style={styles.reasonsContainer}>
              {reasons.slice(0, 2).map((reason) => (
                <View key={reason.id} style={styles.reasonItem}>
                <View style={styles.reasonIcon}>
                  <Heart size={20} color="#fff" />
                  </View>
                  <Text style={styles.reasonText}>{reason.text}</Text>
                </View>
              ))}
              
              <View style={styles.reasonItem}>
                <View style={styles.reasonIcon}>
                  <Star size={20} color="#fff" />
                </View>
                <Text style={styles.reasonText}>
                  You've already overcome {daysSober} days of challenges. This is just one more.
                </Text>
              </View>
            </View>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.overcomeButton}
                onPress={handleCrisisOvercome}
              >
                <Check size={20} color="#fff" />
                <Text style={styles.overcomeButtonText}>I've Overcome This (+30 XP)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinueBreathing}
              >
                <Text style={styles.continueButtonText}>Continue Breathing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.breathingContainer}>
          <Text style={styles.stateText}>{currentState}</Text>
          
          <View style={styles.circleContainer}>
            <Animated.View style={[
              styles.breathingCircle,
              animatedCircleStyle
            ]}>
              <Text style={styles.timerText}>{timer}</Text>
            </Animated.View>
          </View>
          
          <Text style={styles.instructionText}>
            {currentState === BreathingState.READY && "Take a moment to center yourself..."}
            {currentState === BreathingState.INHALE && "Slowly fill your lungs with air"}
            {currentState === BreathingState.EXHALE && "Release your breath slowly"}
          </Text>
          
          <Text style={styles.supportText}>
            This craving will pass. Stay with your breath.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 40,
    textAlign: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
    width: 220, // Fixed width container to prevent layout shifts
    height: 220, // Fixed height container to prevent layout shifts
  },
  breathingCircle: {
    position: 'absolute',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.cardBackground,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
    lineHeight: 28,
    minHeight: 56, // Fixed height to prevent layout shifts
  },
  supportText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  // Motivation styles
  motivationContainer: {
    flex: 1,
    marginTop: 60,
  },
  motivationContent: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  motivationTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sobrietyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sobrietyLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 6,
  },
  sobrietyValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  sobrietySubtext: {
    fontSize: 12,
    color: colors.text,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 12,
  },
  overcomeButton: {
    backgroundColor: colors.success,
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  overcomeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  // Affirmations styles
  affirmationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 60,
  },
  affirmationsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 60,
    textAlign: 'center',
  },
  affirmationWrapper: {
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  affirmationText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 36,
  },
  affirmationSubtext: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 10,
  },
});