/**
 * MindHackerLanding — full cinematic Hebrew homepage.
 * Primary CTAs open the cinematic AION intake chat modal (no navigation, no login).
 */
import { useState } from 'react';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { AmbientBackdrop, useReveal } from './AmbientBackdrop';
import IntakeChatModal from './intake/IntakeChatModal';
import './theme.css';

const BRAND = 'מיינד האקר';

export default function MindHackerLanding() {
  const { openAuthModal } = useAuthModal();
  const [intakeOpen, setIntakeOpen] = useState(false);

  const startIntake = () => setIntakeOpen(true);
  const openLogin = () => openAuthModal('login');

  return (
    <div className="mindhacker-theme min-h-screen" dir="rtl" lang="he">
      <TopBar onLogin={openLogin} />
      <main>
        <Hero onStart={startIntake} onLogin={openLogin} />
        <SystemSection />
        <WhatIDoSection />
        <MethodSection />
        <ContentSection />
        <FinalCTA onStart={startIntake} />
      </main>
      <Footer />
      <IntakeChatModal open={intakeOpen} onOpenChange={setIntakeOpen} />
    </div>
  );
}

/* ─────────────── Top bar ─────────────── */

function TopBar({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-12">
      <div className="flex items-center gap-3">
        <span className="block h-2 w-2 rounded-full bg-[hsl(var(--mh-sand))] mh-breathe" />
        <span className="mh-eyebrow">{BRAND}</span>
      </div>
      <button onClick={onLogin} className="mh-eyebrow hover:text-[hsl(var(--mh-ink))] transition-colors">
        כניסה
      </button>
    </header>
  );
}

/* ─────────────── 1. Hero ─────────────── */

function Hero({ onStart, onLogin }: { onStart: () => void; onLogin: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden">
      <AmbientBackdrop variant="hero" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mh-eyebrow mh-reveal mb-10">Exire Systema · פרק ראשון</p>

        <h1 className="mh-serif mh-reveal text-[2.6rem] leading-[1.08] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
          התודעה שלך
          <br />
          <span className="text-[hsl(var(--mh-sand))]">לא נבנתה</span> על ידך
        </h1>

        <p className="mh-reveal mx-auto mt-10 max-w-2xl text-[0.98rem] leading-[2] text-[hsl(var(--mh-mute))] sm:text-base md:text-lg md:leading-[2.1]">
          רוב האנשים חיים מתוך זהות, פחדים ואמונות
          <br />
          שהותקנו בהם מגיל אפס.
          <br />
          <span className="text-[hsl(var(--mh-sand))]">מעטים לומדים לכתוב את עצמם מחדש.</span>
        </p>

        <div className="mh-reveal mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
          <button onClick={onStart} className="mh-cta-primary">
            התחל את השכתוב
          </button>
          <button onClick={onLogin} className="mh-cta-ghost">
            כניסה למערכת
          </button>
        </div>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 mh-reveal">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-[hsl(var(--mh-mute))] to-transparent" />
      </div>
    </section>
  );
}

/* ─────────────── 2. The System ─────────────── */

function SystemSection() {
  const ref = useReveal<HTMLDivElement>();
  const lines = ['לימדו אותך מה לחשוב.', 'מה לפחד.', 'מה לרצות.', 'מי להיות.'];
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mh-eyebrow mh-reveal mb-16">המערכת</p>
        <div className="space-y-6 md:space-y-8">
          {lines.map((line, i) => (
            <p
              key={i}
              className="mh-serif mh-reveal text-3xl leading-tight text-[hsl(var(--mh-ink))] sm:text-5xl md:text-6xl"
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {line}
            </p>
          ))}
          <div className="mh-reveal pt-10">
            <div className="mh-divider mx-auto w-32" />
          </div>
          <p className="mh-serif mh-reveal pt-8 text-2xl text-[hsl(var(--mh-mute))] sm:text-3xl md:text-4xl">
            ואז קראו לזה:
          </p>
          <p className="mh-serif mh-reveal text-4xl text-[hsl(var(--mh-sand))] sm:text-6xl md:text-7xl">
            ״החיים״.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 3. What I Do ─────────────── */

function WhatIDoSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid gap-16 md:grid-cols-2 md:gap-24 md:items-center">
          {/* Cinematic portrait placeholder */}
          <div className="mh-reveal order-2 md:order-1">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-sm"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--mh-bg-2)) 0%, #000 100%)',
              }}
            >
              {/* silhouette glyph */}
              <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full opacity-40">
                <defs>
                  <radialGradient id="mh-glow" cx="50%" cy="35%">
                    <stop offset="0%" stopColor="hsl(35, 28%, 72%)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(0,0%,0%)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="300" height="400" fill="url(#mh-glow)" />
                <path
                  d="M150 110 c30 0 48 22 48 52 c0 22 -10 38 -26 48 c34 12 56 42 56 80 v110 H72 v-110 c0 -38 22 -68 56 -80 c-16 -10 -26 -26 -26 -48 c0 -30 18 -52 48 -52 z"
                  fill="#000"
                  stroke="hsl(var(--mh-line))"
                  strokeWidth="0.5"
                />
              </svg>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, hsl(var(--mh-bg)) 0%, transparent 50%)',
                }}
              />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="mh-eyebrow mh-reveal mb-8">מה אני עושה</p>
            <h2 className="mh-serif mh-reveal text-4xl leading-[1.15] sm:text-5xl md:text-6xl">
              אני עובד עם
              <br />
              <span className="text-[hsl(var(--mh-sand))]">התת־מודע</span>
              <br />
              כמו שמתכנת עובד עם קוד.
            </h2>
            <div className="mh-reveal mt-12 space-y-5 text-base leading-[2] text-[hsl(var(--mh-mute))] md:text-lg">
              <p>מזהים דפוסים.</p>
              <p>מפרקים זהויות ישנות.</p>
              <p>משנים תכנותים פנימיים.</p>
              <p className="text-[hsl(var(--mh-ink))]">ובונים ריבונות אישית אמיתית.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 4. Method — Exire Systema ─────────────── */

const STEPS = [
  { n: 'I',   t: 'זיהוי התכנות',          d: 'מיפוי השכבות שעוצבו בך מבחוץ.' },
  { n: 'II',  t: 'פירוק הזהות הישנה',     d: 'הפרדה בין מה שאתה לבין מה שהותקן בך.' },
  { n: 'III', t: 'עבודה תת־הכרתית עמוקה', d: 'גישה לשכבות שבהן הקוד נכתב מלכתחילה.' },
  { n: 'IV',  t: 'בנייה מחדש',           d: 'כתיבת זהות חדשה, מתוך בחירה מודעת.' },
  { n: 'V',   t: 'ריבונות פנימית',        d: 'חיים מתוך מי שאתה — לא ממה שלימדו אותך להיות.' },
];

function MethodSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-20 text-center">
          <p className="mh-eyebrow mh-reveal mb-6">השיטה</p>
          <h2 className="mh-serif mh-reveal text-5xl tracking-tight sm:text-6xl md:text-7xl">
            Exire Systema
          </h2>
          <p className="mh-reveal mt-6 text-sm tracking-[0.32em] text-[hsl(var(--mh-mute))]">
            ח מ י ש ה   ש ל ב י ם
          </p>
        </div>

        <ol className="relative">
          {/* vertical line */}
          <div
            className="absolute bottom-0 top-0 hidden w-px md:block"
            style={{
              insetInlineStart: '4.5rem',
              background:
                'linear-gradient(to bottom, transparent, hsl(var(--mh-line)), transparent)',
            }}
          />
          {STEPS.map((s) => (
            <li key={s.n} className="mh-reveal group relative grid grid-cols-[auto_1fr] gap-6 py-8 md:gap-12 md:py-10">
              <span
                dir="ltr"
                className="mh-serif inline-block w-16 text-2xl font-light text-[hsl(var(--mh-sand))] md:w-24 md:text-4xl"
              >
                {s.n}
              </span>
              <div>
                <h3 className="mh-serif text-2xl text-[hsl(var(--mh-ink))] md:text-4xl">{s.t}</h3>
                <p className="mt-3 max-w-xl text-sm leading-[1.9] text-[hsl(var(--mh-mute))] md:text-base">
                  {s.d}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─────────────── 5. Content ─────────────── */

const TOPICS = [
  { t: 'תודעה',           tag: 'I' },
  { t: 'זהות',            tag: 'II' },
  { t: 'היפנוזה',         tag: 'III' },
  { t: 'Shadow Work',     tag: 'IV' },
  { t: 'מערכות שליטה',    tag: 'V' },
  { t: 'ריבונות פנימית',  tag: 'VI' },
];

function ContentSection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mh-eyebrow mh-reveal mb-6">התוכן</p>
          <h2 className="mh-serif mh-reveal text-4xl sm:text-5xl md:text-6xl">
            שדות החקירה
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-[hsl(var(--mh-line))] sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <article
              key={topic.t}
              className="mh-reveal group relative aspect-[4/5] overflow-hidden bg-[hsl(var(--mh-bg))] transition-colors duration-700 hover:bg-[hsl(var(--mh-bg-2))]"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse at 30% 30%, hsla(35, 18%, 50%, 0.18) 0%, transparent 60%)',
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-between p-8">
                <span dir="ltr" className="mh-serif text-xl text-[hsl(var(--mh-sand))]">
                  {topic.tag}
                </span>
                <div>
                  <div className="mb-4 h-px w-8 bg-[hsl(var(--mh-line))] transition-all duration-700 group-hover:w-20 group-hover:bg-[hsl(var(--mh-sand))]" />
                  <h3 className="mh-serif text-3xl md:text-4xl">{topic.t}</h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 6. Final CTA ─────────────── */

function FinalCTA({ onStart }: { onStart: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-40 md:py-56">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="mh-serif mh-reveal text-4xl leading-[1.2] sm:text-5xl md:text-7xl">
          או שתמשיך לחיות
          <br />
          <span className="text-[hsl(var(--mh-mute))]">מתוך מי שתכנתו אותך להיות.</span>
        </h2>
        <p className="mh-serif mh-reveal mt-10 text-4xl leading-[1.2] sm:text-5xl md:text-7xl">
          או שתתחיל לבנות
          <br />
          <span className="text-[hsl(var(--mh-sand))]">את עצמך מחדש.</span>
        </p>

        <div className="mh-reveal mt-16">
          <button onClick={onStart} className="mh-cta-primary">
            היכנס פנימה
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */

function Footer() {
  return (
    <footer className="relative border-t border-[hsl(var(--mh-line))] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center md:flex-row md:text-start">
        <div className="flex items-center gap-3">
          <span className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--mh-sand))]" />
          <span className="mh-eyebrow">{BRAND}</span>
        </div>
        <p className="mh-eyebrow text-[0.65rem]">
          Exire Systema · כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
}
