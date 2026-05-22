## Goal

After the intake chat captures name + phone (lead saved), reliably transition the modal to a success state with a warm message and a primary "Close" button that actually shuts the window — replacing the current Stage-B chat view that sometimes lingers (as seen in the user screenshot, where AION confirmed "זיהיתי. השלב הבא כבר ממתין." but the chat remained open).

## Scope (frontend only)

Single file: `src/components/landing/mindhacker/intake/IntakeChatModal.tsx`
Plus 3 i18n entries (he/en/es) for the new success copy.

No edge-function / backend changes — `save_lead` already works (verified previous turn: row inserted, Resend 200).

## Changes

### 1. More robust success detection

Currently `saveResult` only resolves when a message part has `type === 'tool-save_lead'` with `state === 'output-available'`. That's the primary signal, but if the AI SDK part shape differs across stream chunks or the tool result is wrapped differently, the modal stays stuck.

Update `saveResult` `useMemo` to additionally detect:
- any part whose `type` includes `save_lead` (e.g. `tool-save_lead`, `tool-result-save_lead`) with a truthy `output?.ok` OR `result?.ok`
- fall back to `output ?? result` so we surface `lead_id`, `pattern_diagnosis`, `whatsapp_url` regardless of SDK field name

This guarantees Stage C activates as soon as the tool completes.

### 2. Clean, warm Success card (replaces current reveal stage)

Keep the existing Stage C container but rebuild the inner content as a single clear success card:

```
[AION orb, gentle breathe]
[eyebrow: "זוהה" / "Captured" / "Recibido"]
[serif headline: pattern_diagnosis or fallback]
[soft body: "תודה ש{name}. נחזור אליך בוואטסאפ בקרוב." / EN / ES]
[primary button: "סגור" / "Close" / "Cerrar"]   ← always present, always closes the modal
[secondary link (only if whatsapp_url): "המשך לוואטסאפ" — opens in new tab, does NOT block close]
```

The primary button calls `onOpenChange(false)` unconditionally. Even when `whatsapp_url` exists, the close button is the primary action so the user can always exit.

### 3. Skip the close-confirmation prompt after success

`tryClose()` currently `window.confirm`s when `messages.length > 0`. Once `saveResult` is set, the data is already saved — skip the confirm so the X button and the new Close button close instantly.

### 4. Keep the 1.2s cinematic beat

Preserve the existing `revealDelayDone` delay so the orb breathes for a moment before the success copy fades in. Unchanged.

### 5. i18n additions

Add three keys under `landing.intake` in `he.ts`, `en.ts`, `es.ts`:

- `successTitle` — "תודה" / "Thank you" / "Gracias"
- `successBody` — "קיבלתי את הפרטים. אחזור אליך בוואטסאפ בקרוב." / EN equivalent / ES equivalent
- (reuse existing `revealClose` for the close button label)

## Out of scope

- No changes to `intake-chat` edge function, prompt, tool schemas, or DB.
- No changes to email notification path.
- No new onboarding steps or flow rework — only the closing moment.

## Verification

1. Open the preview, click "התחל" on the intake.
2. Walk through to name + phone.
3. Confirm modal transitions: chat → orb beat (~1.2s) → success card with Close button.
4. Click Close → modal disappears, no confirm dialog.
5. Reopen modal → starts fresh (existing reset effect already handles this).
