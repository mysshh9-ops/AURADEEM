import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import type { GamificationState, Priority, Task } from "@/types";
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
  todayStr,
} from "@/gamification";
import { useToasts } from "@/useToasts";
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

  const { toasts, push, dismiss } = useToasts();

  // Persist whenever state changes
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveGamification(game);
  }, [game]);

  const addFormRef = useRef<HTMLDivElement>(null);

  /* ---------------- Derived data (single source of truth) ---------------- */

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const today = todayStr();
  const todayCompleted = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt).toISOString().slice(0, 10) === today
      ).length,
    [tasks, today]
  );
  const todayPending = pendingTasks; // tasks not completed (regardless of created date)

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
        // Pending first, then by created desc
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
            title: `ACHIEVEMENT UNLOCKED 🏆`,
            subtitle: `${a.icon} ${a.name}`,
            variant: "achievement",
          });
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
      push({ title: "QUEST ADDED ⚡", subtitle: title, variant: "info" });
    },
    [push]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prevTasks) => {
        const task = prevTasks.find((t) => t.id === id);
        if (!task) return prevTasks;

        if (task.completed) {
          // Uncomplete: refund the Aura gained so the complete→uncomplete→complete
          // cycle cannot farm Aura. Aura floor is 0.
          const refund = PRIORITY_AURA[task.priority];
          const updated = prevTasks.map((t) =>
            t.id === id
              ? { ...t, completed: false, completedAt: undefined, rewarded: false }
              : t
          );
          setGame((prevGame) => {
            const newTotal = Math.max(0, prevGame.totalCompleted - 1);
            const newToday =
              today === prevGame.lastCompletionDate
                ? Math.max(0, prevGame.completedToday - 1)
                : prevGame.completedToday;
            const next: GamificationState = {
              ...prevGame,
              aura: Math.max(0, prevGame.aura - refund),
              totalCompleted: newTotal,
              completedToday: newToday,
            };
            return grantAchievements(next, updated);
          });
          return updated;
        }

        // Complete: award Aura ONCE (guarded by task.rewarded)
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
            aura: prevGame.aura + auraGain,
            streak: newStreak,
            lastCompletionDate: today,
            completedToday,
            totalCompleted: prevGame.totalCompleted + 1,
          };
          return grantAchievements(next, updated);
        });

        push({
          title: `+${auraGain} AURA`,
          subtitle: task.priority === "high" ? "LOCKED IN. 🔥" : "WE'RE SO BACK.",
          variant: "reward",
        });

        return updated;
      });
    },
    [today, push, grantAchievements]
  );

  const editTask = useCallback(
    (id: string, title: string, priority: Priority) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title, priority } : t))
      );
      push({ title: "Quest updated.", variant: "info" });
    },
    [push]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      // Light confirmation
      const ok = window.confirm(
        `Delete "${task.title}"? This cannot be undone.`
      );
      if (!ok) return;
      setTasks((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        if (task.completed) {
          setGame((prevGame) => {
            const next: GamificationState = {
              ...prevGame,
              totalCompleted: Math.max(0, prevGame.totalCompleted - 1),
              completedToday:
                prevGame.lastCompletionDate === today
                  ? Math.max(0, prevGame.completedToday - 1)
                  : prevGame.completedToday,
            };
            return grantAchievements(next, updated);
          });
        }
        return updated;
      });
      push({ title: "Quest deleted.", variant: "danger" });
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
  }, [push]);

  const focusAdd = useCallback(() => {
    const input = addFormRef.current?.querySelector<HTMLInputElement>(
      "#task-title"
    );
    input?.focus();
  }, []);

  const hasNoTasksAtAll = tasks.length === 0;
  const hasNoMatches = tasks.length > 0 && filteredTasks.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-[#0a0a12] to-black text-zinc-100">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:max-w-4xl">
        <Header />

        <div className="mt-5 space-y-4 sm:space-y-5">
          <AuraHero
            game={game}
            todayCompleted={todayCompleted}
            todayPending={todayPending}
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
            <NoMatches />
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
              onAddFirst={focusAdd}
            />
          )}

          <Achievements game={game} />
        </div>

        <footer className="mt-10 pb-6 text-center text-[11px] text-zinc-600">
          AURA · local-first productivity · your data lives in this browser
        </footer>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
