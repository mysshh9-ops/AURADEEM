export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  /** true once completion Aura has been granted, prevents farming */
  rewarded?: boolean;
};

export type GamificationState = {
  aura: number;
  streak: number;
  lastCompletionDate?: string;
  completedToday: number;
  totalCompleted: number;
  achievements: string[];
};

export type AchievementId =
  | "first_w"
  | "locked_in"
  | "no_cap"
  | "aura_farmer"
  | "main_character"
  | "streak_demon"
  | "absolute_cinema";

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
};
