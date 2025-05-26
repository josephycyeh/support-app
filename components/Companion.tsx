import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { MessageSquare, Wind, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useSobrietyStore } from '@/store/sobrietyStore';

export const Companion = () => {
  const [optionsVisible, setOptionsVisible] = useState(false);
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
        // Keep message a bit longer than animation
        setTimeout(() => {
          setShowLevelUpMessage(false);
          setLevelUpComplete();
        }, 1000);
      }, 3000); // Animation is 18 frames at 24fps ≈ 750ms, but we extend it
    }
  }, [levelUp, setLevelUpComplete]);

  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  };

  const handleOptionPress = (option: string) => {
    setOptionsVisible(false);
    
    switch(option) {
      case 'breathing':
        router.push('/breathing');
        break;
      case 'chat':
        router.push('/chat');
        break;
      case 'thought':
        // Navigate to the journal entry screen for new entries
        router.push('/journal-entry');
        break;
    }
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleCompanionPress = () => {
    // Don't trigger pet animation if level up modal is showing
    if (showLevelUpMessage) return;
    
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
    // Navigate to the journal screen instead of showing the modal
    router.push('/journal');
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <View style={styles.companionContainer}>
        <View style={styles.companionRow}>
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
          <TouchableOpacity 
            style={styles.journalButton}
            onPress={handleJournalPress}
          >
            <BookOpen size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Button 
        onPress={toggleOptions}
        variant="secondary"
        style={styles.talkButton}
      >
        Speak with Sushi
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

      {/* Options Modal */}
      <Modal
        visible={optionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsVisible(false)}
        >
          <View style={styles.optionsContainer}>
            <View style={styles.optionsContent}>
              <Text style={styles.optionsTitle}>How can Sushi help?</Text>
              
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => handleOptionPress('thought')}
              >
                <View style={styles.optionIconContainer}>
                  <BookOpen size={22} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Log a thought</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => handleOptionPress('chat')}
              >
                <View style={styles.optionIconContainer}>
                  <MessageSquare size={22} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Speak with Sushi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => handleOptionPress('breathing')}
              >
                <View style={styles.optionIconContainer}>
                  <Wind size={22} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Do a breathing exercise</Text>
              </TouchableOpacity>
              
              <Button
                onPress={() => setOptionsVisible(false)}
                variant="outline"
                size="small"
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>
          </View>
        </TouchableOpacity>
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
  journalButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  // Options Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionsContent: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  optionIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 16,
  },
});