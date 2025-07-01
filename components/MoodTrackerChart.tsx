import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import colors from '@/constants/colors';
import { useMoodStore } from '@/store/moodStore';
import { getDaysAgoStr } from '@/utils/dateUtils';

const screenWidth = Dimensions.get('window').width;

// Mood levels configuration
const MOOD_LEVELS = [
  { value: 1, emoji: '😢', color: '#EF4444' },
  { value: 2, emoji: '😔', color: '#F97316' },
  { value: 3, emoji: '😐', color: '#EAB308' },
  { value: 4, emoji: '😊', color: '#22C55E' },
  { value: 5, emoji: '😄', color: '#10B981' },
];

const DAY_LABELS = ['4d', '3d', '2d', '1d', 'Today'];

interface MoodTrackerChartProps {
  className?: string;
}

export const MoodTrackerChart = ({ className }: MoodTrackerChartProps) => {
  const { entries } = useMoodStore();

  // Get mood data for the last 5 days
  const getMoodDataForDays = () => {
    const moodData = [];
    
    for (let i = 4; i >= 0; i--) {
      const dateStr = getDaysAgoStr(i);
      const moodEntry = entries.find(entry => entry.date === dateStr);
      
      moodData.push({
        day: DAY_LABELS[4 - i],
        mood: moodEntry ? moodEntry.mood : null,
        date: dateStr,
      });
    }
    
    return moodData;
  };

  const moodData = getMoodDataForDays();
  
  // Check if there's any mood data at all
  const hasAnyMoodData = entries.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Tracker</Text>
      <Text style={styles.subtitle}>Last 5 days</Text>
      
      {hasAnyMoodData ? (
        <View style={styles.chartContainer}>
          {moodData.map((data, index) => {
            const moodLevel = data.mood ? MOOD_LEVELS.find(level => level.value === data.mood) : null;
            const fillPercentage = data.mood ? (data.mood / 5) : 0;
            const barColor = moodLevel ? moodLevel.color : colors.border;
            
            return (
              <View key={index} style={styles.barContainer}>
                {/* Emoji on top */}
                <View style={styles.emojiContainer}>
                  {moodLevel ? (
                    <Text style={styles.emoji}>{moodLevel.emoji}</Text>
                  ) : (
                    <View style={styles.noMoodIndicator} />
                  )}
                </View>
                
                {/* Bar Container - Fixed height */}
                <View style={styles.barWrapper}>
                  {/* Background bar */}
                  <View style={styles.barBackground}>
                    {/* Filled portion */}
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${fillPercentage * 100}%`,
                          backgroundColor: barColor,
                        }
                      ]} 
                    />
                  </View>
                </View>
                
                {/* Day label */}
                <Text style={styles.dayLabel}>{data.day}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>😊</Text>
          <Text style={styles.emptyStateTitle}>Start tracking your mood</Text>
          <Text style={styles.emptyStateSubtitle}>
            Log your daily mood to see patterns and track your emotional journey
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  emojiContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  noMoodIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  barWrapper: {
    height: 120,
    width: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barBackground: {
    width: 28,
    height: 120,
    backgroundColor: colors.progressBackground,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  barFill: {
    width: '100%',
    borderRadius: 14,
    minHeight: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 