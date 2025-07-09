import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Share } from 'lucide-react-native';
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
import { useSobrietyStore } from '@/store/sobrietyStore';
import { DemoDataButton } from '@/components/DemoDataButton';

export default function HomeScreen() {
  const router = useRouter();
  const { addXP, xpToNextLevel, checkAndAwardMilestones } = useSobrietyStore();
  const { getTodaysMood } = useMoodStore();
  const { newAchievements, markAchievementAsShown } = useBadgeAchievements();
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);
  const [triggerCompanionAnimation, setTriggerCompanionAnimation] = useState(0);
  const [isScreenFocused, setIsScreenFocused] = useState(true);


  // Check mood status immediately on mount to prevent flickering
  useEffect(() => {
    const todaysMood = getTodaysMood();
    const hasLogged = !!todaysMood;
    setHasLoggedMoodToday(hasLogged);
  }, []);

  // Check if mood tracker should be shown on app open
  useFocusEffect(
    React.useCallback(() => {
      // Set screen as focused
      setIsScreenFocused(true);
      
      // Check for milestone achievements immediately
      checkAndAwardMilestones();
      
      // Add a longer delay for users coming from onboarding to avoid modal conflicts
      // Check if user just completed onboarding by looking at app state
      const delayTime = 5000; // 5 seconds delay to allow other modals to dismiss
      
      const timer = setTimeout(() => {
        const todaysMood = getTodaysMood();
        const hasLogged = !!todaysMood;
        
        if (!hasLogged) {
          setShowMoodTracker(true);
        }
      }, delayTime);

      return () => {
        // Set screen as not focused when leaving
        setIsScreenFocused(false);
        clearTimeout(timer);
      };
    }, [])
  );

  const handleMoodTrackerOpen = () => {
    setShowMoodTracker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMoodTrackerClose = () => {
    setShowMoodTracker(false);
    // Update the logged status after closing the modal
    const todaysMood = getTodaysMood();
    const hasLogged = !!todaysMood;
    setHasLoggedMoodToday(hasLogged);
  };

  const handleTaskCompleted = () => {
    // Trigger companion animation by incrementing the trigger value
    setTriggerCompanionAnimation(prev => prev + 1);
  };

  const handleSharePress = () => {
    router.push('/share-progress');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBadgeAchievementDismiss = () => {
    if (newAchievements.length > 0) {
      const currentAchievement = newAchievements[0]; // Always dismiss the first achievement
      if (currentAchievement) {
        markAchievementAsShown(currentAchievement.key);
        // The markAchievementAsShown function will filter out the current achievement
        // If there are more achievements, they will be shown automatically
      }
    }
  };

  const getCurrentAchievement = () => {
    // Always show the first achievement in the array
    return newAchievements[0] || null;
  };

  const shouldShowBadgeModal = () => {
    return isScreenFocused && newAchievements.length > 0 && !showMoodTracker;
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
        <Companion animationTrigger={triggerCompanionAnimation} stopAnimations={!isScreenFocused} />
        <SobrietyTimer />
        
        <View style={styles.cardRow}>
          <MoneySavedCard />
          <MilestoneCard />
        </View>
        
        {!hasLoggedMoodToday && (
          <MoodButton onPress={handleMoodTrackerOpen} />
        )}
        
        <DailyQuote />
        
        {/* <View style={styles.checklistContainer}>
          <DailyChecklist onTaskCompleted={handleTaskCompleted} />
        </View> */}
        
        {/* Temporary Demo Data Button - Remove after demo */}
        {/* <DemoDataButton /> */}
        
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
        visible={showMoodTracker}
        onClose={handleMoodTrackerClose}
      />
      
      <BadgeAchievementModal
        isVisible={shouldShowBadgeModal()}
        achievement={getCurrentAchievement()}
        onDismiss={handleBadgeAchievementDismiss}
      />
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
  checklistContainer: {
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
});