import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import colors from '@/constants/colors';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  id: string;
}

export const ChatMessage = ({ content, role, id }: ChatMessageProps) => {
  const isUser = role === 'user';

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
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={styles.messageText}>{content}</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  messageText: {
    fontSize: 15,
    color: colors.text,
  },
}); 