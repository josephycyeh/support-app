import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BadgeAchievementState {
  shownBadgeKeys: string[]; // Simple array of badge keys that have been shown
  hasHydrated: boolean; // Track if store has finished loading from AsyncStorage
}

interface BadgeAchievementStore extends BadgeAchievementState {
  markBadgeAsShown: (badgeKey: string) => void;
  hasBadgeBeenShown: (badgeKey: string) => boolean;
  clearAll: () => void;
}

const initialState: BadgeAchievementState = {
  shownBadgeKeys: [],
  hasHydrated: false,
};

export const useBadgeAchievementStore = create<BadgeAchievementStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      markBadgeAsShown: (badgeKey: string) => 
        set((state) => {
          // Only add if not already in the array
          if (!state.shownBadgeKeys.includes(badgeKey)) {
            return {
              shownBadgeKeys: [...state.shownBadgeKeys, badgeKey],
            };
          }
          return state;
        }),
      
      hasBadgeBeenShown: (badgeKey: string) => {
        const state = get();
        // Only return true if store has hydrated AND badge is in array
        return state.hasHydrated && state.shownBadgeKeys.includes(badgeKey);
      },
      
      clearAll: () => 
        set(() => ({
          ...initialState,
          hasHydrated: true, // Keep hydrated state when clearing
        })),
    }),
    {
      name: 'badge-achievement-storage-v2', // Changed name to force fresh start
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Set hasHydrated to true once rehydration is complete
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
); 