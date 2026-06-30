/**
 * MoreHome — touch-first card launcher for the More group.
 *
 * IA-7 — three tiers: Core, Additional, Advanced.
 */
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BarChart3, Settings, Users as UsersIcon, Plug, Bell, Palette,
  Mail, Handshake, Bug, Archive, Sparkles, ExternalLink, Brain,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageHeader, SectionHeader, ActionCard, ActionGrid } from '@/components/admin/design-system';

type Card = {
  id: string;
  titleHe: string;
  titleEn: string;
  titleEs: string;
  subtitleHe: string;
  subtitleEn: string;
  subtitleEs: string;
  icon: typeof BarChart3;
  tone?: 'default' | 'primary';
};

const CORE: Card[] = [
  { id: 'advisor', titleHe: 'המוח העסקי', titleEn: 'Business Brain', titleEs: 'Cerebro IA', subtitleHe: 'אסטרטגיה ותובנות', subtitleEn: 'AI strategy & insights', subtitleEs: 'Estrategia y perspectivas IA', icon: Brain, tone: 'primary' },
  { id: 'settings', titleHe: 'הגדרות', titleEn: 'Settings', titleEs: 'Ajustes', subtitleHe: 'חשבון ומערכת', subtitleEn: 'Account & system', subtitleEs: 'Cuenta y sistema', icon: Settings },
  { id: 'analytics', titleHe: 'אנליטיקס', titleEn: 'Analytics', titleEs: 'Analíticas', subtitleHe: 'מגמות ותבניות', subtitleEn: 'Trends & metrics', subtitleEs: 'Tendencias y métricas', icon: BarChart3 },
  { id: 'integrations', titleHe: 'אינטגרציות', titleEn: 'Integrations', titleEs: 'Integraciones', subtitleHe: 'WhatsApp ותשלום', subtitleEn: 'WhatsApp & payments', subtitleEs: 'WhatsApp y pagos', icon: Plug },
  { id: 'users', titleHe: 'משתמשים', titleEn: 'Users', titleEs: 'Usuarios', subtitleHe: 'צוות והרשאות', subtitleEn: 'Team & roles', subtitleEs: 'Equipo y roles', icon: UsersIcon },
];

const ADDITIONAL: Card[] = [
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

  const sectionTitle = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <section className="w-full max-w-[1100px] mx-auto pb-6 space-y-5 lg:space-y-8">
      <PageHeader
        title={language === 'he' ? 'עוד' : language === 'es' ? 'Más' : 'More'}
        subtitle={language === 'he' ? 'חשבון, מערכת ואינטגרציות.' : language === 'es' ? 'Cuenta, sistema e integraciones.' : 'Account, system & integrations.'}
      />

      <section>
        <SectionHeader title={sectionTitle('ליבה', 'Core', 'Núcleo')} />
        <ActionGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {CORE.map((c) => (
            <ActionCard
              key={c.id}
              icon={c.icon}
              title={t(c, 'title')}
              subtitle={t(c, 'sub')}
              tone={c.tone}
              onClick={() => go(c.id)}
            />
          ))}
        </ActionGrid>
      </section>

      <section>
        <SectionHeader title={sectionTitle('נוסף', 'Additional', 'Adicional')} />
        <ActionGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {ADDITIONAL.map((c) => (
            <ActionCard
              key={c.id}
              icon={c.icon}
              title={t(c, 'title')}
              subtitle={t(c, 'sub')}
              onClick={() => go(c.id)}
              compact
            />
          ))}
        </ActionGrid>
      </section>

      <section>
        <SectionHeader title={sectionTitle('מתקדם', 'Advanced', 'Avanzado')} />
        <ActionGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
          <ActionCard
            icon={Archive}
            title={sectionTitle('ארכיון / כלים ישנים', 'Archive / Legacy tools', 'Archivo / Herramientas antiguas')}
            subtitle={sectionTitle('גישה לכלים הישנים', 'Access legacy tooling', 'Acceder a herramientas antiguas')}
            onClick={openArchive}
            compact
          />
          <ActionCard
            icon={ExternalLink}
            title={sectionTitle('אפליקציה ישנה', 'Legacy app', 'App antigua')}
            subtitle={sectionTitle('חזרה לאפליקציה הראשית', 'Back to main app', 'Volver a la app principal')}
            onClick={() => navigate('/home')}
            compact
          />
        </ActionGrid>
      </section>
    </section>
  );
}
