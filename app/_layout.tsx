import '@/polyfills';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { useSobrietyStore } from "@/store/sobrietyStore";
import { 
  scheduleStruggleTimeNotifications,
  rescheduleMilestones
} from "@/services/NotificationService";
import { calculateDaysSober } from "@/utils/dateUtils";

import { ErrorBoundary } from "./error-boundary";
import { Platform } from "react-native"
// Register LiveKit globals

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { onboardingCompleted, struggleTimes, name, startDate } = useSobrietyStore();


  // Schedule notifications when onboarding is completed or data changes
  useEffect(() => {
    const scheduleNotifications = async () => {
      if (onboardingCompleted) {
        try {
          const daysSober = calculateDaysSober(startDate);
          const userPersonalization = { name, daysSober };

          // Schedule struggle time notifications if user has struggle times
          if (struggleTimes && struggleTimes.length > 0) {
            await scheduleStruggleTimeNotifications(struggleTimes, userPersonalization);
            console.log('✅ Struggle time notifications scheduled');
          }

          // Reschedule milestone notifications (cancels existing and creates new ones)
          await rescheduleMilestones(startDate, userPersonalization);
          console.log('✅ Milestone notifications rescheduled');
        } catch (error) {
          console.error('❌ Failed to schedule notifications:', error);
        }
      }
    };

    scheduleNotifications();
  }, [onboardingCompleted, struggleTimes, name, startDate])

  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
