import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  id: string;
  isToolInvocation?: boolean;
}

export const ChatMessage = ({ content, role, id, isToolInvocation }: ChatMessageProps) => {
  const isUser = role === 'user';
  
  // Check if content is a JSON string from a tool invocation
  const isJsonContent = content.startsWith('[{') || content.startsWith('{');

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={styles.avatarContainer}>
          <Image
            source={require('@/assets/images/Character_PNG.png')}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>
      )}
      <View style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.assistantBubble,
        isJsonContent && styles.jsonBubble
      ]}>
        <Text style={[
          styles.messageText,
          isJsonContent && styles.jsonText
        ]}>{content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    maxWidth: '90%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
  },
  jsonBubble: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ddd',
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
  },
  jsonText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
  },
}); 