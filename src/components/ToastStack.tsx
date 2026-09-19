import { useEffect } from "react";
import { Trophy, X } from "lucide-react";
import type { Toast as ToastType } from "@/useToasts";

type Props = {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
};

const VARIANT_STYLES: Record<ToastType["variant"], string> = {
  reward: "border-emerald-500/40 bg-emerald-950/80 text-emerald-100",
  achievement: "border-violet-500/50 bg-violet-950/80 text-violet-100",
  info: "border-white/15 bg-zinc-900/85 text-zinc-100",
  danger: "border-red-500/40 bg-red-950/80 text-red-100",
};

export function ToastStack({ toasts, onDismiss }: Props) {
  useEffect(() => {
    // toasts auto-dismiss; nothing extra needed here
  }, [toasts]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 backdrop-blur-md animate-toast ${VARIANT_STYLES[t.variant]}`}
        >
          {t.variant === "achievement" ? (
            <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight">{t.title}</p>
            {t.subtitle && (
              <p className="mt-0.5 text-xs font-medium opacity-80">
                {t.subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
