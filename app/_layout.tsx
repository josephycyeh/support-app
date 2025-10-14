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
import { Platform } from "react-native";
import { PostHogProvider } from 'posthog-react-native';
// Register LiveKit globals
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { onboardingCompleted, struggleTimes, name, startDate } = useSobrietyStore(); 
  

  useEffect(() => {
    // Initialize Superwall only on native platforms
    const initializeSuperwall = async () => {
      if (Platform.OS !== 'web') {
        try {
          const { default: Superwall } = await import('expo-superwall/compat');
          const apiKey = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY;
          if (apiKey) {
            Superwall.configure({
              apiKey: apiKey,
            });
          }
        } catch (error) {
          console.warn('Failed to initialize Superwall:', error);
        }
      }
    };

    initializeSuperwall();

    const requestTracking = async () => {
      if (Platform.OS !== 'web') {
      const { Settings } = await import('react-native-fbsdk-next');
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('✅ Tracking permissions granted');
        await Settings.setAdvertiserTrackingEnabled(true);
      }
    }

    };
    requestTracking();

  }, [])

  // Schedule notifications when onboarding is completed or data changes
  useEffect(() => {
    const scheduleNotifications = async () => {
      console.log("onboardingCompleted: ",onboardingCompleted)
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
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: 'https://us.i.posthog.com',
        enableSessionReplay: true,
      }}
      autocapture={{
        captureTouches: true, // Keep touch/tap tracking
        captureScreens: false, // Disable screen tracking that causes navigation errors
      }}
    >
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </PostHogProvider>
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