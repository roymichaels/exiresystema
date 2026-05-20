/**
 * MindHackerLanding — cinematic Hebrew homepage.
 * Optimized: AVIF/WebP via <Picture>, LQIP hero, lazy modals, paused background.
 */
import { Suspense, lazy, useState } from 'react';

import { AmbientBackdrop, useReveal } from './AmbientBackdrop';
import Picture from './Picture';

// Hero assets — AVIF + WebP + tiny JPG fallback
import founderHeroAvif from '@/assets/founder-hero.avif';
import founderHeroWebp from '@/assets/founder-hero.webp';
import founderHeroJpg from '@/assets/founder-hero.jpg';

import founderPortraitAvif from '@/assets/founder-portrait.avif';
import founderPortraitWebp from '@/assets/founder-portrait.webp';
import founderPortraitJpg from '@/assets/founder-portrait.jpg';

import topicConsciousnessAvif from '@/assets/topic-consciousness.avif';
import topicConsciousnessWebp from '@/assets/topic-consciousness.webp';
import topicConsciousnessJpg from '@/assets/topic-consciousness.jpg';

import topicIdentityAvif from '@/assets/topic-identity.avif';
import topicIdentityWebp from '@/assets/topic-identity.webp';
import topicIdentityJpg from '@/assets/topic-identity.jpg';

import topicHypnosisAvif from '@/assets/topic-hypnosis.avif';
import topicHypnosisWebp from '@/assets/topic-hypnosis.webp';
import topicHypnosisJpg from '@/assets/topic-hypnosis.jpg';

import topicShadowWorkAvif from '@/assets/topic-shadow-work.avif';
import topicShadowWorkWebp from '@/assets/topic-shadow-work.webp';
import topicShadowWorkJpg from '@/assets/topic-shadow-work.jpg';

import topicControlSystemsAvif from '@/assets/topic-control-systems.avif';
import topicControlSystemsWebp from '@/assets/topic-control-systems.webp';
import topicControlSystemsJpg from '@/assets/topic-control-systems.jpg';

import topicSovereigntyAvif from '@/assets/topic-sovereignty.avif';
import topicSovereigntyWebp from '@/assets/topic-sovereignty.webp';
import topicSovereigntyJpg from '@/assets/topic-sovereignty.jpg';

import exireSigilAvif from '@/assets/exire-sigil.avif';
import exireSigilWebp from '@/assets/exire-sigil.webp';

import './theme.css';

// Lazy: keep modal/chat off the critical path
const IntakeChatModal = lazy(() => import('./intake/IntakeChatModal'));
const AionLandingChat = lazy(() => import('./AionLandingChat'));

const HERO_LQIP =
  'data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAwBACdASoYAA4APxFysFCsJqSisAgBgCIJZwDKABbB2R10ASTKDZr8sAAA/iLu22/Sl3hWKsEzIQUYEUmesH7h4tyL9gMjnEIhYTyLq49v9kIBNCHDq5fJgAA=';

const BRAND = 'EXIRE SYSTEMA';

export default function MindHackerLanding() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const startIntake = () => setIntakeOpen(true);
  const openChat = () => setChatOpen(true);

  return (
    <div className="mindhacker-theme min-h-screen" dir="rtl" lang="he">
      <TopBar />
      <main>
        <Hero onStart={startIntake} />
        <SystemSection />
        <WhatIDoSection />
        <MethodSection />
        <ContentSection />
        <FinalCTA onStart={startIntake} />
      </main>
      <Footer />
      <AionFloatingWidget onOpen={openChat} hidden={intakeOpen || chatOpen} />
      {(chatOpen || intakeOpen) && (
        <Suspense fallback={null}>
          {chatOpen && (
            <AionLandingChat
              open={chatOpen}
              onOpenChange={setChatOpen}
              onOpenIntake={startIntake}
            />
          )}
          {intakeOpen && (
            <IntakeChatModal open={intakeOpen} onOpenChange={setIntakeOpen} />
          )}
        </Suspense>
      )}
    </div>
  );
}

/* ─────────────── Floating AION chat widget ─────────────── */

function AionFloatingWidget({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="פתח שיחה עם AION"
      className="group fixed z-40 flex items-center gap-2 rounded-full border border-[hsl(var(--mh-line)/0.7)] bg-black/40 px-3 py-1.5 backdrop-blur-md opacity-70 transition-all hover:opacity-100 hover:bg-black/60"
      style={{
        insetInlineStart: 'max(1rem, env(safe-area-inset-left))',
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--mh-sand))] opacity-40" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[hsl(var(--mh-sand))]" />
      </span>
      <span dir="ltr" className="text-[0.55rem] tracking-[0.25em] text-[hsl(var(--mh-ink)/0.75)]">
        chat with aion
      </span>
    </button>
  );
}

/* ─────────────── Top bar (logo only) ─────────────── */

function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6 pt-6 md:pt-8">
      <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden">
        <Picture
          avif={exireSigilAvif}
          webp={exireSigilWebp}
          fallback={exireSigilWebp}
          alt="Exire Systema"
          width={512}
          height={768}
          eager
          imgClassName="absolute inset-x-0 top-0 h-[140%] w-full object-contain opacity-80 mix-blend-screen"
          imgStyle={{
            filter: 'brightness(1.05) contrast(0.95) saturate(0.8) drop-shadow(0 0 18px rgba(180,150,255,0.25))',
            clipPath: 'inset(0 0 32% 0)',
          }}
        />
      </div>
    </header>
  );
}

/* ─────────────── 1. Hero ─────────────── */

function Hero({ onStart }: { onStart: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* LCP image */}
      <Picture
        avif={founderHeroAvif}
        webp={founderHeroWebp}
        fallback={founderHeroJpg}
        alt=""
        width={1600}
        height={1067}
        priority
        eager
        lqip={HERO_LQIP}
        className="absolute inset-0 h-full w-full"
        imgClassName="absolute inset-0 h-full w-full object-cover object-[85%_center] md:object-[75%_center]"
      />

      {/* Cinematic grade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 75% 50%, transparent 0%, hsl(var(--mh-bg) / 0.15) 45%, hsl(var(--mh-bg) / 0.75) 80%, hsl(var(--mh-bg)) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--mh-bg) / 0.92) 0%, hsl(var(--mh-bg) / 0.78) 30%, hsl(var(--mh-bg) / 0.35) 55%, transparent 80%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-48"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--mh-bg)) 100%)',
        }}
      />

      <div
        className="absolute inset-y-0 start-0 z-[5] w-full md:w-2/3 pointer-events-none"
        style={{
          background:
            'radial-gradient(80% 60% at 30% 55%, hsl(var(--mh-bg) / 0.7) 0%, hsl(var(--mh-bg) / 0.35) 50%, transparent 80%)',
        }}
      />

      <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pt-40 md:pt-44">
        <div className="max-w-xl text-start md:max-w-2xl">
          <p className="mh-eyebrow mh-reveal mb-10 md:mb-12">פרק ראשון</p>

          <h1 className="mh-serif mh-reveal text-[2.4rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5rem]">
            התודעה שלך
            <br />
            <span className="text-[hsl(var(--mh-sand))]">לא נבנתה</span> על ידך
          </h1>

          <p className="mh-reveal mt-10 md:mt-12 max-w-md text-[0.95rem] leading-[2] text-[hsl(var(--mh-mute))] sm:text-base md:text-lg md:leading-[2.1]">
            רוב האנשים חיים מתוך זהות, פחדים ואמונות
            <br />
            שהותקנו בהם מגיל אפס.
            <br />
            <span className="text-[hsl(var(--mh-sand))]">מעטים לומדים לכתוב את עצמם מחדש.</span>
          </p>

          <div className="mh-reveal mt-14 md:mt-16 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <button onClick={onStart} className="mh-cta-primary">
              התחל את השכתוב
            </button>
          </div>
        </div>
      </div>

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
          <div className="mh-reveal order-2 md:order-1">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-[hsl(var(--mh-bg-2))]">
              <Picture
                avif={founderPortraitAvif}
                webp={founderPortraitWebp}
                fallback={founderPortraitJpg}
                alt=""
                width={1200}
                height={1600}
                className="absolute inset-0 h-full w-full"
                imgClassName="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(110% 80% at 50% 40%, transparent 0%, hsl(var(--mh-bg) / 0.25) 55%, hsl(var(--mh-bg) / 0.75) 90%, hsl(var(--mh-bg)) 100%)',
                }}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/3"
                style={{
                  background:
                    'linear-gradient(to bottom, transparent 0%, hsl(var(--mh-bg)) 100%)',
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

/* ─────────────── 4. Method ─────────────── */

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
  { t: 'תודעה',           tag: 'I',   avif: topicConsciousnessAvif, webp: topicConsciousnessWebp, jpg: topicConsciousnessJpg },
  { t: 'זהות',            tag: 'II',  avif: topicIdentityAvif, webp: topicIdentityWebp, jpg: topicIdentityJpg },
  { t: 'היפנוזה',         tag: 'III', avif: topicHypnosisAvif, webp: topicHypnosisWebp, jpg: topicHypnosisJpg },
  { t: 'Shadow Work',     tag: 'IV',  avif: topicShadowWorkAvif, webp: topicShadowWorkWebp, jpg: topicShadowWorkJpg },
  { t: 'מערכות שליטה',    tag: 'V',   avif: topicControlSystemsAvif, webp: topicControlSystemsWebp, jpg: topicControlSystemsJpg },
  { t: 'ריבונות פנימית',  tag: 'VI',  avif: topicSovereigntyAvif, webp: topicSovereigntyWebp, jpg: topicSovereigntyJpg },
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
              className="mh-reveal group relative aspect-square overflow-hidden bg-[hsl(var(--mh-bg))]"
            >
              <Picture
                avif={topic.avif}
                webp={topic.webp}
                fallback={topic.jpg}
                alt={topic.t}
                width={900}
                height={900}
                className="absolute inset-0 h-full w-full"
                imgClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(5,3,12,0.92) 0%, rgba(5,3,12,0.55) 35%, rgba(5,3,12,0.05) 65%, transparent 100%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-6">
                <h3 className="mh-serif text-2xl text-[hsl(var(--mh-ink))] md:text-3xl">{topic.t}</h3>
                <span dir="ltr" className="mh-serif text-base text-[hsl(var(--mh-sand))]/80 md:text-lg">
                  {topic.tag}
                </span>
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
    <footer className="relative border-t border-[hsl(var(--mh-line))] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
        <Picture
          avif={exireSigilAvif}
          webp={exireSigilWebp}
          fallback={exireSigilWebp}
          alt="Exire Systema"
          width={96}
          height={144}
          imgClassName="h-12 w-12 object-contain opacity-70 mix-blend-screen"
          imgStyle={{ filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(180,150,255,0.2))' }}
        />

        <span dir="ltr" className="mh-eyebrow tracking-[0.42em] text-[hsl(var(--mh-sand))]/80">
          {BRAND}
        </span>
        <p className="mh-eyebrow text-[0.6rem] text-[hsl(var(--mh-mute))]">
          תהליך אישי לבנייה מחדש של התודעה · כל הזכויות שמורות
        </p>
      </div>
    </footer>
  );
}
