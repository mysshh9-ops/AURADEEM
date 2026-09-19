import { Lock, Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/gamification";
import type { AchievementId, GamificationState } from "@/types";

type Props = {
  game: GamificationState;
  recentlyUnlocked?: AchievementId | null;
};

export function Achievements({ game, recentlyUnlocked }: Props) {
  const unlocked = new Set<AchievementId>(game.achievements as AchievementId[]);

  return (
    <section className="card p-4 sm:p-5" aria-label="Achievements">
      <div className="mb-3 flex items-center gap-2">
        <Trophy className="h-3.5 w-3.5 text-violet-400" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
          Achievements
        </h2>
        <span className="ml-auto text-[10px] font-bold text-zinc-500">
          {unlocked.size}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          const isNew = recentlyUnlocked === a.id;
          return (
            <div
              key={a.id}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all duration-300 ${
                isUnlocked
                  ? "border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 hover:border-violet-400/40"
                  : "border-white/[0.04] bg-white/[0.01] opacity-50"
              } ${isNew ? "animate-pop glow-violet" : ""}`}
            >
              {isUnlocked && (
                <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-violet-500/15 blur-2xl" />
              )}
              <div className="relative flex items-center gap-2">
                <span className="text-xl">{isUnlocked ? a.icon : "🔒"}</span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wide ${
                    isUnlocked ? "text-violet-200" : "text-zinc-600"
                  }`}
                >
                  {a.name}
                </span>
              </div>
              <p
                className={`relative mt-1.5 text-[10px] leading-snug ${
                  isUnlocked ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {isUnlocked ? (
                  "Unlocked"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" /> {a.description}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
