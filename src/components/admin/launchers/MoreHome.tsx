/**
 * MoreHome — touch-first card launcher for the More group.
 * System / management surfaces: analytics, settings, users, integrations,
 * notifications, theme, newsletter, affiliates, bug-reports, and a clearly
 * demoted Archive (legacy tools) section.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  BarChart3, Settings, Users as UsersIcon, Plug, Bell, Palette,
  Mail, Handshake, Bug, Archive, Sparkles, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = {
  id: string;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  icon: typeof BarChart3;
  tone?: 'primary' | 'default';
};

const CARDS: Card[] = [
  { id: 'analytics',       titleHe: 'אנליטיקס',     titleEn: 'Analytics',     subtitleHe: 'מספרים, מגמות, קמפיינים',  subtitleEn: 'Numbers & trends',         icon: BarChart3, tone: 'primary' },
  { id: 'settings',        titleHe: 'הגדרות',       titleEn: 'Settings',      subtitleHe: 'כללי, חשבון, שפה',          subtitleEn: 'General, account, language', icon: Settings },
  { id: 'users',           titleHe: 'משתמשים',      titleEn: 'Users',         subtitleHe: 'הרשאות וצוות',              subtitleEn: 'Permissions & team',       icon: UsersIcon },
  { id: 'integrations',    titleHe: 'אינטגרציות',   titleEn: 'Integrations',  subtitleHe: 'WhatsApp, אימייל, תשלום',   subtitleEn: 'WhatsApp, email, pay',     icon: Plug },
  { id: 'notifications',   titleHe: 'התראות',       titleEn: 'Notifications', subtitleHe: 'דחיפה ואימייל',             subtitleEn: 'Push & email',             icon: Bell },
  { id: 'theme',           titleHe: 'ערכת נושא',    titleEn: 'Theme',         subtitleHe: 'צבעים ומיתוג',              subtitleEn: 'Colors & brand',           icon: Palette },
  { id: 'newsletter',      titleHe: 'ניוזלטר',      titleEn: 'Newsletter',    subtitleHe: 'דיוור למצטרפים',            subtitleEn: 'Subscriber blasts',        icon: Mail },
  { id: 'affiliates',      titleHe: 'שותפים',       titleEn: 'Affiliates',    subtitleHe: 'הפניות וקופונים',           subtitleEn: 'Referrals & coupons',      icon: Handshake },
  { id: 'aurora-insights', titleHe: 'תובנות AI',    titleEn: 'AI Insights',   subtitleHe: 'מה Aurora רואה במערכת',     subtitleEn: 'What Aurora sees',         icon: Sparkles },
  { id: 'bug-reports',     titleHe: 'דיווחי באגים', titleEn: 'Bug Reports',   subtitleHe: 'תקלות שמשתמשים שלחו',       subtitleEn: 'User-reported issues',     icon: Bug },
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
    <section className="w-full max-w-5xl mx-auto pb-6">
      <header className="px-1 pb-3">
        <h2 className="text-[18px] md:text-[22px] font-semibold leading-tight">
          {isHe ? 'עוד' : 'More'}
        </h2>
        <p className="text-[12px] md:text-sm text-muted-foreground mt-1">
          {isHe ? 'ניהול חשבון, מערכת ואינטגרציות.' : 'Account, system & integrations.'}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const tone =
            c.tone === 'primary' ? 'border-primary/30 bg-primary/[0.06]'
            : 'border-border/40 bg-card/60';
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => go(c.id)}
              className={cn(
                'group text-start rounded-2xl border backdrop-blur-sm',
                'p-3.5 md:p-4 min-h-[110px] md:min-h-[130px]',
                'flex flex-col gap-2.5 active:scale-[0.98] transition-all',
                'hover:border-foreground/30',
                tone,
              )}
            >
              <div className="rounded-xl bg-muted/60 p-2 w-fit">
                <Icon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] md:text-[15px] font-semibold leading-tight truncate">
                  {isHe ? c.titleHe : c.titleEn}
                </div>
                <div className="text-[11.5px] md:text-[12.5px] text-muted-foreground mt-1 line-clamp-2">
                  {isHe ? c.subtitleHe : c.subtitleEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Advanced / Archive — clearly demoted */}
      <div className="mt-6 pt-4 border-t border-border/40">
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
          {isHe ? 'מתקדם' : 'Advanced'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openArchive}
            className="text-start flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3 hover:bg-muted/50 transition-colors"
          >
            <Archive className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{isHe ? 'ארכיון / כלים ישנים' : 'Archive / legacy tools'}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {isHe ? 'מאמנים, מוצרים, עסקים, FM ועוד' : 'Coach, products, businesses, FM…'}
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="text-start flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3 hover:bg-muted/50 transition-colors"
          >
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{isHe ? 'מעבר לאפליקציה הישנה' : 'Open legacy app'}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {isHe ? 'הסביבה הקודמת של המשתמשים' : 'Previous client environment'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
