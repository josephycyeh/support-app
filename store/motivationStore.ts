import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Quote {
  id: string;
  text: string;
  author?: string;
}

export interface MotivationPack {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  quotes: Quote[];
}

interface MotivationState {
  currentPackId: string | null;
}

interface MotivationStore extends MotivationState {
  setCurrentPack: (packId: string) => void;
}

// Motivation packs with themed content
export const MOTIVATION_PACKS: MotivationPack[] = [
  {
    id: 'daily-strength',
    title: 'Daily Strength',
    description: 'Powerful reminders for everyday courage',
    icon: '💪',
    color: '#6B98C2',
    quotes: [
      {
        id: 'ds1',
        text: 'You are stronger than your excuses and more powerful than your fears.',
      },
      {
        id: 'ds2',
        text: 'Every day you choose recovery, you choose to rewrite your story.',
      },
      {
        id: 'ds3',
        text: 'Your future self is counting on the choices you make today.',
      },
      {
        id: 'ds4',
        text: 'Healing is not linear, but every step forward counts.',
      },
      {
        id: 'ds5',
        text: 'You have survived 100% of your difficult days so far.',
      },
      {
        id: 'ds6',
        text: 'Recovery is not about perfection, it\'s about progress.',
      },
      {
        id: 'ds7',
        text: 'The courage you show today creates the freedom you\'ll feel tomorrow.',
      },
      {
        id: 'ds8',
        text: 'You are not broken. You are breaking through.',
      },
    ]
  },
  {
    id: 'crisis-support',
    title: 'Crisis Support',
    description: 'Immediate comfort for challenging moments',
    icon: '🛡️',
    color: '#F0A1A1',
    quotes: [
      {
        id: 'cs1',
        text: 'This craving is temporary, but your strength is permanent.',
      },
      {
        id: 'cs2',
        text: 'You\'ve survived every difficult moment so far.',
      },
      {
        id: 'cs3',
        text: 'Your recovery matters more than this feeling.',
      },
      {
        id: 'cs4',
        text: 'Each breath you take is a victory.',
      },
      {
        id: 'cs5',
        text: 'You are worthy of the life you\'re building.',
      },
      {
        id: 'cs6',
        text: 'This moment will pass, your progress won\'t.',
      },
      {
        id: 'cs7',
        text: 'Your future self is cheering you on right now.',
      },
      {
        id: 'cs8',
        text: 'You deserve the freedom that comes with sobriety.',
      },
    ]
  },
  {
    id: 'self-love',
    title: 'Self-Love',
    description: 'Gentle reminders of your worth',
    icon: '❤️',
    color: '#C8A2C8',
    quotes: [
      {
        id: 'sl1',
        text: 'You are worthy of love, especially from yourself.',
      },
      {
        id: 'sl2',
        text: 'Be gentle with yourself. You\'re doing the best you can.',
      },
      {
        id: 'sl3',
        text: 'Your worth is not determined by your past mistakes.',
      },
      {
        id: 'sl4',
        text: 'You deserve compassion, starting with your own.',
      },
      {
        id: 'sl5',
        text: 'Treat yourself with the kindness you\'d show a good friend.',
      },
      {
        id: 'sl6',
        text: 'You are enough, exactly as you are right now.',
      },
      {
        id: 'sl7',
        text: 'Self-care is not selfish. It\'s essential.',
      },
      {
        id: 'sl8',
        text: 'You have permission to forgive yourself and move forward.',
      },
    ]
  },
  {
    id: 'hope-future',
    title: 'Hope & Future',
    description: 'Vision for the life you\'re creating',
    icon: '🌅',
    color: '#9CCFB0',
    quotes: [
      {
        id: 'hf1',
        text: 'Your best days are not behind you, they\'re ahead of you.',
      },
      {
        id: 'hf2',
        text: 'Every sunrise is a new chance to start again.',
      },
      {
        id: 'hf3',
        text: 'The life you\'re dreaming of is worth every struggle.',
      },
      {
        id: 'hf4',
        text: 'You\'re not just recovering, you\'re discovering who you really are.',
      },
      {
        id: 'hf5',
        text: 'Your recovery is creating ripples of hope for others.',
      },
      {
        id: 'hf6',
        text: 'One day, your story will be someone else\'s survival guide.',
      },
      {
        id: 'hf7',
        text: 'The person you\'re becoming is worth every challenge you face.',
      },
      {
        id: 'hf8',
        text: 'Your future is being written with every healthy choice you make.',
      },
    ]
  },
  {
    id: 'wisdom',
    title: 'Recovery Wisdom',
    description: 'Insights from the journey',
    icon: '🧠',
    color: '#F2D0A4',
    quotes: [
      {
        id: 'rw1',
        text: 'Progress, not perfection.',
        author: 'AA Motto'
      },
      {
        id: 'rw2',
        text: 'One day at a time.',
        author: 'AA Motto'
      },
      {
        id: 'rw3',
        text: 'The only way out is through.',
        author: 'Robert Frost'
      },
      {
        id: 'rw4',
        text: 'You don\'t have to be great to get started, but you have to get started to be great.',
        author: 'Les Brown'
      },
      {
        id: 'rw5',
        text: 'Rock bottom became the solid foundation on which I rebuilt my life.',
        author: 'J.K. Rowling'
      },
      {
        id: 'rw6',
        text: 'The first step towards getting somewhere is to decide you\'re not going to stay where you are.',
        author: 'J.P. Morgan'
      },
      {
        id: 'rw7',
        text: 'Recovery is not one and done. It\'s a daily practice.',
      },
      {
        id: 'rw8',
        text: 'Your addiction was a chapter, not your whole story.',
      },
    ]
  }
];

const defaultState: MotivationState = {
  currentPackId: null,
};

export const useMotivationStore = create<MotivationStore>()(
  persist(
    (set, get) => ({
      ...defaultState,
      
      setCurrentPack: (packId: string) =>
        set(() => ({ currentPackId: packId })),
    }),
    {
      name: 'motivation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 