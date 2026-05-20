Redesign the floating AION chat widget (`AionFloatingWidget` inside `src/components/landing/mindhacker/MindHackerLanding.tsx`) so it reads instantly as a premium, inviting entry point — without breaking the cinematic dark-luxury tone.

### Current problems
- Tiny pill, `opacity-70`, low contrast — easy to miss.
- Plain dot + Latin "chat with aion" lowercase reads as a debug badge, not a luxury invite.
- No identity mark, no affordance hierarchy.

### New design

A floating pill anchored bottom-start, larger and clearly tappable, with three elements:

1. **AION sigil** — a 32px circular mark using the existing Exire sigil (`exire-sigil.webp/avif` via `<Picture>`), rendered with a soft violet halo (`drop-shadow` + radial-gradient ring) and slow `breathe` animation (scale 1 ↔ 1.04, 4s).
2. **Two-line label** — eyebrow `AION` (Cormorant, letter-spaced, sand color) over a localized invite line (`t('widget.invite')`, e.g. "התחל שיחה" / "Begin the dialogue"), muted ink.
3. **Arrow chevron** — small `ChevronRight` (or `ChevronLeft` under RTL via logical `rotate`/`scale-x`), sand color, signaling action.

Container styling:
- `rounded-full`, `pl-2 pr-4 py-2` (logical via `ps-2 pe-4`).
- `bg-[hsl(var(--mh-bg)/0.55)]` + `backdrop-blur-xl`.
- Hairline border `border border-[hsl(var(--mh-line))]` plus inner highlight via `shadow-[inset_0_1px_0_hsl(var(--mh-ink)/0.08)]`.
- Outer glow `shadow-[0_8px_40px_-12px_hsl(var(--mh-sand)/0.35)]`.
- Default opacity **1** (no more 70%). Hover: subtle lift (`-translate-y-0.5`) + intensified sand glow.
- Slow `breathe` halo behind the sigil, plus the existing `animate-ping` dot becomes a 6px sand pulse at the sigil's edge to signal "alive/awaiting".

Motion & a11y:
- Entrance: fade + 8px slide-up after 600ms (single CSS keyframe, no JS).
- Respects `prefers-reduced-motion` (disables ping/breathe).
- Tap target 44px+. `aria-label` from existing `t('widget.aria')`.
- Keeps existing `insetInlineStart` + safe-area inset positioning so it sits correctly on iOS.

### Localization
Add two new keys to the existing `landing.widget` namespace in both `he.ts` and `en.ts`:
- `widget.brand` = "AION"
- `widget.invite` = "התחל שיחה" / "Begin the dialogue"

(Keep `widget.chatLabel` for backward compat but stop using it.)

### Files touched
- `src/components/landing/mindhacker/MindHackerLanding.tsx` — rewrite `AionFloatingWidget` only.
- `src/components/landing/mindhacker/theme.css` — add `@keyframes mh-breathe` + `mh-widget-enter` (respecting reduced motion).
- `src/i18n/translations/he.ts`, `src/i18n/translations/en.ts` — add `widget.brand` + `widget.invite`.

No other section, layout, or behavior changes.
