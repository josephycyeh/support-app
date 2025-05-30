import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshCw, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  id: string;
  error?: boolean;
  onRetry?: () => void;
}

export const ChatMessage = ({ content, role, id, error = false, onRetry }: ChatMessageProps) => {
  const isUser = role === 'user';

  // For failed user messages, show subtle error state
  if (error && isUser && onRetry) {
    return (
      <View style={[styles.container, styles.userContainer]}>
        <TouchableOpacity onPress={onRetry} style={styles.tappableMessage}>
          <View style={styles.messageRow}>
            <LinearGradient
              colors={['#7BA4CA', '#6B98C2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.userBubble, styles.failedMessage]}
            >
              <Text style={[styles.messageText, styles.userMessageText]}>{content}</Text>
            </LinearGradient>
            <View style={styles.errorIcon}>
              <AlertCircle size={16} color="#E74C3C" />
            </View>
          </View>
          <Text style={styles.retryHintBelow}>Not delivered, tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      {isUser ? (
        <LinearGradient
          colors={['#7BA4CA', '#6B98C2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.userBubble]}
        >
          <Text style={[styles.messageText, styles.userMessageText]}>{content}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.assistantBubble]}>
          <Text style={[styles.messageText, styles.assistantMessageText]}>{content}</Text>
        </View>
      )}
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
    paddingVertical: 12,
    maxWidth: '85%',
  },
  userBubble: {
    shadowColor: '#6B98C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  assistantMessageText: {
    color: colors.text,
    fontWeight: '400',
  },
  failedMessage: {
    opacity: 0.7,
  },
  tappableMessage: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorIcon: {
    marginLeft: 8,
  },
  retryHintBelow: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
    color: '#E74C3C',
  },
}); 