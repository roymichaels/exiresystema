/**
 * AmbientBackdrop — cinematic, GPU-cheap.
 * Pauses when off-screen or page hidden. Respects reduced-motion.
 * Pure CSS gradient + small canvas particle drift.
 */
import { useEffect, useRef, useState } from 'react';

interface Props {
  variant?: 'hero' | 'section';
}

const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AmbientBackdrop({ variant = 'section' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  // Activate when scrolled near
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setActive(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mobile = isMobile();
    const baseCount = variant === 'hero' ? 22 : 10;
    const COUNT = mobile ? Math.round(baseCount * 0.55) : baseCount;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      r: Math.random() * 1.1 + 0.3,
      vy: Math.random() * 0.14 + 0.03,
      a: Math.random() * 0.3 + 0.05,
    }));

    const tick = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(255,255,255,1)';
      for (const p of particles) {
        p.y -= p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active, variant]);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute inset-0 overflow-hidden mh-grain"
      aria-hidden
    >
      {/* Deep void — CSS only */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, hsl(var(--mh-bg-2)) 0%, hsl(var(--mh-bg)) 55%, #000 100%)',
        }}
      />

      {/* Faint sacred geometry (hero only, inline SVG, ~600 B) */}
      {variant === 'hero' && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
          width="900" height="900" viewBox="0 0 900 900" fill="none"
        >
          <circle cx="450" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="450" r="320" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="330" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="570" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="330" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="570" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
        </svg>
      )}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            'linear-gradient(to top, hsl(var(--mh-bg)) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

/** Scroll reveal — adds .is-in when section enters viewport. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    el.querySelectorAll('.mh-reveal').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}
