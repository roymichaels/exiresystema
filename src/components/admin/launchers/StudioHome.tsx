/**
 * StudioHome — touch-first card launcher for the Studio group.
 * Renders large tap-friendly cards that navigate to the existing sub-screens
 * (funnel, landing pages, builder, forms, templates, assets, public content).
 * Used as the default sub-tab when entering "סטודיו".
 */
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Rocket, FileText, ClipboardList, Layers, MessageSquare,
  Mic, Video, BookOpen, HelpCircle, Star, Gift, Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Card = {
  id: string;          // sub-tab id in ADMIN_TABS.studio
  titleHe: string;
  titleEn: string;
  subtitleHe: string;
  subtitleEn: string;
  icon: typeof Rocket;
  tone?: 'primary' | 'good' | 'warn' | 'default';
};

const CARDS: Card[] = [
  { id: 'exire-funnel',     titleHe: 'דף נחיתה',        titleEn: 'Landing',          subtitleHe: 'הגדרות הדף הראשי',          subtitleEn: 'Main funnel settings',     icon: Rocket,        tone: 'primary' },
  { id: 'landing-pages',    titleHe: 'דפי נחיתה',       titleEn: 'Landing Pages',    subtitleHe: 'ניהול וקמפיינים',           subtitleEn: 'Manage & campaigns',       icon: Layers },
  { id: 'landing-builder',  titleHe: 'בונה דפי נחיתה',  titleEn: 'Page Builder',     subtitleHe: 'בנייה חזותית עם AI',         subtitleEn: 'Visual builder with AI',   icon: Wand2 },
  { id: 'forms',            titleHe: 'טפסים',           titleEn: 'Forms',            subtitleHe: 'טפסים, שאלונים, AI',         subtitleEn: 'Forms, quizzes, AI',       icon: ClipboardList },
  { id: 'exire-lead-forms', titleHe: 'מיפוי לידים',     titleEn: 'Lead Mapping',     subtitleHe: 'חיבור טפסים ל־CRM',         subtitleEn: 'Map forms to CRM',         icon: FileText },
  { id: 'templates',        titleHe: 'תבניות הודעה',    titleEn: 'Message Templates',subtitleHe: 'WhatsApp, אימייל',          subtitleEn: 'WhatsApp & email',         icon: MessageSquare },
  { id: 'recordings',       titleHe: 'הקלטות',          titleEn: 'Recordings',       subtitleHe: 'אודיו לסשנים ומשימות',      subtitleEn: 'Audio for sessions',        icon: Mic },
  { id: 'videos',           titleHe: 'סרטונים',         titleEn: 'Videos',           subtitleHe: 'ספריית וידאו',              subtitleEn: 'Video library',            icon: Video },
  { id: 'blog',             titleHe: 'בלוג',            titleEn: 'Blog',             subtitleHe: 'תוכן ציבורי',               subtitleEn: 'Public posts',             icon: BookOpen },
  { id: 'faqs',             titleHe: 'שאלות נפוצות',    titleEn: 'FAQs',             subtitleHe: 'תשובות לדף הנחיתה',         subtitleEn: 'Landing FAQ',              icon: HelpCircle },
  { id: 'testimonials',     titleHe: 'המלצות',          titleEn: 'Testimonials',     subtitleHe: 'סיפורי לקוחות',             subtitleEn: 'Client stories',           icon: Star },
  { id: 'offers',           titleHe: 'הצעות',           titleEn: 'Offers',           subtitleHe: 'חבילות מכירה',              subtitleEn: 'Sales packages',           icon: Gift },
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
    <section className="w-full max-w-5xl mx-auto pb-6">
      <header className="px-1 pb-3">
        <h2 className="text-[18px] md:text-[22px] font-semibold leading-tight">
          {isHe ? 'סטודיו' : 'Studio'}
        </h2>
        <p className="text-[12px] md:text-sm text-muted-foreground mt-1">
          {isHe ? 'כל מה שצריך כדי לבנות ולנהל את המכירה והתוכן.' : 'Everything you need to build and manage funnel & content.'}
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          const tone =
            c.tone === 'primary' ? 'border-primary/30 bg-primary/[0.06]'
            : c.tone === 'good'  ? 'border-emerald-500/25 bg-emerald-500/[0.05]'
            : c.tone === 'warn'  ? 'border-amber-500/25 bg-amber-500/[0.05]'
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
    </section>
  );
}
