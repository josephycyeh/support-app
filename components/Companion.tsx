import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { MessageSquare, Wind, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useSobrietyStore } from '@/store/sobrietyStore';

interface CompanionProps {
  animationTrigger?: number;
}

export const Companion = ({ animationTrigger }: CompanionProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLevelUpMessage, setShowLevelUpMessage] = useState(false);
  const lottieRef = useRef<LottieView>(null);
  const modalWalkingRef = useRef<LottieView>(null);
  const router = useRouter();
  const { levelUp, level, setLevelUpComplete } = useSobrietyStore();

  // Check for level up and show level up modal
  useEffect(() => {
    if (levelUp) {
      // Show level up animation
      setShowLevelUpMessage(true);
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Play walking animation in the modal
      if (modalWalkingRef.current) {
        modalWalkingRef.current.reset();
        modalWalkingRef.current.play();
      }
      
      // When animation is done, reset flags
      setTimeout(() => {
        setShowLevelUpMessage(false);
        setLevelUpComplete();
      }, 2000); // Shortened to 2 seconds total
    }
  }, [levelUp, setLevelUpComplete]);

  // Trigger petting animation when a task is completed
  useEffect(() => {
    if (animationTrigger && animationTrigger > 0) {
      // Don't trigger animation if level up modal is showing or already animating
      if (showLevelUpMessage || isAnimating) return;
      
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Play the petting animation
      setIsAnimating(true);
      if (lottieRef.current) {
        lottieRef.current.reset();
        lottieRef.current.play();
        
        // Reset animation state after it completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 1800); // Animation is 43 frames at 24fps ≈ 1800ms
      }
    }
  }, [animationTrigger, showLevelUpMessage, isAnimating]);

  const handleChatPress = () => {
    router.push('/chat');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleBreathingPress = () => {
    router.push('/breathing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCompanionPress = () => {
    // Don't trigger pet animation if level up modal is showing or already animating
    if (showLevelUpMessage || isAnimating) return;
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Play the petting animation
    setIsAnimating(true);
    if (lottieRef.current) {
      lottieRef.current.reset();
      lottieRef.current.play();
      
      // Reset animation state after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1800); // Animation is 43 frames at 24fps ≈ 1800ms
    }
  };

  const handleJournalPress = () => {
    // Navigate to the main journal page to view all entries
    router.push('/journal');
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.companionContainer}>
        <View style={styles.companionRow}>
          {/* Breathing button positioned to the left of companion */}
          <View style={[styles.actionButtonContainer, styles.leftButtonContainer]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleBreathingPress}
            >
              <Wind size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.actionButtonLabel}>Breathing</Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleCompanionPress}
            style={styles.companionTouchable}
          >
            <View style={styles.companionImageContainer}>
              <Image 
                source={require('@/assets/images/Character_PNG.png')}
                style={[
                  styles.companionImage,
                  isAnimating && { opacity: 0 } 
                ]}
                resizeMode="cover"
              />
              <View style={styles.lottieContainer}>
                {/* Petting animation */}
                <LottieView
                  ref={lottieRef}
                  source={require('@/assets/images/getting petted_opt.json')}
                  style={styles.lottieAnimation}
                  loop={false}
                  autoPlay={false}
                  resizeMode="cover"
              />
              </View>
            </View>
          </TouchableOpacity>
          
          {/* Journal button positioned to the right of companion */}
          <View style={[styles.actionButtonContainer, styles.rightButtonContainer]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleJournalPress}
            >
              <BookOpen size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.actionButtonLabel}>Journal</Text>
          </View>
        </View>
      </View>
      
      <Button 
        onPress={handleChatPress}
        variant="secondary"
        style={styles.talkButton}
      >
        Talk with Sushi
      </Button>

      {/* Level Up Modal */}
      <Modal
        visible={showLevelUpMessage}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.levelUpOverlay}>
          <View style={styles.levelUpContainer}>
            <View style={styles.levelUpContent}>
              <Text style={styles.levelUpTitle}>Level Up! 🎉</Text>
              <Text style={styles.levelUpDescription}>
                Congratulations! You've reached level {level}!
              </Text>
              <View style={styles.levelUpImageContainer}>
                {/* Walking animation only appears in the modal */}
                <LottieView
                  ref={modalWalkingRef}
                  source={require('@/assets/images/walking_opt.json')}
                  style={styles.levelUpAnimation}
                  autoPlay
                  loop
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.adventureText}>
                Sushi is going on an adventure!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  companionContainer: {
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    paddingHorizontal: 40,
  },
  companionTouchable: {
    alignItems: 'center',
  },
  companionImageContainer: {
    borderRadius: 60,
    borderWidth: 0,
    width: 120,
    height: 120,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  companionImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  lottieContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  talkButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  leftButtonContainer: {
    position: 'absolute',
    left: 20,
  },
  rightButtonContainer: {
    position: 'absolute',
    right: 20,
  },
  actionButton: {
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 6,
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    textAlign: 'center',
  },
  // Level Up Modal Styles
  levelUpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpContainer: {
    width: '85%',
    maxWidth: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  levelUpContent: {
    backgroundColor: colors.primary,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  levelUpTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  levelUpDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  levelUpImageContainer: {
    width: 150,
    height: 150,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelUpAnimation: {
    width: '100%',
    height: '100%',
  },
  adventureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});