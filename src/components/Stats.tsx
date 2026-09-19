import type { Task } from "@/types";

type Props = {
  tasks: Task[];
};

export function Stats({ tasks }: Props) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const items: { label: string; value: number; accent: string }[] = [
    { label: "Total Quests", value: total, accent: "text-white" },
    { label: "Completed", value: completed, accent: "text-emerald-400" },
    { label: "Pending", value: pending, accent: "text-amber-400" },
  ];

  return (
    <section
      aria-label="Task statistics"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      {items.map((it) => (
        <div key={it.label} className="card px-3 py-3 text-center sm:px-4">
          <p className={`text-2xl font-black sm:text-3xl ${it.accent}`}>
            {it.value}
          </p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[11px]">
            {it.label}
          </p>
        </div>
      ))}
    </section>
  );
}
