import React from 'react';
import { StyleSheet, View, Text, ScrollView, StatusBar, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import { XPProgressBar } from '@/components/XPProgressBar';
import { Companion } from '@/components/Companion';
import { SobrietyTimer } from '@/components/SobrietyTimer';
import { DailyChecklist } from '@/components/DailyChecklist';
import { SOSButton } from '@/components/SOSButton';
import * as Haptics from 'expo-haptics';
import { useSobrietyStore } from '@/store/sobrietyStore';

export default function HomeScreen() {
  const router = useRouter();
  const { addXP, xpToNextLevel } = useSobrietyStore();

  // Provide subtle haptic feedback when the screen is focused (on non-web platforms)
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    return () => {};
  }, []);

  const handleAddXP = () => {
    // Add just enough XP to level up
    addXP(xpToNextLevel);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <XPProgressBar />
        <Companion />
        <SobrietyTimer />
        
        {/* Debug button for testing level up animation - remove in production */}
        <TouchableOpacity 
          style={styles.debugButton} 
          onPress={handleAddXP}
        >
          <Text style={styles.debugButtonText}>🎮 Test Level Up</Text>
        </TouchableOpacity>
        
        <DailyChecklist />
        
        {/* Add some space at the bottom for the floating button */}
        <View style={{ height: 50 }} />
      </ScrollView>
      
      <SOSButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  debugButton: {
    backgroundColor: colors.progressBackground,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  debugButtonText: {
    color: colors.textLight,
    fontWeight: '500',
    fontSize: 14,
  },
});