/**
 * AdvisorCard — Today launcher card for "המוח העסקי".
 * Navigates to the Advisor page (admin/more/advisor). Not a floating widget.
 */
import { useSearchParams } from 'react-router-dom';
import { Brain, ArrowLeft } from 'lucide-react';
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

  return (
    <section
      className={cn(
        'rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]',
        'p-3.5 md:p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/15 p-2 shrink-0">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14.5px] md:text-[15px] font-semibold leading-tight">{language === 'he' ? 'המוח העסקי' : language === 'es' ? 'Asesor de negocios' : 'Business Advisor'}</h3>
            <span className="text-[10px] text-muted-foreground/80 rounded-full bg-muted/40 px-2 py-0.5">
              {language === 'he' ? 'קריאה-בלבד' : language === 'es' ? 'Solo lectura' : 'Read-only'}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground mt-0.5">{language === 'he' ? 'שאל מה הדבר הבא בעסק' : language === 'es' ? 'Pregunta qué sigue en tu negocio' : 'Ask what\'s next in your business'}</p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(language === 'he'
              ? ['לידים', 'כסף', 'משפך']
              : language === 'es'
              ? ['Leads', 'Dinero', 'Embudo']
              : ['Leads', 'Money', 'Funnel']
            ).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => open(c)}
                className="text-[11.5px] rounded-full border border-border/50 bg-card/70 px-2.5 py-1 hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>


          <div className="mt-3">
            <Button size="sm" onClick={() => open()} className="rounded-xl">
              {language === 'he' ? 'שאל את המוח' : language === 'es' ? 'Preguntar al asesor' : 'Ask the Advisor'}
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
