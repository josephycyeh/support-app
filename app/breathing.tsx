import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  BackHandler,
  StatusBar,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useActivityStore } from '@/store/activityStore';
import { Header } from '@/components/ui/Header';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import LottieView from 'lottie-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  FadeIn
} from 'react-native-reanimated';

// Breathing patterns (in seconds) - simplified to just inhale and exhale
const BREATHING_PATTERNS = {
  inhale: 4,
  exhale: 6
};

// States for the breathing cycle - removed REST state
enum BreathingState {
  INHALE = 'Breathe In',
  EXHALE = 'Breathe Out',
  READY = 'Get Ready',
  COMPLETE = 'Complete'
}

// Character encouragement messages for each state
const CHARACTER_MESSAGES = {
  [BreathingState.READY]: "I'll guide you through this breathing exercise. Let's relax together.",
  [BreathingState.INHALE]: "That's it, breathe in slowly and deeply. You're doing great!",
  [BreathingState.EXHALE]: "Now let it all out. Release any tension you're feeling.",
  [BreathingState.COMPLETE]: "Amazing job! I'm so proud of you. You're taking care of yourself."
};

export default function BreathingExerciseScreen() {
  const router = useRouter();
  const { addXP } = useSobrietyStore();
  const { incrementBreathingExercises } = useActivityStore();
  const [currentState, setCurrentState] = useState<BreathingState>(BreathingState.READY);
  const [timer, setTimer] = useState(3); // Start with 3 second countdown
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  
  // Reanimated values for circle animation
  const circleSize = useSharedValue(100);
  const circleOpacity = useSharedValue(0.3);
  
  const handleExit = useCallback(() => {
    // Award XP if they completed at least one cycle
    if (cyclesCompleted > 0 || currentState === BreathingState.COMPLETE) {
      addXP(15); // Award XP for completing the exercise
    }
    router.back();
  }, [cyclesCompleted, currentState, addXP, router]);
  
  // Provide haptic feedback on state changes
  useEffect(() => {
    if (currentState !== BreathingState.READY) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentState]);
  
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
    
    if (isActive) {
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
                animateCircle(220, BREATHING_PATTERNS.inhale * 1000);
                return BREATHING_PATTERNS.inhale;
              
              case BreathingState.INHALE:
                // Go directly to EXHALE
                setCurrentState(BreathingState.EXHALE);
                animateCircle(100, BREATHING_PATTERNS.exhale * 1000);
                return BREATHING_PATTERNS.exhale;
              
              case BreathingState.EXHALE:
                if (cyclesCompleted >= 2) { // Complete after 3 cycles (0, 1, 2)
                  setCurrentState(BreathingState.COMPLETE);
                  setIsActive(false);
                  
                  // Provide success haptic feedback on completion
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  
                  return 0;
                } else {
                  // Go directly back to INHALE (no REST state)
                  setCurrentState(BreathingState.INHALE);
                  setCyclesCompleted(prev => prev + 1);
                  animateCircle(220, BREATHING_PATTERNS.inhale * 1000);
                  return BREATHING_PATTERNS.inhale;
                }
              
              default:
                return prevTimer;
            }
          }
          return prevTimer - 1;
        });
        
        setTotalTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, currentState, cyclesCompleted]);
  
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
  
  const handleComplete = () => {
    // Award XP for completing the full exercise
    addXP(25);
    
    // Increment breathing exercises count
    incrementBreathingExercises();
    
    // Provide success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    router.back();
  };
  
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(800)}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <Stack.Screen 
        options={{
          title: "Breathing Exercise",
          headerShown: false,
        }} 
      />
      
      <Header onBack={handleExit} variant="floating" />
      
      <View style={styles.content}>
        {currentState === BreathingState.COMPLETE ? (
          <View style={styles.completeContainer}>
            <Text style={styles.completeTitle}>Great job!</Text>
            
            <View style={styles.completionMessageContainer}>
              <Text style={styles.completeText}>
                You've completed the breathing exercise.
              </Text>
            </View>
            
            <View style={styles.statsContainer}>
              <Text style={styles.statsLabel}>Time</Text>
              <Text style={styles.statsValue}>
                {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
              </Text>
              
              <View style={styles.statsDivider} />
              
              <Text style={styles.statsLabel}>Cycles</Text>
              <Text style={styles.statsValue}>
                {cyclesCompleted + 1}
              </Text>
            </View>
            
            <Button
              onPress={handleComplete}
              variant="primary"
              style={styles.doneButton}
            >
              Done (+25 XP)
            </Button>
          </View>
        ) : (
          <>
            <Text style={styles.stateText}>{currentState}</Text>
            
            <View style={styles.circleContainer}>
              <Animated.View style={[
                styles.breathingCircle,
                animatedCircleStyle
              ]}>
                <Text style={styles.timerText}>{timer}</Text>
              </Animated.View>
            </View>
            
            <View style={styles.characterContainer}>
              {currentState === BreathingState.INHALE ? (
                <LottieView
                  source={require('@/assets/images/getting petted_opt.json')}
                  style={styles.characterLottie}
                  autoPlay
                  loop={false}
                />
              ) : currentState === BreathingState.EXHALE ? (
                <LottieView
                  source={require('@/assets/images/walking_opt.json')}
                  style={styles.characterLottie}
                  autoPlay
                  loop={false}
                />
              ) : (
                <Image 
                  source={require('@/assets/images/Character_PNG.png')}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              )}
              
              <View style={styles.bubbleContainer}>
                <View style={styles.bubble}>
                  <Text style={styles.characterMessage}>
                    {CHARACTER_MESSAGES[currentState]}
                  </Text>
                </View>
                <View style={styles.bubbleTail} />
              </View>
            </View>
            
            <Text style={styles.instructionText}>
              {currentState === BreathingState.READY && "Prepare to begin..."}
              {currentState === BreathingState.INHALE && "Slowly fill your lungs with air"}
              {currentState === BreathingState.EXHALE && "Release your breath slowly"}
            </Text>
            
            <Text style={styles.cycleText}>
              Cycle {cyclesCompleted + 1} of 3
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
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
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 30,
    marginTop: 20,
    lineHeight: 24,
    minHeight: 48, // Fixed height to prevent layout shifts
  },
  cycleText: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 16,
  },
  characterContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 120,
  },
  characterImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  characterLottie: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  bubbleContainer: {
    flex: 1,
    maxWidth: 220,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: colors.cardBackground,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleTail: {
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
  characterMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  completeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
  },
  completeTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
  },
  completionMessageContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 300,
  },
  completeText: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 250,
  },
  statsLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statsDivider: {
    width: '80%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  doneButton: {
    marginTop: 24,
    minWidth: 220,
  },
});