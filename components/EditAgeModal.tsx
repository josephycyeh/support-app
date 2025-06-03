import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { X, Save } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface EditAgeModalProps {
  visible: boolean;
  currentAge: number;
  onClose: () => void;
  onSave: (age: number) => void;
}

export const EditAgeModal = ({ visible, currentAge, onClose, onSave }: EditAgeModalProps) => {
  const [editedAge, setEditedAge] = useState('');

  // Update the text when the modal opens
  useEffect(() => {
    if (visible) {
      setEditedAge(currentAge > 0 ? currentAge.toString() : '');
    }
  }, [visible, currentAge]);

  const handleSave = () => {
    const age = parseInt(editedAge.trim());
    if (!isNaN(age) && age > 0 && age <= 120) {
      onSave(age);
    }
  };

  const handleClose = () => {
    setEditedAge(currentAge > 0 ? currentAge.toString() : ''); // Reset to original value
    onClose();
  };

  const handleAgeChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    setEditedAge(numericText);
  };

  const isValidAge = () => {
    const age = parseInt(editedAge.trim());
    return !isNaN(age) && age > 0 && age <= 120;
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      backdropOpacity={0.5}
      useNativeDriver={false}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={300}
      avoidKeyboard={true}
      hideModalContentWhileAnimating={true}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Age</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.modalInput}
          value={editedAge}
          onChangeText={handleAgeChange}
          autoFocus
          placeholder="Enter your age"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={handleSave}
          maxLength={3}
        />
        
        {editedAge && !isValidAge() && (
          <Text style={styles.errorText}>Please enter a valid age (1-120)</Text>
        )}
        
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={[
              styles.modalActionButtonFull,
              !isValidAge() && editedAge && styles.disabledButton
            ]} 
            onPress={handleSave}
            disabled={!isValidAge() && !!editedAge}
          >
            <View style={[
              styles.modalSaveButtonInner,
              !isValidAge() && editedAge && styles.disabledButtonInner
            ]}>
              <Save size={18} color="#FFFFFF" />
              <Text style={styles.modalSaveText}>Save</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
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
    ...typography.h2,
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
  modalInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButtonFull: {
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalSaveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  disabledButtonInner: {
    backgroundColor: colors.textMuted,
  },
  modalSaveText: {
    color: '#FFFFFF',
    ...typography.button,
    marginLeft: 8,
  },
}); 