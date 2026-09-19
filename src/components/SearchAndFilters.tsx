import { Search } from "lucide-react";
import type { Priority } from "@/types";

export type StatusFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | Priority;

type Props = {
  search: string;
  onSearch: (v: string) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  priority: PriorityFilter;
  onPriority: (v: PriorityFilter) => void;
};

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function SearchAndFilters({
  search,
  onSearch,
  status,
  onStatus,
  priority,
  onPriority,
}: Props) {
  return (
    <section
      className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      aria-label="Search and filters"
    >
      <div className="relative flex-1">
        <label htmlFor="task-search" className="sr-only">
          Search your quests
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          id="task-search"
          type="search"
          className="input pl-9"
          placeholder="Search your quests..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div
        className="flex items-center gap-1 self-start rounded-xl bg-white/5 p-1 sm:self-auto"
        role="group"
        aria-label="Status filter"
      >
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onStatus(o.value)}
            aria-pressed={status === o.value}
            className={`seg ${
              status === o.value ? "seg-active" : "seg-idle"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="self-start sm:self-auto">
        <label htmlFor="priority-filter" className="sr-only">
          Priority filter
        </label>
        <select
          id="priority-filter"
          className="input w-auto cursor-pointer"
          value={priority}
          onChange={(e) => onPriority(e.target.value as PriorityFilter)}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
