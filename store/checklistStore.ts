import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDateStr } from '@/utils/dateUtils';
import { ChecklistItem } from '@/types';

interface ChecklistStore {
  items: ChecklistItem[];
  lastResetDate: string;
  toggleItem: (id: string) => void;
  resetDailyItems: () => void;
  checkAndResetIfNewDay: () => void;
}

// Updated checklist items with more action-oriented titles
const defaultItems: ChecklistItem[] = [
  { id: '1', title: "Do Breathing Exercise", completed: false, xpReward: 15 },
  { id: '2', title: "Note a Craving", completed: false, xpReward: 20 },
  { id: '3', title: "Log Your Thoughts", completed: false, xpReward: 20 },
  { id: '4', title: "Take a Walk Outside", completed: false, xpReward: 15 },
  { id: '5', title: "Call a Supportive Friend", completed: false, xpReward: 25 },
];

// Date utility functions are now imported from @/utils/dateUtils

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, get) => ({
      items: defaultItems,
      lastResetDate: getTodayDateStr(),
      
      toggleItem: (id: string) => 
        set((state) => ({
          items: state.items.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),
      
      resetDailyItems: () => 
        set(() => ({
          items: defaultItems.map(item => ({ ...item, completed: false })),
          lastResetDate: getTodayDateStr(),
        })),
        
      checkAndResetIfNewDay: () => {
        const { lastResetDate, resetDailyItems } = get();
        const today = getTodayDateStr();
        
        // If today's date is different from the last reset date, reset items
        if (today !== lastResetDate) {
          resetDailyItems();
        }
      },
    }),
    {
      name: 'checklist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);