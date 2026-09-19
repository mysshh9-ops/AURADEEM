import { Zap, Sparkles } from "lucide-react";
import { SoundToggle } from "@/components/SoundToggle";

type Props = {
  soundEnabled: boolean;
  onToggleSound: () => void;
};

export function Header({ soundEnabled, onToggleSound }: Props) {
  return (
    <header className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 glow-violet">
          <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/20" />
        </div>
        <div className="leading-tight">
          <h1 className="flex items-center gap-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
            AURA
            <Sparkles className="h-4 w-4 text-violet-400" />
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-300/70">
            Get stuff done. Gain Aura.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <SoundToggle enabled={soundEnabled} onToggle={onToggleSound} />
      </div>
    </header>
  );
}
