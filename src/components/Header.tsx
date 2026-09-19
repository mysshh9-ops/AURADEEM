import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 glow-violet">
          <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
            AURA
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
            Get stuff done. Gain Aura.
          </p>
        </div>
      </div>
      <p className="hidden text-xs text-zinc-500 sm:block">
        your productivity era starts now
      </p>
    </header>
  );
}
