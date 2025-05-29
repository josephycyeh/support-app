import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { X, Save, Trash2 } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';

interface EditReasonModalProps {
  visible: boolean;
  reason: { id: string, text: string } | null;
  onClose: () => void;
  onSave: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

export const EditReasonModal = ({ visible, reason, onClose, onSave, onDelete }: EditReasonModalProps) => {
  const [editedText, setEditedText] = useState('');

  // Update the text when the reason changes
  useEffect(() => {
    if (reason) {
      setEditedText(reason.text);
    }
  }, [reason]);

  const handleSave = () => {
    if (reason && editedText.trim()) {
      onSave(reason.id, editedText.trim());
    }
  };

  const handleDelete = () => {
    if (reason) {
      onDelete(reason.id);
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
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
          <Text style={styles.modalTitle}>Edit Reason</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.modalInput}
          value={editedText}
          onChangeText={setEditedText}
          multiline
          autoFocus
          placeholder="Why do you want to stay sober?"
          placeholderTextColor={colors.textMuted}
        />
        
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.modalActionButton} 
            onPress={handleDelete}
          >
            <View style={styles.modalDeleteButtonInner}>
              <Trash2 size={18} color="#FFFFFF" />
              <Text style={styles.modalDeleteText}>Delete</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalActionButton} 
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
    gap: 12,
  },
  modalActionButton: {
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
  modalDeleteButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 16,
    padding: 16,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 