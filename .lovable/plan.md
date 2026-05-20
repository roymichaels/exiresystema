## Findings (root causes)

The landing currently ships **~22 MB of raw images** for a single page on a mobile-first audience, plus three overlapping background systems running at once:

| Asset | Size | Problem |
|---|---|---|
| `exire-sigil.png` | 2.5 MB | Used as small clipped logo. Should be inline SVG / 64 px WebP. |
| `founder-hero.jpg` / `founder-portrait.jpg` | 2.0 + 1.8 MB | Hero only needs ~1600 px wide AVIF (~120 KB). |
| 6 × `topic-*.jpg` | ~1.6–2.0 MB each (≈11 MB total) | Below-the-fold cards loaded eagerly. |
| `aion-logo/aion-icon/aion-orb/apple-touch-icon/logo.png` | 0.5–0.9 MB each | Many are 1024² PNGs used at 32–64 px. |
| Background layers | — | `ConsciousnessField.tsx` (Canvas2D), `ConsciousnessFieldGL.tsx` (WebGL), `AmbientBackdrop.tsx` (DOM fog/gradients) all coexist. |
| Logo wordmark | — | "MindHacker" / duplicate "Powered by AION" pills still visible. |

Also: no `loading="lazy"`, no `decoding="async"`, no width/height (CLS), no preload hint on the LCP image, and the dev server eagerly compiles all of the above on first paint.

## What I'll do

### 1. Image pipeline (the biggest win — ~90% smaller payload)
- Add **`vite-imagetools`** to the Vite config so imports can request `?format=avif&w=1600` / `?format=webp&w=1600` at build time. No new CDN, no runtime cost.
- Re-encode the **8 large JPG/PNG assets** at the sandbox using `sharp` and commit them as `.avif` + `.webp` siblings:
  - `founder-hero` → 1600 w AVIF + WebP (~120 KB / ~180 KB)
  - `founder-portrait` → 1200 w AVIF + WebP
  - 6 × `topic-*` → 900 w AVIF + WebP
  - `exire-sigil` → re-trace as **inline SVG** (used everywhere; PNG dropped entirely)
  - `aion-logo/aion-icon/aion-orb/logo` → 256 w WebP + delete oversized PNGs from `public/` (PWA icons stay at 192/512)
- New tiny **`<Picture>` component** (`<picture><source type=avif><source type=webp><img>`) with `loading`, `decoding`, `width`, `height`, `sizes` and a blurred LQIP placeholder (base64, ~400 B per image generated at build).

### 2. Loading strategy
- **Preload only the hero AVIF** via `<link rel="preload" as="image" imagesrcset>` in `index.html`. `fetchpriority="high"` on the hero `<img>`.
- Everything below the fold (`founder-portrait`, all `topic-*`, AION chat panel, intake modal) → `loading="lazy"` + `decoding="async"`.
- New **`useReveal()` hook** using `IntersectionObserver` + `prefers-reduced-motion`, applies a 350 ms staggered fade/slide reveal to sections and cards. Stagger keeps the cinematic feel without simultaneous paints.

### 3. Background system consolidation (the biggest perf win after images)
- **Delete `ConsciousnessField.tsx` and `AmbientBackdrop.tsx`.** Keep only `ConsciousnessFieldGL.tsx`, and slim it down:
  - Single shared OGL/Three scene at **DPR capped at 1.5**, **paused via `IntersectionObserver` + `document.visibilityState`**.
  - Reduce particles to ~80 on mobile / ~180 on desktop (gated by `matchMedia('(max-width: 768px)')` and `navigator.hardwareConcurrency`).
  - Replace DOM "fog" PNG overlays with CSS `radial-gradient` + a single 1 KB SVG noise tile + `backdrop-filter: blur()` only on text panels (never full-screen).
  - Respect `prefers-reduced-motion` → static gradient + grain only.

### 4. Hero refinements (no visual regression)
- One optimized `founder-hero` `<Picture>` as the LCP image.
- Dark vignette + soft purple glow via CSS, **no stacked overlays**.
- Explicit `aspect-ratio` on hero container → zero CLS.
- "EXIRE SYSTEMA" stays; "MindHacker" wordmark and duplicate "Powered by AION" chips removed (sigil + small AION pill in the header is the only AION surface).

### 5. CSS / paint cost
- Drop `box-shadow` on cards in favor of 1 px borders + subtle inner gradient.
- Limit `backdrop-filter` to ≤ 2 elements per viewport.
- Cards use `will-change: opacity, transform` only during reveal animation, removed after.
- Tailwind purge already on, but I'll also remove unused gradient utilities introduced in earlier passes.

### 6. Branding cleanup
- Search/replace `MindHacker` strings (Hebrew header chip + footer) → either removed or replaced with `EXIRE SYSTEMA`.
- Remove dev/debug overlays (`ShellV2MountDebug` style) from the landing render tree if any still mount on `/`.
- Single AION presence: one tiny pill ("שיחה עם AION") in the header, nothing else on the landing.

## Targets

| Metric (mobile, 4G) | Now (est.) | After |
|---|---|---|
| Transfer size (landing) | ~22 MB | **≤ 600 KB** |
| LCP image | 2.0 MB JPG | **~120 KB AVIF** |
| LCP | ~6–8 s | **≤ 2.0 s** |
| CLS | visible jumps | **0** |
| Background FPS (iPhone, low-power) | drops | **steady 60 fps**, paused off-screen |

## Files touched

- `vite.config.ts` — add `vite-imagetools`.
- `package.json` — add `vite-imagetools` (and `sharp` as devDep for the one-shot re-encode script).
- `scripts/optimize-assets.mjs` (new, one-shot) — generates `.avif` + `.webp` + LQIP base64 for every asset in `src/assets/`.
- `src/components/ui/Picture.tsx` (new) — `<picture>` wrapper with LQIP + lazy + width/height.
- `src/hooks/useReveal.ts` (new) — IntersectionObserver reveal with stagger + reduced-motion.
- `src/components/landing/mindhacker/MindHackerLanding.tsx` — swap `<img>`/`<div bg>` for `<Picture>`, add reveals, drop duplicate branding.
- `src/components/landing/mindhacker/ConsciousnessFieldGL.tsx` — DPR clamp, particle gating, pause hooks, removed PNG overlays.
- **Delete** `ConsciousnessField.tsx`, `AmbientBackdrop.tsx`, oversized `public/*.png` duplicates, raw `src/assets/topic-*.jpg` originals (replaced with `.avif`/`.webp`).
- `index.html` — preload hero AVIF, drop unused preconnects, keep PWA icons.
- `src/components/landing/mindhacker/intake/IntakeChatModal.tsx` — code-split via `React.lazy` so it doesn't block first paint.

## Out of scope (will not touch unless asked)
- The authenticated app shell (`/app`, `/worlds/…`), admin panel, onboarding ceremony — performance pass is **landing-only** for this turn.
- AI/edge-function logic.
- Email/lead system (already approved separately).
- Replacing OGL/Three with a custom shader from scratch — only tuning the existing one.

If you approve, I'll execute everything in one pass and verify with a final build-size check before handing back.
