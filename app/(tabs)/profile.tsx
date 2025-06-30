import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, Heart, LogOut, Edit, X, User, Settings, Bell } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { calculateDaysSober, getStartOfDay, formatDateToISOString } from '@/utils/dateUtils';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useReasonsStore } from '@/store/reasonsStore';
import { 
  scheduleTestNotification, 
  getNotificationStatus, 
  getScheduledNotifications,
  cancelAllNotifications,
  scheduleStruggleTimeNotifications,
  cancelStruggleTimeNotifications,
  scheduleAllUpcomingMilestones,
  cancelMilestoneNotifications
} from '@/services/NotificationService';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { AddReasonModal } from '@/components/AddReasonModal';
import { EditReasonModal } from '@/components/EditReasonModal';
import { EditNameModal } from '@/components/EditNameModal';
import { EditAgeModal } from '@/components/EditAgeModal';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePostHog } from 'posthog-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { level, xp, startDate, xpToNextLevel, resetSobriety, name, age, setName, setAge, setStartDate, struggleTimes } = useSobrietyStore();
  const { reasons, addReason, updateReason, deleteReason } = useReasonsStore();
  const posthog = usePostHog();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showSobrietyDateModal, setShowSobrietyDateModal] = useState(false);
  const [tempSobrietyDate, setTempSobrietyDate] = useState(new Date());
  const [selectedReason, setSelectedReason] = useState<{id: string, text: string} | null>(null);
  
  // Calculate days sober using utility function
  const daysSober = calculateDaysSober(startDate);
  
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
    const wasFirstTimeSet = !age;
    setAge(newAge);
    
    // Track age setting
    if (wasFirstTimeSet) {
      posthog.capture('user_age_set', {
        age: newAge,
        source: 'profile_screen',
      });
    }
    
    setShowAgeModal(false);
  };
  
  const closeAgeModal = () => {
    setShowAgeModal(false);
  };
  

  
  const handleResetSobriety = () => {
    Alert.alert(
      "Reset Your Journey",
      "Recovery is a journey with ups and downs. If you need to restart your counter, that's okay - every step forward matters. Would you like to reset and begin again?",
      [
        {
          text: "Not Now",
          style: "cancel"
        },
        { 
          text: "Reset & Continue", 
          onPress: () => resetSobriety(),
          style: "default"
        }
      ]
    );
  };
  
  const handleEditSobrietyDate = () => {
    setTempSobrietyDate(new Date(startDate));
    setShowSobrietyDateModal(true);
  };
  
  const handleSaveSobrietyDate = (date: Date) => {
    // Set the time to the beginning of the day (00:00:00) and update sobriety start date
    setStartDate(formatDateToISOString(getStartOfDay(date)));
    setShowSobrietyDateModal(false);
  };
  
  const closeSobrietyDateModal = () => {
    setShowSobrietyDateModal(false);
  };

  // Notification test functions for Phase 1
  const handleTestNotification = async () => {
    try {
      const success = await scheduleTestNotification(5);
      if (success) {
        Alert.alert(
          "Test Notification Scheduled",
          "You should receive a test notification in 5 seconds!",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Notification Failed",
          "Could not schedule test notification. Please check permissions.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error scheduling test notification:', error);
      Alert.alert(
        "Error",
        "Failed to schedule test notification.",
        [{ text: "OK" }]
      );
    }
  };

  const handleCheckNotificationStatus = async () => {
    try {
      const status = await getNotificationStatus();
      const scheduled = await getScheduledNotifications();
      
      Alert.alert(
        "Notification Status",
        `Platform: ${status.platform}\nPermissions: ${status.hasPermissions ? 'Granted' : 'Denied'}\nTotal Scheduled: ${scheduled.length}\nStruggle Time: ${status.struggleTimeCount}\nMilestones: ${status.milestoneCount}\nStruggle Times: ${struggleTimes?.join(', ') || 'None'}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error checking notification status:', error);
      Alert.alert("Error", "Failed to check notification status.", [{ text: "OK" }]);
    }
  };

  const handleClearNotifications = async () => {
    try {
      const success = await cancelAllNotifications();
      if (success) {
        Alert.alert("Success", "All notifications cleared!", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", "Failed to clear notifications.", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert("Error", "Failed to clear notifications.", [{ text: "OK" }]);
    }
  };

  // Phase 2 test functions
  const handleTestStruggleTimeNotifications = async () => {
    try {
      if (!struggleTimes || struggleTimes.length === 0) {
        Alert.alert(
          "No Struggle Times",
          "You haven't set any struggle times in onboarding. Complete onboarding first or use the mock data.",
          [{ text: "OK" }]
        );
        return;
      }

      const daysSober = calculateDaysSober(startDate);
      const scheduledIds = await scheduleStruggleTimeNotifications(struggleTimes, {
        name,
        daysSober,
      });

      if (scheduledIds.length > 0) {
        Alert.alert(
          "Struggle Time Notifications Scheduled",
          `Successfully scheduled ${scheduledIds.length} daily notifications for your struggle times: ${struggleTimes.join(', ')}`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Scheduling Failed",
          "Could not schedule struggle time notifications. Check permissions and struggle time format.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error scheduling struggle time notifications:', error);
      Alert.alert("Error", "Failed to schedule struggle time notifications.", [{ text: "OK" }]);
    }
  };

  const handleCancelStruggleTimeNotifications = async () => {
    try {
      const success = await cancelStruggleTimeNotifications();
      if (success) {
        Alert.alert("Success", "All struggle time notifications cancelled!", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", "Failed to cancel struggle time notifications.", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error('Error cancelling struggle time notifications:', error);
      Alert.alert("Error", "Failed to cancel struggle time notifications.", [{ text: "OK" }]);
    }
  };

  // Phase 3 test functions
  const handleTestMilestoneNotifications = async () => {
    try {
      const daysSober = calculateDaysSober(startDate);
      const scheduledIds = await scheduleAllUpcomingMilestones(startDate, {
        name,
        daysSober,
      });

      if (scheduledIds.length > 0) {
        Alert.alert(
          "Milestone Notifications Scheduled",
          `Successfully scheduled ${scheduledIds.length} milestone notifications. Next milestones will be celebrated at 9 AM on their respective days.`,
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "No Milestones to Schedule",
          "All upcoming milestones are already scheduled, or you may have reached all available milestones.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error scheduling milestone notifications:', error);
      Alert.alert("Error", "Failed to schedule milestone notifications.", [{ text: "OK" }]);
    }
  };

  const handleCancelMilestoneNotifications = async () => {
    try {
      const success = await cancelMilestoneNotifications();
      if (success) {
        Alert.alert("Success", "All milestone notifications cancelled!", [{ text: "OK" }]);
      } else {
        Alert.alert("Error", "Failed to cancel milestone notifications.", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error('Error cancelling milestone notifications:', error);
      Alert.alert("Error", "Failed to cancel milestone notifications.", [{ text: "OK" }]);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Profile",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
            >
              <Settings size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <Text style={styles.headerSubtitle}>Level {level} • {daysSober} days sober</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
            >
              <Settings size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
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
        
        {/* Notification Test Section - All Phases */}
        {/* <View style={styles.sectionContainer}>
          <SectionHeader title="Notifications (Phase 1, 2 & 3 Testing)" />
          <Card style={styles.notificationTestContainer}>
            <Text style={styles.notificationTestDescription}>
              Test the complete notification system: basic notifications, struggle time check-ins, and milestone celebrations.
            </Text>
            
            <View style={styles.notificationTestButtons}>
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleTestNotification}
              >
                <Bell size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Test Notification</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleCheckNotificationStatus}
              >
                <Settings size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Check Status</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleClearNotifications}
              >
                <X size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.notificationTestSectionTitle}>Phase 2: Struggle Time Check-ins</Text>
            
            <View style={styles.notificationTestButtons}>
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleTestStruggleTimeNotifications}
              >
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Schedule Struggle Times</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleCancelStruggleTimeNotifications}
              >
                <X size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Cancel Struggle Times</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.notificationTestSectionTitle}>Phase 3: Milestone Celebrations</Text>
            
            <View style={styles.notificationTestButtons}>
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleTestMilestoneNotifications}
              >
                <Heart size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Schedule Milestones</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.notificationTestButton} 
                onPress={handleCancelMilestoneNotifications}
              >
                <X size={16} color={colors.primary} />
                <Text style={styles.notificationTestButtonText}>Cancel Milestones</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View> */}

        
        <Button
          onPress={handleResetSobriety}
          variant="outline"
          style={styles.resetButton}
          icon={<Calendar size={18} color="#6B7280" />}
          textStyle={styles.resetButtonText}
        >
Reset My Journey        
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
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  resetButtonText: {
    color: '#6B7280',
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

  settingsButton: {
    padding: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  
  // Notification test styles for Phase 1
  notificationTestContainer: {
    padding: 16,
  },
  notificationTestDescription: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: 16,
    textAlign: 'center',
  },
  notificationTestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  notificationTestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 12,
    gap: 6,
  },
  notificationTestButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  notificationTestSectionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
});