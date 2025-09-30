import { AppEventsLogger } from 'react-native-fbsdk-next';

export const logFacebookEvent = ({ eventName, parameters = {} }: { eventName: string, parameters?: Record<string, string | number> }) => {
  try {
    AppEventsLogger.logEvent(eventName, parameters);
  } catch (error) {
    console.warn('Facebook event logging failed:', error);
  }
};