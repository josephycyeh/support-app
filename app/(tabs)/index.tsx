import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import colors from '@/constants/colors';
import { XPProgressBar } from '@/components/XPProgressBar';
import { Companion } from '@/components/Companion';
import { SobrietyTimer } from '@/components/SobrietyTimer';
import { DailyChecklist } from '@/components/DailyChecklist';
import { SOSButton } from '@/components/SOSButton';
import { MoodTracker } from '@/components/MoodTracker';
import { MoodButton } from '@/components/MoodButton';
import { useMoodStore } from '@/store/moodStore';
import * as Haptics from 'expo-haptics';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { DemoDataButton } from '@/components/DemoDataButton';

export default function HomeScreen() {
  const router = useRouter();
  const { addXP, xpToNextLevel, checkAndAwardMilestones } = useSobrietyStore();
  const { checkHasLoggedToday } = useMoodStore();
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [hasLoggedMoodToday, setHasLoggedMoodToday] = useState(false);
  const [triggerCompanionAnimation, setTriggerCompanionAnimation] = useState(0);

  // Check mood status immediately on mount to prevent flickering
  useEffect(() => {
    const hasLogged = checkHasLoggedToday();
    setHasLoggedMoodToday(hasLogged);
  }, []);

  // Check if mood tracker should be shown on app open
  useFocusEffect(
    React.useCallback(() => {
      // Check for milestone achievements immediately
      checkAndAwardMilestones();
      
      // Add a delay only for the auto-popup modal, not for checking mood status
      const timer = setTimeout(() => {
        const hasLogged = checkHasLoggedToday();
        
        if (!hasLogged) {
          setShowMoodTracker(true);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }, [])
  );

  const handleMoodTrackerOpen = () => {
    setShowMoodTracker(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMoodTrackerClose = () => {
    setShowMoodTracker(false);
    // Update the logged status after closing the modal
    const hasLogged = checkHasLoggedToday();
    setHasLoggedMoodToday(hasLogged);
  };

  const handleTaskCompleted = () => {
    // Trigger companion animation by incrementing the trigger value
    setTriggerCompanionAnimation(prev => prev + 1);
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
        <Companion animationTrigger={triggerCompanionAnimation} />
        <SobrietyTimer />
        
        {!hasLoggedMoodToday && (
          <MoodButton onPress={handleMoodTrackerOpen} />
        )}
        
        <DailyChecklist onTaskCompleted={handleTaskCompleted} />
        
        {/* Temporary Demo Data Button - Remove after demo */}
        <DemoDataButton />
        
        {/* Add some space at the bottom for the floating button */}
        <View style={{ height: 50 }} />
      </ScrollView>
      
      <SOSButton />
      
      <MoodTracker 
        visible={showMoodTracker}
        onClose={handleMoodTrackerClose}
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
    padding: 16,
    paddingTop: 12,
  },
});