import { useSearchParams } from 'react-router-dom';
import {
  Rocket, FileText, ClipboardList, MessageSquare,
  Mic, BookOpen, HelpCircle, Star, Gift, Library,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  icon: typeof Rocket;
  tone?: 'default' | 'primary' | 'good' | 'warn';
};

const MAIN: Card[] = [
  { id: 'exire-funnel', titleHe: 'דף נחיתה', titleEn: 'Funnel Settings', titleEs: 'Config. de Embudo', subtitleHe: 'הגדרות הדף הראשי', subtitleEn: 'Main page settings', subtitleEs: 'Ajustes de página principal', icon: Rocket, tone: 'primary' },
  { id: 'forms', titleHe: 'טפסים', titleEn: 'Forms', titleEs: 'Formularios', subtitleHe: 'חיבור ושאלונים', subtitleEn: 'Integration & surveys', subtitleEs: 'Integración y encuestas', icon: ClipboardList, tone: 'primary' },
  { id: 'templates', titleHe: 'תבניות', titleEn: 'Templates', titleEs: 'Plantillas', subtitleHe: 'הודעות מעדכנות', subtitleEn: 'Message templates', subtitleEs: 'Plantillas de mensajes', icon: MessageSquare, tone: 'primary' },
  { id: 'recordings', titleHe: 'מדיה', titleEn: 'Media', titleEs: 'Medios', subtitleHe: 'הקלטות וסרטונים', subtitleEn: 'Recordings & videos', subtitleEs: 'Grabaciones y videos', icon: Library, tone: 'primary' },
];

const MORE: Card[] = [
  { id: 'videos', titleHe: 'סרטונים', titleEn: 'Videos', titleEs: 'Videos', subtitleHe: 'מאגר הווידאו', subtitleEn: 'Video library', subtitleEs: 'Biblioteca de videos', icon: Mic },
  { id: 'blog', titleHe: 'בלוג', titleEn: 'Blog', titleEs: 'Blog', subtitleHe: 'כתבות חדשות', subtitleEn: 'Articles & posts', subtitleEs: 'Artículos y posts', icon: BookOpen },
  { id: 'faqs', titleHe: 'שאלות נפוצות', titleEn: 'FAQs', titleEs: 'FAQs', subtitleHe: 'תשובות מוכנות', subtitleEn: 'Pre-written answers', subtitleEs: 'Respuestas preparadas', icon: HelpCircle },
  { id: 'testimonials', titleHe: 'המלצות', titleEn: 'Testimonials', titleEs: 'Testimonios', subtitleHe: 'סיפורי הצלחה', subtitleEn: 'Success stories', subtitleEs: 'Historias de éxito', icon: Star },
  { id: 'offers', titleHe: 'הצעות', titleEn: 'Offers', titleEs: 'Ofertas', subtitleHe: 'חבילות מכירה', subtitleEn: 'Packages', subtitleEs: 'Paquetes', icon: Gift },
  { id: 'landing-pages', titleHe: 'דפי נחיתה', titleEn: 'Landing Pages', titleEs: 'Páginas de Aterrizaje', subtitleHe: 'כל דפי הנחיתה', subtitleEn: 'All landing pages', subtitleEs: 'Todas las páginas de aterrizaje', icon: FileText },
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
  const t = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <section className="w-full max-w-[1100px] mx-auto space-y-6 lg:space-y-8">
      <PageHeader
        title={t('סטודיו', 'Studio', 'Estudio')}
        subtitle={t('בנייה וניהול תוכן והגדרות', 'Build and manage content & settings', 'Construir y gestionar contenido y ajustes')}
      />

      <section>
        <SectionHeader title={t('כלים ראשיים', 'Main tools', 'Herramientas principales')} />
        <ActionGrid className="grid-cols-2 lg:grid-cols-4">
          {MAIN.map((c) => (
            <ActionCard
              key={c.id}
              icon={c.icon}
              title={title(c)}
              subtitle={sub(c)}
              tone={c.tone}
              onClick={() => go(c.id)}
            />
          ))}
        </ActionGrid>
      </section>

      <section>
        <SectionHeader title={t('כלים נוספים', 'More tools', 'Herramientas adicionales')} />
        <ActionGrid className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {MORE.map((c) => (
            <ActionCard
              key={c.id}
              icon={c.icon}
              title={title(c)}
              subtitle={sub(c)}
              onClick={() => go(c.id)}
              compact
            />
          ))}
        </ActionGrid>
      </section>
    </section>
  );
}
