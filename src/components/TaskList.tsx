import { useMemo } from "react";
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
  const roasts = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of tasks) {
      if (!t.completed) map[t.id] = pendingReaction(map[t.id] || undefined);
    }
    return map;
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-14 text-center animate-rise">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-600/10 glow-violet">
          <ClipboardList className="h-8 w-8 text-violet-300" />
        </div>
        <h3 className="text-lg font-black text-white">NO QUESTS YET 👀</h3>
        <p className="mt-1.5 max-w-xs text-sm text-zinc-400">
          Your aura arc starts here. Drop your first quest and start farming.
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

export function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center animate-rise">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
        <SearchX className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="text-base font-black text-white">NO MATCHES 💀</h3>
      <p className="mt-1 max-w-xs text-sm text-zinc-400">
        Nothing in this category. Try changing your search or filters.
      </p>
      <button className="btn-ghost mt-4 text-xs" onClick={onClear}>
        Clear filters
      </button>
    </div>
  );
}
