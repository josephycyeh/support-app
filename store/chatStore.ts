import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
}

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  clearHistory: () => void;
  getMessages: () => ChatMessage[];
  // Limit history to prevent memory issues
  maxMessages: number;
}

const MAX_MESSAGES = 100; // Keep last 100 messages

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      maxMessages: MAX_MESSAGES,
      
      addMessage: (message: Omit<ChatMessage, 'timestamp'>) => 
        set((state) => {
          const newMessage: ChatMessage = {
            ...message,
            timestamp: new Date().toISOString(),
          };
          
          const updatedMessages = [...state.messages, newMessage];
          
          // Keep only the last maxMessages to prevent memory issues
          if (updatedMessages.length > state.maxMessages) {
            // Remove oldest messages, but keep the welcome message if it exists
            const welcomeMessage = updatedMessages.find(msg => msg.id === 'welcome');
            const otherMessages = updatedMessages.filter(msg => msg.id !== 'welcome');
            const trimmedMessages = otherMessages.slice(-state.maxMessages + (welcomeMessage ? 1 : 0));
            
            return {
              messages: welcomeMessage ? [welcomeMessage, ...trimmedMessages] : trimmedMessages
            };
          }
          
          return { messages: updatedMessages };
        }),
      
      clearHistory: () => 
        set(() => ({
          messages: [{
            id: 'welcome',
            role: 'assistant',
            content: "Hi there! I'm Sushi, your companion on this journey. How are you feeling today? I'm here to talk, listen, or just keep you company whenever you need it.",
            timestamp: new Date().toISOString(),
          }],
        })),
      
      getMessages: () => get().messages,
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the messages array
      partialize: (state) => ({ messages: state.messages }),
    }
  )
); 