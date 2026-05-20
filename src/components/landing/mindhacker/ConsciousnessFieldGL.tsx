/**
 * ConsciousnessFieldGL — lightweight WebGL "AION is scanning you" backdrop.
 *
 * Layers (back → front):
 *   1. CSS deep-void + breathing purple core glow + vignette + grain
 *   2. WebGL canvas (R3F) — wireframe sphere + merkaba (two tetrahedra),
 *      slow rotation, pointer/device parallax, sparse depth particles
 *
 * Performance:
 *   - dpr capped at [1, 1.5]
 *   - frameloop="demand" + manual invalidate on a slow timer + pointer
 *   - particle count auto-scales for mobile
 *   - pauses when tab hidden (Page Visibility) and on prefers-reduced-motion
 *   - geometry kept low-poly (sphere 24×16 segs, two tetra)
 *
 * Stays behind text via absolute -z-10 host wrapper at the call site.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  /** Slightly punchier glow + a few more particles. */
  intense?: boolean;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return reduced;
}

/** Smoothed pointer + device-tilt parallax → [-1,1] each axis. */
function useParallaxTarget() {
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      target.current.x = (e.clientX / w) * 2 - 1;
      target.current.y = (e.clientY / h) * 2 - 1;
      invalidate();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      // gamma: -90..90 (left-right), beta: -180..180 (front-back)
      target.current.x = Math.max(-1, Math.min(1, e.gamma / 35));
      target.current.y = Math.max(-1, Math.min(1, (e.beta - 30) / 45));
      invalidate();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('deviceorientation', onOrient, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, []);
  return target;
}

function Scene({ intense, reduced }: { intense: boolean; reduced: boolean }) {
  const sphereRef = useRef<THREE.Group>(null!);
  const merkabaRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const target = useParallaxTarget();
  const { camera } = useThree();

  // Particle field — small, scattered in a thin shell so they read as depth.
  const particleGeo = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const count = reduced ? 0 : isMobile ? 60 : intense ? 140 : 100;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spherical-ish shell, biased outward
      const r = 2.6 + Math.random() * 2.4;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      positions[i * 3 + 0] = r * Math.sin(p) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
      positions[i * 3 + 2] = r * Math.cos(p);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [intense, reduced]);

  const sphereGeo = useMemo(
    () => new THREE.SphereGeometry(1.55, 24, 16),
    [],
  );
  const tetraGeo = useMemo(() => new THREE.TetrahedronGeometry(1.05, 0), []);

  const tStart = useRef(performance.now());
  useFrame((_, delta) => {
    const t = (performance.now() - tStart.current) / 1000;
    const dt = Math.min(0.05, delta);

    // Slow rotation (skip when reduced motion).
    if (!reduced) {
      if (sphereRef.current) {
        sphereRef.current.rotation.y += dt * 0.05;
        sphereRef.current.rotation.x += dt * 0.018;
      }
      if (merkabaRef.current) {
        merkabaRef.current.rotation.y -= dt * 0.07;
        merkabaRef.current.rotation.z += dt * 0.025;
      }
      if (pointsRef.current) {
        pointsRef.current.rotation.y += dt * 0.012;
      }
    }

    // Gentle breathing — applied to sphere scale.
    const breathe = 1 + Math.sin(t * 0.55) * 0.025;
    if (sphereRef.current) sphereRef.current.scale.setScalar(breathe);

    // Parallax — lerp camera toward target * small amplitude.
    const targetX = target.current.x * 0.35;
    const targetY = -target.current.y * 0.22;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      {/* Wireframe sphere — main "consciousness shell" */}
      <group ref={sphereRef}>
        <lineSegments>
          <wireframeGeometry args={[sphereGeo]} />
          <lineBasicMaterial
            color={new THREE.Color('hsl(285, 65%, 70%)')}
            transparent
            opacity={0.18}
          />
        </lineSegments>
      </group>

      {/* Merkaba — two interlocking tetrahedra */}
      <group ref={merkabaRef}>
        <lineSegments>
          <wireframeGeometry args={[tetraGeo]} />
          <lineBasicMaterial
            color={new THREE.Color('hsl(38, 70%, 82%)')}
            transparent
            opacity={0.22}
          />
        </lineSegments>
        <group rotation={[Math.PI, 0, 0]}>
          <lineSegments>
            <wireframeGeometry args={[tetraGeo]} />
            <lineBasicMaterial
              color={new THREE.Color('hsl(282, 70%, 78%)')}
              transparent
              opacity={0.18}
            />
          </lineSegments>
        </group>
      </group>

      {/* Depth particles */}
      <points ref={pointsRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.035}
          sizeAttenuation
          color={new THREE.Color('hsl(38, 55%, 92%)')}
          transparent
          opacity={0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/**
 * Drives `invalidate()` on a slow cadence so frameloop="demand" still
 * advances the breathing/rotation, without burning a constant rAF.
 */
function TickPump({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      // ~30fps is plenty for the slow motion here; halves GPU vs 60fps.
      if (now - last > 33) {
        invalidate();
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
  return null;
}

export function ConsciousnessFieldGL({ intense = false }: Props) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : !document.hidden,
  );

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const animate = visible && !reduced;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <style>{`
        @keyframes cfgl-breathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.95; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes cfgl-drift {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50%      { transform: translate3d(0, -1.4%, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cfgl-anim { animation: none !important; }
        }
      `}</style>

      {/* 1. Deep void */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 45%, hsl(272 45% 12%) 0%, hsl(265 38% 7%) 45%, #060309 80%, #000 100%)',
        }}
      />

      {/* 2. Drifting purple aura */}
      <div
        className="cfgl-anim absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 22%, hsla(282, 65%, 36%, 0.36) 0%, transparent 50%), radial-gradient(circle at 82% 78%, hsla(258, 70%, 28%, 0.32) 0%, transparent 55%)',
          animation: 'cfgl-drift 26s ease-in-out infinite',
        }}
      />

      {/* 3. Breathing purple core glow behind text */}
      <div
        className="cfgl-anim absolute left-1/2 top-1/2"
        style={{
          width: 'min(78vmin, 780px)',
          height: 'min(78vmin, 780px)',
          background:
            'radial-gradient(circle, hsla(285, 80%, 60%, 0.32) 0%, hsla(270, 65%, 38%, 0.16) 40%, transparent 72%)',
          filter: 'blur(10px)',
          animation: 'cfgl-breathe 8s ease-in-out infinite',
        }}
      />

      {/* 4. WebGL scene */}
      <div className="absolute inset-0">
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 1.5]}
          frameloop={animate ? 'demand' : 'never'}
          camera={{ position: [0, 0, 4.2], fov: 55 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <Scene intense={intense} reduced={reduced} />
            <TickPump enabled={animate} />
          </Suspense>
        </Canvas>
      </div>

      {/* 5. Film grain */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-[0.4]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '160px 160px',
        }}
      />

      {/* 6a. Reading well — keep the center readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 48% 32% at 50% 50%, hsla(265, 30%, 4%, 0.55) 0%, transparent 72%)',
        }}
      />

      {/* 6b. Outer vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 88%, rgba(0,0,0,0.96) 100%)',
        }}
      />
    </div>
  );
}

export default ConsciousnessFieldGL;
