## Goal
The Forms/Quiz admin already exists under **Admin → Content → Forms** (`/admin?tab=content&sub=forms`) — it's mounted, working, and writes to `custom_forms` + `form_fields`. I'll verify the current flow, then add an **AI Wizard** (like the landing-page AI maker) where you type what you want and AION builds the full form with all its fields automatically.

## What I'll build

### 1. New edge function: `generate-form` (Lovable AI)
- Auth-protected (admin only via `has_role`).
- Input: free-text prompt (Hebrew or English) + optional intent ("quiz" / "lead form" / "intake" / "assessment").
- Calls `google/gemini-3-flash-preview` via Lovable AI Gateway with a strict JSON schema instruction.
- Returns structured JSON:
  ```
  {
    title, description, intro_title, intro_subtitle, thank_you_message,
    fields: [{ type, label, placeholder, is_required, options[], order_index }]
  }
  ```
- `type` constrained to allowed values: `text, email, phone, textarea, select, radio, checkbox, rating, date, number` (matches DB CHECK constraint).
- Handles 429 / 402 with clean error toasts.

### 2. New component: `AIFormWizard.tsx`
- Dialog with a large textarea: "תאר לי איזה טופס/שאלון אתה רוצה" + a few quick-pick chips (Lead form, Quiz, Intake, Feedback, Assessment).
- "Generate" button → calls `generate-form` → shows a preview of the proposed title + fields list.
- "Edit prompt" lets you tweak and regenerate; "Looks good" creates the form + fields in one transaction (insert `custom_forms`, then bulk insert `form_fields` with order_index).
- On success → closes wizard, refetches the list, opens the existing `FormFieldsEditor` so you can fine-tune.

### 3. Wire into Forms page
- Add a second primary button next to "טופס חדש": **"✨ צור עם AI"** (purple/primary).
- Both buttons live in the existing `src/pages/admin/Forms.tsx` header.

### 4. Verification pass
- Confirm Forms tab loads, list query works, manual create still works, fields editor still works, share-link / submissions still work — no behavior changes to existing flow.

## Files
- `supabase/functions/generate-form/index.ts` *(new)*
- `src/components/admin/forms/AIFormWizard.tsx` *(new)*
- `src/pages/admin/Forms.tsx` *(small edit — add button + wizard mount)*

## Notes
- No DB migration needed — schema already supports everything.
- No new secrets — `LOVABLE_API_KEY` is already configured for the landing-page generator.
- All UI strings in Hebrew, matching the rest of the Forms admin.
