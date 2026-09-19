import { Flame } from "lucide-react";
import { auraStatus, levelBounds } from "@/gamification";
import type { GamificationState } from "@/types";

type Props = {
  game: GamificationState;
  todayCompleted: number;
  todayPending: number;
};

export function AuraHero({ game, todayCompleted, todayPending }: Props) {
  const status = auraStatus(game.aura);
  const { level, current, needed } = levelBounds(game.aura);
  const pct = Math.min(100, Math.round((current / needed) * 100));

  return (
    <section
      className="card relative overflow-hidden p-5 sm:p-6"
      aria-label="Aura dashboard"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        {/* Aura score */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 sm:h-24 sm:w-24">
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">
              Aura
            </span>
            <span className="text-3xl font-black leading-none text-white text-glow sm:text-4xl">
              {game.aura}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="aura-chip bg-violet-600/20 text-violet-200">
                LEVEL {level}
              </span>
              <span className="aura-chip bg-white/5 text-cyan-200">
                {status.emoji} {status.label}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {game.totalCompleted} quests done all-time
            </p>
          </div>
        </div>

        {/* Level progress + streak */}
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              <span>Level {level} progress</span>
              <span className="text-zinc-300">
                {current} / {needed} aura
              </span>
            </div>
            <div
              className="h-3 w-full overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={needed}
              aria-valuenow={current}
              aria-label={`Level ${level} progress: ${current} of ${needed} aura`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 animate-bar"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                  Streak
                </p>
                <p className="text-sm font-black text-amber-200">
                  {game.streak} {game.streak === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Today
                </p>
                <p className="text-sm font-bold text-zinc-200">
                  {todayCompleted} done · {todayPending} pending
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
