import { useEffect } from "react";
import { X, ChevronUp } from "lucide-react";
import { auraStatus } from "@/gamification";

type Props = {
  level: number;
  aura: number;
  onClose: () => void;
};

export function LevelUpModal({ level, aura, onClose }: Props) {
  const status = auraStatus(aura);

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Level up"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative animate-pop w-full max-w-sm overflow-hidden rounded-3xl border border-violet-500/40 bg-gradient-to-br from-violet-950 to-zinc-950 p-8 text-center glow-violet">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close level up"
          className="absolute right-3 top-3 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative">
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
            <ChevronUp className="h-4 w-4" /> Level Up
          </div>
          <p className="text-5xl font-black text-white text-glow sm:text-6xl">
            {level}
          </p>
          <p className="mt-3 text-lg font-bold text-violet-200">
            {status.emoji} {status.label}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            New aura tier unlocked. We're so back.
          </p>
          <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full animate-bar rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
