import { Flame, Zap, Trophy } from "lucide-react";
import { auraStatus, getLocalDateString, levelBounds } from "@/gamification";
import type { GamificationState } from "@/types";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type Props = {
  game: GamificationState;
  todayCompleted: number;
  todayPending: number;
  pulse: boolean;
};

export function AuraHero({
  game,
  todayCompleted,
  todayPending,
  pulse,
}: Props) {
  const status = auraStatus(game.aura);
  const { level, current, needed } = levelBounds(game.aura);
  const pct = Math.min(100, Math.round((current / needed) * 100));
  const today = getLocalDateString();

  return (
    <section
      className="card relative overflow-hidden p-5 sm:p-6"
      aria-label="Aura dashboard"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />

      <div className="relative">
        {/* Aura score — centerpiece */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
          <div
            className={`relative flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/25 to-fuchsia-600/15 sm:h-28 sm:w-28 ${
              pulse ? "animate-aura-pulse" : ""
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
              Aura
            </span>
            <AnimatedNumber
              value={game.aura}
              className="text-3xl font-black leading-none text-white text-glow sm:text-4xl"
            />
            {pulse && (
              <span className="absolute -top-2 right-0 animate-float-up text-sm font-black text-emerald-300">
                +Aura
              </span>
            )}
          </div>

          <div className="mt-3 flex-1 sm:mt-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="aura-chip border border-violet-500/30 bg-violet-600/20 text-violet-200">
                LEVEL {level}
              </span>
              <span className="aura-chip border border-cyan-500/20 bg-cyan-500/10 text-cyan-200">
                {status.emoji} {status.label}
              </span>
            </div>

            {/* Level progress */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <span>Level {level} → {level + 1}</span>
                <span className="text-zinc-300">
                  {current} / {needed}
                </span>
              </div>
              <div
                className="h-3 w-full overflow-hidden rounded-full bg-white/[0.08]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={needed}
                aria-valuenow={current}
                aria-label={`Level ${level} progress: ${current} of ${needed} aura`}
              >
                <div
                  className="relative h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 animate-bar"
                  style={{ width: `${pct}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
            <Flame
              className={`h-5 w-5 shrink-0 text-amber-400 ${
                game.streak > 0 ? "animate-flame" : ""
              }`}
            />
            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-300/70">
                Streak
              </p>
              <p className="text-base font-black text-amber-200 text-glow-amber">
                {game.streak}
                <span className="ml-1 text-[10px]">
                  {game.streak === 1 ? "day" : "days"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2.5">
            <Zap className="h-5 w-5 shrink-0 text-cyan-400" />
            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300/70">
                Today
              </p>
              <p className="text-base font-black text-cyan-200">
                {todayCompleted}
                <span className="ml-1 text-[10px]">done</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
            <Trophy className="h-5 w-5 shrink-0 text-violet-400" />
            <div className="leading-tight">
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-300/70">
                Lifetime
              </p>
              <p className="text-base font-black text-violet-200">
                {game.totalCompleted}
                <span className="ml-1 text-[10px]">done</span>
              </p>
            </div>
          </div>
        </div>

        {/* Streak motivation */}
        {game.streak > 0 && todayCompleted === 0 && todayPending > 0 && (
          <p className="mt-3 text-center text-xs font-semibold text-amber-300/60 sm:text-left">
            One quest today keeps the streak alive.
          </p>
        )}
        {game.streak === 0 && (
          <p className="mt-3 text-center text-xs font-semibold text-zinc-500 sm:text-left">
            Your aura arc starts with one quest.
          </p>
        )}
      </div>
    </section>
  );
}
