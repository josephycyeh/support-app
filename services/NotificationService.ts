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
 * Uses hardcoded mapping for the known struggle time options from onboarding
 */
function parseStruggleTime(timeString: string): StruggleTimeSlot | null {
  console.log('🕐 Parsing struggle time:', timeString);
  
  // Hardcoded mapping for the exact struggle time options from onboarding
  // This ensures 100% accuracy and avoids parsing issues
  const struggleTimeMap: Record<string, StruggleTimeSlot> = {
    '🌅 Morning (6 AM-12 PM)': {
      start: 6,
      end: 12,
      label: 'Morning',
      emoji: '🌅',
    },
    '🌞 Afternoon (12-4 PM)': {
      start: 12,
      end: 16,
      label: 'Afternoon',
      emoji: '🌞',
    },
    '🌆 Evening (4-8 PM)': {
      start: 16,
      end: 20,
      label: 'Evening',
      emoji: '🌆',
    },
    '🌙 Night (8 PM-12 AM)': {
      start: 20,
      end: 24,
      label: 'Night',
      emoji: '🌙',
    },
    '🌃 Late night (12-6 AM)': {
      start: 0,
      end: 6,
      label: 'Late night',
      emoji: '🌃',
    },
  };

  // Direct lookup for exact matches
  const exactMatch = struggleTimeMap[timeString];
  if (exactMatch) {
    console.log('🕐 Found exact match:', exactMatch);
    return exactMatch;
  }

  // Fallback: Try to find partial matches (in case of slight variations)
  for (const [key, value] of Object.entries(struggleTimeMap)) {
    if (timeString.includes(value.label) || timeString.includes(value.emoji)) {
      console.log('🕐 Found partial match:', value);
      return value;
    }
  }

  console.error('❌ No matching struggle time found for:', timeString);
  return null;
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
  
  // Base messages that work for all users (regardless of days sober)
  const baseMessages = {
    morning: [
      `Morning! ☀️ Take 3 deep breaths and set one small intention for today. What's one thing that will make you proud by evening?`,
      `Peaceful morning${name ? `, ${name}` : ''} 🧘‍♀️ Notice something beautiful around you right now. Recovery is about finding joy in small moments.`,
      `Hey there! Sobi checking in 💙 I'm proud of how far you've come. Let's start this day with kindness toward yourself.`,
      `Hey${name ? ` ${name}` : ''}, Sobi here! 💙 I know mornings can be tough, but you're not alone. You're stronger than you realize.`,
    ],
    afternoon: [
      `Hey there! How's your afternoon going? I know this time of day can feel long, but you're doing amazing. Let's finish strong together!`,
      `Afternoon check-in${name ? `, ${name}` : ''} 💪 You're building momentum with every hour. The day isn't over yet - you've got this!`,
      `${name ? `${name}, ` : ''}it's Sobi! Afternoons can feel endless sometimes, but remember - you're not just getting through today, you're building tomorrow.`,
      `Hi${name ? ` ${name}` : ''}, Sobi checking in 💙 Just wanted to remind you that you're not alone in this moment. I'm here, and I'm proud of you.`,
      `Afternoon self-care reminder 🌻 Have you eaten? Had water? Taken a breath? Small acts of self-care add up to big changes.`,
      `Hi${name ? ` ${name}` : ''}, Sobi checking in 💙 We're almost at the finish line for today. You've been so strong - let's keep that beautiful momentum going!`,
    ],
    evening: [
      `Hey, Sobi here! 🌅 You made it through another day - that's incredible. Ready to wind down together?`,
      `Hi${name ? ` ${name}` : ''}, it's Sobi 💙 I know evenings can feel heavy sometimes, but you're not alone. You've been so strong today - let's get through this together.`,
      `Evening self-care 🌙 You've given so much to your recovery today. Now it's time to give to yourself - rest, nourish, breathe.`,
      `Hey${name ? ` ${name}` : ''} 🌙 Evening check-in! You made it to another evening - that's something to acknowledge. How are you feeling right now?`,
      `Good evening${name ? `, ${name}` : ''} ✨ Just a gentle reminder that you're not alone tonight. I'm here, and tomorrow is a fresh start.`,
    ],
    night: [
      `Hey${name ? ` ${name}` : ''}, it's Sobi 🌙 Night time can feel quiet and long, but you're not alone. I'm here with you through these evening hours. You're safe.`,
      `Night time self-care 🌙 Your body and mind need rest after a day of recovery. What helps you feel calm and peaceful right now?`,
      `Good evening${name ? `, ${name}` : ''} 🌟 Before the day ends completely, take a moment to appreciate one small thing about today. You deserve that kindness.`,
      `It's Sobi 🌙 I'm sending you protective, calming energy for the night. You're surrounded by support, even when it's quiet.`,
      `Take a moment to unwind. What will you do for yourself tonight? You deserve kindness 🌙`,
    ],
    latenight: [
      `${emoji} Late night check-in${name ? `, ${name}` : ''}! Every hour is a victory - you've got this 🌃`,
      `Even in the late hours, remember you're building something lasting ✨`,
      `Hey${name ? ` ${name}` : ''}, it's Sobi 💙 I know it's late, but I'm here. Late nights can feel endless, but you're not walking through this alone. I'm right here with you.`,
      `Goodnight${name ? `, ${name}` : ''}! Rest well and recharge for a brighter tomorrow! 🌙`,
    ],
  };
  
  // Additional messages for users with 1+ days sober (include day count)
  const dayCountMessages = {
    morning: [
      `Good morning! Sobi here 🌅 Ready to tackle another day together? You've got ${daysSober} days of strength behind you - let's make today count!`,
      `Morning check-in${name ? `, ${name}` : ''} 💪 Every sober morning is a victory. You're ${daysSober} days strong and building the life you deserve.`,
    ],
    afternoon: [
      `We're almost through another day together - you've got ${daysSober} days of strength behind you. The afternoon is nearly over, let's finish strong!`,
    ],
    evening: [
      `You've made it through another day - that's ${daysSober} days of strength now. I'm so proud of your consistency.`,
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
  let category: keyof typeof baseMessages = 'evening'; // default
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('morning')) category = 'morning';
  else if (lowerLabel.includes('afternoon')) category = 'afternoon';
  else if (lowerLabel.includes('evening')) category = 'evening';
  else if (lowerLabel.includes('night')) category = 'night';
  else if (lowerLabel.includes('late')) category = 'latenight';
  
  // Choose template set based on days sober
  const baseTemplates = baseMessages[category] || [];
  const dayCountTemplates = daysSober >= 1 ? (dayCountMessages[category] || []) : [];
  const allTemplates = [...baseTemplates, ...dayCountTemplates];
  
  // Select random message from combined templates
  const selectedMessage = allTemplates[Math.floor(Math.random() * allTemplates.length)];
  
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
        console.log(`✅ Scheduled milestone notification: ${milestone.days} days on ${milestoneDate.toLocaleDateString()} at ${milestoneDate.toLocaleTimeString()}`);
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