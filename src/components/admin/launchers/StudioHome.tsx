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
};

const PRIMARY: Card[] = [
  { id: 'exire-funnel', titleHe: 'דף נחיתה',         titleEn: 'Funnel Settings',  titleEs: 'Config. de Embudo',      subtitleHe: 'הגדרות הדף הראשי', subtitleEn: 'Main page settings', subtitleEs: 'Ajustes de página principal', icon: Rocket },
  { id: 'forms',        titleHe: 'טפסים',            titleEn: 'Forms',             titleEs: 'Formularios',            subtitleHe: 'טפסים ושאלונים',  subtitleEn: 'Forms & surveys',    subtitleEs: 'Formularios y encuestas',       icon: ClipboardList },
  { id: 'templates',    titleHe: 'תבניות הודעה',     titleEn: 'Message Templates', titleEs: 'Plantillas',             subtitleHe: 'WhatsApp ואימייל', subtitleEn: 'WhatsApp & email',   subtitleEs: 'WhatsApp y correo',             icon: MessageSquare },
  { id: 'recordings',   titleHe: 'מדיה',              titleEn: 'Media',            titleEs: 'Medios',                  subtitleHe: 'הקלטות וסרטונים', subtitleEn: 'Recordings & videos',subtitleEs: 'Grabaciones y videos',           icon: Library },
];

const SECONDARY: Card[] = [
  { id: 'videos',           titleHe: 'סרטונים',        titleEn: 'Videos',         titleEs: 'Videos',          subtitleHe: 'ספריית וידאו',       subtitleEn: 'Video library',      subtitleEs: 'Biblioteca de videos',    icon: Mic },
  { id: 'blog',             titleHe: 'בלוג',           titleEn: 'Blog',            titleEs: 'Blog',            subtitleHe: 'תוכן ציבורי',        subtitleEn: 'Public content',     subtitleEs: 'Contenido público',       icon: BookOpen },
  { id: 'faqs',             titleHe: 'שאלות נפוצות',   titleEn: 'FAQs',            titleEs: 'Preguntas Frecuentes', subtitleHe: 'תשובות לפאנל',       subtitleEn: 'Panel answers',      subtitleEs: 'Respuestas del panel',    icon: HelpCircle },
  { id: 'testimonials',     titleHe: 'המלצות',         titleEn: 'Testimonials',    titleEs: 'Testimonios',     subtitleHe: 'סיפורי לקוחות',      subtitleEn: 'Client stories',     subtitleEs: 'Historias de clientes',   icon: Star },
  { id: 'offers',           titleHe: 'הצעות',          titleEn: 'Offers',          titleEs: 'Ofertas',         subtitleHe: 'חבילות מכירה',       subtitleEn: 'Sales packages',     subtitleEs: 'Paquetes de venta',        icon: Gift },
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

  return (
    <section className="w-full max-w-5xl mx-auto pb-6 space-y-5">
      <header className="px-1">
        <h2 className="text-[17px] md:text-[20px] font-semibold leading-tight">
          {language === 'he' ? 'סטודיו' : language === 'es' ? 'Estudio' : 'Studio'}
        </h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {language === 'he' ? 'בנייה וניהול של פאנל ותוכן.' : language === 'es' ? 'Construcción y gestión de paneles y contenido.' : 'Build and manage panels and content.'}
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
                  {title(c)}
                </div>
                <div className="text-[11px] md:text-[12px] text-muted-foreground mt-0.5 truncate">
                  {sub(c)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
          {language === 'he' ? 'עוד כלים' : language === 'es' ? 'Más herramientas' : 'More tools'}
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
                    {title(c)}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground truncate">
                    {sub(c)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
