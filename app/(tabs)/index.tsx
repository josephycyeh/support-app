import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { Share, X, Sparkles } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import colors from '@/constants/colors';
import { XPProgressBar } from '@/components/XPProgressBar';
import { Companion } from '@/components/Companion';
import { SobrietyTimer } from '@/components/SobrietyTimer';
import { DailyChecklist } from '@/components/DailyChecklist';
import { SOSButton } from '@/components/SOSButton';
import { MoodTracker } from '@/components/MoodTracker';
import { MoodButton } from '@/components/MoodButton';
import { DailyQuote } from '@/components/DailyQuote';
import { MilestoneCard } from '@/components/MilestoneCard';
import { MoneySavedCard } from '@/components/MoneySavedCard';
import { BadgeAchievementModal } from '@/components/BadgeAchievementModal';
import { useMoodStore } from '@/store/moodStore';
import { useBadgeAchievements } from '@/hooks/useBadgeAchievements';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { DemoDataButton } from '@/components/DemoDataButton';

type ModalType = 'level-up' | 'badge' | 'mood-tracker';

export default function HomeScreen() {
  const router = useRouter();
  const { addXP, xpToNextLevel, checkAndAwardMilestones, levelUp, level, setLevelUpComplete } = useSobrietyStore();
  const { getTodaysMood } = useMoodStore();
  const { newAchievements, markAchievementAsShown } = useBadgeAchievements();
  
  const [modalQueue, setModalQueue] = useState<ModalType[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);

  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);
  const [triggerCompanionAnimation, setTriggerCompanionAnimation] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [showAnimationBanner, setShowAnimationBanner] = useState(true);
  
  // REMOVED: Level up modal state is now managed by the queue
  // const [showLevelUpMessage, setShowLevelUpMessage] = useState(false);
  const modalWalkingRef = useRef<LottieView>(null);

  // Check mood status immediately on mount
  useEffect(() => {
    const todaysMood = getTodaysMood();
    const hasLogged = !!todaysMood;
    setHasLoggedMoodToday(hasLogged);
  }, []);

  // Check if animation banner was dismissed
  useEffect(() => {
    const checkBannerStatus = async () => {
      try {
        const dismissed = await AsyncStorage.getItem('animation_banner_dismissed');
        if (dismissed === 'true') {
          setShowAnimationBanner(false);
        }
      } catch (error) {
        console.error('Error checking banner status:', error);
      }
    };
    checkBannerStatus();
  }, []);

  // --- Modal Queue Management ---

  // Add modals to the queue when their conditions are met
  useEffect(() => {
    if (levelUp && !modalQueue.includes('level-up') && activeModal !== 'level-up') {
      setModalQueue(prev => [...prev, 'level-up']);
    }
  }, [levelUp, modalQueue, activeModal]);

  useEffect(() => {
    if (newAchievements.length > 0 && !modalQueue.includes('badge') && activeModal !== 'badge') {
      setModalQueue(prev => [...prev, 'badge']);
    }
  }, [newAchievements, modalQueue, activeModal]);

  // Show the next modal in the queue
  useEffect(() => {
    if (!activeModal && modalQueue.length > 0) {
      setActiveModal(modalQueue[0]);
    }
  }, [modalQueue, activeModal]);


  // Check if mood tracker should be shown on app open
  useFocusEffect(
    React.useCallback(() => {
      // Set screen as focused
      setIsScreenFocused(true);
      
      // Check for milestone achievements immediately
      checkAndAwardMilestones();
      

      const delayTime = 5000;

      const timer = setTimeout(() => {
        const todaysMood = getTodaysMood();
        const hasLogged = !!todaysMood;
        
        if (!hasLogged && !modalQueue.includes('mood-tracker') && activeModal !== 'mood-tracker') {
          setModalQueue(prev => [...prev, 'mood-tracker']);
        }
      }, delayTime);

      return () => {
        // Set screen as not focused when leaving
        setIsScreenFocused(false);
        clearTimeout(timer); // Clear the timeout if the screen loses focus
      };
    }, [activeModal, modalQueue, checkAndAwardMilestones, getTodaysMood])
  );

  const handleModalDismiss = () => {
    if (!activeModal) return;

    const dismissedModal = activeModal;

    // Perform cleanup for the specific modal
    if (dismissedModal === 'level-up') {
      setLevelUpComplete();
    } else if (dismissedModal === 'badge') {
      if (newAchievements.length > 0) {
        markAchievementAsShown(newAchievements[0].key);
      }
    } else if (dismissedModal === 'mood-tracker') {
      const todaysMood = getTodaysMood();
      setHasLoggedMoodToday(!!todaysMood);
    }

    // Set active modal to null and remove it from queue
    setActiveModal(null);
    setModalQueue(prev => prev.slice(1));
  };


  const handleTaskCompleted = () => {
    // Trigger companion animation by incrementing the trigger value
    setTriggerCompanionAnimation(prev => prev + 1);
  };

  const handleSharePress = () => {
    router.push('/share-progress');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCurrentAchievement = () => {
    // Always show the first achievement in the array
    return newAchievements[0] || null;
  };

  const handleDismissAnimationBanner = async () => {
    try {
      await AsyncStorage.setItem('animation_banner_dismissed', 'true');
      setShowAnimationBanner(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error dismissing banner:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <XPProgressBar />
        
        {/* Animation Banner */}
        {showAnimationBanner && (
          <View style={styles.animationBanner}>
            <View style={styles.bannerContent}>
              <Sparkles size={16} color={colors.primary} style={styles.bannerIcon} />
              <Text style={styles.bannerText}>
                Coming soon: Unlock new animations and accessories by leveling up!
              </Text>
              <TouchableOpacity 
                style={styles.dismissButton}
                onPress={handleDismissAnimationBanner}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <Companion animationTrigger={triggerCompanionAnimation} stopAnimations={!isScreenFocused} />
        <SobrietyTimer />
        
        <View style={styles.cardRow}>
          <MoneySavedCard />
          <MilestoneCard />
        </View>
        
        {!hasLoggedMoodToday && (
          <MoodButton onPress={handleModalDismiss} />
        )}
        
        <DailyQuote />
        
        {/* <View style={styles.checklistContainer}>
          <DailyChecklist onTaskCompleted={handleTaskCompleted} />
        </View> */}
        
        {/* Temporary Demo Data Button - Remove after demo */}
        <DemoDataButton />
        
        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleSharePress}
          activeOpacity={0.8}
        >
          <Share size={20} color="#FFFFFF" /> 
          <Text style={styles.shareButtonText}>Share My Progress</Text>
        </TouchableOpacity>
        
        {/* Add some space at the bottom for the floating button */}
        <View style={{ height: 10 }} />
      </ScrollView>
      
      <SOSButton />
      
      <MoodTracker 
        visible={activeModal === 'mood-tracker'}
        onClose={handleModalDismiss}
      />
      
      <BadgeAchievementModal
        isVisible={activeModal === 'badge'}
        achievement={getCurrentAchievement()}
        onDismiss={handleModalDismiss}
      />
      
      {/* Level Up Modal */}
      <Modal
        visible={activeModal === 'level-up'}
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
                You're getting stronger every day!
              </Text>
              <TouchableOpacity
                style={styles.levelUpButton}
                onPress={handleModalDismiss}
              >
                <Text style={styles.levelUpButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 20,
    paddingTop: 20,
    gap: 28,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    height: 140,
    gap: 20,
  },

  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  levelUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  levelUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  animationBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  bannerContent: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});