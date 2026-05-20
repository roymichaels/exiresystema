/**
 * AmbientBackdrop — cinematic dark canvas: deep void + breathing orb halo
 * + sacred geometry grid + drifting particles. Pure CSS/SVG, no WebGL.
 */
import { useEffect, useRef } from 'react';

interface Props {
  variant?: 'hero' | 'section';
  showOrb?: boolean;
}

export function AmbientBackdrop({ variant = 'section', showOrb = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const COUNT = variant === 'hero' ? 38 : 18;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      r: Math.random() * 1.2 + 0.3,
      vy: Math.random() * 0.18 + 0.04,
      a: Math.random() * 0.35 + 0.05,
    }));

    const tick = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.y -= p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(40, 25%, 92%, ${p.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [variant]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden mh-grain" aria-hidden>
      {/* Deep void radial */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, hsl(var(--mh-bg-2)) 0%, hsl(var(--mh-bg)) 55%, #000 100%)',
        }}
      />

      {/* Sacred geometry — faint circles */}
      {variant === 'hero' && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
          width="900" height="900" viewBox="0 0 900 900" fill="none"
        >
          <circle cx="450" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="450" r="320" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="450" r="420" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="330" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="570" cy="450" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="330" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
          <circle cx="450" cy="570" r="220" stroke="hsl(var(--mh-sand))" strokeWidth="0.5" />
        </svg>
      )}

      {/* Breathing orb halo */}
      {showOrb && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mh-breathe"
          style={{
            width: 'min(78vmin, 720px)',
            height: 'min(78vmin, 720px)',
            background:
              'radial-gradient(circle at 50% 50%, hsla(35, 28%, 72%, 0.22) 0%, hsla(28, 30%, 50%, 0.10) 28%, transparent 62%)',
            filter: 'blur(8px)',
          }}
        />
      )}
      {showOrb && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 'min(24vmin, 220px)',
            height: 'min(24vmin, 220px)',
            background:
              'radial-gradient(circle at 38% 38%, hsla(40, 30%, 92%, 0.95) 0%, hsla(28, 30%, 58%, 0.4) 35%, hsla(0,0%,2%,0.9) 78%)',
            boxShadow:
              '0 0 80px hsla(35, 28%, 70%, 0.18), inset 0 0 60px hsla(0,0%,0%,0.6)',
          }}
        />
      )}

      {/* Particle drift */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Bottom fog */}
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

/** Scroll reveal hook — adds .is-in when element enters viewport. */
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
      { threshold: 0.15 },
    );
    el.querySelectorAll('.mh-reveal').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}
