import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  rotation: number;
  vr: number;
};

type Props = {
  active: boolean;
  /** number of particles */
  count?: number;
};

const COLORS = [
  "#a78bfa",
  "#22d3ee",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#c084fc",
];

/** Canvas-based confetti burst. Renders fullscreen overlay, auto-clears. */
export function Confetti({ active, count = 80 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (!active || reduceRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const cx = w / 2;
    const cy = h * 0.35;

    particlesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of particlesRef.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // gravity
        p.vx *= 0.99;
        p.rotation += p.vr;
        p.life -= 0.012;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, count]);

  if (!active || reduceRef.current) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      aria-hidden="true"
    />
  );
}
