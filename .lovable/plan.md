# הסרת באנר עוגיות + ווידג'ט AION + Powered by AION

## 1. הסרת באנר העוגיות
- מסירים את `<CookieConsent />` מ-`src/App.tsx` (שורה 441) ואת ה-import (שורה 38).
- הקובץ `src/components/CookieConsent.tsx` יישאר על הדיסק אך לא ייטען (אפשר למחוק בהמשך).

## 2. "POWERED BY AION" branding
- **Footer** (`MindHackerLanding.tsx`, שורות 397–410): מוסיפים שורה נפרדת זעירה ועדינה: `POWERED BY AION` ב-LTR, letter-spacing רחב, צבע `mh-sand` בעמעום ~60%.
- **TopBar** (שורות 42–51): מוסיפים תג קטן בצד שמאל `· POWERED BY AION` באותו סגנון eyebrow זעיר, כך שבכל גלילה רואים את החתימה של AION כתשתית.

## 3. ווידג'ט צ'אט AION צף בעמוד הבית
כפתור צף בפינה (bottom-start, מעל ה-safe area) שפותח את `IntakeChatModal` הקיים — שזה כבר ה-AION cinematic intake chat. כך לא ממציאים צ'אט שני; מאחדים את כל ה-CTAs לאותה שיחה.

מבנה הכפתור:
- עיגול ~56px, רקע כהה זכוכיתי (`backdrop-blur`, `border` עדין `mh-line`), ללא צל בולט (לפי כללי העיצוב).
- בתוך הכפתור: נקודת `mh-sand` פועמת + כיתוב "AION" זעיר ב-LTR.
- ברירת מחדל מוצג רק מתחת ל-md (מובייל); ב-desktop גם נשאר אבל קטן יותר ובפינה.
- onClick → `setIntakeOpen(true)` (אותה state שכבר קיימת ב-`MindHackerLanding`).
- מסתתר בזמן שה-modal פתוח כדי לא להפריע.

הערה (כללי AION Presence): אופציה מועדפת היא לרנדר `CanonicalAionModel` כאורב ה-AION בתוך הכפתור. אם הקומפוננטה זמינה ולא יקרה ביצועית (קנבס WebGL נוסף בעמוד הבית), נשתמש בה; אחרת — נסתפק בנקודה פועמת + הטקסט "AION" (זה לא chrome, זה landing page, אז fallback מותר).

## קבצים מושפעים

```text
src/App.tsx                                              ← הסרת CookieConsent
src/components/landing/mindhacker/MindHackerLanding.tsx  ← footer + topbar + floating widget
src/components/landing/mindhacker/AionWidgetButton.tsx   ← קומפוננטה חדשה קטנה
```

ללא שינויי DB, ללא שינויי תוכן בצ'אט עצמו (משתמש ב-intake הקיים).
