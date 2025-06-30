import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity, AppState, Alert } from 'react-native';
import { fetch as expoFetch } from 'expo/fetch';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone } from 'lucide-react-native';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Header } from '@/components/ui/Header';
import { generateAPIUrl } from '../../utils/api'
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useChatStore } from '@/store/chatStore';
import { useSobrietyContext } from '@/hooks/useSobrietyContext';
import { usePostHog } from 'posthog-react-native';

// Simple ID generator
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const posthog = usePostHog();
  
  // Simple state management
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat store - single source of truth
  const { messages, addMessage, clearHistory, removeMessage, setMessageFailed, removeAllFailedMessages } = useChatStore();
  
  // Get comprehensive sobriety context
  const sobrietyContext = useSobrietyContext();

  // Initialize with welcome message if store is empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant' as const,
        content: `Hi there! I'm Sobi, your companion on this journey. I'm here to talk, listen, or just keep you company whenever you need it.\n\nYou can also ask me about your sobriety journey, celebrate your milestones, get tips, and more, just ask!`
      };
      addMessage(welcomeMessage);
    }
  }, []);

  // Send message function - much simpler than useChat
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Clear any failed messages before sending new one (like WhatsApp behavior)
    removeAllFailedMessages();

    // Create user message
    const userMessage = {
      id: generateId(),
      role: 'user' as const,
      content: content.trim()
    };

    // Add user message to store immediately
    addMessage(userMessage);
    
    // Track message sent
    posthog.capture('message_sent', {
      content_length: content.trim().length,
      word_count: content.trim().split(/\s+/).length,
    });
    
    // Clear input
    setInput('');

    // Get fresh messages from store after adding the user message
    const { getMessages } = useChatStore.getState();
    const allMessages = getMessages();

    setIsLoading(true);
    
    // Create abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await expoFetch(generateAPIUrl('/api/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages, // Store format = API format, no conversion needed
          sobrietyContext
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response to store
      const assistantMessage = {
        id: generateId(),
        role: 'assistant' as const,
        content: data.response
      };
      
      addMessage(assistantMessage);

    } catch (error: any) {
      console.error('Chat error:', error);
      
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      }
      
      // Mark user message as failed for retry (for any error)
      setMessageFailed(userMessage.id, true);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle input submission
  const handleSubmit = () => {
    sendMessage(input);
  };

  // Retry function for failed messages
  const handleRetry = (messageId: string) => {
    // Don't retry if already sending a message
    if (isLoading) return;
    
    const failedMessage = messages.find(msg => msg.id === messageId);
    if (failedMessage && failedMessage.role === 'user' && failedMessage.failed) {
      // Remove the failed message from store first to avoid duplicates
      const { removeMessage } = useChatStore.getState();
      removeMessage(messageId);
      
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Resend the message content (this will create a new message with new ID)
      sendMessage(failedMessage.content);
    }
  };

  // App state handling - abort requests when app goes to background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Abort any ongoing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Cleanup function - abort any ongoing requests when component unmounts
    return () => {
      subscription?.remove();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleVoiceCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming Soon', 'This feature is coming soon!');
  };

  const VoiceCallButton = () => (
    <TouchableOpacity 
      style={styles.voiceCallButton}
      onPress={handleVoiceCall}
    >
      <Phone size={20} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <Header 
        title="Talk to Sobi" 
        onBack={() => router.back()} 
        rightComponent={<VoiceCallButton />}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              content={message.content}
              role={message.role as 'user' | 'assistant'}
              id={message.id}
              error={message.failed || false}
              onRetry={message.failed ? () => handleRetry(message.id) : undefined}
            />
          ))}
          
          {isLoading && <TypingIndicator />}
        </ScrollView>
        
        <ChatInput
          value={input}
          onChange={(e: any) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingBottom: 10,
  },
  voiceCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
}); 