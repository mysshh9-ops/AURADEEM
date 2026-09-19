import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { AchievementId, GamificationState, Priority, Task } from "@/types";
import {
  generateId,
  loadGamification,
  loadTasks,
  saveGamification,
  saveTasks,
} from "@/storage";
import {
  PRIORITY_AURA,
  achievementById,
  checkAchievements,
  computeStreak,
  getLocalDateString,
  levelForAura,
  localDateFromTimestamp,
} from "@/gamification";
import { useToasts } from "@/useToasts";
import { initAudio, play, setSoundEnabled } from "@/sound";
import { Header } from "@/components/Header";
import { AuraHero } from "@/components/AuraHero";
import { Stats } from "@/components/Stats";
import { TaskForm } from "@/components/TaskForm";
import {
  SearchAndFilters,
  type PriorityFilter,
  type StatusFilter,
} from "@/components/SearchAndFilters";
import { NoMatches, TaskList } from "@/components/TaskList";
import { Achievements } from "@/components/Achievements";
import { ToastStack } from "@/components/ToastStack";
import { Confetti } from "@/components/Confetti";
import { LevelUpModal } from "@/components/LevelUpModal";

const DEMO_TASKS: { title: string; priority: Priority }[] = [
  { title: "Finish biology assignment", priority: "high" },
  { title: "Read anatomy chapter", priority: "medium" },
  { title: "Touch grass (10 min walk)", priority: "low" },
  { title: "Reply to that one email", priority: "medium" },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [game, setGame] = useState<GamificationState>(() => loadGamification());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [soundOn, setSoundOn] = useState(true);
  const [auraPulse, setAuraPulse] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);
  const [levelUp, setLevelUp] = useState<{ level: number; aura: number } | null>(
    null
  );
  const [recentAchievement, setRecentAchievement] = useState<AchievementId | null>(
    null
  );

  const { toasts, push, dismiss } = useToasts();
  const addFormRef = useRef<HTMLDivElement>(null);
  const prevLevelRef = useRef<number>(levelForAura(game.aura));

  // Persist state
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGamification(game);
  }, [game]);

  // Sync sound enabled state
  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  // Detect level-ups
  useEffect(() => {
    const newLevel = levelForAura(game.aura);
    if (newLevel > prevLevelRef.current) {
      setLevelUp({ level: newLevel, aura: game.aura });
      play("levelup");
      triggerConfetti();
    }
    prevLevelRef.current = newLevel;
  }, [game.aura]);

  const today = getLocalDateString();

  const triggerConfetti = useCallback(() => {
    setConfettiOn(false);
    requestAnimationFrame(() => setConfettiOn(true));
    setTimeout(() => setConfettiOn(false), 1500);
  }, []);

  const triggerAuraPulse = useCallback(() => {
    setAuraPulse(false);
    requestAnimationFrame(() => setAuraPulse(true));
    setTimeout(() => setAuraPulse(false), 800);
  }, []);

  /* ---------------- Derived data (single source of truth) ---------------- */

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const todayCompleted = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.completed &&
          t.completedAt &&
          localDateFromTimestamp(t.completedAt) === today
      ).length,
    [tasks, today]
  );
  const todayPending = pendingTasks;

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (q && !t.title.toLowerCase().includes(q)) return false;
        if (statusFilter === "active" && t.completed) return false;
        if (statusFilter === "completed" && !t.completed) return false;
        if (priorityFilter !== "all" && t.priority !== priorityFilter)
          return false;
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, search, statusFilter, priorityFilter]);

  /* ---------------- Actions ---------------- */

  const grantAchievements = useCallback(
    (newGame: GamificationState, currentTasks: Task[]) => {
      const newly = checkAchievements(newGame, currentTasks);
      if (newly.length === 0) return newGame;
      for (const id of newly) {
        const a = achievementById(id);
        if (a) {
          push({
            title: "ACHIEVEMENT UNLOCKED",
            subtitle: `${a.icon} ${a.name}`,
            variant: "achievement",
          });
          play("achievement");
          setRecentAchievement(id);
          setTimeout(() => setRecentAchievement(null), 2500);
        }
      }
      return { ...newGame, achievements: [...newGame.achievements, ...newly] };
    },
    [push]
  );

  const addTask = useCallback(
    (title: string, priority: Priority) => {
      const task: Task = {
        id: generateId(),
        title,
        priority,
        completed: false,
        createdAt: Date.now(),
        rewarded: false,
      };
      setTasks((prev) => [task, ...prev]);
      push({ title: "QUEST ADDED", subtitle: title, variant: "info" });
      play("add");
    },
    [push]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prevTasks) => {
        const task = prevTasks.find((t) => t.id === id);
        if (!task) return prevTasks;

        if (task.completed) {
          // Uncomplete: do NOT refund Aura, do NOT decrement lifetime count,
          // do NOT reset rewarded. Only toggle the completed state.
          const updated = prevTasks.map((t) =>
            t.id === id
              ? { ...t, completed: false, completedAt: undefined }
              : t
          );
          setGame((prevGame) => {
            // Only adjust today's counter, not lifetime
            const newToday =
              today === prevGame.lastCompletionDate
                ? Math.max(0, prevGame.completedToday - 1)
                : prevGame.completedToday;
            const next: GamificationState = {
              ...prevGame,
              completedToday: newToday,
            };
            return grantAchievements(next, updated);
          });
          return updated;
        }

        // Complete: award Aura ONLY on first completion (task.rewarded is false)
        const isRewardable = !task.rewarded;
        const auraGain = PRIORITY_AURA[task.priority];
        const updated = prevTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: true,
                completedAt: Date.now(),
                rewarded: true,
              }
            : t
        );

        setGame((prevGame) => {
          const newStreak = computeStreak(
            prevGame.streak,
            prevGame.lastCompletionDate,
            today
          );
          const completedToday =
            prevGame.lastCompletionDate === today
              ? prevGame.completedToday + 1
              : 1;
          const next: GamificationState = {
            ...prevGame,
            aura: isRewardable ? prevGame.aura + auraGain : prevGame.aura,
            streak: newStreak,
            lastCompletionDate: today,
            completedToday,
            totalCompleted: isRewardable
              ? prevGame.totalCompleted + 1
              : prevGame.totalCompleted,
          };
          return grantAchievements(next, updated);
        });

        if (isRewardable) {
          push({
            title: `+${auraGain} AURA`,
            subtitle:
              task.priority === "high" ? "LOCKED IN. 🔥" : "WE'RE SO BACK.",
            variant: "reward",
          });
          play("complete");
          triggerAuraPulse();
        }

        return updated;
      });
    },
    [today, push, grantAchievements, triggerAuraPulse]
  );

  const editTask = useCallback(
    (id: string, title: string, priority: Priority) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title, priority } : t))
      );
      push({ title: "Quest updated.", variant: "info" });
      play("click");
    },
    [push]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const ok = window.confirm(
        `Delete "${task.title}"? This cannot be undone.`
      );
      if (!ok) return;
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        // Do NOT decrement lifetime totalCompleted on delete.
        // Only adjust today's count if the deleted task was completed today.
        if (task.completed) {
          setGame((prevGame) => {
            const newToday =
              today === prevGame.lastCompletionDate &&
              task.completedAt &&
              localDateFromTimestamp(task.completedAt) === today
                ? Math.max(0, prevGame.completedToday - 1)
                : prevGame.completedToday;
            const next: GamificationState = {
              ...prevGame,
              completedToday: newToday,
            };
            return grantAchievements(next, updated);
          });
        }
        return updated;
      });
      push({ title: "Quest deleted.", variant: "danger" });
      play("delete");
    },
    [tasks, today, push, grantAchievements]
  );

  const loadDemo = useCallback(() => {
    setTasks((prev) => {
      const existingTitles = new Set(prev.map((t) => t.title.toLowerCase()));
      const additions: Task[] = DEMO_TASKS.filter(
        (d) => !existingTitles.has(d.title.toLowerCase())
      ).map((d) => ({
        id: generateId(),
        title: d.title,
        priority: d.priority,
        completed: false,
        createdAt: Date.now(),
        rewarded: false,
      }));
      return [...additions, ...prev];
    });
    push({ title: "Demo quests loaded.", variant: "info" });
    play("click");
  }, [push]);

  const focusAdd = useCallback(() => {
    const input = addFormRef.current?.querySelector<HTMLInputElement>(
      "#task-title"
    );
    input?.focus();
  }, []);

  const handleToggleSound = useCallback(() => {
    initAudio();
    setSoundOn((prev) => {
      const next = !prev;
      if (next) {
        setSoundEnabled(true);
        play("click");
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }, []);

  const hasNoTasksAtAll = tasks.length === 0;
  const hasNoMatches = tasks.length > 0 && filteredTasks.length === 0;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#08080f] via-[#0a0a14] to-black text-zinc-100"
      onClick={() => initAudio()}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-700/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-600/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-fuchsia-600/[0.04] blur-[120px]" />
      </div>

      <Confetti active={confettiOn} />

      {levelUp && (
        <LevelUpModal
          level={levelUp.level}
          aura={levelUp.aura}
          onClose={() => setLevelUp(null)}
        />
      )}

      <div className="relative mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:max-w-4xl">
        <Header soundEnabled={soundOn} onToggleSound={handleToggleSound} />

        <div className="mt-5 space-y-4 sm:space-y-5">
          <AuraHero
            game={game}
            todayCompleted={todayCompleted}
            todayPending={todayPending}
            pulse={auraPulse}
          />

          <Stats tasks={tasks} />

          <div ref={addFormRef}>
            <TaskForm onAdd={addTask} />
          </div>

          {hasNoTasksAtAll && (
            <div className="flex justify-center">
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={loadDemo}
              >
                <Sparkles className="h-3.5 w-3.5" /> Load Demo Quests
              </button>
            </div>
          )}

          <SearchAndFilters
            search={search}
            onSearch={setSearch}
            status={statusFilter}
            onStatus={setStatusFilter}
            priority={priorityFilter}
            onPriority={setPriorityFilter}
          />

          {hasNoMatches ? (
            <NoMatches onClear={clearFilters} />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
              onAddFirst={focusAdd}
            />
          )}

          <Achievements game={game} recentlyUnlocked={recentAchievement} />
        </div>

        <footer className="mt-10 pb-6 text-center text-[11px] text-zinc-600">
          AURA · local-first productivity · your data lives in this browser
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
