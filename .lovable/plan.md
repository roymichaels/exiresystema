## דף בית קולנועי — "מיינד האקר"

החלפה מלאה של `/` (src/pages/Index.tsx) בדף עברית-RTL חשוך, יוקרתי, קולנועי. כל ה-CTAs הראשיים פותחים את אשף ההצטרפות הגדול דרך `useSmartOnboarding().smartNavigate()`. ה-CTA "כניסה למערכת" פותח את מודאל ה-Auth.

### מבנה הדף (קומפוננטה אחת לכל סקשן, ב-`src/components/landing/mindhacker/`)

1. **HeroSection** — מסך מלא, רקע שחור עמוק, נוכחות אורב חיה (CanonicalAionModel קיים), ערפל/חלקיקים עדינים, גריד גיאומטריה קדושה דהוי.
   - כותרת ענק: "התודעה שלך לא נבנתה על ידך"
   - תת־כותרת רב־שורתית
   - CTA ראשי "התחל את השכתוב" → `smartNavigate()`
   - CTA משני "כניסה למערכת" → `openAuthModal('login')`
   - מותג זעיר בפינה: "מיינד האקר"
2. **SystemSection** — טיפוגרפיה ענקית, אנימציית שורה-אחר-שורה ("לימדו אותך מה לחשוב…"), פס רעש/סטטיק עדין ברקע.
3. **WhatIDoSection** — שתי עמודות (טקסט + placeholder קולנועי כהה עם דיוקן צללית). מטאפורת "תת־מודע כקוד".
4. **MethodSection — Exire Systema** — 5 שלבים בכרטיסים מינימליים עם מספור רומי דק, קו אנכי מחבר, גלוו רך בריחוף.
5. **ContentSection** — רשת 3×2 של כרטיסי תוכן קולנועיים (תודעה, זהות, היפנוזה, Shadow Work, מערכות שליטה, ריבונות פנימית). תמונות placeholder מ-gradient כהה + אייקון.
6. **FinalCTASection** — שורה דרמטית, CTA ענק "היכנס פנימה" → `smartNavigate()`.
7. **MinimalFooter** — שם, סימן אורב זעיר, שורת זכויות.

### שפת עיצוב (סמנטית בלבד — דרך index.css/tailwind tokens)

- רקע: שחור פחם (`--background` מודגש כהה יותר עבור הדף הזה דרך wrapper `.mindhacker-theme`).
- מבטאים: stone/sand חם (`hsl(35 18% 78%)`) ו-off-white (`hsl(40 25% 92%)`) כ-tokens חדשים: `--ink`, `--sand`, `--ember`.
- ללא gradients זוהרים, ללא צבעי wellness. רק שכבות שחור + sand + ערפל.
- טיפוגרפיה: heading ב-`Frank Ruhl Libre` (serif עברי יוקרתי), body ב-`Heebo` light. הוספה ל-index.css דרך Google Fonts.
- ריווח עצום (`py-32` לסקשנים), tracking רחב, weight דק.
- אנימציות: fade-in + parallax עדין על scroll (IntersectionObserver), נשימה איטית של האורב (קיים).

### חיבור ה-Wizard

- `HeroSection` ו-`FinalCTASection` מקבלים `onStart` prop.
- ב-`Index.tsx`: `const { smartNavigate } = useSmartOnboarding();` ומעבירים `onStart={smartNavigate}`.
- ה-CTA המשני משתמש ב-`useAuthModal().openAuthModal('login')`.

### RTL

- `dir="rtl"` על שורש הדף, `lang="he"`.
- שימוש ב-Tailwind logical: `ps-*`/`pe-*`/`ms-*`/`me-*`/`start-*`/`end-*`.
- מספרי שלבים עטופים ב-`<span dir="ltr">` במידת הצורך.

### SEO

- `<title>` "מיינד האקר — אדריכל תודעה ואסטרטג זהות תת־מודעת" (<60 תווים)
- meta description עברית (<160)
- H1 יחיד בהירו, JSON-LD `Person`.

### קבצים

**חדשים**
```
src/components/landing/mindhacker/HeroSection.tsx
src/components/landing/mindhacker/SystemSection.tsx
src/components/landing/mindhacker/WhatIDoSection.tsx
src/components/landing/mindhacker/MethodSection.tsx
src/components/landing/mindhacker/ContentSection.tsx
src/components/landing/mindhacker/FinalCTASection.tsx
src/components/landing/mindhacker/MinimalFooter.tsx
src/components/landing/mindhacker/AmbientBackdrop.tsx   // particles + fog + sacred grid
src/components/landing/mindhacker/theme.css             // scoped tokens (--ink/--sand/--ember + fonts)
```

**נערכים**
```
src/pages/Index.tsx     // החלפה מלאה לדף החדש
index.html              // <title>/<meta>/<html lang="he" dir="rtl"> אם חסר
```

לא נוגעים ב: backend, DB, edge functions, ShellV2, AION orb pipeline, auth context — רק consumption.

### Acceptance

- `/` נטען בעברית-RTL מלאה, רקע שחור קולנועי, האורב חי ברקע ההירו.
- לחיצה על "התחל את השכתוב" / "היכנס פנימה" פותחת את אשף ההצטרפות (`smartNavigate`).
- "כניסה למערכת" פותח Auth modal.
- אין English placeholder. אין צבעי wellness. עובד מובייל-first (402px) ועד דסקטופ.
- typecheck נקי.
