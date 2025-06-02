import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MoneySavedState {
  dailySpending: number; // How much they used to spend per day
  isConfigured: boolean; // Whether they've set up their spending amount
  currency: string; // Currency symbol (default $)
}

interface MoneySavedStore extends MoneySavedState {
  setDailySpending: (amount: number) => void;
  calculateTotalSaved: (daysSober: number) => number;
  resetConfiguration: () => void;
}

// Suggested spending amounts for common scenarios
export const SPENDING_SUGGESTIONS = [
  { label: 'Light use', dailyAmount: 10, description: '$10/day' },
  { label: 'Moderate use', dailyAmount: 25, description: '$25/day' },
  { label: 'Heavy use', dailyAmount: 50, description: '$50/day' },
  { label: 'Very heavy use', dailyAmount: 100, description: '$100/day' },
];

const defaultState: MoneySavedState = {
  dailySpending: 0,
  isConfigured: false,
  currency: '$',
};

export const useMoneySavedStore = create<MoneySavedStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setDailySpending: (amount: number) =>
        set(() => ({
          dailySpending: amount,
          isConfigured: true,
        })),
      
      calculateTotalSaved: (daysSober: number) => {
        const state = get();
        return state.dailySpending * daysSober;
      },
      
      resetConfiguration: () =>
        set(() => defaultState),
    }),
    {
      name: 'money-saved-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 