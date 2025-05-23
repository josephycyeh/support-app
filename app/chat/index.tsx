import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { generateAPIUrl } from '../../utils/api'
import colors from '@/constants/colors';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  generateAPIUrl()
  const { messages, error, handleInputChange, input, handleSubmit, isLoading } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: "",
    onError: error => console.error(error, 'ERROR'),
    maxSteps: 5,
    id: 'sushi-chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi there! I'm Sushi, your companion on this journey. How are you feeling today? I'm here to talk, listen, or just keep you company whenever you need it."
      }
    ]
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Stack.Screen
        options={{
          title: 'Talk to Sushi',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(message => {
          const hasToolInvocations = Boolean(message.toolInvocations);
          const content = hasToolInvocations 
            ? JSON.stringify(message.toolInvocations, null, 2) 
            : message.content;
            
          return (
            <ChatMessage
              key={message.id}
              content={content}
              role={message.role as 'user' | 'assistant'}
              id={message.id}
              isToolInvocation={hasToolInvocations}
            />
          );
        })}
        
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingVertical: 20,
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
}); 