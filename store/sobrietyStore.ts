import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SobrietyState } from '@/types';

interface SobrietyStore extends SobrietyState {
  addXP: (amount: number) => void;
  resetSobriety: () => void;
  setLevelUpComplete: () => void;
  recordSobrietyBreak: (date?: string) => void; // Record a sobriety break
  checkAndAwardMilestones: () => void; // Check and award milestone XP
  setName: (name: string) => void; // Set user's name
  setAge: (age: number) => void; // Set user's age
}

// Calculate XP needed for next level (increases with each level)
const calculateXpForNextLevel = (level: number) => 100 + (level - 1) * 50;

// Get today's date in YYYY-MM-DD format with proper UTC handling
const getTodayDateStr = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split('T')[0];
};

// Format a date object to ISO timestamp for consistent precision
const formatDateToISOString = (date: Date) => {
  return date.toISOString();
};

// Default state with current timestamp as start date
const getDefaultState = (): SobrietyState => {
  const today = getTodayDateStr();
  const defaultDailyXP: Record<string, number> = {};
  defaultDailyXP[today] = 0; // Initialize today with 0 XP
  
  const startDate = formatDateToISOString(new Date());
  
  return {
    startDate,
    firstAppUseDate: startDate, // First time using app is same as first sobriety start
    xp: 0,
    level: 1,
    xpToNextLevel: calculateXpForNextLevel(1),
    levelUp: false,
    dailyXP: defaultDailyXP,
    sobrietyBreaks: [],
    milestonesReached: [],
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
              ...state, // Preserve all existing state
              xp: newXP - state.xpToNextLevel, // Carry over excess XP
              level: newLevel,
              xpToNextLevel: calculateXpForNextLevel(newLevel),
              levelUp: true, // Set the level up flag
              dailyXP: newDailyXP,
            };
          }
          
          return { 
            ...state, // Preserve all existing state
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
            const newStartDate = formatDateToISOString(new Date());
            return {
              ...state, // Preserve all existing state including firstAppUseDate
              sobrietyBreaks: [...state.sobrietyBreaks, breakDate],
              startDate: newStartDate, // Reset sobriety start date only
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
          
          // Reset to current timestamp for immediate 0:0:0:0
          const newStartDate = formatDateToISOString(new Date());
          
          return {
            ...state, // Preserve XP, level, dailyXP, firstAppUseDate, and other data
            startDate: newStartDate, // Reset to current timestamp
            sobrietyBreaks: updatedBreaks, // Keep the record of sobriety breaks
          };
        }),
      
      checkAndAwardMilestones: () => 
        set((state) => {
          const now = new Date();
          // Parse startDate as ISO timestamp (always full timestamp now)
          const sobrietyStart = new Date(state.startDate);
          const daysSober = Math.floor((now.getTime() - sobrietyStart.getTime()) / (1000 * 60 * 60 * 24));
          
          // Define milestones and their XP rewards
          const milestones = [
            { days: 1, xp: 50 },
            { days: 3, xp: 75 },
            { days: 7, xp: 100 },
            { days: 14, xp: 150 },
            { days: 30, xp: 300 },
            { days: 90, xp: 500 },
            { days: 180, xp: 750 },
            { days: 365, xp: 1000 },
            { days: 730, xp: 1500 },
            { days: 1825, xp: 2500 },
          ];
          
          let totalXPAwarded = 0;
          const newMilestonesReached = [...state.milestonesReached];
          
          // Check each milestone
          for (const milestone of milestones) {
            if (daysSober >= milestone.days && !state.milestonesReached.includes(milestone.days)) {
              totalXPAwarded += milestone.xp;
              newMilestonesReached.push(milestone.days);
            }
          }
          
          // If no new milestones, return current state
          if (totalXPAwarded === 0) {
            return state;
          }
          
          // Calculate new XP and level
          const newXP = state.xp + totalXPAwarded;
          const today = getTodayDateStr();
          
          // Update daily XP record
          const newDailyXP = { ...state.dailyXP };
          newDailyXP[today] = (newDailyXP[today] || 0) + totalXPAwarded;
          
          // Check if user leveled up
          if (newXP >= state.xpToNextLevel) {
            const newLevel = state.level + 1;
            return {
              ...state,
              xp: newXP - state.xpToNextLevel,
              level: newLevel,
              xpToNextLevel: calculateXpForNextLevel(newLevel),
              levelUp: true,
              dailyXP: newDailyXP,
              milestonesReached: newMilestonesReached,
            };
          }
          
          return {
            ...state,
            xp: newXP,
            dailyXP: newDailyXP,
            milestonesReached: newMilestonesReached,
          };
        }),
      
      setName: (name: string) => 
        set(() => ({
          name,
        })),
      
      setAge: (age: number) => 
        set(() => ({
          age,
        })),
    }),
    {
      name: 'sobriety-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);