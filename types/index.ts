export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  xpReward: number;
}

export interface SobrietyState {
  startDate: string; // ISO string
  xp: number;
  level: number;
  xpToNextLevel: number;
  levelUp: boolean;
}