import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TIME_CONSTANTS } from '@/utils/dateUtils';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface StruggleTimeSlot {
  start: number; // 24-hour format (0-23)
  end: number;
  label: string;
  emoji: string;
}

interface UserPersonalization {
  name?: string;
  daysSober: number;
}

interface Milestone {
  days: number;
  message: string;
  emoji: string;
}

// Milestone definitions
const MILESTONES: Milestone[] = [
  { days: 1/24, message: "First hour complete!", emoji: "⏰" }, // 1 hour = 1/24 days
  { days: 1, message: "First day complete!", emoji: "🌟" },
  { days: 3, message: "3 days strong!", emoji: "💪" },
  { days: 7, message: "One week sober!", emoji: "🎉" },
  { days: 14, message: "Two weeks of progress!", emoji: "🏆" },
  { days: 30, message: "One month milestone!", emoji: "🎊" },
  { days: 60, message: "Two months strong!", emoji: "💎" },
  { days: 90, message: "90 days - incredible!", emoji: "🌈" },
  { days: 180, message: "6 months of sobriety!", emoji: "🎯" },
  { days: 365, message: "One full year!", emoji: "👑" },
  { days: 730, message: "Two years strong!", emoji: "🏅" },
  { days: 1095, message: "Three years of freedom!", emoji: "🌟" },
];

/**
 * Parse struggle time string into structured data
 * Example: "🌆 Evening (4-8 PM)" → { start: 16, end: 20, label: "Evening", emoji: "🌆" }
 */
function parseStruggleTime(timeString: string): StruggleTimeSlot | null {
  try {
    // Extract emoji (first character) - use Array.from to handle Unicode properly
    const emoji = Array.from(timeString)[0] || '';

    // Extract label (between emoji and parentheses) - improved extraction
    // Remove the emoji first, then extract everything before the opening parenthesis
    const withoutEmoji = timeString.slice(emoji.length).trim();
    const labelMatch = withoutEmoji.match(/^([^(]+)/);
    const label = labelMatch ? labelMatch[1].trim() : '';

    
    // Extract time range from parentheses
    const timeMatch = timeString.match(/\(([^)]+)\)/);
    if (!timeMatch) return null;
    
    const timeRange = timeMatch[1];
    
    // Parse time range like "4-8 PM" or "12-4 PM" or "8 PM-12 AM"
    const rangeParts = timeRange.split('-');
    if (rangeParts.length !== 2) return null;
    
    const startPart = rangeParts[0].trim();
    const endPart = rangeParts[1].trim();
    
    // Convert to 24-hour format
    const parseTime = (timeStr: string): number => {
      const isPM = timeStr.includes('PM');
      const isAM = timeStr.includes('AM');
      const numStr = timeStr.replace(/[^\d]/g, '');
      let hour = parseInt(numStr);
      
      if (isPM && hour !== 12) {
        hour += 12;
      } else if (isAM && hour === 12) {
        hour = 0;
      }
      
      return hour;
    };
    
    const start = parseTime(startPart);
    const end = parseTime(endPart);
    
    return {
      start,
      end: end === 0 ? 24 : end, // Handle midnight as 24 for easier comparison
      label,
      emoji,
    };
  } catch (error) {
    console.error('Error parsing struggle time:', timeString, error);
    return null;
  }
}

/**
 * Generate personalized struggle time message
 */
function generateStruggleTimeMessage(
  timeSlot: StruggleTimeSlot,
  userPersonalization: UserPersonalization
): { title: string; body: string } {
  const { name, daysSober } = userPersonalization;
  const { label, emoji } = timeSlot;
  
  // Special messages for users with less than 1 day sober
  const earlyJourneyTemplates = {
    morning: [
      `Good morning${name ? ` ${name}` : ''}! Starting your recovery journey strong ☀️`,
      `${emoji} Morning check-in${name ? `, ${name}` : ''}! Every hour counts - you're building something amazing 💪`,
    ],
    afternoon: [
      `${emoji} Afternoon check-in${name ? `, ${name}` : ''}! You're taking it one step at a time 🌞`,
      `Hey${name ? ` ${name}` : ''}! You're doing great - every moment of sobriety is progress 💪`,
    ],
    evening: [
      `${emoji} Evening check-in${name ? `, ${name}` : ''}! You're making it through - hour by hour 🌅`,
      `Hey${name ? ` ${name}` : ''}! Evening can be tough, but every moment of progress matters 💪`,
    ],
    night: [
      `${emoji} Night check-in${name ? `, ${name}` : ''}! You're choosing recovery in this moment 🌙`,
      `Good evening${name ? ` ${name}` : ''}! Late nights can be challenging, but you're taking it one hour at a time 🛡️`,
    ],
    latenight: [
      `${emoji} Late night check-in${name ? `, ${name}` : ''}! Every hour is a victory - you've got this 🌃`,
      `Hey${name ? ` ${name}` : ''}! Even in the late hours, remember you're building something lasting ✨`,
    ],
  };
  
  // Message templates for different time periods (1+ days sober)
  const messageTemplates = {
    morning: [
      `Good morning${name ? ` ${name}` : ''}! Starting the day strong with ${daysSober} days behind you ☀️`,
      `${emoji} Morning check-in${name ? `, ${name}` : ''}! You've got ${daysSober} days of strength to carry you forward 💪`,
    ],
    afternoon: [
      `${emoji} Afternoon check-in${name ? `, ${name}` : ''}! You're ${daysSober} days strong and going! 🌞`,
      `Hey${name ? ` ${name}` : ''}! Midday can be challenging, but you've conquered ${daysSober} days already 💪`,
    ],
    evening: [
      `${emoji} Evening check-in${name ? `, ${name}` : ''}! You've made it through another day - ${daysSober} days strong 🌅`,
      `Hey${name ? ` ${name}` : ''}! Evening can be tough, but you've got ${daysSober} days of strength behind you 💪`,
    ],
    night: [
      `${emoji} Late night check-in${name ? `, ${name}` : ''}! You've conquered ${daysSober} days - stay strong 🌙`,
      `Good evening${name ? ` ${name}` : ''}! Late nights can be challenging, but your ${daysSober}-day streak is worth protecting 🛡️`,
    ],
    latenight: [
      `${emoji} Late night check-in${name ? `, ${name}` : ''}! You're ${daysSober} days strong - you've got this 🌃`,
      `Hey${name ? ` ${name}` : ''}! Even in the late hours, remember your ${daysSober} days of progress ✨`,
    ],
  };
  
  // Determine message category based on label
  let category: keyof typeof messageTemplates = 'evening'; // default
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('morning')) category = 'morning';
  else if (lowerLabel.includes('afternoon')) category = 'afternoon';
  else if (lowerLabel.includes('evening')) category = 'evening';
  else if (lowerLabel.includes('night')) category = 'night';
  else if (lowerLabel.includes('late')) category = 'latenight';
  
  // Choose template set based on days sober
  const templates = daysSober < 1 ? earlyJourneyTemplates[category] : messageTemplates[category];
  
  // Select random message from category
  const selectedMessage = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    title: `${emoji} ${label} Check-in`,
    body: selectedMessage,
  };
}

/**
 * Generate personalized milestone celebration message
 */
function generateMilestoneMessage(
  milestone: Milestone,
  userPersonalization: UserPersonalization
): { title: string; body: string } {
  const { name } = userPersonalization;
  const { days, message, emoji } = milestone;
  
  // Milestone message templates - one message per milestone
  const milestoneTemplates: Record<number, string[]> = {
    [1/24]: [ // 1 hour milestone
      `${name ? `${name}, ` : ''}first hour down! Every step counts`,
    ],
    1: [
      `${name ? `${name}, ` : ''}you made it through day one! That's huge`,
    ],
    3: [
      `${name ? `${name}, ` : ''}three days strong! You're building momentum`,
    ],
    7: [
      `${name ? `${name}, ` : ''}one week milestone! You're proving you can do this`,
    ],
    14: [
      `${name ? `${name}, ` : ''}two weeks! You're getting stronger every day`,
    ],
    30: [
      `${name ? `${name}, ` : ''}one month milestone! You're building something lasting`,
    ],
    60: [
      `${name ? `${name}, ` : ''}two months! You're really hitting your stride`,
    ],
    90: [
      `${name ? `${name}, ` : ''}three months! You've made this a real habit`,
    ],
    180: [
      `${name ? `${name}, ` : ''}six months! You've completely changed your life`,
    ],
    365: [
      `${name ? `${name}, ` : ''}one full year! What an incredible achievement`,
    ],
    730: [
      `${name ? `${name}, ` : ''}two years! Your dedication is truly inspiring`,
    ],
    1095: [
      `${name ? `${name}, ` : ''}three years! You've mastered this journey`,
    ],
  };
  
  // Get templates for this milestone, or use generic template
  const templates = milestoneTemplates[days] || [
    `${name ? `${name}, ` : ''}${days} days strong! You're making real progress`,
  ];
  
  // Get the message (only one per milestone now)
  const selectedMessage = templates[0];
  
  return {
    title: `${emoji} ${message}`,
    body: selectedMessage,
  };
}

/**
 * Calculate days until a milestone from current days sober
 */
function calculateDaysUntilMilestone(daysSober: number, milestone: Milestone): number {
  return milestone.days - daysSober;
}

/**
 * Helper function to filter notifications by type
 */
function filterNotificationsByType(
  notifications: Notifications.NotificationRequest[],
  type: 'struggle_time' | 'milestone'
): Notifications.NotificationRequest[] {
  const prefixes = {
    struggle_time: 'struggle_time_',
    milestone: 'milestone_'
  };
  const dataTypes = {
    struggle_time: 'struggle_time_checkin',
    milestone: 'milestone_celebration'
  };

  return notifications.filter(notification => 
    notification.identifier.startsWith(prefixes[type]) ||
    notification.content.data?.type === dataTypes[type]
  );
}

/**
 * Helper function to get categorized notifications
 */
async function getCategorizedNotifications(): Promise<{
  all: Notifications.NotificationRequest[];
  struggleTime: Notifications.NotificationRequest[];
  milestone: Notifications.NotificationRequest[];
}> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return {
    all,
    struggleTime: filterNotificationsByType(all, 'struggle_time'),
    milestone: filterNotificationsByType(all, 'milestone')
  };
}

/**
 * Helper function to cancel notifications by type
 */
async function cancelNotificationsByType(type: 'struggle_time' | 'milestone'): Promise<boolean> {
  try {
    const { [type === 'struggle_time' ? 'struggleTime' : 'milestone']: notifications } = 
      await getCategorizedNotifications();

    for (const notification of notifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    const typeLabel = type === 'struggle_time' ? 'struggle time' : 'milestone';
    console.log(`✅ Cancelled ${notifications.length} ${typeLabel} notifications`);
    return true;
  } catch (error) {
    const typeLabel = type === 'struggle_time' ? 'struggle time' : 'milestone';
    console.error(`❌ Error cancelling ${typeLabel} notifications:`, error);
    return false;
  }
}

/**
 * Helper function to ensure permissions before scheduling
 */
async function ensureNotificationPermissions(context: string): Promise<boolean> {
  const hasPermissions = await requestNotificationPermissions();
  if (!hasPermissions) {
    console.log(`❌ No notification permissions for ${context}`);
  }
  return hasPermissions;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    console.log('🔐 Requesting notification permissions...');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification
 */
export async function scheduleNotification(
  title: string,
  body: string,
  delaySeconds: number,
  identifier?: string
): Promise<string | null> {
  try {
    // Check permissions before scheduling
    if (!(await ensureNotificationPermissions('basic scheduling'))) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: identifier || `notification_${Date.now()}`,
      content: {
        title,
        body,
      },
      trigger: {
        seconds: delaySeconds,
        type: 'timeInterval',
      } as Notifications.TimeIntervalTriggerInput,
    });

    console.log(`✅ Notification scheduled with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('❌ Error scheduling notification:', error);
    return null;
  }
}

/**
 * Schedule daily recurring notifications for struggle times
 */
export async function scheduleStruggleTimeNotifications(
  struggleTimes: string[],
  userPersonalization: UserPersonalization
): Promise<string[]> {
  try {
    console.log('📅 Scheduling struggle time notifications...', { 
      struggleTimesCount: struggleTimes.length, 
      hasDaysSober: !!userPersonalization.daysSober,
      hasName: !!userPersonalization.name 
    });
    
    // Check permissions before scheduling
    if (!(await ensureNotificationPermissions('struggle times'))) {
      return [];
    }

    // Cancel existing struggle time notifications first
    await cancelStruggleTimeNotifications();

    const scheduledIds: string[] = [];

    for (const timeString of struggleTimes) {
      const timeSlot = parseStruggleTime(timeString);
      if (!timeSlot) {
        console.warn('⚠️ Could not parse struggle time:', timeString);
        continue;
      }

      // Generate personalized message
      const message = generateStruggleTimeMessage(timeSlot, userPersonalization);
      
      // Schedule daily notification at the start of the time slot
      const identifier = `struggle_time_${timeSlot.start}_${timeSlot.label.toLowerCase().replace(/\s+/g, '_')}`;
      
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: message.title,
            body: message.body,
            data: {
              type: 'struggle_time_checkin',
              timeSlot: timeSlot.label,
              hour: timeSlot.start,
            },
          },
          trigger: {
            type: 'daily',
            hour: timeSlot.start,
            minute: 0,
            repeats: true,
          } as Notifications.DailyTriggerInput,
        });

        scheduledIds.push(notificationId);
        console.log(`✅ Scheduled struggle time notification: ${timeSlot.label} at ${timeSlot.start}:00`);
      } catch (error) {
        console.error(`❌ Error scheduling struggle time notification for ${timeSlot.label}:`, error);
      }
    }

    console.log(`✅ Scheduled ${scheduledIds.length} struggle time notifications`);
    return scheduledIds;
  } catch (error) {
    console.error('❌ Error scheduling struggle time notifications:', error);
    return [];
  }
}

/**
 * Schedule all upcoming milestone notifications
 */
export async function scheduleAllUpcomingMilestones(
  startDate: string,
  userPersonalization: UserPersonalization
): Promise<string[]> {
  try {
    console.log('🎯 Scheduling upcoming milestone notifications...', { 
      startDate, 
      hasDaysSober: !!userPersonalization.daysSober,
      hasName: !!userPersonalization.name 
    });
    
    // Check permissions before scheduling
    if (!(await ensureNotificationPermissions('milestones'))) {
      return [];
    }

    // Cancel existing milestone notifications first
    await cancelMilestoneNotifications();

    const scheduledIds: string[] = [];
    const start = new Date(startDate);
    const { daysSober } = userPersonalization;

    // Find all future milestones
    const upcomingMilestones = MILESTONES.filter(milestone => milestone.days > daysSober);

    for (const milestone of upcomingMilestones) {
      const daysUntil = calculateDaysUntilMilestone(daysSober, milestone);
      
      if (daysUntil <= 0) continue; // Skip past milestones
      
      // Calculate the exact date/time for this milestone
      const milestoneDate = new Date(start);
      milestoneDate.setTime(milestoneDate.getTime() + (milestone.days * TIME_CONSTANTS.MILLISECONDS_PER_DAY));
      
      // For milestones >= 1 day, set to 9 AM. For hour milestone, keep exact time
      const MILESTONE_NOTIFICATION_HOUR = 9; // 9 AM local time
      if (milestone.days >= 1) {
        milestoneDate.setHours(MILESTONE_NOTIFICATION_HOUR, 0, 0, 0);
      }

      // Generate personalized message
      const message = generateMilestoneMessage(milestone, userPersonalization);
      
      // Schedule notification for the milestone date
      const identifier = milestone.days < 1 
        ? `milestone_${Math.round(milestone.days * 24)}_hours`
        : `milestone_${milestone.days}_days`;
      
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: message.title,
            body: message.body,
            data: {
              type: 'milestone_celebration',
              milestoneDays: milestone.days,
              milestoneDate: milestoneDate.toISOString(),
            },
          },
          trigger: {
            date: milestoneDate,
            type: 'date'
          } as Notifications.DateTriggerInput,
        });

        scheduledIds.push(notificationId);
        console.log(`✅ Scheduled milestone notification: ${milestone.days} days on ${milestoneDate.toLocaleDateString()}`);
      } catch (error) {
        console.error(`❌ Error scheduling milestone notification for ${milestone.days} days:`, error);
      }
    }

    console.log(`✅ Scheduled ${scheduledIds.length} milestone notifications`);
    return scheduledIds;
  } catch (error) {
    console.error('❌ Error scheduling milestone notifications:', error);
    return [];
  }
}

/**
 * Reschedule all milestone notifications (used when sobriety date changes)
 */
export async function rescheduleMilestones(
  newStartDate: string,
  userPersonalization: UserPersonalization
): Promise<void> {
  try {
    console.log('🔄 Rescheduling milestones for new start date...', { newStartDate });
    
    // Cancel all existing milestone notifications
    await cancelMilestoneNotifications();
    
    // Schedule fresh milestones from new date
    await scheduleAllUpcomingMilestones(newStartDate, userPersonalization);
    
    console.log('✅ Milestones rescheduled successfully');
  } catch (error) {
    console.error('❌ Error rescheduling milestones:', error);
  }
}

/**
 * Cancel all struggle time notifications
 */
export async function cancelStruggleTimeNotifications(): Promise<boolean> {
  return cancelNotificationsByType('struggle_time');
}

/**
 * Cancel all milestone notifications
 */
export async function cancelMilestoneNotifications(): Promise<boolean> {
  return cancelNotificationsByType('milestone');
}

/**
 * Cancel a specific notification by identifier
 */
export async function cancelNotification(identifier: string): Promise<boolean> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log(`✅ Cancelled notification: ${identifier}`);
    return true;
  } catch (error) {
    console.error('❌ Error cancelling notification:', error);
    return false;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Cancelled all notifications');
    return true;
  } catch (error) {
    console.error('❌ Error cancelling all notifications:', error);
    return false;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    const { all } = await getCategorizedNotifications();
    console.log(`📋 Found ${all.length} scheduled notifications`);
    return all;
  } catch (error) {
    console.error('❌ Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Schedule a test notification (for Phase 1 verification)
 */
export async function scheduleTestNotification(delaySeconds: number = 5): Promise<string | null> {
  return scheduleNotification(
    '🧪 Test Notification',
    `NotificationService is working! Scheduled ${delaySeconds}s ago.`,
    delaySeconds,
    `test_${Date.now()}`
  );
}

/**
 * Get notification service status for debugging
 */
export async function getNotificationStatus(): Promise<{
  hasPermissions: boolean;
  scheduledCount: number;
  struggleTimeCount: number;
  milestoneCount: number;
  platform: string;
}> {
  const { status } = await Notifications.getPermissionsAsync();
  const { all, struggleTime, milestone } = await getCategorizedNotifications();
  
  return {
    hasPermissions: status === 'granted',
    scheduledCount: all.length,
    struggleTimeCount: struggleTime.length,
    milestoneCount: milestone.length,
    platform: Platform.OS,
  };
} 