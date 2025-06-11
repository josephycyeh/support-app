import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SobrietyState } from '@/types';
import { getTodayDateStr, formatDateToISOString, calculateDaysSober } from '@/utils/dateUtils';

interface SobrietyStore extends SobrietyState {
  addXP: (amount: number) => void;
  resetSobriety: () => void;
  setLevelUpComplete: () => void;
  recordSobrietyBreak: (date?: string) => void; // Record a sobriety break
  checkAndAwardMilestones: () => void; // Check and award milestone XP
  setName: (name: string) => void; // Set user's name
  setAge: (age: number) => void; // Set user's age
  setStartDate: (date: string) => void; // Set sobriety start date
  completeOnboarding: () => void; // Mark onboarding as complete
  
  // Onboarding data setters
  setSubstance: (substance: string) => void;
  setSubstanceFrequency: (frequency: string) => void;
  setTriggers: (triggers: string[]) => void;
  setRecoveryGoals: (goals: string[]) => void;
  setHardestChallenge: (challenge: string) => void;
  setSobrietyImportance: (importance: string) => void;
  setStruggleTimes: (times: string[]) => void;
}

// Calculate XP needed for next level (increases with each level)
const calculateXpForNextLevel = (level: number) => 100 + (level - 1) * 50;

// Date utility functions are now imported from @/utils/dateUtils

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
    onboardingCompleted: false,
  };
};

export const useSobrietyStore = create<SobrietyStore>()(
  persist(
    (set) => ({
      ...getDefaultState(),
      
      addXP: (amount: number) => 
        set((state) => {
          let newXP = state.xp + amount;
          let newLevel = state.level;
          let newXpToNextLevel = state.xpToNextLevel;
          let leveledUp = false;
          const today = getTodayDateStr();
          
          // Update daily XP record
          const newDailyXP = { ...state.dailyXP };
          newDailyXP[today] = (newDailyXP[today] || 0) + amount;
          
          // Handle multiple level-ups if the XP amount is large enough
          while (newXP >= newXpToNextLevel) {
            newXP -= newXpToNextLevel; // Subtract the XP needed for current level
            newLevel++; // Level up!
            newXpToNextLevel = calculateXpForNextLevel(newLevel); // Calculate XP needed for next level
            leveledUp = true;
          }
          
          return { 
            ...state, // Preserve all existing state
            xp: newXP,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
            levelUp: leveledUp,
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
          const daysSober = calculateDaysSober(state.startDate);
          
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
          
          // Find the highest milestone reached
          let milestoneToAward = null;
          for (const milestone of milestones) {
            if (daysSober >= milestone.days) {
              milestoneToAward = milestone;
            }
          }
          
          // Check if we should award this milestone
          if (milestoneToAward) {
            const today = getTodayDateStr();
            const todaysXP = state.dailyXP[today] || 0;
            
            // Check if we've already awarded this specific milestone by looking for large XP amounts
            // that match milestone rewards (crude but effective)
            const hasAlreadyAwardedThisMilestone = todaysXP >= milestoneToAward.xp;
            
            if (!hasAlreadyAwardedThisMilestone) {
              // Calculate new XP and level with proper multiple level-up handling
              let newXP = state.xp + milestoneToAward.xp;
              let newLevel = state.level;
              let newXpToNextLevel = state.xpToNextLevel;
              let leveledUp = false;
              
              // Handle multiple level-ups if the XP award is large enough
              while (newXP >= newXpToNextLevel) {
                newXP -= newXpToNextLevel; // Subtract the XP needed for current level
                newLevel++; // Level up!
                newXpToNextLevel = calculateXpForNextLevel(newLevel); // Calculate XP needed for next level
                leveledUp = true;
              }
              
              // Update daily XP record
              const newDailyXP = { ...state.dailyXP };
              newDailyXP[today] = (newDailyXP[today] || 0) + milestoneToAward.xp;
              
              return {
                ...state,
                xp: newXP,
                level: newLevel,
                xpToNextLevel: newXpToNextLevel,
                levelUp: leveledUp,
                dailyXP: newDailyXP,
              };
            }
          }
          
          return state; // No milestone to award
        }),
      
      setName: (name: string) => 
        set(() => ({
          name,
        })),
      
      setAge: (age: number) => 
        set(() => ({
          age,
        })),
      
      setStartDate: (date: string) => 
        set((state) => {
          // When manually setting start date, completely reset all progression data
          // This is like starting completely fresh from that date
          const newStartDate = date;
          const today = getTodayDateStr();
          const resetDailyXP: Record<string, number> = {};
          resetDailyXP[today] = 0; // Initialize today with 0 XP
          
          return {
            ...state, // Preserve personal info (name, age, onboarding status)
            startDate: newStartDate,
            xp: 0, // Reset XP to 0
            level: 1, // Reset level to 1
            xpToNextLevel: calculateXpForNextLevel(1), // Reset XP needed for next level
            levelUp: false, // Clear any level up flags
            dailyXP: resetDailyXP, // Clear all daily XP history
            sobrietyBreaks: [], // Clear sobriety break history (fresh start)
            // Keep firstAppUseDate unchanged - this should never change
          };
        }),
      
      completeOnboarding: () => 
        set(() => ({
          onboardingCompleted: true,
        })),
      
      // Onboarding data setters
      setSubstance: (substance: string) => 
        set(() => ({
          substance,
        })),
      
      setSubstanceFrequency: (frequency: string) => 
        set(() => ({
          substanceFrequency: frequency,
        })),
      
      setTriggers: (triggers: string[]) => 
        set(() => ({
          triggers,
        })),
      
      setRecoveryGoals: (goals: string[]) => 
        set(() => ({
          recoveryGoals: goals,
        })),
      
      setHardestChallenge: (challenge: string) => 
        set(() => ({
          hardestChallenge: challenge,
        })),
      
      setSobrietyImportance: (importance: string) => 
        set(() => ({
          sobrietyImportance: importance,
        })),
      
      setStruggleTimes: (times: string[]) => 
        set(() => ({
          struggleTimes: times,
        })),
    }),
    {
      name: 'sobriety-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);