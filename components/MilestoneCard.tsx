import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Trophy, Clock, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { TIME_CONSTANTS } from '@/utils/dateUtils';
import { useSobrietyStore } from '@/store/sobrietyStore';
import * as Haptics from 'expo-haptics';
import typography from '@/constants/typography';

const MILESTONES = [
  { days: 1, title: "First Day", icon: Clock, color: colors.primary },
  { days: 3, title: "Three Days", icon: Star, color: "#FFA726" },
  { days: 7, title: "One Week", icon: Trophy, color: colors.accent },
  { days: 14, title: "Two Weeks", icon: Star, color: "#66BB6A" },
  { days: 30, title: "One Month", icon: Trophy, color: "#5E72E4" },
  { days: 90, title: "Three Months", icon: Star, color: "#11CDEF" },
  { days: 180, title: "Six Months", icon: Trophy, color: "#E91E63" },
  { days: 365, title: "One Year", icon: Star, color: "#FFD700" },
  { days: 730, title: "Two Years", icon: Trophy, color: "#8E24AA" },
  { days: 1825, title: "Five Years", icon: Star, color: "#FF6F00" },
];

export const MilestoneCard = () => {
  const router = useRouter();
  const { startDate } = useSobrietyStore();

  // Calculate granular time elapsed (including hours and minutes)
  const now = new Date();
  const start = new Date(startDate);
  const totalMilliseconds = now.getTime() - start.getTime();
  const totalDays = Math.max(0, totalMilliseconds / TIME_CONSTANTS.MILLISECONDS_PER_DAY);
  const daysSober = Math.floor(totalDays);

  // Find next milestone based purely on current streak (consistent with Progress screen)
  const nextMilestone = MILESTONES.find(milestone => 
    daysSober < milestone.days
  );

  // If no next milestone found, show the highest one
  const milestone = nextMilestone || MILESTONES[MILESTONES.length - 1];
  const Icon = milestone.icon;
  const daysToGo = Math.max(0, milestone.days - daysSober);
  const isCompleted = totalDays >= milestone.days;

  // Calculate granular progress including hours and minutes
  const progressPercentage = Math.min(Math.max((totalDays / milestone.days) * 100, 0), 100);

  const handlePress = () => {
    router.push('/(tabs)/progress');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={[styles.gradientBackground, { backgroundColor: colors.primary }]}>
        <View style={styles.content}>
          {isCompleted ? (
            <>
              <Text style={styles.nextLabel}>Milestone</Text>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.achievedText}>Achieved!</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextLabel}>Next Milestone</Text>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              
              {/* Progress Visualization */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                  <View style={styles.progressGlow} />
                </View>
                <View style={styles.progressPercentage}>
                  <Text style={styles.progressPercentageText}>{Math.round(progressPercentage)}%</Text>
                </View>
              </View>
              
              <Text style={styles.daysToGo}>{daysToGo} days to go</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
    height: 140,
  },
  gradientBackground: {
    borderRadius: 16,
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  nextLabel: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  milestoneTitle: {
    ...typography.h3,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  daysToGo: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  achievedText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 8,
    position: 'relative',
  },
  progressTrack: {
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressPercentage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  progressPercentageText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 