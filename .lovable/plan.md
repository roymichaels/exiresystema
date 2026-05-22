## Problem

The current email uses `pattern_diagnosis` written by the chat model mid-conversation. It echoes surface answers (e.g. "yoga") instead of analyzing the whole conversation and surfacing the real underlying pattern. The intake AI is tuned for short, in-conversation reflections — not for deep post-hoc analysis.

## Fix

Add a dedicated "deep analyst" pass in `supabase/functions/intake-chat/index.ts` that runs server-side **after** `save_lead` validates but **before** the email is sent and the row is inserted. It re-reads the entire conversation with a stronger model and a strict analyst prompt, returns structured JSON, and that JSON becomes the source of truth for the email.

### Analyst pass

1. New helper `analyzeConversationDeep(messages, signals, baseAnalysis, language)` inside `intake-chat/index.ts`:
   - Model: `google/gemini-2.5-pro` (deep reasoning, supports Hebrew).
   - Non-streaming call to Lovable AI Gateway with `tool_choice` forcing a single `emit_lead_report` tool — structured output, no free text.
   - Input: full transcript flattened to plain `role: text` turns (user + assistant text only, tool calls stripped) + the recovered signals + the AI's own short diagnosis as a hint to challenge.
   - System prompt (Hebrew/English/Spanish per `language`) instructs:
     - Read the ENTIRE conversation, not just the last answer.
     - Distinguish surface content (examples the user mentioned like "yoga") from the underlying pattern (what actually keeps repeating, what the user is avoiding, what archetype is active).
     - Explicitly call out: stated_problem vs real_problem, contradictions, defenses, what the user is NOT saying, recommended angle for the founder's first call.
     - Be specific, no coaching clichés, no "מעולה".

### Structured output schema (`emit_lead_report` tool)

```
{
  headline: string,                  // 1 sentence, sharp, the real pattern
  stated_problem: string,            // what the user literally said
  real_problem: string,              // what's actually going on underneath
  recurring_pattern: string,         // the loop that keeps repeating
  avoidance: string,                 // what they're avoiding/defending
  contradictions: string[],          // up to 3
  archetype: string,                 // short label (e.g. "המתחיל הנצחי")
  readiness_read: string,            // qualitative read beyond the 1-10
  recommended_opening: string,       // first sentence founder should say on the call
  risk_flags: string[],              // up to 3 (e.g. "low follow-through", "intellectualizing")
  confidence: number                 // 0-1
}
```

### Wire-up in `save_lead.execute`

After validation passes, before `supabase.from('leads').insert(row)`:

1. Call `deepReport = await analyzeConversationDeep(...)`.
2. Merge `ai_analysis = { ...args.ai_analysis, pattern_diagnosis: args.pattern_diagnosis, change_depth: signals.change_depth, deep_report: deepReport }`.
3. Insert as today.
4. Pass `deepReport` into `notifyFounder` for rendering.

If the analyst call fails or times out (10s budget), log the error and fall back to today's behavior (email still goes out, just without the deep section). Never block lead capture on the analyst.

### Email template (`notifyFounder`)

Restructure the HTML to lead with the deep report:

```
ליד חדש: {name}
{headline}

== הקריאה העמוקה ==
מה שהוא אמר: {stated_problem}
מה שבאמת קורה: {real_problem}
דפוס חוזר: {recurring_pattern}
מה הוא מתחמק ממנו: {avoidance}
סתירות: {contradictions as <ul>}
ארכיטיפ: {archetype}
מוכנות (קריאה): {readiness_read}
דגלי סיכון: {risk_flags}

== איך לפתוח את השיחה ==
{recommended_opening}

== נתוני קשר ==
שם / טלפון / אימייל

== חתימת שיחה ==
Pain / ניסה / מחפש / Readiness / Intent / עומק / חזון
אבחנה מקורית (AI בזמן אמת): {pattern_diagnosis}

== Transcript ==
<details> with role-tagged turns from body.messages.
```

Also include the raw transcript inline (collapsed) so the founder can verify the analysis.

## Technical notes

- Use direct `fetch` to `https://ai.gateway.lovable.dev/v1/chat/completions` with `LOVABLE_API_KEY` (same pattern as `generate-transformation-report`) rather than the `ai` SDK, so we can force tool choice and parse one JSON cleanly.
- 10s `AbortController` timeout on the analyst call.
- Strip the transcript to text only: walk `body.messages`, take user content and assistant `parts[].text`, ignore tool inputs/outputs to keep tokens tight.
- Handle 429/402 from the gateway: log, skip deep report, continue.
- No DB schema changes — `ai_analysis` is already `jsonb` and just gains a `deep_report` key.
- No frontend changes.

## Validation

1. Deploy `intake-chat`.
2. Run a real intake flow in the preview as a user, give intentionally shallow surface answers (like the yoga test), submit name + phone.
3. Confirm email arrives with the new sections and `real_problem` is clearly distinct from `stated_problem`.
4. Check edge function logs for `deep_report` generation timing and any fallback warnings.
5. Inspect the new `leads` row and confirm `ai_analysis.deep_report` is populated.
