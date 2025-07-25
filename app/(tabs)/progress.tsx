import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Award, Star, Trophy, Clock, Calendar, Heart, BookOpen, Wind, TrendingUp, Check, Target, Shield, Moon, MessageSquare, Smile, Share } from 'lucide-react-native';
import colors from '@/constants/colors';
import { calculateDaysSober } from '@/utils/dateUtils';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useChatStore } from '@/store/chatStore';
import { useMoodStore } from '@/store/moodStore';
import { useJournalStore } from '@/store/journalStore';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { MoodTrackerChart } from '@/components/MoodTrackerChart';
import { useActivityStore } from '@/store/activityStore';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { startDate, level, xp, dailyXP } = useSobrietyStore();
  const { breathingExercises, journalEntries, cravingsOvercome, sharesCount } = useActivityStore();
  const { reasons } = useReasonsStore();
  const { messages } = useChatStore();
  const { entries: moodEntries } = useMoodStore();
  const { entries: journalEntryStore } = useJournalStore();
  
  // Calculate days sober using utility function
  const daysSober = calculateDaysSober(startDate);
  
  // Calculate total XP earned (sum of all daily XP)
  const totalXPEarned = Object.values(dailyXP).reduce((sum, xp) => sum + xp, 0);
  
  const milestoneData = [
    {
      days: 1,
      title: "First Day",
      description: "Your recovery journey begins",
      icon: <Clock size={20} color="#fff" />,
      color: colors.primary,
      xpReward: 50,
      scienceInfo: "Brain enters acute withdrawal, stress hormones spike as it adjusts to absence of substances"
    },
    {
      days: 3,
      title: "Three Days",
      description: "Peak withdrawal phase",
      icon: <Star size={20} color="#fff" />,
      color: "#FFA726",
      xpReward: 75,
      scienceInfo: "Body hits peak withdrawal, brain chemistry is highly imbalanced, driving strong cravings and mood swings"
    },
    {
      days: 7,
      title: "One Week",
      description: "Initial brain rebalancing",
      icon: <Calendar size={20} color="#fff" />,
      color: colors.accent,
      xpReward: 100,
      scienceInfo: "Acute withdrawal fades, brain begins early stages of chemical recalibration"
    },
    {
      days: 14,
      title: "Two Weeks",
      description: "Sleep patterns improving",
      icon: <Wind size={20} color="#fff" />,
      color: "#66BB6A",
      xpReward: 150,
      scienceInfo: "Sleep and mood begin improving, early brain healing underway"
    },
    {
      days: 30,
      title: "One Month",
      description: "Significant brain changes",
      icon: <Trophy size={20} color="#fff" />,
      color: "#5E72E4",
      xpReward: 300,
      scienceInfo: "Neural pathways start rewiring, cognitive function improves"
    },
    {
      days: 90,
      title: "Three Months",
      description: "Neuroplasticity acceleration",
      icon: <Award size={20} color="#fff" />,
      color: "#11CDEF",
      xpReward: 500,
      scienceInfo: "Brain forms new healthy neural pathways, willpower strengthens"
    },
    {
      days: 180,
      title: "Six Months",
      description: "Emotional regulation restored",
      icon: <Heart size={20} color="#fff" />,
      color: "#E91E63",
      xpReward: 750,
      scienceInfo: "Emotional centers of brain show significant healing"
    },
    {
      days: 365,
      title: "One Year",
      description: "Major milestone achievement",
      icon: <Star size={20} color="#fff" />,
      color: "#FFD700",
      xpReward: 1000,
      scienceInfo: "Brain structure and function show remarkable recovery"
    },
    {
      days: 730,
      title: "Two Years",
      description: "Long-term transformation",
      icon: <Award size={20} color="#fff" />,
      color: "#8E24AA",
      xpReward: 1500,
      scienceInfo: "Brain fully adapted to substance-free life, relapse risk drops significantly"
    },
    {
      days: 1825,
      title: "Five Years",
      description: "Thriving in recovery",
      icon: <Trophy size={20} color="#fff" />,
      color: "#FF6F00",
      xpReward: 2500,
      scienceInfo: "Brain function stable and resilient, long-term recovery well established"
    }
  ]
  
  
  // Helper function to determine milestone state
  const getMilestoneState = (targetDays: number, index: number) => {
    if (daysSober >= targetDays) {
      return { completed: true, current: false };
    }
    
    // Current milestone is the next one to achieve
    const previousMilestone = index > 0 ? milestoneData[index - 1] : null;
    const isNext = !previousMilestone || daysSober >= previousMilestone.days;
    
    return { completed: false, current: isNext };
  };
  
  // Calculate badge progress
  const mindfulMasterProgress = Math.min(breathingExercises * 10, 100); // 10% per exercise up to 10
  const journalKeeperProgress = Math.min(journalEntries * 20, 100); // 20% per entry up to 5
  const craveConquerorProgress = Math.min(cravingsOvercome * 25, 100); // 4 cravings overcome
  
  // Calculate Getting Started badge progress
  const motivatorProgress = Math.min(((reasons?.length || 0) / 3) * 100, 100); // Add 3 reasons for recovery (incremental)
  const helloSobiProgress = messages?.some(msg => msg.role === 'user') ? 100 : 0; // First chat with AI companion (binary)
  const moodTrackerProgress = (moodEntries?.length || 0) > 0 ? 100 : 0; // Log first mood (binary)
  const firstStoryProgress = (journalEntryStore?.length || 0) > 0 ? 100 : 0; // Write first journal entry (binary)
  const deepBreathProgress = (breathingExercises || 0) > 0 ? 100 : 0; // Complete first breathing exercise (binary)
  const firstShareProgress = (sharesCount || 0) > 0 ? 100 : 0; // Share progress for first time (binary)
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Progress",
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Journey</Text>
          <Text style={styles.headerSubtitle}>Level {level} • {daysSober} days sober</Text>
        </View>
        
        {/* Journey Path - Enhanced with clearer plan */}
        <View style={styles.journeyContainer}>
          <View style={styles.journeyHeader}>
            <Text style={styles.journeyTitle}>Recovery Roadmap</Text>
            <Text style={styles.journeySubtitle}>Follow your path to wellness</Text>
          </View>
          
          <View style={styles.journeyPath}>
            <View style={styles.journeyLine} />
            
            {milestoneData.map((milestone, index) => (
              <MilestoneNode 
                key={milestone.days}
                title={milestone.title}
                description={milestone.description}
                icon={milestone.icon}
                color={milestone.color}
                completed={getMilestoneState(milestone.days, index).completed}
                current={getMilestoneState(milestone.days, index).current}
                xpReward={milestone.xpReward}
                scienceInfo={milestone.scienceInfo}
              />
            ))}
          </View>
        </View>
        
        {/* Heatmap Calendar Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sobriety Calendar</Text>
          <Text style={styles.sectionSubtitle}>Track your daily progress</Text>
          <HeatmapCalendar startDate={startDate} />
        </View>
        
        {/* Mood Tracker Chart Section */}
        <View style={styles.moodTrackerContainer}>
          <MoodTrackerChart />
        </View>
        
        {/* Badges Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Badges</Text>
          <Text style={styles.sectionSubtitle}>Achievements unlocked on your journey</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesContainer}
          >
            {/* Getting Started Badges */}
            <BadgeItem 
              title="Motivator" 
              description="Add 3 reasons for recovery"
              icon={<Heart size={24} color="#FFFFFF" />}
              color="#E91E63" // Pink
              progress={motivatorProgress}
              earned={motivatorProgress >= 100}
            />
            <BadgeItem 
              title="Hello Sobi" 
              description="First chat with Sobi"
              icon={<MessageSquare size={24} color="#FFFFFF" />}
              color="#11CDEF" // Cyan
              progress={helloSobiProgress}
              earned={helloSobiProgress >= 100}
            />
            <BadgeItem 
              title="Mood Tracker" 
              description="Log first mood"
              icon={<Smile size={24} color="#FFFFFF" />}
              color="#66BB6A" // Green
              progress={moodTrackerProgress}
              earned={moodTrackerProgress >= 100}
            />
            <BadgeItem 
              title="First Story" 
              description="Write first journal entry"
              icon={<BookOpen size={24} color="#FFFFFF" />}
              color="#FB6340" // Orange
              progress={firstStoryProgress}
              earned={firstStoryProgress >= 100}
            />
            <BadgeItem 
              title="Deep Breath" 
              description="Complete first breathing exercise"
              icon={<Wind size={24} color="#FFFFFF" />}
              color="#5E72E4" // Indigo
              progress={deepBreathProgress}
              earned={deepBreathProgress >= 100}
            />
            <BadgeItem 
              title="First Share" 
              description="Share progress for first time"
              icon={<Share size={24} color="#FFFFFF" />}
              color="#8E24AA" // Purple
              progress={firstShareProgress}
              earned={firstShareProgress >= 100}
            />
            
            {/* Activity Badges */}
            <BadgeItem 
              title="Mindful Master" 
              description="Complete 10 breathing exercises"
              icon={<Wind size={24} color="#FFFFFF" />}
              color="#11CDEF" // Cyan
              progress={mindfulMasterProgress}
              earned={mindfulMasterProgress >= 100}
            />
            <BadgeItem 
              title="Journal Keeper" 
              description="Write 5 journal entries"
              icon={<BookOpen size={24} color="#FFFFFF" />}
              color="#FB6340" // Orange
              progress={journalKeeperProgress}
              earned={journalKeeperProgress >= 100}
            />
            <BadgeItem 
              title="Cravings Conqueror" 
              description="Overcome 4 cravings"
              icon={<Shield size={24} color="#FFFFFF" />}
              color="#FFA726" // Orange
              progress={craveConquerorProgress}
              earned={craveConquerorProgress >= 100}
            />
            
            {/* Recovery Milestone Badges */}
            <BadgeItem 
              title="First Day" 
              description="1 day sober"
              icon={<Clock size={24} color="#FFFFFF" />}
              color={colors.primary}
              progress={daysSober >= 1 ? 100 : (daysSober * 100)}
              earned={daysSober >= 1}
            />
            <BadgeItem 
              title="Three Days" 
              description="3 days sober"
              icon={<Star size={24} color="#FFFFFF" />}
              color="#FFA726" // Orange
              progress={daysSober >= 3 ? 100 : Math.min((daysSober / 3) * 100, 100)}
              earned={daysSober >= 3}
            />
            <BadgeItem 
              title="One Week" 
              description="7 days sober"
              icon={<Calendar size={24} color="#FFFFFF" />}
              color={colors.accent}
              progress={daysSober >= 7 ? 100 : Math.min((daysSober / 7) * 100, 100)}
              earned={daysSober >= 7}
            />
            <BadgeItem 
              title="Two Weeks" 
              description="14 days sober"
              icon={<Wind size={24} color="#FFFFFF" />}
              color="#66BB6A" // Green
              progress={daysSober >= 14 ? 100 : Math.min((daysSober / 14) * 100, 100)}
              earned={daysSober >= 14}
            />
            <BadgeItem 
              title="One Month" 
              description="30 days sober"
              icon={<Trophy size={24} color="#FFFFFF" />}
              color="#5E72E4" // Indigo
              progress={daysSober >= 30 ? 100 : Math.min((daysSober / 30) * 100, 100)}
              earned={daysSober >= 30}
            />
            <BadgeItem 
              title="Three Months" 
              description="90 days sober"
              icon={<Award size={24} color="#FFFFFF" />}
              color="#11CDEF" // Cyan
              progress={daysSober >= 90 ? 100 : Math.min((daysSober / 90) * 100, 100)}
              earned={daysSober >= 90}
            />
            <BadgeItem 
              title="Six Months" 
              description="180 days sober"
              icon={<Heart size={24} color="#FFFFFF" />}
              color="#E91E63" // Pink
              progress={daysSober >= 180 ? 100 : Math.min((daysSober / 180) * 100, 100)}
              earned={daysSober >= 180}
            />
            <BadgeItem 
              title="One Year" 
              description="365 days sober"
              icon={<Star size={24} color="#FFFFFF" />}
              color="#FFD700" // Gold
              progress={daysSober >= 365 ? 100 : Math.min((daysSober / 365) * 100, 100)}
              earned={daysSober >= 365}
            />
            <BadgeItem 
              title="Two Years" 
              description="730 days sober"
              icon={<Award size={24} color="#FFFFFF" />}
              color="#8E24AA" // Purple
              progress={daysSober >= 730 ? 100 : Math.min((daysSober / 730) * 100, 100)}
              earned={daysSober >= 730}
            />
            <BadgeItem 
              title="Five Years" 
              description="1825 days sober"
              icon={<Trophy size={24} color="#FFFFFF" />}
              color="#FF6F00" // Deep Orange
              progress={daysSober >= 1825 ? 100 : Math.min((daysSober / 1825) * 100, 100)}
              earned={daysSober >= 1825}
            />
          </ScrollView>
        </View>
        
        {/* Stats Section */}
        {/* <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <Text style={styles.sectionSubtitle}>Track your recovery activities</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Breathing Exercises"
              value={breathingExercises.toString()}
              icon={<Wind size={20} color={colors.primary} />}
            />
            <StatCard 
              title="Journal Entries"
              value={journalEntries.toString()}
              icon={<BookOpen size={20} color={colors.primary} />}
            />
            <StatCard 
              title="Cravings Overcome"
              value={cravingsOvercome.toString()}
              icon={<Star size={20} color={colors.primary} />}
            />
            <StatCard 
              title="XP Earned"
              value={totalXPEarned.toString()}
              icon={<Award size={20} color={colors.primary} />}
            />
          </View>
        </View> */}
      </ScrollView>
    </View>
  );
}

interface MilestoneProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  completed: boolean;
  current: boolean;
  xpReward: number;
  scienceInfo: string;
}

const MilestoneNode = ({ title, description, icon, color, completed, current, xpReward, scienceInfo }: MilestoneProps) => (
  <View style={styles.milestoneContainer}>
    <View style={[
      styles.milestoneNode, 
      { 
        backgroundColor: completed ? color : colors.border,
        opacity: 1
      },
      current && styles.currentNode
    ]}>
      {icon}
    </View>
    <View style={[
      styles.milestoneContent,
      current && styles.currentMilestoneContent
    ]}>
      {current && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>CURRENT</Text>
        </View>
      )}
      <Text style={[
        styles.milestoneTitle,
        { 
          color: completed || current ? colors.text : colors.textMuted,
          fontWeight: current ? '700' : completed ? '600' : '500'
        }
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.milestoneDescription,
        { color: completed || current ? colors.textLight : colors.textMuted }
      ]}>
        {description}
      </Text>
        <Text style={[
        styles.milestoneScienceInfo,
        { color: completed || current ? colors.primary : colors.textMuted }
        ]}>
        {scienceInfo}
        </Text>
      <Text style={[
        styles.milestoneXP,
        { 
          color: completed || current ? colors.primary : colors.textMuted,
          fontWeight: current ? '700' : '500'
        }
      ]}>
        +{xpReward} XP
      </Text>
    </View>
  </View>
);

interface BadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  earned: boolean;
}

const BadgeItem = ({ title, description, icon, color, progress, earned }: BadgeProps) => (
  <View style={[styles.badgeItem, !earned && { opacity: progress / 100 + 0.4 }]}>
    <View style={[styles.badgeIcon, { backgroundColor: color }]}>
      {icon}
    </View>
    <Text style={styles.badgeTitle}>{title}</Text>
    <Text style={styles.badgeDescription} numberOfLines={2}>
      {description}
    </Text>
    {!earned && (
      <View style={styles.badgeProgressContainer}>
        <View style={[styles.badgeProgress, { width: `${progress}%`, backgroundColor: color }]} />
      </View>
    )}
    {earned && (
      <View style={[styles.badgeEarnedTag, { backgroundColor: color }]}>
        <Text style={styles.badgeEarnedText}>Earned</Text>
      </View>
    )}
  </View>
);

interface StatProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatProps) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  journeyContainer: {
    marginBottom: 30,
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
  journeyHeader: {
    marginBottom: 20,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  journeySubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
  journeyPath: {
    position: 'relative',
    paddingLeft: 24,
  },
  journeyLine: {
    position: 'absolute',
    left: 48,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  milestoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
    position: 'relative',
  },
  milestoneNode: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    zIndex: 2,
    borderWidth: 3,
    borderColor: colors.cardBackground,
  },
  currentNode: {
    borderColor: colors.primary,
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingTop: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 6,
  },
  milestoneScienceInfo: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  milestoneXP: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  badgesContainer: {
    paddingRight: 20,
    gap: 16,
  },
  badgeItem: {
    width: 140,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 10,
    height: 32,
  },
  badgeProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.progressBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  badgeProgress: {
    height: '100%',
    borderRadius: 2,
  },
  badgeEarnedTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  badgeEarnedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(126, 174, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
  },
  currentMilestoneContent: {
    backgroundColor: 'rgba(107, 152, 194, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginLeft: -12,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(107, 152, 194, 0.2)',
  },
  currentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moodTrackerContainer: {
    marginBottom: 30,
  },
});