/**
 * MindHackerLanding — cinematic homepage (HE / EN).
 * Optimized: AVIF/WebP via <Picture>, LQIP hero, lazy modals, paused background.
 * Localized via shared LanguageContext + getTranslation.
 */
import { Suspense, lazy, useState } from 'react';

import { AmbientBackdrop, useReveal } from './AmbientBackdrop';
import Picture from './Picture';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation, type Language } from '@/i18n';

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

type T = (key: string) => string;
const makeT = (language: Language): T => (key) => getTranslation(language, `landing.${key}`);

export default function MindHackerLanding() {
  const { language, isRTL } = useLanguage();
  const t = makeT(language);

  const [intakeOpen, setIntakeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const startIntake = () => setIntakeOpen(true);
  const openChat = () => setChatOpen(true);

  return (
    <div className="mindhacker-theme min-h-screen" dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
      <TopBar t={t} />
      <main>
        <Hero t={t} onStart={startIntake} />
        <SystemSection t={t} />
        <WhatIDoSection t={t} />
        <MethodSection t={t} />
        <ContentSection t={t} />
        <FinalCTA t={t} onStart={startIntake} />
      </main>
      <Footer t={t} />
      <AionFloatingWidget t={t} onOpen={openChat} hidden={intakeOpen || chatOpen} />
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

function AionFloatingWidget({ t, onOpen, hidden }: { t: T; onOpen: () => void; hidden: boolean }) {
  if (hidden) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t('widget.aria')}
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
        {t('widget.chatLabel')}
      </span>
    </button>
  );
}

/* ─────────────── Language toggle ─────────────── */

function LangToggle({ t }: { t: T }) {
  const { language, setLanguage } = useLanguage();
  const base =
    'mh-eyebrow text-[0.6rem] tracking-[0.32em] transition-colors duration-300';
  const active = 'text-[hsl(var(--mh-ink))]';
  const idle = 'text-[hsl(var(--mh-mute)/0.7)] hover:text-[hsl(var(--mh-ink))]';
  return (
    <div
      dir="ltr"
      aria-label={t('langToggle.aria')}
      className="absolute top-6 z-40 flex items-center gap-2 rounded-full border border-[hsl(var(--mh-line)/0.6)] bg-black/30 px-3 py-1.5 backdrop-blur-md md:top-8"
      style={{ insetInlineEnd: 'max(1rem, env(safe-area-inset-right))' }}
    >
      <button
        type="button"
        onClick={() => setLanguage('he')}
        aria-pressed={language === 'he'}
        className={`${base} ${language === 'he' ? active : idle}`}
      >
        {t('langToggle.he')}
      </button>
      <span className="h-3 w-px bg-[hsl(var(--mh-line))]" />
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`${base} ${language === 'en' ? active : idle}`}
      >
        {t('langToggle.en')}
      </button>
    </div>
  );
}

/* ─────────────── Top bar (logo only) ─────────────── */

function TopBar({ t }: { t: T }) {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex flex-col items-center px-6 pt-6 md:pt-8">
      <LangToggle t={t} />
      <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden">
        <Picture
          avif={exireSigilAvif}
          webp={exireSigilWebp}
          fallback={exireSigilWebp}
          alt={t('header.brand')}
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
      <p
        dir="ltr"
        className="mt-3 text-[0.6rem] md:text-[0.65rem] font-light text-[hsl(var(--mh-ink)/0.7)]"
        style={{
          fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
          letterSpacing: '0.55em',
          textIndent: '0.55em',
        }}
      >
        {t('header.brand')}
      </p>
    </header>
  );
}

/* ─────────────── 1. Hero ─────────────── */

function Hero({ t, onStart }: { t: T; onStart: () => void }) {
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
          <p className="mh-eyebrow mh-reveal mb-10 md:mb-12">{t('hero.eyebrow')}</p>

          <h1 className="mh-serif mh-reveal text-[2.4rem] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[5rem]">
            {t('hero.titleLine1')}
            <br />
            <span className="text-[hsl(var(--mh-sand))]">{t('hero.titleHighlight')}</span>
            {t('hero.titleSuffix')}
          </h1>

          <p className="mh-reveal mt-10 md:mt-12 max-w-md text-[0.95rem] leading-[2] text-[hsl(var(--mh-mute))] sm:text-base md:text-lg md:leading-[2.1]">
            {t('hero.bodyLine1')}
            <br />
            {t('hero.bodyLine2')}
            <br />
            <span className="text-[hsl(var(--mh-sand))]">{t('hero.bodyHighlight')}</span>
          </p>

          <div className="mh-reveal mt-14 md:mt-16 flex flex-col gap-4 sm:flex-row sm:gap-5">
            <button onClick={onStart} className="mh-cta-primary">
              {t('hero.cta')}
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

function SystemSection({ t }: { t: T }) {
  const ref = useReveal<HTMLDivElement>();
  const lines = [t('system.line1'), t('system.line2'), t('system.line3'), t('system.line4')];
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <p className="mh-eyebrow mh-reveal mb-16">{t('system.eyebrow')}</p>
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
            {t('system.then')}
          </p>
          <p className="mh-serif mh-reveal text-4xl text-[hsl(var(--mh-sand))] sm:text-6xl md:text-7xl">
            {t('system.life')}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 3. What I Do ─────────────── */

function WhatIDoSection({ t }: { t: T }) {
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
            <p className="mh-eyebrow mh-reveal mb-8">{t('whatIDo.eyebrow')}</p>
            <h2 className="mh-serif mh-reveal text-4xl leading-[1.15] sm:text-5xl md:text-6xl">
              {t('whatIDo.titlePre')}
              <br />
              <span className="text-[hsl(var(--mh-sand))]">{t('whatIDo.titleHighlight')}</span>
              <br />
              {t('whatIDo.titleSuffix')}
            </h2>
            <div className="mh-reveal mt-12 space-y-5 text-base leading-[2] text-[hsl(var(--mh-mute))] md:text-lg">
              <p>{t('whatIDo.b1')}</p>
              <p>{t('whatIDo.b2')}</p>
              <p>{t('whatIDo.b3')}</p>
              <p className="text-[hsl(var(--mh-ink))]">{t('whatIDo.b4')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 4. Method ─────────────── */

function MethodSection({ t }: { t: T }) {
  const ref = useReveal<HTMLDivElement>();
  const steps = [
    { n: 'I',   t: t('method.s1t'), d: t('method.s1d') },
    { n: 'II',  t: t('method.s2t'), d: t('method.s2d') },
    { n: 'III', t: t('method.s3t'), d: t('method.s3d') },
    { n: 'IV',  t: t('method.s4t'), d: t('method.s4d') },
    { n: 'V',   t: t('method.s5t'), d: t('method.s5d') },
  ];
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div className="mb-20 text-center">
          <p className="mh-eyebrow mh-reveal mb-6">{t('method.eyebrow')}</p>
          <h2 className="mh-serif mh-reveal text-5xl tracking-tight sm:text-6xl md:text-7xl">
            {t('method.title')}
          </h2>
          <p className="mh-reveal mt-6 text-sm tracking-[0.32em] text-[hsl(var(--mh-mute))]">
            {t('method.stepsLabel')}
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
          {steps.map((s) => (
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

function ContentSection({ t }: { t: T }) {
  const ref = useReveal<HTMLDivElement>();
  const topics = [
    { t: t('content.consciousness'), tag: 'I',   avif: topicConsciousnessAvif, webp: topicConsciousnessWebp, jpg: topicConsciousnessJpg },
    { t: t('content.identity'),      tag: 'II',  avif: topicIdentityAvif, webp: topicIdentityWebp, jpg: topicIdentityJpg },
    { t: t('content.hypnosis'),      tag: 'III', avif: topicHypnosisAvif, webp: topicHypnosisWebp, jpg: topicHypnosisJpg },
    { t: t('content.shadow'),        tag: 'IV',  avif: topicShadowWorkAvif, webp: topicShadowWorkWebp, jpg: topicShadowWorkJpg },
    { t: t('content.control'),       tag: 'V',   avif: topicControlSystemsAvif, webp: topicControlSystemsWebp, jpg: topicControlSystemsJpg },
    { t: t('content.sovereignty'),   tag: 'VI',  avif: topicSovereigntyAvif, webp: topicSovereigntyWebp, jpg: topicSovereigntyJpg },
  ];
  return (
    <section ref={ref} className="relative overflow-hidden py-32 md:py-48">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mh-eyebrow mh-reveal mb-6">{t('content.eyebrow')}</p>
          <h2 className="mh-serif mh-reveal text-4xl sm:text-5xl md:text-6xl">
            {t('content.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-[hsl(var(--mh-line))] sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <article
              key={topic.tag}
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
              <span
                dir="ltr"
                className="mh-serif absolute bottom-5 z-10 text-base text-[hsl(var(--mh-sand))]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] md:bottom-6 md:text-lg"
                style={{ insetInlineStart: '1.25rem' }}
              >
                {topic.tag}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── 6. Final CTA ─────────────── */

function FinalCTA({ t, onStart }: { t: T; onStart: () => void }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section ref={ref} className="relative isolate overflow-hidden py-40 md:py-56">
      <AmbientBackdrop />
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="mh-serif mh-reveal text-4xl leading-[1.2] sm:text-5xl md:text-7xl">
          {t('finalCta.line1a')}
          <br />
          <span className="text-[hsl(var(--mh-mute))]">{t('finalCta.line1b')}</span>
        </h2>
        <p className="mh-serif mh-reveal mt-10 text-4xl leading-[1.2] sm:text-5xl md:text-7xl">
          {t('finalCta.line2a')}
          <br />
          <span className="text-[hsl(var(--mh-sand))]">{t('finalCta.line2b')}</span>
        </p>

        <div className="mh-reveal mt-16">
          <button onClick={onStart} className="mh-cta-primary">
            {t('finalCta.button')}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Footer ─────────────── */

function Footer({ t }: { t: T }) {
  return (
    <footer className="relative border-t border-[hsl(var(--mh-line))] py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
        <Picture
          avif={exireSigilAvif}
          webp={exireSigilWebp}
          fallback={exireSigilWebp}
          alt={t('header.brand')}
          width={96}
          height={144}
          imgClassName="h-12 w-12 object-contain opacity-70 mix-blend-screen"
          imgStyle={{ filter: 'brightness(1.1) drop-shadow(0 0 10px rgba(180,150,255,0.2))' }}
        />

        <span dir="ltr" className="mh-eyebrow tracking-[0.42em] text-[hsl(var(--mh-sand))]/80">
          {t('header.brand')}
        </span>
        <p className="mh-eyebrow text-[0.6rem] text-[hsl(var(--mh-mute))]">
          {t('footer.tagline')}
        </p>
      </div>
    </footer>
  );
}
