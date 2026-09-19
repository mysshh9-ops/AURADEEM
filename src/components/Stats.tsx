import { ListChecks, CheckCircle2, CircleDot } from "lucide-react";
import type { Task } from "@/types";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type Props = {
  tasks: Task[];
};

export function Stats({ tasks }: Props) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  const items: {
    label: string;
    value: number;
    accent: string;
    icon: typeof ListChecks;
  }[] = [
    { label: "Total Quests", value: total, accent: "text-white", icon: ListChecks },
    { label: "Completed", value: completed, accent: "text-emerald-400", icon: CheckCircle2 },
    { label: "Pending", value: pending, accent: "text-amber-400", icon: CircleDot },
  ];

  return (
    <section
      aria-label="Task statistics"
      className="grid grid-cols-3 gap-2 sm:gap-3"
    >
      {items.map((it) => (
        <div
          key={it.label}
          className="card card-hover px-3 py-3 text-center sm:px-4"
        >
          <it.icon className="mx-auto mb-1 h-4 w-4 text-zinc-500" />
          <AnimatedNumber
            value={it.value}
            className={`text-2xl font-black sm:text-3xl ${it.accent}`}
          />
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 sm:text-[10px]">
            {it.label}
          </p>
        </div>
      ))}
    </section>
  );
}
