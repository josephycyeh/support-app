import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert,  } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Heart, Target, BookOpen, LogOut, Edit, X, Save, Trash2 } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useJournalStore } from '@/store/journalStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { AddReasonModal } from '@/components/AddReasonModal';
import { EditReasonModal } from '@/components/EditReasonModal';
import Modal from 'react-native-modal';
import { BirthdayEditModal } from '@/components/BirthdayEditModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { level, xp, startDate, setBirthday, xpToNextLevel, resetSobriety } = useSobrietyStore();
  const { entries } = useJournalStore();
  const { reasons, addReason, updateReason, deleteReason } = useReasonsStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<{id: string, text: string} | null>(null);
  
  // Get today's date for the sobriety counter
  const today = new Date();
  const sobrietyDate = new Date(startDate);
  
  // Calculate days sober
  const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate XP progress
  const progressPercentage = (xp / xpToNextLevel) * 100;
  
  // Get user's birthday (fallback to today if not set)
  const birthday = useSobrietyStore.getState().birthday || new Date();
  
  // Get recent journal entries (last 3)
  const recentEntries = entries.slice(0, 3);
  
  const handleAddNewReason = () => {
    setShowAddModal(true);
  };
  
  const handleSaveNewReason = (text: string) => {
    // Add the new reason
    addReason(text);
    
    // Close the modal
    setShowAddModal(false);
  };
  
  const handleOpenReasonEditor = (reason: { id: string, text: string }) => {
    setSelectedReason(reason);
    setShowEditModal(true);
  };
  
  const handleUpdateReason = (id: string, text: string) => {
    // Update the reason
    updateReason(id, text);
    
    // Close the modal
    setShowEditModal(false);
    setSelectedReason(null);
  };
  
  const handleDeleteReason = (id: string) => {
    // Delete the reason
    deleteReason(id);
    
    // Close the modal
    setShowEditModal(false);
    setSelectedReason(null);
  };
  
  const closeAddModal = () => {
    setShowAddModal(false);
  };
  
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedReason(null);
  };
  
  const handleNewJournalEntry = () => {
    router.push('/journal-entry');
  };
  
  const handleEditBirthday = () => {
    setShowBirthdayModal(true);
  };
  
  const handleSaveBirthday = (date: Date) => {
    setBirthday(date);
    setShowBirthdayModal(false);
  };
  
  const closeBirthdayModal = () => {
    setShowBirthdayModal(false);
  };
  
  // Format birthday for display
  const formatBirthday = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
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
              value={formatBirthday(birthday)}
              isEditable
              onEdit={handleEditBirthday}
            />
          </Card>
        </View>
        
        <View style={styles.sectionContainer}>
          <SectionHeader title="My Reasons for Change" />
          <Card style={styles.reasonsContainer}>
            {reasons.map((reason) => (
              <TouchableOpacity 
                key={reason.id} 
                style={styles.reasonItem}
                onPress={() => handleOpenReasonEditor(reason)}
              >
              <Heart size={20} color={colors.primary} />
                <Text style={styles.reasonText}>{reason.text}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addReasonButton} onPress={handleAddNewReason}>
              <Text style={styles.addReasonText}>+ Add another reason</Text>
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
            onPress={handleNewJournalEntry}
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
      
      {/* Add Reason Modal */}
      <AddReasonModal
        visible={showAddModal}
        onClose={closeAddModal}
        onSave={handleSaveNewReason}
      />
      
      {/* Edit Reason Modal */}
      <EditReasonModal
        visible={showEditModal}
        reason={selectedReason}
        onClose={closeEditModal}
        onSave={handleUpdateReason}
        onDelete={handleDeleteReason}
      />
      
      {/* Birthday Edit Modal */}
      <BirthdayEditModal
        visible={showBirthdayModal}
        currentDate={birthday}
        onClose={closeBirthdayModal}
        onSave={handleSaveBirthday}
      />
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
  onEdit?: () => void;
}

const PersonalInfoItem = ({ icon, label, value, isEditable = false, onEdit }: PersonalInfoItemProps) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      {icon}
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
    {isEditable && (
      <TouchableOpacity style={styles.infoEditButton} onPress={onEdit}>
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
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseButton: {
    padding: 5,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  modalActionButtonFull: {
    flex: 1,
    marginHorizontal: 0,
  },
  modalDeleteButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.danger,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalDeleteText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  modalSaveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalSaveText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
});