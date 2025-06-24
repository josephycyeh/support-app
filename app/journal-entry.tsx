import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import colors from '@/constants/colors';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { useJournalStore } from '@/store/journalStore';
import { useActivityStore } from '@/store/activityStore';
import { Header } from '@/components/ui/Header';
import * as Haptics from 'expo-haptics';

export default function JournalEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = typeof params.mode === 'string' ? params.mode : 'new';
  const entryId = typeof params.id === 'string' ? params.id : null;
  
  const [title, setTitle] = useState(typeof params.title === 'string' ? params.title : '');
  const [content, setContent] = useState(typeof params.content === 'string' ? params.content : '');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const contentInputRef = useRef<TextInput>(null);
  const { addXP } = useSobrietyStore();
  const { addEntry, updateEntry } = useJournalStore();
  const { incrementJournalEntries } = useActivityStore();
  
  // Set up keyboard listeners to track keyboard height
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    // Auto-focus the content input when component mounts
    setTimeout(() => {
      if (contentInputRef.current) {
        contentInputRef.current.focus();
      }
    }, 100);

    // Only reset the form when creating a new entry
    // For edit mode, we already set the initial values from params
    if (mode !== 'edit') {
      setTitle('');
      setContent('');
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [mode]);
  
  const handleSave = () => {
    if (content.trim()) {
      if (mode === 'edit' && entryId) {
        // Update existing entry
        updateEntry({
          id: entryId,
          title: title.trim() || 'Untitled',
          content: content.trim(),
          date: typeof params.date === 'string' ? params.date : new Date().toISOString(), // Keep original date
        });
      } else {
        // Add new journal entry
        addEntry({
          id: Date.now().toString(),
          title: title.trim() || 'Untitled',
          content: content.trim(),
          date: new Date().toISOString(),
        });
        
        // Award XP for journaling (only for new entries)
        addXP(30);
        
        // Increment journal entries count (only for new entries)
        incrementJournalEntries();
      }
      
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Go back to previous screen
      router.back();
    }
  };
  
  const handleCancel = () => {
    router.back();
  };

  const addInspirationToContent = (text: string) => {
    setContent(prev => prev + (prev ? '\n\n' : '') + text);
    if (contentInputRef.current) {
      contentInputRef.current.focus();
    }
  };
  
  const { height: screenHeight } = Dimensions.get('window');
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "New Journal Entry",
          headerShown: false,
        }} 
      />
      
      <Header 
        title={mode === 'edit' ? 'Edit Entry' : 'New Entry'} 
        onBack={handleCancel} 
      />

      <View style={styles.inspirationsContainer}>
        <Text style={styles.inspirationsLabel}>Inspirations</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.inspirationsScrollContent}
          keyboardShouldPersistTaps="always"
        >
          <TouchableOpacity 
            style={styles.inspirationChip}
            onPress={() => addInspirationToContent("Today I'm feeling...")}
            activeOpacity={0.7}
          >
            <View style={styles.inspirationIconContainer}>
              <Text style={styles.inspirationIcon}>😊</Text>
            </View>
            <Text style={styles.inspirationText}>Today I'm feeling...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.inspirationChip}
            onPress={() => addInspirationToContent("I'm proud that I...")}
            activeOpacity={0.7}
          >
            <View style={styles.inspirationIconContainer}>
              <Text style={styles.inspirationIcon}>🌟</Text>
            </View>
            <Text style={styles.inspirationText}>I'm proud that I...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.inspirationChip}
            onPress={() => addInspirationToContent("A challenge I faced today was...")}
            activeOpacity={0.7}
          >
            <View style={styles.inspirationIconContainer}>
              <Text style={styles.inspirationIcon}>💪</Text>
            </View>
            <Text style={styles.inspirationText}>A challenge I faced...</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.inspirationChip}
            onPress={() => addInspirationToContent("I'm grateful for...")}
            activeOpacity={0.7}
          >
            <View style={styles.inspirationIconContainer}>
              <Text style={styles.inspirationIcon}>🙏</Text>
            </View>
            <Text style={styles.inspirationText}>I'm grateful for...</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.contentArea}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />
        
        <TextInput
          ref={contentInputRef}
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
      
      {keyboardHeight > 0 && (
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { bottom: keyboardHeight + 16 }
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'edit' ? 'Save Changes' : 'Save (+30 XP)'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inspirationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: colors.background,
  },
  inspirationsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  inspirationsScrollContent: {
    paddingRight: 16,
  },
  inspirationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(107, 152, 194, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  inspirationIconContainer: {
    marginRight: 8,
  },
  inspirationIcon: {
    fontSize: 16,
  },
  inspirationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.background,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    paddingBottom: 100,
  },
  saveButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
}); 