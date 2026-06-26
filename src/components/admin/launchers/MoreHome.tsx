/**
 * MoreHome — touch-first card launcher for the More group.
 *
 * IA-7 — three tiers: Primary (large accent), Secondary (compact), Advanced
 * (visually quiet, includes Archive + legacy app).
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BarChart3, Settings, Users as UsersIcon, Plug, Bell, Palette,
  Mail, Handshake, Bug, Archive, Sparkles, ExternalLink, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = {
  id: string;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  icon: typeof BarChart3;
};

const PRIMARY: Card[] = [
  { id: 'settings',     titleHe: 'הגדרות',         titleEn: 'Settings',     subtitleHe: 'כללי וחשבון',          subtitleEn: 'General & account',   icon: Settings },
  { id: 'analytics',    titleHe: 'אנליטיקס',       titleEn: 'Analytics',    subtitleHe: 'מספרים ומגמות',         subtitleEn: 'Numbers & trends',    icon: BarChart3 },
  { id: 'integrations', titleHe: 'אינטגרציות',     titleEn: 'Integrations', subtitleHe: 'WhatsApp, אימייל, תשלום', subtitleEn: 'WhatsApp, mail, pay', icon: Plug },
  { id: 'users',        titleHe: 'משתמשים והרשאות',titleEn: 'Users & Roles',subtitleHe: 'צוות והרשאות',          subtitleEn: 'Team & permissions',  icon: UsersIcon },
];

const SECONDARY: Card[] = [
  { id: 'notifications',   titleHe: 'התראות',       titleEn: 'Notifications', subtitleHe: 'דחיפה ואימייל',     subtitleEn: 'Push & email',       icon: Bell },
  { id: 'theme',           titleHe: 'ערכת נושא',    titleEn: 'Theme',         subtitleHe: 'צבעים ומיתוג',       subtitleEn: 'Colors & brand',     icon: Palette },
  { id: 'newsletter',      titleHe: 'ניוזלטר',      titleEn: 'Newsletter',    subtitleHe: 'דיוור',              subtitleEn: 'Blasts',             icon: Mail },
  { id: 'affiliates',      titleHe: 'שותפים',       titleEn: 'Affiliates',    subtitleHe: 'הפניות וקופונים',    subtitleEn: 'Referrals',          icon: Handshake },
  { id: 'aurora-insights', titleHe: 'תובנות AI',    titleEn: 'AI Insights',   subtitleHe: 'מה Aurora רואה',     subtitleEn: 'What Aurora sees',   icon: Sparkles },
  { id: 'bug-reports',     titleHe: 'דיווחי באגים', titleEn: 'Bug Reports',   subtitleHe: 'תקלות ממשתמשים',     subtitleEn: 'User issues',        icon: Bug },
];

export default function MoreHome() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const go = (subId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'more');
    params.set('sub', subId);
    setSearchParams(params, { replace: true });
  };

  const openArchive = () => {
    const params = new URLSearchParams();
    params.set('tab', 'legacy');
    setSearchParams(params, { replace: true });
  };

  return (
    <section className="w-full max-w-5xl mx-auto pb-6 space-y-5">
      <header className="px-1">
        <h2 className="text-[17px] md:text-[20px] font-semibold leading-tight">
          {isHe ? 'עוד' : 'More'}
        </h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {isHe ? 'חשבון, מערכת ואינטגרציות.' : 'Account, system & integrations.'}
        </p>
      </header>

      {/* Primary — large, accent border */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
        {PRIMARY.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => go(c.id)}
              className={cn(
                'group text-start rounded-2xl border border-primary/25 bg-primary/[0.05]',
                'p-3.5 md:p-4 min-h-[96px] md:min-h-[112px]',
                'flex flex-col gap-2 active:scale-[0.98] transition-all',
                'hover:border-primary/40',
              )}
            >
              <div className="rounded-xl bg-primary/10 p-1.5 w-fit">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] md:text-[15px] font-semibold leading-tight truncate">
                  {isHe ? c.titleHe : c.titleEn}
                </div>
                <div className="text-[11px] md:text-[12px] text-muted-foreground mt-0.5 truncate">
                  {isHe ? c.subtitleHe : c.subtitleEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary — quieter row */}
      <div>
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
          {isHe ? 'נוסף' : 'More'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {SECONDARY.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => go(c.id)}
                className={cn(
                  'group text-start rounded-xl border border-border/40 bg-card/40',
                  'px-3 py-2.5 min-h-[64px]',
                  'flex items-center gap-2.5 active:scale-[0.98] transition-all',
                  'hover:bg-card/70 hover:border-border/70',
                )}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.6} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium leading-tight truncate">
                    {isHe ? c.titleHe : c.titleEn}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {isHe ? c.subtitleHe : c.subtitleEn}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced — clearly quiet */}
      <div className="pt-3 border-t border-border/30">
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/60">
          {isHe ? 'מתקדם' : 'Advanced'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={openArchive}
            className="text-start flex items-center gap-2.5 rounded-lg bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
          >
            <Archive className="h-3.5 w-3.5 text-muted-foreground/70" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium truncate text-foreground/80">
                {isHe ? 'ארכיון / כלים ישנים' : 'Archive / legacy tools'}
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-start flex items-center gap-2.5 rounded-lg bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/70" />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium truncate text-foreground/80">
                {isHe ? 'אפליקציה ישנה' : 'Legacy app'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
