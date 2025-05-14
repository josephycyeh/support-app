import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityState {
  breathingExercises: number;
  journalEntries: number;
  cravingsOvercome: number;
}

interface ActivityStore extends ActivityState {
  incrementBreathingExercises: () => void;
  incrementJournalEntries: () => void;
  incrementCravingsOvercome: () => void;
  setBreathingExercises: (count: number) => void;
  setJournalEntries: (count: number) => void;
  setCravingsOvercome: (count: number) => void;
}

const initialState: ActivityState = {
  breathingExercises: 0,
  journalEntries: 0,
  cravingsOvercome: 0,
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
    }),
    {
      name: 'activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 