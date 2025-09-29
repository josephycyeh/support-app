import { AppEventsLogger } from 'react-native-fbsdk-next';
import { useCallback } from 'react';

export const logFacebookEvent = useCallback(
  ({ eventName, parameters = {} }: { eventName: string, parameters?: Record<string, string | number> }) => {
       AppEventsLogger.logEvent(eventName, parameters);
  }, []);