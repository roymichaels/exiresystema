# איחוד פלטפורמת המאמן עם האדמין

מאחר שהאתר הוא אפליקציה של מאמן אישי יחיד (האדמין הוא המאמן), אין צורך בשתי מערכות ניהול נפרדות. נאחד הכל תחת `AdminHub`.

## מצב נוכחי

- `/admin-hub` — מערכת אדמין מלאה (סקירה, ניהול, קמפיינים, תוכן, אתר, מערכת).
- `/coaches` → `CareerHub` עם `careerPath="coach"` — מציג CoachHub עם טאבים: דאשבורד, מתאמנים, לידים, מוצרים, תוכן, תוכניות, שיווק, אנליטיקס, דפי נחיתה, הגדרות.
- כפילות אמיתית: לידים, מוצרים, תוכן, דפי נחיתה, אנליטיקס, הגדרות — קיימים בשני המקומות.

## מה לבנות

### 1. טאב חדש ב-AdminHub: "מאמן" (Coach)
מוסיפים טאב עליון חדש ב-`src/domain/admin/tabConfig.ts` עם תתי-טאבים שמושכים את הקומפוננטות הקיימות מ-`@/components/careers/coach/*`:

- סקירה (`CoachDashboardOverview`)
- מתאמנים (`CoachClientsTab`)
- לידים (`CoachLeadsTab`) — מחליף את `admin/Leads` הגנרי
- תוכניות (`CoachPlansTab`)
- שיווק (`CoachMarketingTab`)
- הפרופיל הציבורי (`CoachSettingsTab`) — נהיה "פרופיל המאמן"

הקומפוננטות כבר עצמאיות ועובדות מול ה-coach profile של המשתמש המחובר (האדמין).

### 2. הסרת כפילויות מ-AdminHub
- מוחקים את תת-הטאב `admin/leads` (גנרי) — מוחלף ב-coach/leads.
- מוחקים את תת-הטאב `admin/coaches` (ניהול מאמנים מרובים) — לא רלוונטי.
- משאירים `landing-pages` תחת `site` כי הוא מערכת-רחבה, ו-`CoachLandingPagesTab` נטמע בתוכו או נמחק (לבחירת המשתמש בשאלה למטה).

### 3. ניתוב מחדש של `/coaches`
- `/coaches` → redirect ל-`/admin-hub?tab=coach`.
- `/coaches/:sub` → redirect ל-`/admin-hub?tab=coach&sub=:sub`.
- `CoachHub.tsx`, `Coaches.tsx`, `CoachesLayoutWrapper` — נמחקים (או נשארים כ-thin redirect).
- `CareerHub` נשאר עבור freelancer/creator/business אם רלוונטי, או נמחק לגמרי אם גם הם לא בשימוש.

### 4. ניווט
- מורידים כל קישור ל-`/coaches` מה-nav (אם קיים).
- ה-tab החדש "מאמן" ב-AdminHub זמין לאדמין בלבד (כבר מוגן ע"י `AdminRoute`).

## קבצים מושפעים

```text
src/domain/admin/tabConfig.ts     ← מוסיפים טאב "coach"
src/App.tsx                        ← /coaches → redirect ל-/admin-hub
src/pages/Coaches.tsx              ← נמחק / הופך ל-Navigate
src/pages/CoachHub.tsx             ← נמחק
src/components/careers/coach/CoachesLayoutWrapper.tsx  ← נמחק
src/navigation/canonicalSurfaces.ts ← הסרת קישור מאמנים
```

ה-DB, ה-RLS, וטבלאות `practitioner_*` נשארות כמו שהן — רק שכבת ה-UI מתאחדת.

## שאלות לפני שמתחילים
