import { useState, type FormEvent } from "react";
import { Plus, Sword } from "lucide-react";
import type { Priority } from "@/types";

type Props = {
  onAdd: (title: string, priority: Priority) => void;
};

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "text-red-300" },
  { value: "medium", label: "Medium", color: "text-amber-300" },
  { value: "low", label: "Low", color: "text-cyan-300" },
];

const PLACEHOLDERS = [
  "What's the quest?",
  "What are we locking in on?",
  "Drop a quest...",
  "What needs doing?",
];

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Can't add an empty quest, bro.");
      return;
    }
    onAdd(trimmed, priority);
    setTitle("");
    setError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  return (
    <section className="card p-4 sm:p-5" aria-label="Create a task">
      <div className="mb-3 flex items-center gap-2">
        <Sword className="h-3.5 w-3.5 text-violet-400" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
          New Quest
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="task-title" className="sr-only">
              Quest title
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              placeholder={placeholder}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              maxLength={140}
              aria-invalid={!!error}
              aria-describedby={error ? "task-title-error" : undefined}
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="task-priority" className="sr-only">
              Priority
            </label>
            <select
              id="task-priority"
              className="input w-auto cursor-pointer"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-primary shrink-0">
              <Plus className="h-4 w-4" />
              Add Quest
            </button>
          </div>
        </div>
        {error && (
          <p
            id="task-title-error"
            role="alert"
            className="text-xs font-medium text-red-400"
          >
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
