import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SobrietyState } from '@/types';

interface SobrietyStore extends SobrietyState {
  addXP: (amount: number) => void;
  resetSobriety: () => void;
  setLevelUpComplete: () => void;
}

// Calculate XP needed for next level (increases with each level)
const calculateXpForNextLevel = (level: number) => 100 + (level - 1) * 50;

// Default state with current date as start date
const getDefaultState = (): SobrietyState => ({
  startDate: new Date().toISOString(),
  xp: 0,
  level: 1,
  xpToNextLevel: calculateXpForNextLevel(1),
  levelUp: false,
});

export const useSobrietyStore = create<SobrietyStore>()(
  persist(
    (set) => ({
      ...getDefaultState(),
      
      addXP: (amount: number) => 
        set((state) => {
          const newXP = state.xp + amount;
          
          // Check if user leveled up
          if (newXP >= state.xpToNextLevel) {
            const newLevel = state.level + 1;
            return {
              xp: newXP - state.xpToNextLevel, // Carry over excess XP
              level: newLevel,
              xpToNextLevel: calculateXpForNextLevel(newLevel),
              levelUp: true, // Set the level up flag
            };
          }
          
          return { xp: newXP };
        }),
      
      setLevelUpComplete: () => 
        set(() => ({
          levelUp: false,
        })),
      
      resetSobriety: () => 
        set(() => ({
          ...getDefaultState(),
        })),
    }),
    {
      name: 'sobriety-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);