import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, Pencil, Trash2, X, Zap } from "lucide-react";
import type { Priority, Task } from "@/types";
import { PRIORITY_AURA, completionReaction } from "@/gamification";

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (id: string, title: string, priority: Priority) => void;
  onDelete: (id: string) => void;
  roast: string;
};

const PRIORITY_STYLES: Record<
  Priority,
  { badge: string; dot: string; label: string; ring: string }
> = {
  high: {
    badge: "bg-red-500/15 text-red-300 border border-red-500/25",
    dot: "bg-red-400",
    label: "HIGH",
    ring: "hover:border-red-500/20",
  },
  medium: {
    badge: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
    dot: "bg-amber-400",
    label: "MEDIUM",
    ring: "hover:border-amber-500/20",
  },
  low: {
    badge: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25",
    dot: "bg-cyan-400",
    label: "LOW",
    ring: "hover:border-cyan-500/20",
  },
};

export function TaskCard({ task, onToggle, onEdit, onDelete, roast }: Props) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editError, setEditError] = useState("");
  const [reaction, setReaction] = useState("");
  const [completing, setCompleting] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editing]);

  const style = PRIORITY_STYLES[task.priority];
  const auraValue = PRIORITY_AURA[task.priority];

  function startEdit() {
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditError("");
    setEditing(true);
  }

  function saveEdit(e: FormEvent) {
    e.preventDefault();
    const trimmed = editTitle.trim();
    if (!trimmed) {
      setEditError("Title can't be blank.");
      return;
    }
    onEdit(task.id, trimmed, editPriority);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="card animate-pop p-4 border-violet-500/20">
        <form onSubmit={saveEdit} className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={editInputRef}
              type="text"
              className="input flex-1"
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (editError) setEditError("");
              }}
              maxLength={140}
              aria-label="Edit task title"
            />
            <select
              className="input w-auto cursor-pointer"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              aria-label="Edit priority"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          {editError && (
            <p role="alert" className="text-xs text-red-400">
              {editError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setEditing(false)}
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check className="h-4 w-4" /> Save
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`card card-hover animate-rise group p-4 ${
        task.completed
          ? "border-emerald-500/15 bg-emerald-500/[0.02]"
          : style.ring
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion control */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as not done`
              : `Mark "${task.title}" as done`
          }
          onClick={() => {
            if (!task.completed) {
              setReaction(completionReaction(reaction || undefined));
              setCompleting(true);
              setTimeout(() => setCompleting(false), 700);
            } else {
              setReaction("");
            }
            onToggle(task.id);
          }}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
            task.completed
              ? "border-emerald-400 bg-emerald-400 text-zinc-900 shadow-[0_0_12px_-2px_rgba(52,211,153,0.6)]"
              : "border-zinc-600 bg-transparent hover:border-violet-400 hover:bg-violet-500/10"
          } ${completing ? "animate-pop" : ""}`}
        >
          {task.completed && <Check className="h-4 w-4" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Title */}
          <p
            className={`text-sm font-semibold leading-snug sm:text-[15px] ${
              task.completed
                ? "text-zinc-500 line-through decoration-zinc-600"
                : "text-white"
            }`}
          >
            {task.title}
          </p>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`aura-chip ${style.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
            <span className="aura-chip border border-white/10 bg-white/5 text-zinc-300">
              <Zap className="h-3 w-3 text-violet-400" />
              +{auraValue} AURA
            </span>
            {task.completed ? (
              <span className="aura-chip border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                QUEST COMPLETE
              </span>
            ) : (
              <span
                className="aura-chip border border-white/5 bg-white/[0.02] text-zinc-500"
                title="Playful nudge"
              >
                {roast}
              </span>
            )}
          </div>

          {/* Reaction */}
          {task.completed && reaction && (
            <p className="mt-1.5 animate-slide-in text-xs font-bold text-emerald-300">
              {reaction}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            onClick={startEdit}
            aria-label={`Edit "${task.title}"`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
