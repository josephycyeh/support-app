import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
}

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => void;
  getEntries: () => JournalEntry[];
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (entry: JournalEntry) => 
        set((state) => ({
          entries: [entry, ...state.entries]
        })),
      
      deleteEntry: (id: string) => 
        set((state) => ({
          entries: state.entries.filter(entry => entry.id !== id)
        })),
      
      updateEntry: (id: string, updates: Partial<Omit<JournalEntry, 'id'>>) => 
        set((state) => ({
          entries: state.entries.map(entry => 
            entry.id === id ? { ...entry, ...updates } : entry
          )
        })),
      
      getEntries: () => get().entries,
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);