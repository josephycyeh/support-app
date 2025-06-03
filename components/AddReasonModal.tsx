import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { X, Save } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface AddReasonModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const AddReasonModal = ({ visible, onClose, onSave }: AddReasonModalProps) => {
  const [newReasonText, setNewReasonText] = useState('');

  const handleSave = () => {
    if (newReasonText.trim()) {
      onSave(newReasonText.trim());
      setNewReasonText('');
    }
  };

  const handleClose = () => {
    setNewReasonText('');
    onClose();
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
          <Text style={styles.modalTitle}>Add New Reason</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.modalInput}
          value={newReasonText}
          onChangeText={setNewReasonText}
          multiline
          autoFocus
          placeholder="Why do you want to stay sober?"
          placeholderTextColor={colors.textMuted}
        />
        
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
    minHeight: 120,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButtonFull: {
    flex: 1,
  },
  modalSaveButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
  },
  modalSaveText: {
    color: '#FFFFFF',
    ...typography.button,
    marginLeft: 8,
  },
}); 