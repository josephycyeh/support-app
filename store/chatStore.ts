import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string
  failed?: boolean; // Track if message failed to send
}

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  removeMessage: (messageId: string) => void;
  setMessageFailed: (messageId: string, failed: boolean) => void;
  removeAllFailedMessages: () => void;
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
      
      removeMessage: (messageId: string) =>
        set((state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        })),
      
      setMessageFailed: (messageId: string, failed: boolean) =>
        set((state) => ({
          messages: state.messages.map(msg =>
            msg.id === messageId ? { ...msg, failed } : msg
          )
        })),
      
      removeAllFailedMessages: () =>
        set((state) => ({
          messages: state.messages.filter(msg => !msg.failed)
        })),
      
      clearHistory: () => 
        set(() => ({
          messages: [{
            id: 'welcome',
            role: 'assistant',
            content: `Hi there! I'm Sushi, your companion on this journey. I'm here to talk, listen, or just keep you company whenever you need it.\n\nYou can also ask me about your sobriety journey, celebrate your milestones, get tips, and more, just ask!`,
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