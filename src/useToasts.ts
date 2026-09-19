import { useEffect, useRef, useState, useCallback } from "react";

export type Toast = {
  id: string;
  title: string;
  subtitle?: string;
  variant: "reward" | "achievement" | "info" | "danger";
};

let counter = 0;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current[id];
    if (timer) {
      clearTimeout(timer);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">, duration = 2600) => {
      const id = `toast_${counter++}_${Date.now()}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return { toasts, push, dismiss };
}
