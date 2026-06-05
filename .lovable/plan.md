# Fix: AION chat widget appears unresponsive on click

## Diagnosis

On `/` (MindHackerLanding), the floating AION widget renders correctly and clicking it does work — but only after the lazy-loaded `AionLandingChat` chunk finishes downloading. During that window (often several seconds on a fresh load), nothing on screen changes:

- `openChat()` in `src/components/landing/mindhacker/MindHackerLanding.tsx` only calls `setChatOpen(true)` inside `aionChatImport().finally(...)`, i.e. **after** the chunk resolves.
- The widget's `hidden` flag is `intakeOpen || chatOpen`, so it stays visible the whole time the chunk loads.
- `Suspense fallback={null}` means no visible fallback either.
- Result: tap the widget → no visual feedback → user perceives "the chat isn't popping up".

The intake flow already solves this with an `intakeLoading` spinner overlay. The AION chat path is missing the equivalent.

Confirmed in the live preview: after a click, the chat drawer does eventually render (verified via screenshot and DOM observation), just with a noticeable blank gap first.

## Fix (frontend only, `src/components/landing/mindhacker/MindHackerLanding.tsx`)

1. Add a `chatLoading` state next to `intakeLoading`.
2. Update `openChat` to mirror `startIntake`:
   - `setChatLoading(true)` before `aionChatImport()`.
   - In `.finally()` → `setChatOpen(true)` then `setChatLoading(false)`.
3. Render the same fullscreen spinner overlay (used by `intakeLoading`) when `chatLoading` is true, with appropriate aria attributes.
4. Also include `chatLoading` in the widget's `hidden` prop so the floating button hides as soon as the user taps it, signalling something is happening even before the chunk resolves.

No backend, routing, or chat logic changes. This is purely UX feedback during the lazy-load window.

## Verification

- Reload `/`, click the AION widget: spinner appears immediately, then drawer mounts when the chunk finishes.
- Closing the drawer (`onOpenChange(false)`) still restores the floating widget.
- Intake flow remains unchanged.
