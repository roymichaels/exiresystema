/**
 * AdvisorCard — Today launcher card for "המוח העסקי".
 * Level 1 hero: The AI brain of BizOS.
 */
import { useSearchParams } from 'react-router-dom';
import { Brain, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdvisorCard({ className }: { className?: string }) {
  const { language } = useTranslation();
  const [, setParams] = useSearchParams();
  const open = (seed?: string) => {
    const p = new URLSearchParams();
    p.set('tab', 'more');
    p.set('sub', 'advisor');
    if (seed) p.set('seed', seed);
    setParams(p, { replace: true });
  };

  const t = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <section
      className={cn(
        'relative rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/[0.12] via-card/80 to-background/90',
        'p-4 md:p-5 shadow-xl shadow-primary/10',
        'overflow-hidden',
        className,
      )}
    >
      {/* Subtle glow effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

      <div className="relative flex items-start gap-3.5">
        <div className="rounded-2xl bg-primary/20 p-2.5 shrink-0 shadow-inner shadow-primary/10">
          <Brain className="h-6 w-6 text-primary" strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[16px] md:text-lg font-bold leading-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('המוח העסקי', 'Business Brain', 'Cerebro de Negocio')}
            </h3>
            <span className="text-[10px] text-muted-foreground rounded-full bg-primary/[0.08] border border-primary/30 px-2.5 py-1 font-medium">
              {t('AI Assistant', 'AI Assistant', 'Asistente IA')}
            </span>
          </div>
          <p className="text-[12.5px] md:text-[13px] text-muted-foreground mt-1">
            {t('אסטרטגיה, ניתוח לידים, המלצות עסקיות בזמן אמת', 'Strategy, lead analysis, real-time business insights', 'Estrategia, análisis de leads, insights en tiempo real')}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {(language === 'he' ? ['לידים', 'כסף', 'משפך', 'סשנים'] : language === 'es' ? ['Leads', 'Ingresos', 'Embudo', 'Sesiones'] : ['Leads', 'Revenue', 'Funnel', 'Sessions']).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => open(c)}
                className={cn(
                  'text-[11px] rounded-full border border-primary/40 bg-primary/[0.08]',
                  'px-2.5 py-1 font-medium text-primary',
                  'hover:bg-primary/20 hover:border-primary/60 hover:scale-[1.03] transition-all active:scale-[0.97]',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => open()}
              className={cn(
                'rounded-xl px-4 h-9 font-semibold shadow-lg shadow-primary/20',
                'bg-primary hover:bg-primary/90',
              )}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {t('שאל את המוח', 'Ask the Brain', 'Preguntar al Cerebro')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
