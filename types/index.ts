export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
}

export interface SobrietyState {
  startDate: string; // ISO string - current sobriety streak start
  firstAppUseDate: string; // ISO string - when user first used the app
  xp: number;
  level: number;
  xpToNextLevel: number;
  levelUp: boolean;
  dailyXP: Record<string, number>; // Track XP earned per day (key is date in ISO format)
  sobrietyBreaks: string[]; // Track days when sobriety was broken (dates in ISO format)
  name?: string; // User's name
  age?: number; // User's age
  onboardingCompleted?: boolean; // Track if user has completed onboarding
  
  // Onboarding personalization data
  substance?: string; // What they're working on: 'Alcohol', 'Nicotine', etc.
  substanceFrequency?: string; // How often they use it: 'Daily', 'Weekly', etc.
  triggers?: string[]; // Main triggers: ['Stress', 'Social situations', ...]
  recoveryGoals?: string[]; // Recovery goals: ['Stay sober', 'Save money', ...]
  hardestChallenge?: string; // Biggest challenge: 'Cravings', 'Breaking habits', etc.
  sobrietyImportance?: string; // Importance level: '🔥 Extremely important - my top priority'
  struggleTimes?: string[]; // When they struggle: ['🌆 Evening (4-8 PM)', ...]
}