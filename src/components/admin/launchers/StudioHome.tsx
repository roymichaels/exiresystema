import { useSearchParams } from 'react-router-dom';
import {
  Rocket, FileText, ClipboardList, MessageSquare,
  Mic, BookOpen, HelpCircle, Star, Gift, Library,
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
  icon: typeof Rocket;
  accent?: 'purple' | 'blue' | 'cyan' | 'emerald' | 'amber';
};

const ACCENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/30' },
  blue: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const PRIMARY: Card[] = [
  { id: 'exire-funnel', titleHe: 'דף נחיתה', titleEn: 'Funnel Settings', titleEs: 'Config. de Embudo', subtitleHe: 'הגדרות הדף הראשי', subtitleEn: 'Main page settings', subtitleEs: 'Ajustes de página principal', icon: Rocket, accent: 'purple' },
  { id: 'forms', titleHe: 'טפסים', titleEn: 'Forms', titleEs: 'Formularios', subtitleHe: 'חיבור ושאלונים', subtitleEn: 'Integration & surveys', subtitleEs: 'Integración y encuestas', icon: ClipboardList, accent: 'blue' },
  { id: 'templates', titleHe: 'תבניות', titleEn: 'Templates', titleEs: 'Plantillas', subtitleHe: 'הודעות מעדכנות', subtitleEn: 'Message templates', subtitleEs: 'Plantillas de mensajes', icon: MessageSquare, accent: 'cyan' },
  { id: 'recordings', titleHe: 'מדיה', titleEn: 'Media', titleEs: 'Medios', subtitleHe: 'הקלטות וסרטונים', subtitleEn: 'Recordings & videos', subtitleEs: 'Grabaciones y videos', icon: Library, accent: 'emerald' },
];

const SECONDARY: Card[] = [
  { id: 'videos', titleHe: 'סרטונים', titleEn: 'Videos', titleEs: 'Videos', subtitleHe: 'מאגר הווידאו', subtitleEn: 'Video library', subtitleEs: 'Biblioteca de videos', icon: Mic, accent: 'purple' },
  { id: 'blog', titleHe: 'בלוג', titleEn: 'Blog', titleEs: 'Blog', subtitleHe: 'כתבות חדשות', subtitleEn: 'Articles & posts', subtitleEs: 'Artículos y posts', icon: BookOpen, accent: 'blue' },
  { id: 'faqs', titleHe: 'שאלות נפוצות', titleEn: 'FAQs', titleEs: 'FAQs', subtitleHe: 'תשובות מוכנות', subtitleEn: 'Pre-written answers', subtitleEs: 'Respuestas preparadas', icon: HelpCircle, accent: 'cyan' },
  { id: 'testimonials', titleHe: 'המלצות', titleEn: 'Testimonials', titleEs: 'Testimonios', subtitleHe: 'סיפורי הצלחה', subtitleEn: 'Success stories', subtitleEs: 'Historias de éxito', icon: Star, accent: 'amber' },
  { id: 'offers', titleHe: 'הצעות', titleEn: 'Offers', titleEs: 'Ofertas', subtitleHe: 'חבילות מכירה', subtitleEn: 'Packages', subtitleEs: 'Paquetes', icon: Gift, accent: 'purple' },
];

export default function StudioHome() {
  const { language } = useTranslation();
  const [, setSearchParams] = useSearchParams();

  const go = (subId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'studio');
    params.set('sub', subId);
    setSearchParams(params, { replace: true });
  };

  const title = (c: Card) => language === 'he' ? c.titleHe : language === 'es' ? c.titleEs : c.titleEn;
  const sub = (c: Card) => language === 'he' ? c.subtitleHe : language === 'es' ? c.subtitleEs : c.subtitleEn;
  const accent = (c: Card) => ACCENT_COLORS[c.accent || 'purple'];
  const t = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <section className="w-full max-w-[1100px] mx-auto space-y-6">
      <header className="px-1">
        <h2 className="text-[18px] md:text-[22px] font-bold leading-tight">{t('סטודיו', 'Studio', 'Estudio')}</h2>
        <p className="text-[12px] md:text-sm text-muted-foreground mt-1">
          {t('בנייה וניהול תוכן והגדרות', 'Build and manage content & settings', 'Construir y gestionar contenido y ajustes')}
        </p>
      </header>

      {/* Primary actions - Level 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
        {PRIMARY.map((c) => {
          const Icon = c.icon;
          const a = accent(c);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => go(c.id)}
              className={cn(
                'group text-start rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm',
                'p-3.5 md:p-4 min-h-[92px] md:min-h-[112px]',
                'flex flex-col gap-2 transition-all duration-150',
                'hover:border-primary/50 hover:bg-card/80 hover:-translate-y-0.5',
                'active:scale-[0.98]',
              )}
            >
              <div className={cn('rounded-xl p-1.5 w-fit', a.bg)}>
                <Icon className={cn('h-4.5 w-4.5 md:h-5 md:w-5', a.text)} strokeWidth={1.6} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] md:text-[15px] font-semibold leading-tight truncate">{title(c)}</div>
                <div className="text-[10.5px] md:text-[11px] text-muted-foreground mt-0.5 truncate">{sub(c)}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary actions - Level 4 */}
      <div>
        <div className="px-1 pb-2 text-[11px] tracking-[0.15em] uppercase text-muted-foreground/60 font-medium">
          {t('כלים נוספים', 'More tools', 'Herramientas adicionales')}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {SECONDARY.map((c) => {
            const Icon = c.icon;
            const a = accent(c);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => go(c.id)}
                className={cn(
                  'group text-start rounded-xl border border-border/30 bg-card/40',
                  'px-3 py-2.5 min-h-[64px]',
                  'flex items-center gap-2.5 transition-all duration-150',
                  'hover:border-border/50 hover:bg-card/60 hover:-translate-y-0.5',
                  'active:scale-[0.98]',
                )}
              >
                <Icon className={cn('h-4 w-4', a.text)} strokeWidth={1.6} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium leading-tight truncate">{title(c)}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{sub(c)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
