/**
 * AdvisorTrigger — small brain button that opens the Advisor panel.
 * Renders as a subtle icon in the admin header.
 */
import { Brain } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AdvisorTriggerProps {
  onClick: () => void;
}

export function AdvisorTrigger({ onClick }: AdvisorTriggerProps) {
  const { language } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative h-10 w-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform text-muted-foreground/60 hover:text-primary"
      title={language === 'he' ? 'המוח העסקי' : language === 'es' ? 'Asesor de negocios' : 'Business Advisor'}
    >
      <Brain className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
