import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  type?: 'journal' | 'trigger'; // Optional for backward compatibility
}

interface JournalStore {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (updatedEntry: JournalEntry) => void;
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
      
      updateEntry: (updatedEntry: JournalEntry) => 
        set((state) => ({
          entries: state.entries.map(entry => 
            entry.id === updatedEntry.id ? updatedEntry : entry
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