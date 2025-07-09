import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { scheduleStruggleTimeNotifications, cancelStruggleTimeNotifications } from '@/services/NotificationService';
import { calculateDaysSober } from '@/utils/dateUtils';
import { MultiSelectOptions } from '@/components/onboarding/MultiSelectOptions';
import { Header } from '@/components/ui/Header';
import colors from '@/constants/colors';

export default function CheckInSettingsScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { struggleTimes: currentStruggleTimes, setStruggleTimes, startDate, name } = useSobrietyStore();
  const [selectedTimes, setSelectedTimes] = useState<string[]>(currentStruggleTimes || []);
  const [isLoading, setIsLoading] = useState(false);

  // Struggle time options - same as onboarding
  const timeOptions = [
    '🌅 Morning (6 AM-12 PM)',
    '🌞 Afternoon (12-4 PM)',
    '🌆 Evening (4-8 PM)',
    '🌙 Night (8 PM-12 AM)',
    '🌃 Late night (12-6 AM)'
  ];

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (selectedTimes.length === 0) {
      Alert.alert(
        "No Times Selected",
        "Please select at least one time period when you'd like to receive check-ins.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // Update struggle times in store
      setStruggleTimes(selectedTimes);

      // Cancel existing notifications
      await cancelStruggleTimeNotifications();

      // Schedule new notifications based on updated times
      const daysSober = calculateDaysSober(startDate);
      await scheduleStruggleTimeNotifications(selectedTimes, {
        name: name || '',
        daysSober
      });

      // Track notification settings update
      posthog.capture('notification_settings_updated');

      Alert.alert(
        "Check-in Times Updated",
        "Your notification preferences have been saved successfully.",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating check-in times:', error);
      Alert.alert(
        "Error",
        "Failed to update your check-in times. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = () => {
    const current = currentStruggleTimes || [];
    return JSON.stringify(current.sort()) !== JSON.stringify(selectedTimes.sort());
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Check-in Times",
          headerShown: false,
        }} 
      />
      
      <Header title="Check-in Times" onBack={handleBack} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            Select when you'd like to receive supportive check-ins from Sobi
          </Text>
          
          <View style={styles.optionsContainer}>
            <MultiSelectOptions
              options={timeOptions}
              selectedOptions={selectedTimes}
              onSelectionChange={setSelectedTimes}
              minSelections={1}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges() || isLoading) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasChanges() || isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionDescription: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 