import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import type { Priority } from "@/types";

type Props = {
  onAdd: (title: string, priority: Priority) => void;
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");

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

  function handleEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <section className="card p-4 sm:p-5" aria-label="Create a task">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
        What are we cooking today?
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="task-title" className="sr-only">
              What needs doing?
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleEnter}
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
