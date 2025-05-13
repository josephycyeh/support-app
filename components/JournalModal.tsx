import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useJournalStore } from '@/store/journalStore';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { createFadeInAnimation } from '@/utils/animations';

interface JournalModalProps {
  visible: boolean;
  onClose: () => void;
}

export const JournalModal = ({ visible, onClose }: JournalModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addXP } = useSobrietyStore();
  const { addEntry } = useJournalStore();
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setTitle('');
      setContent('');
      createFadeInAnimation(fadeAnim).start();
    }
  }, [visible]);
  
  const handleSave = () => {
    if (content.trim()) {
      // Add journal entry
      addEntry({
        id: Date.now().toString(),
        title: title.trim() || 'Untitled',
        content: content.trim(),
        date: new Date().toISOString(),
      });
      
      // Award XP for journaling
      addXP(20);
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Close modal
      onClose();
    }
  };
  
  // For web compatibility
  const AnimatedView = Platform.OS === 'web' ? View : Animated.View;
  const animationStyle = Platform.OS === 'web' 
    ? {} 
    : { opacity: fadeAnim };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AnimatedView style={[styles.content, animationStyle]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Journal Entry</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.titleContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="Title (optional)"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={50}
              />
            </View>
            
            <View style={styles.contentContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder="What's on your mind today?"
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </View>
            
            <View style={styles.promptsContainer}>
              <Text style={styles.promptsTitle}>Prompts to help you reflect:</Text>
              <TouchableOpacity 
                style={styles.promptButton}
                onPress={() => setContent(prev => prev + (prev ? '\n\n' : '') + "Today I'm feeling...")}
              >
                <Text style={styles.promptText}>Today I'm feeling...</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.promptButton}
                onPress={() => setContent(prev => prev + (prev ? '\n\n' : '') + "I'm proud that I...")}
              >
                <Text style={styles.promptText}>I'm proud that I...</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.promptButton}
                onPress={() => setContent(prev => prev + (prev ? '\n\n' : '') + "A challenge I faced today was...")}
              >
                <Text style={styles.promptText}>A challenge I faced today was...</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              onPress={handleSave}
              variant="primary"
              icon={<Save size={18} color="#fff" />}
              style={styles.saveButton}
            >
              Save Entry (+20 XP)
            </Button>
          </View>
        </AnimatedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 60,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  titleContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  contentContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentInput: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 180,
  },
  promptsContainer: {
    marginBottom: 24,
  },
  promptsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  promptButton: {
    backgroundColor: 'rgba(107, 152, 194, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(107, 152, 194, 0.2)',
  },
  promptText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    width: '100%',
  },
});