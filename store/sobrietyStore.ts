import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SobrietyState } from '@/types';

interface SobrietyStore extends SobrietyState {
  addXP: (amount: number) => void;
  resetSobriety: () => void;
  setLevelUpComplete: () => void;
  recordSobrietyBreak: (date?: string) => void; // Record a sobriety break
}

// Calculate XP needed for next level (increases with each level)
const calculateXpForNextLevel = (level: number) => 100 + (level - 1) * 50;

// Get today's date in YYYY-MM-DD format with proper UTC handling
const getTodayDateStr = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split('T')[0];
};

// Format a date object to YYYY-MM-DD string
const formatDateToYYYYMMDD = (date: Date) => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
};

// Default state with current date as start date
const getDefaultState = (): SobrietyState => {
  const today = getTodayDateStr();
  const defaultDailyXP: Record<string, number> = {};
  defaultDailyXP[today] = 0; // Initialize today with 0 XP
  
  const startDate = formatDateToYYYYMMDD(new Date());
  
  return {
    startDate,
    xp: 0,
    level: 1,
    xpToNextLevel: calculateXpForNextLevel(1),
    levelUp: false,
    dailyXP: defaultDailyXP,
    sobrietyBreaks: [],
  };
};

export const useSobrietyStore = create<SobrietyStore>()(
  persist(
    (set) => ({
      ...getDefaultState(),
      
      addXP: (amount: number) => 
        set((state) => {
          const newXP = state.xp + amount;
          const today = getTodayDateStr();
          
          // Update daily XP record
          const newDailyXP = { ...state.dailyXP };
          newDailyXP[today] = (newDailyXP[today] || 0) + amount;
          
          // Check if user leveled up
          if (newXP >= state.xpToNextLevel) {
            const newLevel = state.level + 1;
            return {
              xp: newXP - state.xpToNextLevel, // Carry over excess XP
              level: newLevel,
              xpToNextLevel: calculateXpForNextLevel(newLevel),
              levelUp: true, // Set the level up flag
              dailyXP: newDailyXP,
            };
          }
          
          return { 
            xp: newXP,
            dailyXP: newDailyXP,
          };
        }),
      
      setLevelUpComplete: () => 
        set(() => ({
          levelUp: false,
        })),
      
      recordSobrietyBreak: (date?: string) => 
        set((state) => {
          const breakDate = date ? date : getTodayDateStr();
          
          // Only add the date if it's not already recorded
          if (!state.sobrietyBreaks.includes(breakDate)) {
            const newStartDate = formatDateToYYYYMMDD(new Date());
            return {
              sobrietyBreaks: [...state.sobrietyBreaks, breakDate],
              startDate: newStartDate, // Reset sobriety start date
            };
          }
          
          return state;
        }),
      
      resetSobriety: () => 
        set((state) => {
          // Record today as a sobriety break
          const today = getTodayDateStr();
          const updatedBreaks = [...state.sobrietyBreaks];
          if (!updatedBreaks.includes(today)) {
            updatedBreaks.push(today);
          }
          
          return {
            ...getDefaultState(),
            sobrietyBreaks: updatedBreaks, // Keep the record of sobriety breaks
          };
        }),
    }),
    {
      name: 'sobriety-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);