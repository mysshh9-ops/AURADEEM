import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
};

/** Animated counter that smoothly transitions between numeric values. */
export function AnimatedNumber({
  value,
  duration = 600,
  className,
  format = (n) => Math.round(n).toLocaleString(),
}: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce || duration <= 0) {
      setDisplay(value);
      return;
    }
    fromRef.current = display;
    startRef.current = 0;
    const from = fromRef.current;
    const diff = value - from;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + diff * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(value);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
