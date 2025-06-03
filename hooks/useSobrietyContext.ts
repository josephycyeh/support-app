import { useMemo } from 'react';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useJournalStore } from '@/store/journalStore';
import { useMoodStore } from '@/store/moodStore';
import { useChecklistStore } from '@/store/checklistStore';
import { useActivityStore } from '@/store/activityStore';
import { useMoneySavedStore } from '@/store/moneySavedStore';

// TypeScript interfaces for better type safety
export interface PersonalInfo {
  name?: string;
  age?: number;
  daysSober: number;
  sobrietyStartDate: string;
  firstAppUseDate?: string;
}

export interface ProgressInfo {
  level: number;
  xp: number;
  xpToNextLevel: number;
  sobrietyBreaks: string[];
}

export interface RecentActivity {
  breathingExercises: number;
  journalCount: number;
  cravingsOvercome: number;
  dailyXP: [string, number][];
}

export interface MoodInfo {
  averageMood: number | null;
  moodStreak: number;
  recentMoods: any[];
}

export interface JournalInfo {
  totalEntries: number;
  recentEntries: Array<{
    type: string;
    title: string;
    date: string;
    content: string;
  }>;
}

export interface ChecklistInfo {
  todaysItems: any[];
  completedToday: number;
  totalItems: number;
}

export interface MoneyInfo {
  isConfigured: boolean;
  dailySpending: number;
  currency: string;
  totalSaved?: number;
}

export interface SobrietyContext {
  personal: PersonalInfo;
  progress: ProgressInfo;
  recentActivity: RecentActivity;
  mood: MoodInfo;
  journal: JournalInfo;
  checklist: ChecklistInfo;
  money: MoneyInfo;
  reasons: any[];
}

/**
 * Custom hook to gather comprehensive sobriety context from all stores.
 * This ensures consistent context structure between chat and voice calls.
 */
export function useSobrietyContext(): SobrietyContext {
  // Get data from all stores
  const { startDate, level, xp, xpToNextLevel, firstAppUseDate, sobrietyBreaks, dailyXP, name, age } = useSobrietyStore();
  const { reasons } = useReasonsStore();
  const { entries: journalEntries } = useJournalStore();
  const { entries: moodEntries, getAverageMood, getMoodStreak } = useMoodStore();
  const { items: checklistItems } = useChecklistStore();
  const { breathingExercises, journalEntries: journalCount, cravingsOvercome } = useActivityStore();
  const { isConfigured, dailySpending, currency, calculateTotalSaved } = useMoneySavedStore();
  
  // Calculate days sober (memoized for performance)
  const daysSober = useMemo(() => {
    const today = new Date();
    const start = new Date(startDate); // startDate is always ISO timestamp now
    return Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate]);

  // Build comprehensive sobriety context
  const context = useMemo((): SobrietyContext => {
    const sobrietyContext: SobrietyContext = {
      personal: {
        name,
        age,
        daysSober,
        sobrietyStartDate: startDate,
        firstAppUseDate,
      },
      progress: {
        level,
        xp,
        xpToNextLevel,
        sobrietyBreaks,
      },
      recentActivity: {
        breathingExercises,
        journalCount,
        cravingsOvercome,
        dailyXP: Object.entries(dailyXP).slice(-7), // Last 7 days
      },
      mood: {
        averageMood: getAverageMood(7), // Last 7 days
        moodStreak: getMoodStreak(),
        recentMoods: moodEntries.slice(0, 5), // Last 5 mood entries
      },
      journal: {
        totalEntries: journalEntries.length,
        recentEntries: journalEntries.slice(0, 3).map(entry => ({
          type: entry.type || 'journal',
          title: entry.title,
          date: entry.date,
          content: entry.content
        })),
      },
      checklist: {
        todaysItems: checklistItems,
        completedToday: checklistItems.filter(item => item.completed).length,
        totalItems: checklistItems.length,
      },
      money: {
        isConfigured,
        dailySpending,
        currency,
        totalSaved: isConfigured ? calculateTotalSaved(daysSober) : undefined,
      },
      reasons,
    };
    
    // Consistent debug logging
    console.log('🤖 Sobriety context gathered:', {
      daysSober: sobrietyContext.personal.daysSober,
      level: sobrietyContext.progress.level,
      journalEntries: sobrietyContext.journal.totalEntries,
      avgMood: sobrietyContext.mood.averageMood,
      contextSize: JSON.stringify(sobrietyContext).length + ' bytes'
    });
    
    return sobrietyContext;
  }, [
    name, age, daysSober, startDate, firstAppUseDate,
    level, xp, xpToNextLevel, sobrietyBreaks,
    breathingExercises, journalCount, cravingsOvercome, dailyXP,
    getAverageMood, getMoodStreak, moodEntries,
    journalEntries, checklistItems, reasons,
    isConfigured, dailySpending, currency, calculateTotalSaved
  ]);

  return context;
} 