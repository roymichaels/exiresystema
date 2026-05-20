## Goals

1. Remove the breathing orb from the Mind Hacker homepage.
2. Stop using the isolated `mh-*` palette and drive the landing from the app's existing semantic theme tokens (background/foreground/primary/aion-violet/aion-cyan) so it matches the rest of the app.
3. Switch the `intake-chat` edge function from the Lovable AI Gateway to OpenRouter (the `OPENROUTER_API_KEY` secret is already configured).

## Changes

### 1. Remove the orb (frontend only)
- `src/components/landing/mindhacker/MindHackerLanding.tsx`: drop `showOrb` from both `<AmbientBackdrop ... />` calls (hero + closing section).
- `src/components/landing/mindhacker/intake/IntakeChatModal.tsx`: drop `showOrb` from the modal backdrop.
- `src/components/landing/mindhacker/AmbientBackdrop.tsx`: delete the two orb halo blocks (lines ~93–118) and the `showOrb` prop entirely. Keep void radial, sacred geometry, particles, fog.

### 2. Theme alignment
Re-point the Mind Hacker palette to existing app tokens so the landing inherits the global theme instead of defining its own colors.

- `src/components/landing/mindhacker/theme.css`:
  - Replace the hardcoded `--mh-bg / --mh-bg-2 / --mh-ink / --mh-sand / --mh-ember / --mh-line / --mh-mute` HSL values with references to existing app tokens:
    - `--mh-bg`        → `var(--background)`
    - `--mh-bg-2`      → `var(--card)` (or `--muted`)
    - `--mh-ink`       → `var(--foreground)`
    - `--mh-sand`      → `var(--aion-violet)` (accent)
    - `--mh-ember`     → `var(--aion-cyan)` (secondary accent)
    - `--mh-line`      → `var(--border)`
    - `--mh-mute`      → `var(--muted-foreground)`
  - Update `.mh-cta-primary` / `.mh-cta-ghost` to reference these (already do, no change beyond token swap).
  - Particles in `AmbientBackdrop.tsx` currently use a hardcoded `hsla(40, 25%, 92%, …)` — switch to `hsl(var(--foreground) / a)`.

This keeps all section structure/typography intact; only the color source changes, so the landing visually inherits whatever theme the rest of the app uses (dark purple/aion).

### 3. Switch intake AI to OpenRouter
- `supabase/functions/intake-chat/index.ts`:
  - Replace the `createOpenAICompatible` config:
    ```ts
    const gateway = createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENROUTER_API_KEY')!}`,
        'HTTP-Referer': 'https://mindhacker.app',
        'X-Title': 'Mind Hacker Intake',
      },
    });
    ```
  - Change the model from `google/gemini-3-flash-preview` to an OpenRouter model id — proposed default: `google/gemini-2.5-flash` (fast, cheap, supports tool calls). Easy to swap.
  - Leave the Resend founder notify path unchanged (still uses `LOVABLE_API_KEY` via the connector gateway — that's not LLM traffic).
- Redeploy the edge function.

### 4. Verification
- `curl -X POST .../intake-chat` with a sample messages array → expect 200 + stream chunks (not 402).
- Open the landing, confirm: no orb, colors match the rest of the app (dark purple aion theme rather than sandy/ember), CTA opens modal, modal scans through to `save_lead`, WhatsApp button appears.

## Open question
You said "colors from the theme of the app" — I'm assuming you mean the global aion/purple dark theme used everywhere else (so the Mind Hacker landing stops looking like its own micro-brand). If you actually wanted to keep the sandy/ember vibe and only retune a couple of shades, tell me and I'll do that instead.
