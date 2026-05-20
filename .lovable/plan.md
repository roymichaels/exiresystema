## What I'll do

Reuse the project's existing i18n stack (`LanguageContext` + `getTranslation`) on the landing — no new library, no behavior change.

### 1. Geo + storage logic — already exists, just reuse it
`src/contexts/LanguageContext` already:
- Detects country via `ipapi.co` on first visit → `IL` ⇒ `he`, else `en`
- Persists choice in `localStorage` + syncs to `profiles.preferred_language` when logged in
- Sets `document.documentElement.dir` / `lang`
- Exposes `useLanguage()` with `{ language, setLanguage, isRTL }`

`LanguageProvider` already wraps `<App>` (line 268). The landing currently ignores it and hardcodes `dir="rtl" lang="he"` — I'll make it read from `useLanguage()` instead.

### 2. New landing translation namespace
Add a `landing` block to `src/i18n/translations/he.ts` and `src/i18n/translations/en.ts`, mirroring every visible string on the landing:

- `landing.header.brand` — "EXIRE SYSTEMA" (same in both, kept Latin per brand)
- `landing.hero.eyebrow` / `title.line1` / `title.line2Highlight` / `title.line2Suffix` / `body.line1` / `body.line2` / `body.line3Highlight` / `cta`
- `landing.system.eyebrow` + `lines[]` + `then` + `quote`
- `landing.whatIDo.eyebrow` / `title.*` / `bullets[]`
- `landing.method.eyebrow` / `title` / `subtitle` + `steps` (5 × `{t,d}`, keyed by Roman numeral)
- `landing.content.eyebrow` / `title` + topic labels (6) keyed by id
- `landing.finalCta.line1` / `line1Suffix` / `line2` / `line2Highlight` / `button`
- `landing.footer.tagline`
- `landing.widget.chatLabel` ("chat with aion" / Hebrew equiv)
- `landing.lang.toggleAria`

English translations will mirror the cinematic tone (e.g. "Your consciousness wasn't built by you" / "Begin the rewrite") — I'll write them in keeping with the existing brand voice.

### 3. Wire `MindHackerLanding.tsx` to translations
- Import `useLanguage` + `getTranslation`; build a tiny local `t = (k) => getTranslation(language, k)`.
- Replace every hardcoded Hebrew string with `t('landing.…')`.
- Replace `dir="rtl" lang="he"` on the root `<div>` with `dir={isRTL ? 'rtl' : 'ltr'} lang={language}`.
- Asymmetric layout uses logical Tailwind props already (`start-0`, `inset-x-0`, `text-start`) so it flips naturally for EN.
- The Cormorant-serif "EXIRE SYSTEMA" wordmark and Roman numerals stay LTR via the existing `dir="ltr"` spans.

### 4. Tiny EN/HE switch in the header
Add a minimalist pill to the right of the centered logo group:

```
[ HE · EN ]
```

- Two letterspaced uppercase buttons, separated by a hairline divider.
- Active language: `text-[hsl(var(--mh-ink))]`. Inactive: `text-[hsl(var(--mh-mute))]`.
- Calls `setLanguage('he'|'en')` from `useLanguage()` — no reload.
- Positioned `absolute top-6 inset-inline-end-6` so it flips sides under RTL automatically.
- Keyboard accessible (`button` + `aria-pressed`).

### 5. Out of scope (keep behavior identical)
- IntakeChatModal / AionLandingChat: copy stays Hebrew for now (these surface dynamic AI output and have their own intake flows; localizing them is a separate, larger task).
- No change to ipapi detection, no change to storage keys, no change to profile sync.
- No visual/layout changes beyond the small language pill in the header.

### Files touched
- `src/i18n/translations/he.ts` — add `landing` block
- `src/i18n/translations/en.ts` — add `landing` block
- `src/components/landing/mindhacker/MindHackerLanding.tsx` — use `t()` everywhere, dynamic `dir`/`lang`, add `<LangToggle/>`

Approve and I'll ship it.
