import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSobrietyStore } from '@/store/sobrietyStore';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';

export default function IndexScreen() {
  const router = useRouter();
  const { onboardingCompleted } = useSobrietyStore();

  useEffect(() => {
    // Small delay to ensure stores are loaded
    const timer = setTimeout(() => {
      if (onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [onboardingCompleted, router]);

  // Show loading spinner while determining route
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
} 