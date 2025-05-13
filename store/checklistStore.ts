import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChecklistItem } from '@/types';

interface ChecklistStore {
  items: ChecklistItem[];
  toggleItem: (id: string) => void;
  resetDailyItems: () => void;
}

// Updated checklist items with more action-oriented titles
const defaultItems: ChecklistItem[] = [
  { id: '1', title: "Do Breathing Exercise", completed: false, xpReward: 15 },
  { id: '2', title: "Note a Craving", completed: false, xpReward: 20 },
  { id: '3', title: "Log Your Thoughts", completed: false, xpReward: 20 },
  { id: '4', title: "Take a Walk Outside", completed: false, xpReward: 15 },
  { id: '5', title: "Call a Supportive Friend", completed: false, xpReward: 20 },
];

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set) => ({
      items: defaultItems,
      
      toggleItem: (id: string) => 
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),
      
      resetDailyItems: () => 
        set(() => ({
          items: defaultItems.map(item => ({ ...item, completed: false })),
        })),
    }),
    {
      name: 'checklist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);