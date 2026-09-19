import { Lock } from "lucide-react";
import { ACHIEVEMENTS } from "@/gamification";
import type { AchievementId, GamificationState } from "@/types";

type Props = {
  game: GamificationState;
};

export function Achievements({ game }: Props) {
  const unlocked = new Set<AchievementId>(game.achievements as AchievementId[]);

  return (
    <section className="card p-4 sm:p-5" aria-label="Achievements">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">
        Achievements
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-3 transition-all ${
                isUnlocked
                  ? "border-violet-500/40 bg-violet-600/10 animate-pop"
                  : "border-white/5 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{isUnlocked ? a.icon : "🔒"}</span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wide ${
                    isUnlocked ? "text-violet-200" : "text-zinc-500"
                  }`}
                >
                  {a.name}
                </span>
              </div>
              <p
                className={`mt-1 text-[11px] leading-snug ${
                  isUnlocked ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {isUnlocked ? (
                  "Unlocked"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" /> {a.description}
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
