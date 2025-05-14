import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { X, Save } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

interface BirthdayEditModalProps {
  visible: boolean;
  currentDate: Date;
  onClose: () => void;
  onSave: (date: Date) => void;
}

export const BirthdayEditModal = ({ visible, currentDate, onClose, onSave }: BirthdayEditModalProps) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);
  
  const handleChange = (_: any, date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const handleSave = () => {
    onSave(selectedDate);
    onClose();
  };
  
  // For iOS, we use a modal with DateTimePicker
  if (Platform.OS === 'ios') {
    return (
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.5}
        useNativeDriver
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Birthday</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalActionButtonFull} 
              onPress={handleSave}
            >
              <View style={styles.modalSaveButtonInner}>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.modalSaveText}>Save</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
  
  // For Android, we return a simpler date picker implementation
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropTransitionOutTiming={0}
      backdropOpacity={0.5}
      useNativeDriver
      style={styles.modal}
      animationIn="fade"
      animationOut="fade"
    >
      <View style={[styles.modalContent, { padding: 20 }]}>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(_, date) => {
            if (date) {
              onSave(date);
            }
            onClose();
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButtonFull: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  modalSaveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 