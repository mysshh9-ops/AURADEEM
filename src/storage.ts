import type { Task, GamificationState } from "@/types";

const TASKS_KEY = "aura_tasks";
const GAMES_KEY = "aura_gamification";

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable — keep running in-memory */
  }
}

export function loadGamification(): GamificationState {
  const fallback: GamificationState = {
    aura: 0,
    streak: 0,
    lastCompletionDate: undefined,
    completedToday: 0,
    totalCompleted: 0,
    achievements: [],
  };
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return fallback;
    return {
      aura: typeof parsed.aura === "number" ? parsed.aura : 0,
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastCompletionDate:
        typeof parsed.lastCompletionDate === "string"
          ? parsed.lastCompletionDate
          : undefined,
      completedToday:
        typeof parsed.completedToday === "number" ? parsed.completedToday : 0,
      totalCompleted:
        typeof parsed.totalCompleted === "number" ? parsed.totalCompleted : 0,
      achievements: Array.isArray(parsed.achievements)
        ? parsed.achievements.filter((a: unknown) => typeof a === "string")
        : [],
    };
  } catch {
    return fallback;
  }
}

export function saveGamification(state: GamificationState): void {
  try {
    localStorage.setItem(GAMES_KEY, JSON.stringify(state));
  } catch {
    /* no-op */
  }
}

function isValidTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    (t.priority === "high" || t.priority === "medium" || t.priority === "low") &&
    typeof t.completed === "boolean" &&
    typeof t.createdAt === "number"
  );
}

export function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
