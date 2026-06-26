/**
 * StudioHome — touch-first card launcher for the Studio group.
 *
 * IA-7 — hierarchical: Primary (large, brand-accent) cards on top, then a
 * quieter "More tools" grid. No equal-weight wall of cards.
 */
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Rocket, FileText, ClipboardList, Layers, MessageSquare,
  Mic, BookOpen, HelpCircle, Star, Gift, Wand2, Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = {
  id: string;
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  icon: typeof Rocket;
};

const PRIMARY: Card[] = [
  { id: 'exire-funnel', titleHe: 'דף נחיתה',     titleEn: 'Landing',          subtitleHe: 'הגדרות הדף הראשי',  subtitleEn: 'Main funnel',        icon: Rocket },
  { id: 'forms',        titleHe: 'טפסים',        titleEn: 'Forms',            subtitleHe: 'טפסים ושאלונים',    subtitleEn: 'Forms & quizzes',    icon: ClipboardList },
  { id: 'templates',    titleHe: 'תבניות הודעה', titleEn: 'Message Templates',subtitleHe: 'WhatsApp ואימייל',  subtitleEn: 'WhatsApp & email',   icon: MessageSquare },
  { id: 'recordings',   titleHe: 'מדיה',         titleEn: 'Media',            subtitleHe: 'הקלטות וסרטונים',   subtitleEn: 'Audio & video',      icon: Library },
];

// Landing-related sub-actions exposed UNDER the main "דף נחיתה" card,
// so we don't have 3 equal-weight cards (דף נחיתה / דפי נחיתה / בונה דף נחיתה).
const LANDING_ACTIONS: { id: string; labelHe: string; labelEn: string; icon: typeof Rocket }[] = [
  { id: 'landing-pages',    labelHe: 'דפי נחיתה',  labelEn: 'Pages',   icon: Layers },
  { id: 'landing-builder',  labelHe: 'בונה דפים',  labelEn: 'Builder', icon: Wand2  },
  { id: 'exire-lead-forms', labelHe: 'מיפוי לידים',labelEn: 'Mapping', icon: FileText },
];

const SECONDARY: Card[] = [
  { id: 'videos',           titleHe: 'סרטונים',        titleEn: 'Videos',        subtitleHe: 'ספריית וידאו',     subtitleEn: 'Video library',  icon: Mic },
  { id: 'blog',             titleHe: 'בלוג',           titleEn: 'Blog',          subtitleHe: 'תוכן ציבורי',     subtitleEn: 'Public posts',    icon: BookOpen },
  { id: 'faqs',             titleHe: 'שאלות נפוצות',   titleEn: 'FAQs',          subtitleHe: 'תשובות לפאנל',    subtitleEn: 'Landing FAQ',     icon: HelpCircle },
  { id: 'testimonials',     titleHe: 'המלצות',         titleEn: 'Testimonials',  subtitleHe: 'סיפורי לקוחות',   subtitleEn: 'Client stories',  icon: Star },
  { id: 'offers',           titleHe: 'הצעות',          titleEn: 'Offers',        subtitleHe: 'חבילות מכירה',    subtitleEn: 'Packages',        icon: Gift },
];

export default function StudioHome() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const [, setSearchParams] = useSearchParams();

  const go = (subId: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'studio');
    params.set('sub', subId);
    setSearchParams(params, { replace: true });
  };

  return (
    <section className="w-full max-w-5xl mx-auto pb-6 space-y-5">
      <header className="px-1">
        <h2 className="text-[17px] md:text-[20px] font-semibold leading-tight">
          {isHe ? 'סטודיו' : 'Studio'}
        </h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          {isHe ? 'בנייה וניהול של פאנל ותוכן.' : 'Build and manage funnel & content.'}
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

      {/* Landing sub-actions — quiet pills under the main Landing card */}
      <div className="-mt-2 flex flex-wrap gap-1.5 px-1">
        {LANDING_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => go(a.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-card/30 px-2.5 py-1 text-[11px] text-foreground/70 hover:bg-card/60 hover:text-foreground transition-colors"
            >
              <Icon className="h-3 w-3 opacity-70" strokeWidth={1.6} />
              {isHe ? a.labelHe : a.labelEn}
            </button>
          );
        })}
      </div>


      {/* Secondary — quieter, smaller */}
      <div>
        <div className="px-1 pb-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground/70">
          {isHe ? 'עוד כלים' : 'More tools'}
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
    </section>
  );
}
