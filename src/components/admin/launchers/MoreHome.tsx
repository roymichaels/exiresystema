/**
 * MoreHome — touch-first card launcher for the More group.
 *
 * IA-7 — three tiers: Primary (large accent), Secondary (compact), Advanced
 * (visually quiet, includes Archive + legacy app).
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3, Settings, Users as UsersIcon, Plug, Bell, Palette,
  Mail, Handshake, Bug, Archive, Sparkles, ExternalLink, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

type Card = {
  id: string;
  titleHe: string;
  titleEn: string;
  titleEs: string;
  subtitleHe: string;
  subtitleEn: string;
  subtitleEs: string;
  icon: typeof BarChart3;
};

const PRIMARY: Card[] = [
  { id: 'advisor',      titleHe: 'המוח העסקי',     titleEn: 'Advisor',        titleEs: 'Asesor',            subtitleHe: 'אסטרטגיה ופעולות להיום', subtitleEn: 'Strategy & daily actions',  subtitleEs: 'Estrategia y acciones diarias', icon: Brain },
  { id: 'settings',     titleHe: 'הגדרות',         titleEn: 'Settings',       titleEs: 'Ajustes',           subtitleHe: 'כללי וחשבון',           subtitleEn: 'General & account',          subtitleEs: 'General y cuenta',            icon: Settings },
  { id: 'analytics',    titleHe: 'אנליטיקס',       titleEn: 'Analytics',      titleEs: 'Analíticas',        subtitleHe: 'מספרים ומגמות',         subtitleEn: 'Numbers & trends',           subtitleEs: 'Números y tendencias',        icon: BarChart3 },
  { id: 'integrations', titleHe: 'אינטגרציות',     titleEn: 'Integrations',   titleEs: 'Integraciones',     subtitleHe: 'WhatsApp, אימייל, תשלום', subtitleEn: 'WhatsApp, email, payments',  subtitleEs: 'WhatsApp, correo, pagos',     icon: Plug },
  { id: 'users',        titleHe: 'משתמשים והרשאות',titleEn: 'Users & Roles',  titleEs: 'Usuarios y Roles',  subtitleHe: 'צוות והרשאות',          subtitleEn: 'Team & permissions',         subtitleEs: 'Equipo y permisos',           icon: UsersIcon },
];

const SECONDARY: Card[] = [
  { id: 'notifications',   titleHe: 'התראות',       titleEn: 'Notifications',  titleEs: 'Notificaciones',    subtitleHe: 'דחיפה ואימייל',          subtitleEn: 'Push & email',             subtitleEs: 'Push y correo',               icon: Bell },
  { id: 'theme',           titleHe: 'ערכת נושא',    titleEn: 'Theme',          titleEs: 'Tema',              subtitleHe: 'צבעים ומיתוג',           subtitleEn: 'Colors & branding',        subtitleEs: 'Colores y marca',             icon: Palette },
  { id: 'newsletter',      titleHe: 'ניוזלטר',      titleEn: 'Newsletter',     titleEs: 'Boletín',           subtitleHe: 'דיוור',                  subtitleEn: 'Email campaigns',          subtitleEs: 'Campañas de correo',          icon: Mail },
  { id: 'affiliates',      titleHe: 'שותפים',       titleEn: 'Affiliates',     titleEs: 'Afiliados',         subtitleHe: 'הפניות וקופונים',        subtitleEn: 'Referrals & coupons',      subtitleEs: 'Referidos y cupones',         icon: Handshake },
  { id: 'aurora-insights', titleHe: 'תובנות AI',    titleEn: 'AI Insights',    titleEs: 'Perspectivas AI',   subtitleHe: 'מה Aurora רואה',         subtitleEn: 'What Aurora sees',         subtitleEs: 'Lo que Aurora ve',            icon: Sparkles },
  { id: 'bug-reports',     titleHe: 'דיווחי באגים', titleEn: 'Bug Reports',    titleEs: 'Informes de Errores', subtitleHe: 'תקלות ממשתמשים',       subtitleEn: 'User-submitted issues',   subtitleEs: 'Problemas de usuarios',       icon: Bug },
];

export default function MoreHome() {
  const { language } = useTranslation();
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

  const t = (c: Card, kind: 'title' | 'sub') => {
    const map = kind === 'title' ? [c.titleHe, c.titleEn, c.titleEs] : [c.subtitleHe, c.subtitleEn, c.subtitleEs];
    return language === 'he' ? map[0] : language === 'es' ? map[2] : map[1];
  };

  return (
    <section className="w-full max-w-5xl mx-auto pb-6 space-y-5">
      <header className="px-1">
        <h2 className="text-[17px] md:text-[20px] font-semibold leading-tight">
          {language === 'he' ? 'עוד' : language === 'es' ? 'Más' : 'More'}
        </h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {language === 'he' ? 'חשבון, מערכת ואינטגרציות.' : language === 'es' ? 'Cuenta, sistema e integraciones.' : 'Account, system & integrations.'}
        </p>
      </header>

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
                  {t(c, 'title')}
                </div>
                <div className="text-[11px] md:text-[12px] text-muted-foreground mt-0.5 truncate">
                  {t(c, 'sub')}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
          {language === 'he' ? 'נוסף' : language === 'es' ? 'Adicional' : 'Additional'}
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
                    {t(c, 'title')}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {t(c, 'sub')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-border/30">
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/60">
          {language === 'he' ? 'מתקדם' : language === 'es' ? 'Avanzado' : 'Advanced'}
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
                {language === 'he' ? 'ארכיון / כלים ישנים' : language === 'es' ? 'Archivo / Herramientas antiguas' : 'Archive / Legacy tools'}
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
                {language === 'he' ? 'אפליקציה ישנה' : language === 'es' ? 'App antigua' : 'Legacy app'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
