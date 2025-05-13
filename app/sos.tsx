import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  BackHandler,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Check, Heart, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  FadeIn
} from 'react-native-reanimated';

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
  
  // Provide haptic feedback on state changes if not on web
  useEffect(() => {
    if (Platform.OS !== 'web' && currentState !== BreathingState.READY) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentState]);
  
  // Provide emergency haptic feedback on mount
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);
  
  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });
    
    return () => backHandler.remove();
  }, []);
  
  // Main breathing cycle effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
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
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                  
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
  }, [isActive, currentState, cyclesCompleted]);
  
  // Animation function for the breathing circle using Reanimated
  const animateCircle = (toSize: number, duration: number) => {
    // Skip complex animations on web to avoid potential issues
    if (Platform.OS === 'web') {
      circleSize.value = toSize;
      circleOpacity.value = toSize > 150 ? 0.7 : 0.3;
      return;
    }
    
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
  
  const handleExit = () => {
    // Award XP if they completed at least one cycle
    if (cyclesCompleted > 0) {
      addXP(15); // Award XP for using the SOS feature
    }
    router.back();
  };
  
  const handleCrisisOvercome = () => {
    // Award XP for overcoming the crisis
    addXP(30);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
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
      entering={Platform.OS !== 'web' ? FadeIn.duration(800) : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Stack.Screen 
        options={{
          title: "SOS Support",
          headerShown: false,
        }} 
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleExit}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      {showMotivation ? (
        <ScrollView 
          style={styles.motivationContainer}
          contentContainerStyle={styles.motivationContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.motivationTitle}>You're Doing Great</Text>
          
          <View style={styles.sobrietyCard}>
            <Text style={styles.sobrietyLabel}>Your Sobriety Streak</Text>
            <Text style={styles.sobrietyValue}>{daysSober} days</Text>
            <Text style={styles.sobrietySubtext}>That's an incredible achievement!</Text>
          </View>
          
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>{randomQuote}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Remember Your Reasons for Change</Text>
          
          <View style={styles.reasonsContainer}>
            {reasons.map((reason) => (
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
        </ScrollView>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
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
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  motivationTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  sobrietyCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sobrietyLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 8,
  },
  sobrietyValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  sobrietySubtext: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  quoteCard: {
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  quoteText: {
    fontSize: 18,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  reasonsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  reasonItem: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reasonText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 16,
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
});