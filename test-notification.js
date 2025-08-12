import { scheduleNotification } from './services/NotificationService.js';
import { useSobrietyStore } from './store/sobrietyStore.js';
import { calculateDaysSober } from './utils/dateUtils.js';

// Function to trigger the test notification
export async function triggerTestNotification() {
  try {
    // Get current sobriety data
    const { startDate, name } = useSobrietyStore.getState();
    const daysSober = Math.floor(calculateDaysSober(startDate));
    
    // Create the personalized message
    const title = "Good morning! Sobi here 🌅";
    const body = `Ready to tackle another day together? You've got ${daysSober} days of strength behind you - let's make today count!`;
    
    console.log('🧪 Triggering test notification:', { title, body, daysSober });
    
    // Schedule notification to fire in 3 seconds
    const notificationId = await scheduleNotification(
      title,
      body,
      3, // 3 seconds delay
      `test_morning_${Date.now()}`
    );
    
    if (notificationId) {
      console.log('✅ Test notification scheduled successfully!', notificationId);
      return notificationId;
    } else {
      console.log('❌ Failed to schedule test notification');
      return null;
    }
  } catch (error) {
    console.error('❌ Error triggering test notification:', error);
    return null;
  }
}

// Call the function
triggerTestNotification();
