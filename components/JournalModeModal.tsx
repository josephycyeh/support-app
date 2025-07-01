import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { X, BookOpen, AlertTriangle } from 'lucide-react-native';
import Modal from 'react-native-modal';
import colors from '@/constants/colors';
import Superwall from 'expo-superwall/compat';

interface JournalModeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectJournal: () => void;
  onSelectTrigger: () => void;
}

export const JournalModeModal = ({ visible, onClose, onSelectJournal, onSelectTrigger }: JournalModeModalProps) => {
  const handleJournalPress = () => {
    // Register paywall for journal entry feature
    Superwall.shared.register({
      placement: 'journal_log',
      feature: () => {
        // This runs when user has access (premium user or after payment)
        onSelectJournal();
      }
    });
  };

  const handleTriggerPress = () => {
    // Register paywall for trigger log feature
    Superwall.shared.register({
      placement: 'trigger_log',
      feature: () => {
        // This runs when user has access (premium user or after payment)
        onSelectTrigger();
      }
    });
  };

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
          <Text style={styles.modalTitle}>Add Entry</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleJournalPress}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.primary }]}>
              <BookOpen size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.optionTitle}>Journal Entry</Text>
            <Text style={styles.optionDescription}>
              Record your thoughts, feelings, and reflections
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={handleTriggerPress}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: colors.danger }]}>
              <AlertTriangle size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.optionTitle}>Trigger Log</Text>
            <Text style={styles.optionDescription}>
              Document triggers and coping strategies
            </Text>
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
    marginBottom: 24,
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
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 