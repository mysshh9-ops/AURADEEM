import type {
  AchievementId,
  Achievement,
  GamificationState,
  Task,
} from "@/types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_w", name: "First W", description: "Complete your first task.", icon: "🏆" },
  { id: "locked_in", name: "Locked In", description: "Complete 5 tasks.", icon: "🔒" },
  { id: "no_cap", name: "No Cap", description: "Complete 10 tasks.", icon: "🧢" },
  { id: "aura_farmer", name: "Aura Farmer", description: "Earn 500 Aura.", icon: "👑" },
  { id: "main_character", name: "Main Character", description: "Reach Level 5.", icon: "✨" },
  { id: "streak_demon", name: "Streak Demon", description: "Reach a 7-day streak.", icon: "🔥" },
  { id: "absolute_cinema", name: "Absolute Cinema", description: "Complete a High-priority task.", icon: "🎬" },
];

export const PRIORITY_AURA: Record<Task["priority"], number> = {
  high: 30,
  medium: 20,
  low: 10,
};

/** Cumulative Aura thresholds: index = level (1-based), value = aura needed to REACH that level. */
export const LEVEL_THRESHOLDS: number[] = [
  0, // L1
  0, // L1 starts at 0
  100, // L2
  250, // L3
  450, // L4
  700, // L5
  1000, // L6
];

export function levelForAura(aura: number): number {
  // Continue beyond L6 with a simple formula: each level needs +350 more than the previous gap after L6
  let level = 1;
  for (let i = 2; i < LEVEL_THRESHOLDS.length; i++) {
    if (aura >= LEVEL_THRESHOLDS[i]) level = i;
    else return level;
  }
  // Beyond the static table
  let threshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]; // 1000 for L6
  let gap = 350;
  let lv = LEVEL_THRESHOLDS.length - 1; // 6
  while (aura >= threshold + gap) {
    threshold += gap;
    lv += 1;
    gap += 50;
  }
  return lv;
}

export function levelBounds(aura: number): {
  level: number;
  current: number;
  needed: number;
  floor: number;
} {
  const level = levelForAura(aura);
  // floor for this level
  let floor: number;
  let ceil: number;
  if (level < LEVEL_THRESHOLDS.length) {
    floor = LEVEL_THRESHOLDS[level];
    ceil = LEVEL_THRESHOLDS[level + 1] ?? floor + 350;
  } else {
    // recompute dynamic bounds
    let threshold = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    let gap = 350;
    let lv = LEVEL_THRESHOLDS.length - 1;
    while (lv < level) {
      threshold += gap;
      lv += 1;
      gap += 50;
    }
    floor = threshold;
    ceil = threshold + gap;
  }
  return {
    level,
    current: aura - floor,
    needed: ceil - floor,
    floor,
  };
}

export type AuraStatus = {
  label: string;
  emoji: string;
};

export function auraStatus(aura: number): AuraStatus {
  if (aura >= 1000) return { label: "AURA FARMER", emoji: "👑" };
  if (aura >= 700) return { label: "ABSOLUTE CINEMA", emoji: "🎬" };
  if (aura >= 450) return { label: "MAIN CHARACTER ENERGY", emoji: "✨" };
  if (aura >= 250) return { label: "LOCKING IN", emoji: "🔒" };
  if (aura >= 100) return { label: "GETTING STARTED", emoji: "🌱" };
  return { label: "NPC ARC", emoji: "🤖" };
}

const COMPLETION_REACTIONS = [
  "WE'RE SO BACK 🔥",
  "ABSOLUTE CINEMA 🎬",
  "LOCKED IN.",
  "COMMON W.",
  "MAIN CHARACTER ENERGY ✨",
  "AURA +++",
  "YOU ACTUALLY DID IT.",
  "NO CAP. HUGE W.",
  "THE GRINDSET IS GRINDING.",
  "THAT'S A CLUTCH.",
  "WE'RE SO BACK FR.",
];

const PENDING_REACTIONS = [
  "-999 aura bro 💀",
  "Bro entered the procrastination arc.",
  "NPC behavior detected.",
  "Respectfully... lock in.",
  "You said later. Later said nah.",
  "The task is literally still here 😭",
  "Your redemption arc starts now.",
  "Bro is cooking... unfortunately nothing.",
  "the villain arc is showing 👀",
  "touch grass... then finish this.",
];

export function randomReaction(list: string[], avoid?: string): string {
  if (list.length === 1) return list[0];
  let pick = list[Math.floor(Math.random() * list.length)];
  let guard = 0;
  while (pick === avoid && guard < 5) {
    pick = list[Math.floor(Math.random() * list.length)];
    guard += 1;
  }
  return pick;
}

export function completionReaction(avoid?: string): string {
  return randomReaction(COMPLETION_REACTIONS, avoid);
}

export function pendingReaction(avoid?: string): string {
  return randomReaction(PENDING_REACTIONS, avoid);
}

/** Check and return any newly-unlocked achievements given current state + tasks. */
export function checkAchievements(
  state: GamificationState,
  tasks: Task[]
): AchievementId[] {
  const unlocked = new Set<AchievementId>(
    state.achievements as AchievementId[]
  );
  const newly: AchievementId[] = [];
  const grant = (id: AchievementId) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newly.push(id);
    }
  };

  if (state.totalCompleted >= 1) grant("first_w");
  if (state.totalCompleted >= 5) grant("locked_in");
  if (state.totalCompleted >= 10) grant("no_cap");
  if (state.aura >= 500) grant("aura_farmer");
  if (levelForAura(state.aura) >= 5) grant("main_character");
  if (state.streak >= 7) grant("streak_demon");
  if (tasks.some((t) => t.completed && t.priority === "high"))
    grant("absolute_cinema");

  return newly;
}

export function achievementById(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Compute new streak after a completion today. */
export function computeStreak(
  streak: number,
  lastCompletionDate: string | undefined,
  today: string
): number {
  if (!lastCompletionDate) return 1;
  if (lastCompletionDate === today) return Math.max(1, streak);
  const diff = daysBetween(lastCompletionDate, today);
  if (diff === 1) return streak + 1;
  if (diff <= 0) return Math.max(1, streak);
  return 1; // missed a day
}
