import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { Award, Star, Trophy, Clock, Calendar, Heart, BookOpen, Wind, TrendingUp, Check } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { HeatmapCalendar } from '@/components/HeatmapCalendar';
import { useActivityStore } from '@/store/activityStore';

const screenWidth = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { startDate, level, xp } = useSobrietyStore();
  const { breathingExercises, journalEntries, cravingsOvercome } = useActivityStore();
  
  // Calculate days sober
  const daysSober = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate badge progress
  const earlyRiserProgress = Math.min(daysSober, 5) * 20; // 20% per day up to 5 days
  const mindfulMasterProgress = Math.min(breathingExercises * 10, 100); // 10% per exercise up to 10
  const journalKeeperProgress = Math.min(journalEntries * 20, 100); // 20% per entry up to 5
  const communityHelperProgress = 30; // Fixed for now, could be dynamic in the future
  
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
            
            {/* Milestone 1 - First Day */}
            <MilestoneNode 
              title="First Day"
              description="Your recovery journey begins"
              icon={<Clock size={20} color="#fff" />}
              color={colors.primary}
              completed={daysSober >= 1}
              current={daysSober === 0}
              xpReward={50}
              scienceInfo="Your brain starts adjusting to life without substances"
            />
            
            {/* Milestone 2 - Three Days */}
            <MilestoneNode 
              title="Three Days"
              description="Peak withdrawal phase"
              icon={<Star size={20} color="#fff" />}
              color="#FFA726" // Orange
              completed={daysSober >= 3}
              current={daysSober >= 1 && daysSober < 3}
              xpReward={75}
              scienceInfo="Physical withdrawal symptoms often peak around this time"
            />
            
            {/* Milestone 3 - One Week */}
            <MilestoneNode 
              title="One Week"
              description="Initial brain rebalancing"
              icon={<Calendar size={20} color="#fff" />}
              color={colors.accent}
              completed={daysSober >= 7}
              current={daysSober >= 3 && daysSober < 7}
              xpReward={100}
              scienceInfo="Dopamine and serotonin systems begin to stabilize"
            />
            
            {/* Milestone 4 - Two Weeks */}
            <MilestoneNode 
              title="Two Weeks"
              description="Sleep patterns improving"
              icon={<Wind size={20} color="#fff" />}
              color="#66BB6A" // Green
              completed={daysSober >= 14}
              current={daysSober >= 7 && daysSober < 14}
              xpReward={150}
              scienceInfo="Many people report better sleep quality and mood stability"
            />
            
            {/* Milestone 5 - One Month */}
            <MilestoneNode 
              title="One Month"
              description="Significant brain changes"
              icon={<Trophy size={20} color="#fff" />}
              color="#5E72E4" // Indigo
              completed={daysSober >= 30}
              current={daysSober >= 14 && daysSober < 30}
              xpReward={300}
              scienceInfo="Neural pathways start rewiring, cognitive function improves"
            />
            
            {/* Milestone 6 - Three Months */}
            <MilestoneNode 
              title="Three Months"
              description="Neuroplasticity acceleration"
              icon={<Award size={20} color="#fff" />}
              color="#11CDEF" // Cyan
              completed={daysSober >= 90}
              current={daysSober >= 30 && daysSober < 90}
              xpReward={500}
              scienceInfo="Brain forms new healthy neural pathways, willpower strengthens"
            />
            
            {/* Milestone 7 - Six Months */}
            <MilestoneNode 
              title="Six Months"
              description="Emotional regulation restored"
              icon={<Heart size={20} color="#fff" />}
              color="#E91E63" // Pink
              completed={daysSober >= 180}
              current={daysSober >= 90 && daysSober < 180}
              xpReward={750}
              scienceInfo="Emotional centers of brain show significant healing"
            />
            
            {/* Milestone 8 - One Year */}
            <MilestoneNode 
              title="One Year"
              description="Major milestone achievement"
              icon={<Star size={20} color="#fff" />}
              color="#FFD700" // Gold
              completed={daysSober >= 365}
              current={daysSober >= 180 && daysSober < 365}
              xpReward={1000}
              scienceInfo="Brain structure and function show remarkable recovery"
            />
            
            {/* Milestone 9 - Two Years */}
            <MilestoneNode 
              title="Two Years"
              description="Long-term transformation"
              icon={<Award size={20} color="#fff" />}
              color="#8E24AA" // Purple
              completed={daysSober >= 730}
              current={daysSober >= 365 && daysSober < 730}
              xpReward={1500}
              scienceInfo="Continued neural growth, reduced relapse risk"
            />
            
            {/* Milestone 10 - Five Years */}
            <MilestoneNode 
              title="Five Years"
              description="Recovery mastery"
              icon={<Trophy size={20} color="#fff" />}
              color="#FF6F00" // Deep Orange
              completed={daysSober >= 1825}
              current={daysSober >= 730 && daysSober < 1825}
              xpReward={2500}
              scienceInfo="Brain health fully restored, inspiring others on their journey"
            />
          </View>
        </View>
        
        {/* Heatmap Calendar Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sobriety Calendar</Text>
          <Text style={styles.sectionSubtitle}>Track your daily progress</Text>
          <HeatmapCalendar startDate={startDate} />
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
            <BadgeItem 
              title="Early Riser" 
              description="Complete morning check-in 5 days in a row"
              icon={<Clock size={24} color="#FFFFFF" />}
              color={colors.primary}
              progress={earlyRiserProgress}
              earned={earlyRiserProgress >= 100}
            />
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
              title="Community Helper" 
              description="Support 3 community members"
              icon={<Heart size={24} color="#FFFFFF" />}
              color="#F5365C" // Pink
              progress={communityHelperProgress}
              earned={communityHelperProgress >= 100}
            />
          </ScrollView>
        </View>
        
        {/* Stats Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
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
              value={xp.toString()}
              icon={<Award size={20} color={colors.primary} />}
            />
          </View>
        </View>
        
        {/* Next Challenges */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Next Challenges</Text>
          <Text style={styles.sectionSubtitle}>Complete these to earn XP and level up</Text>
          <View style={styles.challengesContainer}>
            <ChallengeCard 
              title="Complete 3 breathing exercises"
              xpReward={30}
              progress={Math.min(breathingExercises, 3)}
              total={3}
            />
            <ChallengeCard 
              title="Log your thoughts for 5 days"
              xpReward={50}
              progress={Math.min(journalEntries, 5)}
              total={5}
            />
            <ChallengeCard 
              title="Share your story with the community"
              xpReward={40}
              progress={0}
              total={1}
            />
          </View>
        </View>
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
      { backgroundColor: completed ? color : current ? color : colors.border },
      current && styles.currentNode
    ]}>
      {icon}
    </View>
    <View style={styles.milestoneContent}>
      <Text style={[
        styles.milestoneTitle,
        completed && { color: colors.text },
        current && { color: colors.text, fontWeight: '700' }
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.milestoneDescription,
        completed && { color: colors.textLight },
        current && { color: colors.textLight }
      ]}>
        {description}
      </Text>
      <Text style={[
        styles.milestoneScienceInfo,
        completed && { color: colors.primary },
        current && { color: colors.primary }
      ]}>
        {scienceInfo}
      </Text>
      <Text style={[
        styles.milestoneXP,
        completed && { color: colors.primary },
        current && { color: colors.primary, fontWeight: '600' }
      ]}>
        +{xpReward} XP
      </Text>
    </View>
    {completed && (
      <View style={styles.completedBadge}>
        <Check size={12} color="#fff" />
      </View>
    )}
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

interface ChallengeProps {
  title: string;
  xpReward: number;
  progress: number;
  total: number;
}

const ChallengeCard = ({ title, xpReward, progress, total }: ChallengeProps) => (
  <View style={styles.challengeCard}>
    <View style={styles.challengeHeader}>
      <Text style={styles.challengeTitle}>{title}</Text>
      <Text style={styles.challengeXP}>+{xpReward} XP</Text>
    </View>
    <View style={styles.challengeProgressContainer}>
      <View 
        style={[
          styles.challengeProgress, 
          { width: `${(progress / total) * 100}%` }
        ]} 
      />
    </View>
    <Text style={styles.challengeProgressText}>
      {progress} of {total} completed
    </Text>
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
    left: 24,
    top: 30,
    bottom: 30,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
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
    borderColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
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
  completedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
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
  challengesContainer: {
    gap: 12,
  },
  challengeCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  challengeXP: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  challengeProgressContainer: {
    height: 6,
    backgroundColor: colors.progressBackground,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  challengeProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  challengeProgressText: {
    fontSize: 13,
    color: colors.textLight,
  },
});