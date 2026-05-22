## Problem

In the AION intake chat, when a user asks directly about price (e.g. "כמה זה עולה?", "אין מחיר לפגישה?"), the model evades ("לא נוכל לדון במחיר כאן…") instead of giving the price. The system prompt already contains a price rule, but Gemini Flash ignores it.

Also: in English/Spanish the price must be shown in USD (~$139 for 500₪ at a marketing-friendly round number), not "₪".

## Fix (in `supabase/functions/intake-chat/index.ts`)

### 1. Strengthen the price rule in `SYSTEM_PROMPT`

Replace the current price block with a stricter, example-driven rule so the model cannot evade:

- Title it as a hard rule, same severity as the closing rules.
- State: if the user asks anything that maps to "how much / price / cost / per session / fees / כמה זה עולה / מחיר / עלות / cuánto cuesta / precio" — answer in **one short dry sentence** with the price, then return to the next reflective question. Never say "we can't discuss price", never defer to a call, never offer packages/discounts.
- Add 2–3 concrete good/bad examples in Hebrew so the model copies the pattern.
- Add explicit currency rule:
  - Hebrew → `500₪ לפגישה`.
  - English → `$139 per session`.
  - Spanish → `$139 por sesión`.
- Keep the existing "do not bring up price unprompted" line.

### 2. Reinforce via the per-language directive

In the `languageDirective` block (lines 617–622), append a one-liner that restates the price answer in the target language, so it overrides the Hebrew default:

- English directive gains: `If the user asks about price/cost/fees, answer in one dry sentence: "$139 per session." Do not deflect.`
- Spanish directive gains the Spanish equivalent.

### 3. No business-logic / UI changes

- No DB changes, no new tools, no UI changes. Only the edge function prompt text is modified.
- Deploy `intake-chat` after the edit.

## Technical notes

- 500₪ → $139 is consistent with `src/lib/currency.ts` rounding (≈ 0.27 conversion, rounded to nearest 10 above 50). Hard-coding the USD figure in the prompt is fine since it's a single fixed price.
- Keep the rule outside the "🌀 השלבים" flow so it can fire at any point in the conversation without breaking the intake sequence.

## Out of scope

- Changing the price itself.
- Adding a price quick-reply chip or any new UI.
- Touching the deep analyst report or lead email.