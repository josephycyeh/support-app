import { useEffect, useState } from 'react';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useChatStore } from '@/store/chatStore';
import { useMoodStore } from '@/store/moodStore';
import { useJournalStore } from '@/store/journalStore';
import { useActivityStore } from '@/store/activityStore';
import { useBadgeAchievementStore } from '@/store/badgeAchievementStore';
import { calculateDaysSober } from '@/utils/dateUtils';

export interface BadgeAchievement {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const useBadgeAchievements = () => {
  const [newAchievements, setNewAchievements] = useState<BadgeAchievement[]>([]);
  
  // Store hooks
  const { startDate, level, xp, dailyXP } = useSobrietyStore();
  const { breathingExercises, journalEntries, cravingsOvercome, sharesCount } = useActivityStore();
  const { reasons } = useReasonsStore();
  const { messages } = useChatStore();
  const { entries: moodEntries } = useMoodStore();
  const { entries: journalEntryStore } = useJournalStore();
  const { markBadgeAsShown, hasBadgeBeenShown, hasHydrated } = useBadgeAchievementStore();
  
  // Calculate days sober and total XP
  const daysSober = calculateDaysSober(startDate);
  const totalXPEarned = Object.values(dailyXP).reduce((sum, xp) => sum + xp, 0);
  
  // Badge definitions with their achievement conditions
  const badgeDefinitions = {
    // Getting Started Badges
    motivator: {
      title: 'Motivator',
      description: 'Add 3 reasons for recovery',
      icon: 'heart',
      color: '#E91E63',
      isAchieved: () => (reasons?.length || 0) >= 3,
    },
    helloSobi: {
      title: 'Hello Sobi',
      description: 'First chat with Sobi',
      icon: 'message-square',
      color: '#11CDEF',
      isAchieved: () => messages?.some(msg => msg.role === 'user') || false,
    },
    moodTracker: {
      title: 'Mood Tracker',
      description: 'Log first mood',
      icon: 'smile',
      color: '#66BB6A',
      isAchieved: () => (moodEntries?.length || 0) > 0,
    },
    firstStory: {
      title: 'First Story',
      description: 'Write first journal entry',
      icon: 'book-open',
      color: '#FB6340',
      isAchieved: () => (journalEntryStore?.length || 0) > 0,
    },
    deepBreath: {
      title: 'Deep Breath',
      description: 'Complete first breathing exercise',
      icon: 'wind',
      color: '#5E72E4',
      isAchieved: () => (breathingExercises || 0) > 0,
    },
    firstShare: {
      title: 'First Share',
      description: 'Share progress for first time',
      icon: 'share',
      color: '#8E24AA',
      isAchieved: () => (sharesCount || 0) > 0,
    },
    
    // Activity Badges
    mindfulMaster: {
      title: 'Mindful Master',
      description: 'Complete 10 breathing exercises',
      icon: 'wind',
      color: '#11CDEF',
      isAchieved: () => (breathingExercises || 0) >= 10,
    },
    journalKeeper: {
      title: 'Journal Keeper',
      description: 'Write 5 journal entries',
      icon: 'book-open',
      color: '#FB6340',
      isAchieved: () => (journalEntries || 0) >= 5,
    },
    craveConqueror: {
      title: 'Cravings Conqueror',
      description: 'Overcome 4 cravings',
      icon: 'shield',
      color: '#FFA726',
      isAchieved: () => (cravingsOvercome || 0) >= 4,
    },
    
    // Recovery Milestone Badges
    firstDay: {
      title: 'First Day',
      description: '1 day sober',
      icon: 'clock',
      color: '#6B98C2', // colors.primary
      isAchieved: () => daysSober >= 1,
    },
    threeDays: {
      title: 'Three Days',
      description: '3 days sober',
      icon: 'star',
      color: '#FFA726',
      isAchieved: () => daysSober >= 3,
    },
    oneWeek: {
      title: 'One Week',
      description: '7 days sober',
      icon: 'calendar',
      color: '#C8A2C8', // colors.accent
      isAchieved: () => daysSober >= 7,
    },
    twoWeeks: {
      title: 'Two Weeks',
      description: '14 days sober',
      icon: 'wind',
      color: '#66BB6A',
      isAchieved: () => daysSober >= 14,
    },
    oneMonth: {
      title: 'One Month',
      description: '30 days sober',
      icon: 'trophy',
      color: '#5E72E4',
      isAchieved: () => daysSober >= 30,
    },
    threeMonths: {
      title: 'Three Months',
      description: '90 days sober',
      icon: 'award',
      color: '#11CDEF', // Match progress screen cyan
      isAchieved: () => daysSober >= 90,
    },
    sixMonths: {
      title: 'Six Months',
      description: '180 days sober',
      icon: 'heart', // Match progress screen Heart icon
      color: '#E91E63', // Match progress screen pink
      isAchieved: () => daysSober >= 180,
    },
    oneYear: {
      title: 'One Year',
      description: '365 days sober',
      icon: 'star', // Match progress screen Star icon
      color: '#FFD700',
      isAchieved: () => daysSober >= 365,
    },
    twoYears: {
      title: 'Two Years',
      description: '730 days sober',
      icon: 'award',
      color: '#8E24AA', // Match progress screen purple
      isAchieved: () => daysSober >= 730,
    },
    fiveYears: {
      title: 'Five Years',
      description: '1825 days sober',
      icon: 'trophy', // Match progress screen Trophy icon
      color: '#FF6F00', // Match progress screen deep orange
      isAchieved: () => daysSober >= 1825,
    },
  };
  
  // Check for new achievements
  useEffect(() => {
    // Don't check for badges until the store has finished loading
    if (!hasHydrated) {
      return;
    }
    
    const newlyAchieved: BadgeAchievement[] = [];
    
    Object.entries(badgeDefinitions).forEach(([key, badge]) => {
      const isAchieved = badge.isAchieved();
      const hasBeenShown = hasBadgeBeenShown(key);
      
      if (isAchieved && !hasBeenShown) {
        newlyAchieved.push({
          key,
          title: badge.title,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
        });
      }
    });
    
    if (newlyAchieved.length > 0) {
      setNewAchievements(newlyAchieved);
    } else {
      // Clear achievements if none are newly achieved
      setNewAchievements([]);
    }
  }, [
    hasHydrated, // Add this first to ensure store is ready
    daysSober,
    reasons?.length,
    messages?.length,
    moodEntries?.length,
    journalEntryStore?.length,
    breathingExercises,
    sharesCount,
    journalEntries,
    cravingsOvercome,
    level,
    totalXPEarned,
    hasBadgeBeenShown, // Add this to ensure we recheck when badges are marked as shown
  ]);
  
  const markAchievementAsShown = (badgeKey: string) => {
    markBadgeAsShown(badgeKey);
    // Immediately filter out the shown achievement to dismiss the modal
    setNewAchievements(prev => prev.filter(achievement => achievement.key !== badgeKey));
  };
  
  const clearNewAchievements = () => {
    setNewAchievements([]);
  };
  
  return {
    newAchievements,
    markAchievementAsShown,
    clearNewAchievements,
  };
}; 