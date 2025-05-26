import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Smile, Meh, Frown } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useMoodStore } from '@/store/moodStore';
import { useSobrietyStore } from '@/store/sobrietyStore';
import * as Haptics from 'expo-haptics';

interface MoodTrackerProps {
  visible: boolean;
  onClose: () => void;
}

const MOOD_LEVELS = [
  { value: 1, emoji: '😢', label: 'Very Sad', color: '#EF4444' },
  { value: 2, emoji: '😔', label: 'Sad', color: '#F97316' },
  { value: 3, emoji: '😐', label: 'Neutral', color: '#EAB308' },
  { value: 4, emoji: '😊', label: 'Good', color: '#22C55E' },
  { value: 5, emoji: '😄', label: 'Great', color: '#10B981' },
];

export const MoodTracker = ({ visible, onClose }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [scaleAnim] = useState(new Animated.Value(0));
  const { addMoodEntry } = useMoodStore();
  const { addXP } = useSobrietyStore();

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogMood = () => {
    if (selectedMood === null) return;

    addMoodEntry(selectedMood);
    addXP(5); // Small XP reward for logging mood
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Close after a brief delay
    setTimeout(() => {
      onClose();
      setSelectedMood(null);
    }, 300);
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>Daily check-ins help track your journey</Text>

          <View style={styles.moodContainer}>
            {MOOD_LEVELS.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  selectedMood === mood.value && {
                    backgroundColor: mood.color,
                    transform: [{ scale: 1.1 }],
                  },
                ]}
                onPress={() => handleMoodSelect(mood.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMood && (
            <Text style={styles.selectedLabel}>
              {MOOD_LEVELS.find(m => m.value === selectedMood)?.label}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.logButton,
                !selectedMood && styles.logButtonDisabled,
              ]}
              onPress={handleLogMood}
              disabled={!selectedMood}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.logButtonText,
                !selectedMood && styles.logButtonTextDisabled,
              ]}>
                Log Mood (+5 XP)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 28,
  },
  selectedLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  logButtonDisabled: {
    backgroundColor: colors.border,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logButtonTextDisabled: {
    color: colors.textMuted,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '500',
  },
}); 