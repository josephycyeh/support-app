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
import { usePostHog } from 'posthog-react-native';

export default function TriggerEntryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = typeof params.mode === 'string' ? params.mode : 'new';
  const entryId = typeof params.id === 'string' ? params.id : null;
  const posthog = usePostHog();
  
  const [title, setTitle] = useState(typeof params.title === 'string' ? params.title : '');
  const [trigger, setTrigger] = useState(typeof params.trigger === 'string' ? params.trigger : '');
  const [intensity, setIntensity] = useState(typeof params.intensity === 'string' ? params.intensity : '5');
  const [copingStrategy, setCopingStrategy] = useState(typeof params.copingStrategy === 'string' ? params.copingStrategy : '');
  const [outcome, setOutcome] = useState(typeof params.outcome === 'string' ? params.outcome : 'stayed-strong');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const triggerInputRef = useRef<TextInput>(null);
  const copingInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
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

    // Only reset the form when creating a new entry
    if (mode !== 'edit') {
      setTitle('');
      setTrigger('');
      setIntensity('5');
      setCopingStrategy('');
      setOutcome('stayed-strong');
    }

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [mode]);

  // Function to scroll to a specific input when focused
  const scrollToInput = (inputRef: React.RefObject<TextInput>) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        const { height: screenHeight } = Dimensions.get('window');
        const keyboardOffset = keyboardHeight || 300; // Default keyboard height estimate
        const scrollOffset = y + height - (screenHeight - keyboardOffset - 100); // 100px buffer
        
        if (scrollOffset > 0) {
          scrollViewRef.current?.scrollTo({
            y: scrollOffset,
            animated: true,
          });
        }
      });
    }
  };

  // Handle coping strategy input focus
  const handleCopingFocus = () => {
    setTimeout(() => {
      scrollToInput(copingInputRef);
    }, 100); // Small delay to ensure keyboard is showing
  };
  
  const handleSave = () => {
    if (trigger.trim()) {
      const outcomeText = outcome === 'stayed-strong' ? 'Stayed Strong' : 'Relapsed';
      const content = `Trigger: ${trigger.trim()}\n\nIntensity: ${intensity}/10\n\nCoping Strategy: ${copingStrategy.trim()}\n\nOutcome: ${outcomeText}`;
      const triggerWordCount = trigger.trim().split(/\s+/).length;
      const copingWordCount = copingStrategy.trim() ? copingStrategy.trim().split(/\s+/).length : 0;
      const totalWordCount = triggerWordCount + copingWordCount;
      
      if (mode === 'edit' && entryId) {
        // Update existing entry
        updateEntry({
          id: entryId,
          title: title.trim() || 'Trigger Log',
          content,
          date: typeof params.date === 'string' ? params.date : new Date().toISOString(),
          type: 'trigger',
        });
      } else {
        // Add new trigger entry
        addEntry({
          id: Date.now().toString(),
          title: title.trim() || 'Trigger Log',
          content,
          date: new Date().toISOString(),
          type: 'trigger',
        });
        
        // Track trigger journal written for new entries only
        posthog.capture('journal_written', {
          type: 'trigger',
          word_count: totalWordCount,
          character_count: content.length,
          intensity_level: parseInt(intensity),
          outcome: outcome,
        });
        
        // Award XP for logging trigger (only for new entries)
        addXP(15);
        
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

  const addTriggerSuggestion = (text: string) => {
    setTrigger(prev => prev + (prev ? '\n\n' : '') + text);
    if (triggerInputRef.current) {
      triggerInputRef.current.focus();
    }
  };
  
  const { height: screenHeight } = Dimensions.get('window');
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen 
        options={{
          title: "Trigger Log",
          headerShown: false,
        }} 
      />
      
      <Header 
        title={mode === 'edit' ? 'Edit Trigger Log' : 'New Trigger Log'} 
        onBack={handleCancel} 
      />

      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsLabel}>Common Triggers</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScrollContent}
          keyboardShouldPersistTaps="always"
        >
          <TouchableOpacity 
            style={styles.suggestionChip}
            onPress={() => addTriggerSuggestion("Stress at work")}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>Work Stress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.suggestionChip}
            onPress={() => addTriggerSuggestion("Social situation")}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>Social</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.suggestionChip}
            onPress={() => addTriggerSuggestion("Feeling lonely")}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>Loneliness</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.suggestionChip}
            onPress={() => addTriggerSuggestion("Boredom")}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>Boredom</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.suggestionChip}
            onPress={() => addTriggerSuggestion("Anxiety")}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>Anxiety</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.contentArea} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={styles.titleInput}
          placeholder="Title (optional)"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />
        
        <Text style={styles.fieldLabel}>What triggered you? *</Text>
        <TextInput
          ref={triggerInputRef}
          style={styles.triggerInput}
          placeholder="Describe the trigger situation..."
          placeholderTextColor={colors.textMuted}
          value={trigger}
          onChangeText={setTrigger}
          multiline
          textAlignVertical="top"
        />
        
        <Text style={styles.fieldLabel}>Intensity (1-10)</Text>
        <View style={styles.intensityContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.intensityButton,
                intensity === num.toString() && styles.intensityButtonActive
              ]}
              onPress={() => setIntensity(num.toString())}
            >
              <Text style={[
                styles.intensityText,
                intensity === num.toString() && styles.intensityTextActive
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.fieldLabel}>Coping Strategy Used</Text>
        <TextInput
          ref={copingInputRef}
          style={styles.copingInput}
          placeholder="What did you do to cope?"
          placeholderTextColor={colors.textMuted}
          value={copingStrategy}
          onChangeText={setCopingStrategy}
          multiline
          textAlignVertical="top"
          onFocus={handleCopingFocus}
        />
        
        <Text style={styles.fieldLabel}>Outcome</Text>
        <View style={styles.outcomeContainer}>
          <TouchableOpacity
            style={[
              styles.outcomeButton,
              outcome === 'stayed-strong' && styles.outcomeButtonActive
            ]}
            onPress={() => setOutcome('stayed-strong')}
          >
            <Text style={styles.outcomeEmoji}>💪</Text>
            <Text style={[
              styles.outcomeText,
              outcome === 'stayed-strong' && styles.outcomeTextActive
            ]}>
              Stayed Strong
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.outcomeButton,
              outcome === 'relapsed' && styles.outcomeButtonActive
            ]}
            onPress={() => setOutcome('relapsed')}
          >
            <Text style={styles.outcomeEmoji}>😢</Text>
            <Text style={[
              styles.outcomeText,
              outcome === 'relapsed' && styles.outcomeTextActive
            ]}>
              Relapsed
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.logButton,
            !trigger.trim() && styles.logButtonDisabled
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!trigger.trim()}
        >
          <Text style={[
            styles.logButtonText,
            !trigger.trim() && styles.logButtonTextDisabled
          ]}>
            {mode === 'edit' ? 'Save Changes' : 'Log Trigger (+15 XP)'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.finalBottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: colors.background,
  },
  suggestionsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  suggestionsScrollContent: {
    paddingRight: 16,
  },
  suggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(240, 161, 161, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.danger,
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
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  triggerInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  intensityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  intensityButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  intensityText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  intensityTextActive: {
    color: '#FFFFFF',
  },
  copingInput: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  outcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  outcomeButton: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.cardBackground,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  outcomeButtonActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  outcomeEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  outcomeTextActive: {
    color: '#FFFFFF',
  },
  logButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  logButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  logButtonTextDisabled: {
    color: colors.textLight,
  },
  finalBottomPadding: {
    height: 40,
  },
}); 