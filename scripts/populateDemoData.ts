import { useSobrietyStore } from '@/store/sobrietyStore';
import { useMoodStore } from '@/store/moodStore';
import { useJournalStore } from '@/store/journalStore';
import { useChatStore } from '@/store/chatStore';
import { useChecklistStore } from '@/store/checklistStore';
import { useActivityStore } from '@/store/activityStore';

// Helper function to get date string N days ago
const getDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().split('T')[0];
};

// Helper function to get ISO timestamp N days ago
const getTimestampDaysAgo = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const populateDemoData = () => {
  console.log('🎭 Populating demo data...');
  
  // === CLEAR ALL EXISTING DATA FIRST ===
  console.log('🧹 Clearing existing data...');
  
  // Clear chat history (this will reset to welcome message only)
  const chatStoreForClearing = useChatStore.getState();
  chatStoreForClearing.clearHistory();
  
  // Clear journal entries
  const journalStoreForClearing = useJournalStore.getState();
  const existingEntries = journalStoreForClearing.getEntries();
  existingEntries.forEach(entry => journalStoreForClearing.deleteEntry(entry.id));
  
  // Clear mood entries
  const moodStoreForClearing = useMoodStore.getState();
  useMoodStore.setState({ entries: [], hasLoggedToday: false });
  
  // Clear activity stats
  const activityStoreForClearing = useActivityStore.getState();
  useActivityStore.setState({ 
    breathingExercises: 0, 
    journalEntries: 0, 
    cravingsOvercome: 0 
  });
  
  // Reset checklist to default state
  const checklistStoreForClearing = useChecklistStore.getState();
  checklistStoreForClearing.checkAndResetIfNewDay(); // This will reset all items to uncompleted
  
  // Reset sobriety data to clean state
  useSobrietyStore.setState({
    xp: 0,
    level: 1,
    xpToNextLevel: 100,
    levelUp: false,
    dailyXP: {},
    sobrietyBreaks: [],
    // We'll set startDate and other data below
  });
  
  console.log('✅ Existing data cleared!');
  
  // === SOBRIETY DATA ===
  const sobrietyStore = useSobrietyStore.getState();
  
  // Set user profile
  sobrietyStore.setName('Alex');
  sobrietyStore.setAge(28);
  
  // Set sobriety start date to 45 days ago for impressive streak
  const sobrietyStartDate = getTimestampDaysAgo(45);
  
  // Generate daily XP data for the past 45 days with reasonable amounts
  const dailyXP: Record<string, number> = {};
  for (let i = 0; i < 45; i++) {
    const dateStr = getDaysAgo(i);
    // XP amounts in multiples of 5 with LOTS of darkest blue days (need >60 XP for intensity 1.0)
    let xpAmount = 0;
    const rand = Math.random();
    
    if (rand > 0.65) {
      // 35% chance of very high XP day (65-85) - darkest blue (intensity 1.0)
      const options = [65, 70, 75, 80, 85];
      xpAmount = options[Math.floor(Math.random() * options.length)];
    } else if (rand > 0.35) {
      // 30% chance of high XP day (40-65) - darker blue, some crossing into darkest
      const options = [40, 45, 50, 55, 60, 65];
      xpAmount = options[Math.floor(Math.random() * options.length)];
    } else if (rand > 0.05) {
      // 30% chance of normal XP day (20-35) - medium blue
      const options = [20, 25, 30, 35];
      xpAmount = options[Math.floor(Math.random() * options.length)];
    }
    // 5% chance of no XP (missed day)
    
    if (xpAmount > 0) {
      dailyXP[dateStr] = xpAmount;
    }
  }
  
  // Calculate proper level progression using the actual game formula
  // Level 1: 0-100 XP, Level 2: 100-250 XP (100+150), Level 3: 250-450 XP (100+150+200), etc.
  let currentLevel = 1;
  let totalXPEarned = Object.values(dailyXP).reduce((sum, xp) => sum + xp, 0);
  let currentXP = totalXPEarned;
  
  // Use the actual game formula: 100 + (level - 1) * 50
  const getXPForLevel = (level: number) => 100 + (level - 1) * 50;
  
  // Calculate which level they should be at and current XP within that level
  let totalXPSpent = 0;
  while (currentLevel < 10 && currentXP >= getXPForLevel(currentLevel)) {
    const xpNeededForThisLevel = getXPForLevel(currentLevel);
    totalXPSpent += xpNeededForThisLevel;
    currentXP -= xpNeededForThisLevel;
    currentLevel++;
  }
  
  const xpToNextLevel = getXPForLevel(currentLevel);
  
  // Update sobriety store directly with corrected XP values
  useSobrietyStore.setState({
    startDate: sobrietyStartDate,
    firstAppUseDate: sobrietyStartDate,
    xp: currentXP, // Current XP within the level (should be less than xpToNextLevel)
    level: currentLevel,
    xpToNextLevel: xpToNextLevel,
    dailyXP: dailyXP,
    sobrietyBreaks: [], // Clean streak
  });
  
  // === MOOD DATA ===
  const moodStore = useMoodStore.getState();
  
  // Clear existing mood entries first
  useMoodStore.setState({ entries: [], hasLoggedToday: false });
  
  // Generate mood entries for the past 30 days with proper dates
  for (let i = 29; i >= 0; i--) { // Start from 29 days ago, work forward
    const mood = Math.floor(Math.random() * 3) + 3; // Mostly good moods (3-5)
    const timestamp = getTimestampDaysAgo(i);
    const date = getDaysAgo(i);
    
    // Create proper MoodEntry with all required fields
    const moodEntry = {
      id: `demo-mood-${i}`,
      mood,
      timestamp,
      date
    };
    
    // Add to store directly to ensure proper date
    useMoodStore.setState(state => ({
      entries: [...state.entries, moodEntry]
    }));
  }
  
  // === JOURNAL ENTRIES ===
  const journalStore = useJournalStore.getState();
  
  const sampleEntries = [
    {
      id: 'demo-1',
      title: 'Actually feeling pretty good today',
      content: `Woke up early for once and actually felt rested. Crazy how much better sleep is when you're not drinking.

Made myself a proper breakfast instead of just grabbing coffee. Small wins but they add up right?

Work was actually manageable today. Used that breathing thing when I started getting stressed about the presentation. Can't believe it actually works lol.`,
      date: getTimestampDaysAgo(2),
      type: 'journal' as const,
    },
    {
      id: 'demo-2',
      title: 'Weekend thoughts',
      content: `Saturdays used to be for recovering from Friday nights. Now I'm up at 8am cleaning my apartment and it feels... good?

Went grocery shopping and actually bought ingredients instead of frozen pizza. Might try cooking that recipe mom sent me.

Texted Sarah back finally. She's been worried about me but I wasn't ready to talk about everything until now. Maybe I'll tell her about the app.`,
      date: getTimestampDaysAgo(5),
      type: 'journal' as const,
    },
    {
      id: 'demo-3',
      title: 'Close call at happy hour',
      content: `Trigger: Got invited to team happy hour after work. Usually I'd have an excuse ready but this caught me off guard. Everyone was going and I didn't want to seem antisocial. Went for "just one drink" but standing there with a beer in my hand, I realized this was exactly the situation I've been trying to avoid.

Intensity: 8/10

Coping Strategy: Left after 20 minutes and told them I had dinner plans. Came straight home and opened this app. Talked to Sushi for like 30 minutes just processing it all. Did some breathing exercises to calm down.

Outcome: Stayed Strong`,
      date: getTimestampDaysAgo(8),
      type: 'trigger' as const,
    },
    {
      id: 'demo-4',
      title: 'thirty days... wow',
      content: `I keep staring at the app saying 30 days. A month. That's longer than I've gone since... I can't even remember when.

Called dad tonight. Told him about the milestone. He got quiet for a minute and then said "I'm proud of you kiddo." Haven't heard him say that in years. We both kind of cried a little.

Mom would have been proud too. I think she'd like this version of me better.

The weird thing is I'm not even craving it as much anymore. Like my brain is starting to remember what normal feels like. Still have bad days but they're different now. Manageable.

30 more days feels possible. Maybe even 60.`,
      date: getTimestampDaysAgo(15),
      type: 'journal' as const,
    },
    {
      id: 'demo-5',
      title: 'Friend drama',
      content: `Jake keeps inviting me to the same bars we used to go to. I keep making excuses but he's starting to get annoyed.

I get it. I was probably annoying when he was trying to get his shit together too. But it sucks feeling like I'm losing friends just for trying to be healthier.

Maybe I need to just be honest with him. Or find new friends who don't revolve everything around drinking. That sounds lonely though.`,
      date: getTimestampDaysAgo(12),
      type: 'journal' as const,
    },
  ];
  
  sampleEntries.forEach(entry => journalStore.addEntry(entry));
  
  // === CHAT MESSAGES ===
  const chatStore = useChatStore.getState();
  
  // First clear any existing messages beyond welcome
  chatStore.clearHistory();
  
  const sampleMessages = [
    {
      id: 'demo-msg-1',
      role: 'user' as const,
      content: 'hey sushi, having a rough day today',
    },
    {
      id: 'demo-msg-2',
      role: 'assistant' as const,
      content: 'I\'m really sorry to hear you\'re having a tough day. It takes courage to reach out when you\'re struggling. What\'s been making today particularly rough for you? I\'m here to listen and help however I can. 💙',
    },
    {
      id: 'demo-msg-3',
      role: 'user' as const,
      content: 'just work stress and my friends keep asking me to go out drinking. its hard to keep saying no',
    },
    {
      id: 'demo-msg-4',
      role: 'assistant' as const,
      content: 'That sounds really challenging, especially dealing with both work pressure and social pressure at the same time. It\'s completely normal to feel tired of having to say no all the time.\n\nFirst, I want to acknowledge how strong you\'ve been - 45 days is amazing! Every "no" you\'ve said has brought you to this point.\n\nFor the friends situation, have you thought about suggesting alternative activities? Maybe coffee, hiking, or seeing a movie? Sometimes people just want to spend time with you, not necessarily drink.',
    },
    {
      id: 'demo-msg-5',
      role: 'user' as const,
      content: 'yeah maybe. i just feel like im missing out on everything',
    },
    {
      id: 'demo-msg-6',
      role: 'assistant' as const,
      content: 'That feeling of missing out is so real and valid. But can I share something? You\'re not missing out - you\'re actually gaining so much. Look at your mood tracker - you\'ve been consistently happier these past weeks. Your journal entries show how proud you are of your progress.\n\nThe "fun" you think you\'re missing often comes with hangovers, regret, and setbacks. You\'re building a life you can actually remember and be proud of. That\'s not missing out - that\'s choosing something better. ✨',
    },
    {
      id: 'demo-msg-7',
      role: 'user' as const,
      content: 'thanks sushi. youre right. maybe ill suggest going to that new coffee place instead',
    },
    {
      id: 'demo-msg-8',
      role: 'assistant' as const,
      content: 'Now that sounds like an awesome plan! I love that you\'re taking control and suggesting something positive. Your real friends will appreciate that you still want to spend time with them, just in a different way.\n\nHow are you feeling about the work stress? Want to talk through any strategies for that too?',
    },
  ];
  
  // Add messages to chat store
  sampleMessages.forEach(msg => chatStore.addMessage(msg));
  
  // Force a storage sync to ensure persistence
  // This helps trigger React state updates in components that depend on the store
  setTimeout(() => {
    console.log('💬 Chat store refreshed with demo messages');
  }, 100);
  
  // === CHECKLIST COMPLETION ===
  // Reset checklist to ensure all items are available first
  const checklistStore = useChecklistStore.getState();
  checklistStore.resetDailyItems(); // Force reset all items to uncompleted
  
  // Complete 3 items to show engagement, leave 2 for demo interaction
  const items = checklistStore.items;
  if (items.length >= 5) {
    checklistStore.toggleItem(items[0].id); // Complete "Do Breathing Exercise"
    checklistStore.toggleItem(items[2].id); // Complete "Log Your Thoughts" 
    checklistStore.toggleItem(items[4].id); // Complete "Call a Supportive Friend"
    // Leave items[1] "Note a Craving" and items[3] "Take a Walk Outside" for demo
  }
  
  // === ACTIVITY STATS ===
  const activityStore = useActivityStore.getState();
  
  // Set realistic activity stats that match the demo content
  activityStore.setBreathingExercises(12); // 12 breathing exercises completed
  activityStore.setJournalEntries(5); // 5 journal entries (matches the entries we're adding)
  activityStore.setCravingsOvercome(3); // 3 cravings successfully overcome
  
  console.log('✅ Demo data populated successfully!');
  console.log(`📊 Stats: ${currentLevel} level, 45-day streak, ${Object.keys(dailyXP).length} active days`);
  console.log(`📝 Added ${sampleEntries.length} journal entries`);
  console.log(`💬 Added ${sampleMessages.length} chat messages`);
  console.log(`😊 Added 30 days of mood tracking`);
  console.log(`🎯 Activity Stats: ${12} breathing exercises, ${5} journal entries, ${3} cravings overcome`);
}; 