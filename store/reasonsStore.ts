import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reason {
  id: string;
  text: string;
}

interface ReasonsStore {
  reasons: Reason[];
  addReason: (text: string) => void;
  deleteReason: (id: string) => void;
  updateReason: (id: string, text: string) => void;
  getReasons: () => Reason[];
  clearAll: () => void;
}

// Initial default reasons
const defaultReasons: Reason[] = [];

export const useReasonsStore = create<ReasonsStore>()(
  persist(
    (set, get) => ({
      reasons: defaultReasons,
      
      addReason: (text: string) => 
        set((state) => ({
          reasons: [...state.reasons, { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text }]
        })),
      
      deleteReason: (id: string) => 
        set((state) => ({
          reasons: state.reasons.filter(reason => reason.id !== id)
        })),
      
      updateReason: (id: string, text: string) => 
        set((state) => ({
          reasons: state.reasons.map(reason => 
            reason.id === id ? { ...reason, text } : reason
          )
        })),
      
      getReasons: () => get().reasons,
      
      clearAll: () => 
        set(() => ({
          reasons: []
        })),
    }),
    {
      name: 'reasons-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 