import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityState {
  breathingExercises: number;
  journalEntries: number;
  cravingsOvercome: number;
  sharesCount: number;
}

interface ActivityStore extends ActivityState {
  incrementBreathingExercises: () => void;
  incrementJournalEntries: () => void;
  incrementCravingsOvercome: () => void;
  incrementSharesCount: () => void;
  setBreathingExercises: (count: number) => void;
  setJournalEntries: (count: number) => void;
  setCravingsOvercome: (count: number) => void;
  setSharesCount: (count: number) => void;
  clearAll: () => void;
}

const initialState: ActivityState = {
  breathingExercises: 0,
  journalEntries: 0,
  cravingsOvercome: 0,
  sharesCount: 0,
};

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      incrementBreathingExercises: () => 
        set((state) => ({
          breathingExercises: state.breathingExercises + 1,
        })),
      
      incrementJournalEntries: () => 
        set((state) => ({
          journalEntries: state.journalEntries + 1,
        })),
      
      incrementCravingsOvercome: () => 
        set((state) => ({
          cravingsOvercome: state.cravingsOvercome + 1,
        })),
      
      incrementSharesCount: () => 
        set((state) => ({
          sharesCount: state.sharesCount + 1,
        })),
      
      setBreathingExercises: (count: number) => 
        set(() => ({
          breathingExercises: count,
        })),
      
      setJournalEntries: (count: number) => 
        set(() => ({
          journalEntries: count,
        })),
      
      setCravingsOvercome: (count: number) => 
        set(() => ({
          cravingsOvercome: count,
        })),
      
      setSharesCount: (count: number) => 
        set(() => ({
          sharesCount: count,
        })),
      
      clearAll: () => 
        set(() => ({
          ...initialState
        })),
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 