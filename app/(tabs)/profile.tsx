import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Heart, Target, BookOpen, LogOut } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useJournalStore } from '@/store/journalStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const { startDate, level, xp, xpToNextLevel, resetSobriety } = useSobrietyStore();
  const { entries } = useJournalStore();
  const { reasons, addReason } = useReasonsStore();
  
  // Calculate days sober
  const daysSober = Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const progressPercentage = Math.min((xp / xpToNextLevel) * 100, 100);
  
  // Get recent journal entries
  const recentEntries = entries.slice(0, 3);
  
  const addNewReason = () => {
    addReason({ 
      id: Math.random().toString(36).substr(2, 9), 
      text: 'New reason for change' 
    });
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Profile",
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <Text style={styles.headerSubtitle}>Level {level} • {daysSober} days sober</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{daysSober}</Text>
            <Text style={styles.statLabel}>Days Sober</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Level {level}</Text>
            <Text style={styles.statLabel}>{Math.floor(progressPercentage)}% to Next</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <SectionHeader title="Personal Information" />
          <Card style={styles.personalInfoContainer}>
            <PersonalInfoItem 
              icon={<Calendar size={20} color={colors.primary} />}
              label="Sobriety Date"
              value={new Date(startDate).toLocaleDateString()}
            />
            <PersonalInfoItem 
              icon={<Calendar size={20} color={colors.primary} />}
              label="Birthday"
              value="January 15, 1988"
              isEditable
            />
          </Card>
        </View>
        
        <View style={styles.sectionContainer}>
          <SectionHeader title="My Reasons for Change" />
          <Card style={styles.reasonsContainer}>
            {reasons.map((reason) => (
              <View key={reason.id} style={styles.reasonItem}>
                <Heart size={20} color={colors.primary} />
                <Text style={styles.reasonText}>{reason.text}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addReasonButton} onPress={addNewReason}>
              <Text style={styles.addReasonText}>+ Add another reason</Text>
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.sectionContainer}>
          <SectionHeader title="Recovery Goals" />
          <Card style={styles.goalsContainer}>
            <View style={styles.goalItem}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.goalText}>Complete 30 days of sobriety</Text>
              <View style={[styles.goalBadge, { backgroundColor: daysSober >= 30 ? colors.success : colors.border }]}>
                <Text style={styles.goalBadgeText}>{daysSober >= 30 ? 'Achieved' : `${daysSober}/30`}</Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.goalText}>Attend 10 support group meetings</Text>
              <View style={[styles.goalBadge, { backgroundColor: colors.border }]}>
                <Text style={styles.goalBadgeText}>3/10</Text>
              </View>
            </View>
            <View style={styles.goalItem}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.goalText}>Journal daily for 2 weeks</Text>
              <View style={[styles.goalBadge, { backgroundColor: colors.border }]}>
                <Text style={styles.goalBadgeText}>5/14</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addGoalButton}>
              <Text style={styles.addGoalText}>+ Add new goal</Text>
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.sectionContainer}>
          <SectionHeader title="Journal Entries" />
          <View style={styles.journalContainer}>
            {recentEntries.length > 0 ? (
              recentEntries.map(entry => (
                <JournalEntry 
                  key={entry.id}
                  date={formatDate(entry.date)}
                  title={entry.title}
                  preview={entry.content}
                />
              ))
            ) : (
              <Text style={styles.noEntriesText}>No journal entries yet</Text>
            )}
          </View>
          
          <Button 
            onPress={() => {}}
            variant="primary"
            style={styles.newEntryButton}
          >
            New Journal Entry
          </Button>
        </View>
        
        <Button
          onPress={() => resetSobriety()}
          variant="outline"
          style={styles.resetButton}
          icon={<LogOut size={18} color={colors.danger} />}
          textStyle={styles.resetButtonText}
        >
          Reset Sobriety Counter
        </Button>
      </ScrollView>
    </View>
  );
}

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If today, show "Today"
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  }
  
  // If yesterday, show "Yesterday"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Otherwise, show date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric'
  });
};

interface PersonalInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isEditable?: boolean;
}

const PersonalInfoItem = ({ icon, label, value, isEditable = false }: PersonalInfoItemProps) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      {icon}
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {isEditable && (
      <TouchableOpacity style={styles.infoEditButton}>
        <Text style={styles.infoEditText}>Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

interface JournalProps {
  date: string;
  title: string;
  preview: string;
}

const JournalEntry = ({ date, title, preview }: JournalProps) => (
  <TouchableOpacity style={styles.journalEntry}>
    <Text style={styles.journalDate}>{date}</Text>
    <Text style={styles.journalTitle}>{title}</Text>
    <Text style={styles.journalPreview} numberOfLines={2}>{preview}</Text>
  </TouchableOpacity>
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
    marginBottom: 24,
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textLight,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.border,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  personalInfoContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  infoEditButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 12,
  },
  infoEditText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  reasonsContainer: {
    padding: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 16,
    flex: 1,
  },
  addReasonButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addReasonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  goalsContainer: {
    padding: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  goalText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 16,
    flex: 1,
  },
  goalBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  goalBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addGoalButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addGoalText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  journalContainer: {
    gap: 12,
    marginBottom: 20,
  },
  journalEntry: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  journalDate: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
  },
  journalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  journalPreview: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  noEntriesText: {
    fontSize: 15,
    color: colors.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  newEntryButton: {
    marginTop: 8,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: 'rgba(240, 161, 161, 0.15)',
    borderColor: 'rgba(240, 161, 161, 0.3)',
  },
  resetButtonText: {
    color: colors.danger,
  },
});