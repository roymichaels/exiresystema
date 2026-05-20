/**
 * ConsciousnessField — living atmospheric backdrop for the intake intro.
 * Pure CSS + SVG + a single lightweight canvas. No images, no WebGL, no heavy libs.
 *
 * Layers (back → front):
 *   1. Deep black + dark purple radial bed
 *   2. Soft "breathing" glow behind the central text
 *   3. Two faint, slowly counter-rotating sacred-geometry rings
 *   4. Drifting consciousness particles (canvas)
 *   5. Subtle film grain
 *   6. Dark vignette + clean center fade for text readability
 *
 * Honors prefers-reduced-motion and scales particle count down on mobile.
 */
import { useEffect, useRef } from 'react';

interface Props {
  /** Stronger glow + a few more particles when true. Default false. */
  intense?: boolean;
}

export function ConsciousnessField({ intense = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mobile = window.innerWidth < 640;
    const baseCount = intense ? 90 : 55;
    const COUNT = reduced ? 0 : mobile ? Math.round(baseCount * 0.6) : baseCount;

    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);

    let raf = 0;
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particles drift gently upward and sideways; a few "stars" stay nearly still.
    const particles = Array.from({ length: COUNT }, () => {
      const r = Math.random() * 1.6 + 0.35;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r,
        // Slow upward drift; tiny horizontal sway via sine.
        vy: Math.random() * 0.22 + 0.05,
        sway: Math.random() * 0.5 + 0.1,
        phase: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        // Brighter base + twinkle on top.
        a: Math.min(0.85, 0.28 + r * 0.22),
      };
    });

    let t0 = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - t0);
      t0 = now;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.y -= p.vy * (dt / 16);
        p.phase += 0.0025 * (dt / 16);
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        const x = p.x + Math.sin(p.phase) * p.sway * 6;
        // Warm sand-white tint to feel like consciousness motes, not snow.
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(38, 35%, 88%, ${p.a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    if (COUNT > 0) raf = requestAnimationFrame(tick);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [intense]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Scoped keyframes — keep the component self-contained. */}
      <style>{`
        @keyframes cf-breathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.85; transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes cf-rotate-cw  { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes cf-rotate-ccw { to { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes cf-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(0, -1.2%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cf-anim { animation: none !important; }
        }
      `}</style>

      {/* 1. Deep void: black core with dark purple bleed */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 45%, hsl(272 35% 10%) 0%, hsl(265 30% 6%) 45%, #050207 80%, #000 100%)',
        }}
      />

      {/* Secondary purple aura, drifting very slowly */}
      <div
        className="cf-anim absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, hsla(282, 55%, 28%, 0.28) 0%, transparent 45%), radial-gradient(circle at 82% 78%, hsla(258, 60%, 22%, 0.22) 0%, transparent 50%)',
          animation: 'cf-drift 24s ease-in-out infinite',
        }}
      />

      {/* 2. Soft breathing glow behind the text */}
      <div
        className="cf-anim absolute left-1/2 top-1/2"
        style={{
          width: 'min(72vmin, 720px)',
          height: 'min(72vmin, 720px)',
          background:
            'radial-gradient(circle, hsla(285, 70%, 55%, 0.18) 0%, hsla(270, 60%, 35%, 0.10) 35%, transparent 65%)',
          filter: 'blur(8px)',
          animation: 'cf-breathe 9s ease-in-out infinite',
        }}
      />

      {/* 3. Faint sacred-geometry arcs — two counter-rotating rings */}
      <svg
        className="cf-anim absolute left-1/2 top-1/2"
        style={{
          width: 'min(95vmin, 920px)',
          height: 'min(95vmin, 920px)',
          transform: 'translate(-50%, -50%)',
          animation: 'cf-rotate-cw 220s linear infinite',
          opacity: 0.085,
        }}
        viewBox="0 0 800 800"
        fill="none"
      >
        <defs>
          <radialGradient id="cf-arc-fade" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="hsl(38, 40%, 80%)" stopOpacity="0" />
            <stop offset="85%" stopColor="hsl(38, 40%, 80%)" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(38, 40%, 80%)" stopOpacity="0" />
          </radialGradient>
          <mask id="cf-arc-mask">
            <rect width="800" height="800" fill="url(#cf-arc-fade)" />
          </mask>
        </defs>
        <g mask="url(#cf-arc-mask)" stroke="hsl(38, 40%, 80%)" strokeWidth="0.5" fill="none">
          <circle cx="400" cy="400" r="240" />
          <circle cx="400" cy="400" r="320" />
          <circle cx="400" cy="400" r="380" />
          {/* Vesica-style overlaps */}
          <circle cx="300" cy="400" r="220" />
          <circle cx="500" cy="400" r="220" />
        </g>
      </svg>

      <svg
        className="cf-anim absolute left-1/2 top-1/2"
        style={{
          width: 'min(70vmin, 680px)',
          height: 'min(70vmin, 680px)',
          transform: 'translate(-50%, -50%)',
          animation: 'cf-rotate-ccw 340s linear infinite',
          opacity: 0.06,
        }}
        viewBox="0 0 600 600"
        fill="none"
      >
        <g stroke="hsl(282, 55%, 70%)" strokeWidth="0.4" fill="none">
          <polygon points="300,80 520,440 80,440" />
          <polygon points="300,520 80,160 520,160" />
          <circle cx="300" cy="300" r="180" />
        </g>
      </svg>

      {/* 4. Particle drift */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* 5. Film grain — uses existing .mh-grain if defined, plus an SVG fallback */}
      <div
        className="absolute inset-0 mh-grain opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '160px 160px',
        }}
      />

      {/* 6a. Clean reading well — keep the center dim-but-clear */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 38% at 50% 50%, hsla(265, 30%, 4%, 0.55) 0%, transparent 70%)',
        }}
      />

      {/* 6b. Outer vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0.85) 100%)',
        }}
      />
    </div>
  );
}

export default ConsciousnessField;
