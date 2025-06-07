import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Heart, Target, BookOpen, LogOut, Edit, X, Save, Trash2, User, MessageSquare, Shield, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { useChatStore } from '@/store/chatStore';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { AddReasonModal } from '@/components/AddReasonModal';
import { EditReasonModal } from '@/components/EditReasonModal';
import { EditNameModal } from '@/components/EditNameModal';
import { EditAgeModal } from '@/components/EditAgeModal';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProfileScreen() {
  const router = useRouter();
  const { level, xp, startDate, xpToNextLevel, resetSobriety, name, age, setName, setAge, setStartDate } = useSobrietyStore();
  const { reasons, addReason, updateReason, deleteReason } = useReasonsStore();
  const { clearHistory } = useChatStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showSobrietyDateModal, setShowSobrietyDateModal] = useState(false);
  const [tempSobrietyDate, setTempSobrietyDate] = useState(new Date());
  const [selectedReason, setSelectedReason] = useState<{id: string, text: string} | null>(null);
  
  // Calculate days sober using consistent ISO timestamp format
  const today = new Date();
  const sobrietyDate = new Date(startDate); // startDate is always ISO timestamp now
  const daysSober = Math.floor((today.getTime() - sobrietyDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate XP progress
  const progressPercentage = (xp / xpToNextLevel) * 100;
  
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
  
  const handleEditName = () => {
    setShowNameModal(true);
  };
  
  const handleSaveName = (newName: string) => {
    setName(newName);
    setShowNameModal(false);
  };
  
  const closeNameModal = () => {
    setShowNameModal(false);
  };
  
  const handleEditAge = () => {
    setShowAgeModal(true);
  };
  
  const handleSaveAge = (newAge: number) => {
    setAge(newAge);
    setShowAgeModal(false);
  };
  
  const closeAgeModal = () => {
    setShowAgeModal(false);
  };
  
  const handleClearChatHistory = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to delete all your conversations with Sushi? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Clear History", 
          onPress: () => clearHistory(),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This will erase all your data including your sobriety progress, reasons, and chat history. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete Account", 
          onPress: async () => {
            try {
              // Clear all AsyncStorage data
              await AsyncStorage.clear();
              // Navigate back to onboarding
              router.replace('/onboarding');
            } catch (error) {
              console.error('Error clearing storage:', error);
              Alert.alert('Error', 'Failed to delete account data. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleResetSobriety = () => {
    Alert.alert(
      "Reset Sobriety Counter",
      "Are you sure you want to reset your sobriety counter? This will restart your streak from day 0.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Reset Counter", 
          onPress: () => resetSobriety(),
          style: "destructive"
        }
      ]
    );
  };
  
  const handleEditSobrietyDate = () => {
    setTempSobrietyDate(new Date(startDate));
    setShowSobrietyDateModal(true);
  };
  
  const handleSaveSobrietyDate = (date: Date) => {
    // Set the time to the beginning of the day (00:00:00) 
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Update the sobriety start date
    setStartDate(startOfDay.toISOString());
    setShowSobrietyDateModal(false);
  };
  
  const closeSobrietyDateModal = () => {
    setShowSobrietyDateModal(false);
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
              icon={<User size={20} color={colors.primary} />}
              label="Name"
              value={name || "Not set"}
              isEditable
              onEdit={handleEditName}
            />
            <PersonalInfoItem 
              icon={<Calendar size={20} color={colors.primary} />}
              label="Age"
              value={age ? `${age} years old` : "Not set"}
              isEditable
              onEdit={handleEditAge}
            />
            <PersonalInfoItem 
              icon={<Calendar size={20} color={colors.primary} />}
              label="Sobriety Date"
              value={new Date(startDate).toLocaleDateString()}
              isEditable
              onEdit={handleEditSobrietyDate}
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
          <SectionHeader title="Legal & Privacy" />
          <Card style={styles.legalContainer}>
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => Linking.openURL('https://example.com/privacy-policy')}
            >
              <View style={styles.legalIconContainer}>
                <Shield size={20} color={colors.primary} />
              </View>
              <View style={styles.legalContent}>
                <Text style={styles.legalLabel}>Privacy Policy</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.legalItem}
              onPress={() => Linking.openURL('https://example.com/terms-of-use')}
            >
              <View style={styles.legalIconContainer}>
                <FileText size={20} color={colors.primary} />
              </View>
              <View style={styles.legalContent}>
                <Text style={styles.legalLabel}>Terms of Use</Text>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        
        <Button
          onPress={handleResetSobriety}
          variant="outline"
          style={styles.resetButton}
          icon={<LogOut size={18} color="#8B0000" />}
          textStyle={styles.resetButtonText}
        >
I Relapsed        
</Button>
        
        <Button
          onPress={handleClearChatHistory}
          variant="secondary"
          style={styles.clearChatHistoryButton}
          icon={<MessageSquare size={18} color="#FFFFFF" />}
          textStyle={styles.clearChatHistoryButtonText}
        >
          Clear Chat History
        </Button>

        <Button
          onPress={handleDeleteAccount}
          variant="outline"
          style={styles.deleteAccountButton}
          icon={<Trash2 size={18} color="#B91C1C" />}
          textStyle={styles.deleteAccountButtonText}
        >
          Delete Account
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
      
      {/* Edit Name Modal */}
      <EditNameModal
        visible={showNameModal}
        currentName={name || ""}
        onClose={closeNameModal}
        onSave={handleSaveName}
      />
      
      {/* Edit Age Modal */}
      <EditAgeModal
        visible={showAgeModal}
        currentAge={age || 0}
        onClose={closeAgeModal}
        onSave={handleSaveAge}
      />
      
      {/* Sobriety Date Modal */}
      <Modal
        isVisible={showSobrietyDateModal}
        onBackdropPress={closeSobrietyDateModal}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Sobriety Date</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeSobrietyDateModal}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={tempSobrietyDate}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setTempSobrietyDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
              style={{ height: 200, width: '100%' }}
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalActionButtonFull} onPress={closeSobrietyDateModal}>
              <View style={styles.modalActionButton}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalActionButtonFull} onPress={() => handleSaveSobrietyDate(tempSobrietyDate)}>
              <View style={[styles.modalActionButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

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
    ...typography.h1,
    marginBottom: 6,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
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
    ...typography.bodySmall,
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
    ...typography.bodySmall,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '500',
  },
  infoEditButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 12,
  },
  infoEditText: {
    ...typography.caption,
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
    ...typography.body,
    marginLeft: 16,
    flex: 1,
  },
  addReasonButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addReasonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#f0a1a1',
    borderColor: '#e08888',
  },
  resetButtonText: {
    color: '#8B0000',
  },
  clearChatHistoryButton: {
    marginTop: 12,
    backgroundColor: '#6b98c2',
    borderColor: '#5a86ab',
  },
  clearChatHistoryButtonText: {
    color: '#FFFFFF',
  },
  deleteAccountButton: {
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    borderColor: '#B91C1C',
  },
  deleteAccountButtonText: {
    color: '#B91C1C',
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
    ...typography.h3,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActionButtonFull: {
    flex: 1,
    marginHorizontal: 6,
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
  modalButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  legalContainer: {
    padding: 0,
    overflow: 'hidden',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  legalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  legalContent: {
    flex: 1,
  },
  legalLabel: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  legalDescription: {
    ...typography.bodySmall,
  },
});