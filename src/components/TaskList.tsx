import { useMemo, useState } from "react";
import { ClipboardList, SearchX, Sparkles } from "lucide-react";
import type { Priority, Task } from "@/types";
import { TaskCard } from "@/components/TaskCard";
import { pendingReaction } from "@/gamification";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, priority: Priority) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
};

export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAddFirst,
}: Props) {
  // Stable roast per pending task id (re-randomized on each render cycle but keyed by id)
  const roasts = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tasks) {
      if (!t.completed) map[t.id] = pendingReaction(map[t.id] || undefined);
    }
    return map;
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-12 text-center animate-rise">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20">
          <ClipboardList className="h-7 w-7 text-violet-300" />
        </div>
        <h3 className="text-lg font-bold text-white">NO QUESTS YET 👀</h3>
        <p className="mt-1 max-w-xs text-sm text-zinc-400">
          Your productivity arc starts here. Add your first task and start
          farming Aura.
        </p>
        <button className="btn-primary mt-5" onClick={onAddFirst}>
          <Sparkles className="h-4 w-4" /> Add First Quest
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-3" aria-label="Task list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          roast={roasts[task.id] ?? ""}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export function NoMatches() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-10 text-center animate-rise">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
        <SearchX className="h-6 w-6 text-zinc-400" />
      </div>
      <h3 className="text-base font-bold text-white">NO MATCHES 💀</h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-400">
        Nothing fits that filter. Try changing your search or filters.
      </p>
    </div>
  );
}

export type { Priority };
