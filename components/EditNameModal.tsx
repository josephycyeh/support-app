import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { X, Save } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';

interface EditNameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const EditNameModal = ({ visible, currentName, onClose, onSave }: EditNameModalProps) => {
  const [editedName, setEditedName] = useState('');

  // Update the text when the modal opens
  useEffect(() => {
    if (visible) {
      setEditedName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = () => {
    if (editedName.trim()) {
      onSave(editedName.trim());
    }
  };

  const handleClose = () => {
    setEditedName(currentName); // Reset to original value
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropTransitionOutTiming={0}
      backdropOpacity={0.5}
      useNativeDriver
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={true}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Name</Text>
          <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.modalInput}
          value={editedName}
          onChangeText={setEditedName}
          autoFocus
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={handleSave}
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
  modalInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: colors.text,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 