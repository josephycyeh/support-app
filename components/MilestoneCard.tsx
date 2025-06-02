import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Clock, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import * as Haptics from 'expo-haptics';

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
  const { startDate, milestonesReached } = useSobrietyStore();

  // Calculate days sober
  const now = new Date();
  const start = new Date(startDate);
  const daysSober = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // Find next milestone
  const nextMilestone = MILESTONES.find(milestone => 
    daysSober < milestone.days && !milestonesReached.includes(milestone.days)
  );

  // If no next milestone found, show the highest one
  const milestone = nextMilestone || MILESTONES[MILESTONES.length - 1];
  const Icon = milestone.icon;
  const daysToGo = Math.max(0, milestone.days - daysSober);
  const isCompleted = daysSober >= milestone.days;

  // Calculate progress for progress bar
  const previousMilestone = MILESTONES.find((m, index) => {
    const nextIndex = MILESTONES.findIndex(mil => mil.days === milestone.days);
    return index === nextIndex - 1;
  });
  
  const startDays = previousMilestone ? previousMilestone.days : 0;
  const totalDaysNeeded = milestone.days - startDays;
  const currentProgress = daysSober - startDays;
  const progressPercentage = Math.min(Math.max((currentProgress / totalDaysNeeded) * 100, 0), 100);

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
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
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
    height: 120,
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
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  milestoneTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  daysToGo: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  achievedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginVertical: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
  },
}); 