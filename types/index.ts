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
  milestonesReached: number[]; // Track which milestone days have been rewarded (1, 7, 14, 30, 90, etc.)
  name?: string; // User's name
  age?: number; // User's age
}