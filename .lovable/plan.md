## Intent

Keep the existing AION Consciousness Scan (`IntakeChatModal` + `intake-chat` edge function). Strip the interview/CRM tone. Make the conversation feel like a quiet, intelligent presence reading the user — not a form filling out fields. The flow already exists; we refine it.

## What changes

### 1. System prompt (the soul of the change) — `supabase/functions/intake-chat/index.ts`

Rewrite the Hebrew system prompt around four contracts:

- **Voice**: short, emotional, archetypal lines. Two-line max per turn. Cinematic silence — never two questions at once, never "מעולה/תודה רבה". No numbered question grids.
- **Mirroring rhythm**: every 2nd or 3rd user reply, return a one-sentence *reflection* before the next question. Example output the model is allowed to mirror:
  > "מעניין… נראה שאתה לא באמת מחפש מוטיבציה. נראה שאתה מנסה להבין למה שום שינוי לא מחזיק."
- **Question style examples** baked into the prompt:
  - instead of "מה הכי תקוע" → "מה ממשיך לחזור גם כשאתה מנסה להשתנות?"
  - instead of "בחר תחום" → "מה מרגיש הכי מוכר לאחרונה?"
  - instead of readiness 1–10 → "כשאתה מדמיין שינוי אמיתי — איזה חלק בך נרתע?"
- **Quick replies as a tool, not a list in text**: add a new tool `offer_choices({ prompt, options[1..5], allow_freeform })`. The model emits archetypal options (4–5 max). The UI renders them as chips below the assistant bubble. User can tap one or write their own. The chip text is what gets sent back as the user message. The current text-only "1. … 2. … 3. …" pattern is forbidden in the prompt.
- **Phases (silent, never spoken to user)**: Echo → Loop → Identity → Readiness → Contact. The model decides pacing; no fixed step count. `save_lead` still gates on name + phone.
- Keep tools `set_pain_signal`, `set_readiness`, `set_vision`, `save_lead`. Add `offer_choices` (no DB side-effect, just UI hint) and `reflect({ insight })` (optional — surfaces a separate mirror bubble visually).

### 2. UI — `IntakeChatModal.tsx`

Reuse existing tokens (`atmo-surface-soft`, `aion-glow-cyan`, `mh-*`, `animate-aion-breath`, `animate-aion-emerge`). No new components beyond:

- **Reactive orb at the top of the chat stage** (replaces the static "AION סורק" indicator). Renders `CanonicalAionModel` from `@/components/orb/CanonicalAionModel` at ~120px with the `mh-breathe` halo from `theme.css`. Three states tied to chat status:
  - `idle/ready` → slow breath
  - `submitted/streaming` → faster breath, halo brightens (`dark:aion-glow-cyan`)
  - on each new assistant message → one-shot `animate-aion-emerge` pulse
- **Quick-reply chips**: when the last assistant message contains a `tool-offer_choices` part with `state === 'output-available'`, render the options as rounded chips below the bubble. Tapping a chip calls `sendMessage({ text: option })` and hides the chip row. Always include a "אחר…" affordance that focuses the textarea.
- **Mirror bubble variant**: if a `tool-reflect` part is present, render its `insight` as a centered serif line (`mh-serif`, `text-[hsl(var(--mh-sand))]`, generous leading, no bubble background) above the next assistant question — feels like AION pausing to think.
- **Breathing pacing**: stagger assistant text reveal with a tiny `animate-fade-in` per line; insert a 600ms delay before the typing indicator appears so silences feel intentional, not laggy.
- **Composer**: keep the existing rounded textarea + send button. Soften the placeholder to "כתוב, או פשוט תרגיש". Hide the composer entirely while chips are pending — user picks first, then types only if they tap "אחר…". Reduces interview feeling.
- **Hook stage**: keep current copy ("רוב האנשים חיים מתוך דפוסים…"). Change the CTA label to "התחל" (one word). Show the canonical orb above the headline, breathing slowly.
- **Reveal stage**: keep the pattern_diagnosis reveal. Add a 1.2s held silence (orb breathing alone, no text) before the diagnosis fades in — cinematic beat.

### 3. Edge function plumbing

- Add the two new tools (`offer_choices`, `reflect`) — both have `execute` that just echoes back the args so they appear as `tool-*` parts in the stream. No DB writes.
- Keep `stopWhen: stepCountIs(50)`, OpenRouter `google/gemini-2.5-flash`, OpenRouter base URL — no provider change.
- Tighten prompt rule: "אם הצעת אפשרויות — חובה לקרוא ל-offer_choices, לא לכתוב 1. 2. 3. בטקסט."

### 4. Out of scope
- No new tables, no auth changes, no new routes, no AI Elements install (the existing AION-styled bubbles already match the contract). The `chat-agent-ui-contract` thread-storage question doesn't apply — this is a single anonymous scan with no persistence beyond the final `save_lead` row.
- No change to `MindHackerLanding.tsx` sections. No change to the OpenRouter setup.

## Files touched
- `supabase/functions/intake-chat/index.ts` — new system prompt, two new tools, deploy.
- `src/components/landing/mindhacker/intake/IntakeChatModal.tsx` — orb at top, chip renderer, mirror bubble, paced reveal, composer gating.

## Verification
- `curl` the function with a sample message → confirm 200 SSE and that the first reply is ≤2 short lines.
- Open modal in preview → tap "התחל", confirm: orb breathes, first question is short and emotional, chips render (no numbered list), tapping a chip sends a message, mirror line appears within ~3 turns, composer hides while chips pending, save_lead still produces the WhatsApp CTA.

## One open call I'm making for you
I'm assuming the existing 5-phase data capture (`pain_category`, `readiness_score`, `transformation_vision`, etc.) stays — the model just gathers it through emotional language and chips instead of explicit questions, so your leads table fills the same way. If you want to drop some of those fields entirely and let AION decide what's worth capturing, tell me and I'll thin the tools.
