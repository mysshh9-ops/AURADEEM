import { Volume2, VolumeX } from "lucide-react";

type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export function SoundToggle({ enabled, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Disable sound effects" : "Enable sound effects"}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-violet-300" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">{enabled ? "Sound On" : "Muted"}</span>
    </button>
  );
}
