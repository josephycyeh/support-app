import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get today's date in consistent YYYY-MM-DD format
const getTodayDateStr = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split('T')[0];
};

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format for consistency
  mood: number; // 1-5 scale (1 = very sad, 5 = very happy)
  timestamp: string;
}

interface MoodStore {
  entries: MoodEntry[];
  hasLoggedToday: boolean;
  addMoodEntry: (mood: number) => void;
  getTodaysMood: () => MoodEntry | null;
  checkHasLoggedToday: () => boolean;
  getMoodStreak: () => number;
  getAverageMood: (days?: number) => number;
}

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      entries: [],
      hasLoggedToday: false,

      addMoodEntry: (mood: number) => {
        const now = new Date();
        const today = getTodayDateStr();
        
        const newEntry: MoodEntry = {
          id: Date.now().toString(),
          date: today,
          mood,
          timestamp: now.toISOString(),
        };

        set((state) => {
          // Remove any existing entry for today
          const filteredEntries = state.entries.filter(
            entry => entry.date !== today
          );
          
          return {
            entries: [newEntry, ...filteredEntries],
            hasLoggedToday: true,
          };
        });
      },

      getTodaysMood: () => {
        const today = getTodayDateStr();
        return get().entries.find(entry => entry.date === today) || null;
      },

      checkHasLoggedToday: () => {
        const today = getTodayDateStr();
        const hasLogged = get().entries.some(entry => entry.date === today);
        set({ hasLoggedToday: hasLogged });
        return hasLogged;
      },

      getMoodStreak: () => {
        const entries = get().entries;
        if (entries.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) { // Check up to a year
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const dateString = new Date(Date.UTC(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())).toISOString().split('T')[0];
          
          if (entries.some(entry => entry.date === dateString)) {
            streak++;
          } else {
            break;
          }
        }
        
        return streak;
      },

      getAverageMood: (days = 7) => {
        const entries = get().entries;
        const recentEntries = entries.slice(0, days);
        
        if (recentEntries.length === 0) return 0;
        
        const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
        return Math.round((sum / recentEntries.length) * 10) / 10;
      },
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 