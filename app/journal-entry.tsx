import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { X, ArrowLeft } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useJournalStore } from '@/store/journalStore';
import { useActivityStore } from '@/store/activityStore';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';

export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = typeof params.mode === 'string' ? params.mode : 'new';
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { addXP } = useSobrietyStore();
  const { addEntry } = useJournalStore();
  const { incrementJournalEntries } = useActivityStore();
  
  useEffect(() => {
    // Reset form when screen mounts
    setTitle('');
    setContent('');
  }, []);
  
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
      
      // Increment journal entries count
      incrementJournalEntries();
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Go back to previous screen
      router.back();
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "New Journal Entry",
          headerShown: false,
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleCancel}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'edit' ? 'Edit Entry' : 'New Entry'}
          </Text>
          <View style={styles.headerRightPlaceholder} />
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
            style={styles.saveFullButton}
          >
            Save Entry (+20 XP)
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerRightPlaceholder: {
    width: 44,
    height: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
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
    minHeight: 300,
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
    minHeight: 280,
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
  saveFullButton: {
    width: '100%',
  },
}); 