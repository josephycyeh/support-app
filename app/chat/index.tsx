import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity } from 'react-native';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone } from 'lucide-react-native';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Header } from '@/components/ui/Header';
import { generateAPIUrl } from '../../utils/api'
import colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useChatStore, ChatMessage as StoredChatMessage } from '@/store/chatStore';
import { useSobrietyContext } from '@/hooks/useSobrietyContext';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Chat history store
  const { messages: storedMessages, addMessage } = useChatStore();
  
  // Get comprehensive sobriety context using shared hook
  const sobrietyContext = useSobrietyContext();

  // Initialize with welcome message if store is empty
  const initialMessages = React.useMemo(() => {
    if (storedMessages.length > 0) {
      return storedMessages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content
      }));
    }
    
    // Add welcome message to store and return it
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant' as const,
      content: "Hi there! I'm Sushi, your companion on this journey. How are you feeling today? I'm here to talk, listen, or just keep you company whenever you need it."
    };
    
    addMessage(welcomeMessage);
    return [welcomeMessage];
  }, [storedMessages, addMessage]);

  const { messages, error, handleInputChange, input, handleSubmit, isLoading } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: generateAPIUrl('/api/chat'),
    body: { sobrietyContext },
    onError: error => console.error(error, 'ERROR'),
    id: 'sushi-chat',
    initialMessages,
    onFinish: (message) => {
      // Save assistant messages to store
      addMessage({
        id: message.id,
        role: 'assistant',
        content: message.content
      });
    }
  });

  // Simple message sync - only save new user messages
  const lastMessageRef = useRef<string | null>(null);
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage && 
        lastMessage.role === 'user' && 
        lastMessage.id !== lastMessageRef.current) {
      
      lastMessageRef.current = lastMessage.id;
      addMessage({
        id: lastMessage.id,
        role: 'user',
        content: lastMessage.content
      });
    }
  }, [messages, addMessage]);

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
    router.push('/voice-call');
  };

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Something went wrong. Please try again later.
        </Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </SafeAreaView>
    );
  }

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
        title="Talk to Sushi" 
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
            />
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>
        
        <ChatInput
          value={input}
          onChange={handleInputChange}
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
  loadingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
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