import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMoodStore } from '@/store/moodStore';

interface MoodButtonProps {
  onPress: () => void;
}

const MOOD_EMOJIS = ['😢', '😔', '😐', '😊', '😄'];
const MOOD_LABELS = ['Very Sad', 'Sad', 'Neutral', 'Good', 'Great'];

export const MoodButton = ({ onPress }: MoodButtonProps) => {
  const { getTodaysMood } = useMoodStore();
  const todaysMood = getTodaysMood();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {todaysMood ? (
          <Text style={styles.moodEmoji}>
            {MOOD_EMOJIS[todaysMood.mood - 1]}
          </Text>
        ) : (
          <Heart size={28} color={colors.primary} />
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          {todaysMood ? 'Today\'s Mood' : 'Check In'}
        </Text>
        <Text style={styles.subtitle}>
          {todaysMood 
            ? MOOD_LABELS[todaysMood.mood - 1]
            : 'How are you feeling?'
          }
        </Text>
      </View>
      
      {!todaysMood && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  moodEmoji: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
}); 