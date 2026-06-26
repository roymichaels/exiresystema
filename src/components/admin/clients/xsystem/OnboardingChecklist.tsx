/**
 * Onboarding checklist for a converted client. Derived from existing records.
 */
import { Check, Circle, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Item { label: string; done: boolean; hint?: string }

export default function OnboardingChecklist({
  hasIntake, hasFirstSession, hasPayment, hasAudio, contactInfoOk,
}: {
  hasIntake: boolean;
  hasFirstSession: boolean;
  hasPayment: boolean;
  hasAudio: boolean;
  contactInfoOk: boolean;
}) {
  const items: Item[] = [
    { label: 'פרטי התקשרות מלאים', done: contactInfoOk },
    { label: 'טופס קבלה שויך', done: hasIntake, hint: hasIntake ? '' : 'שייך טופס בלשונית "אינטייק"' },
    { label: 'סשן ראשון נקבע', done: hasFirstSession, hint: hasFirstSession ? '' : 'צור סשן בלשונית "סשנים"' },
    { label: 'תשלום ראשון נרשם', done: hasPayment, hint: hasPayment ? '' : 'הוסף תשלום בלשונית "תשלומים"' },
    { label: 'הקלטה אישית הוקצתה', done: hasAudio, hint: hasAudio ? '' : 'הוסף הקצאה בלשונית "הקלטות"' },
  ];
  const completed = items.filter((i) => i.done).length;

  return (
    <Card className="border-border/50">
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>אונבורדינג</span>
          <span className="text-xs text-muted-foreground">{completed}/{items.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-start gap-2 text-sm">
            {it.done
              ? <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className={it.done ? 'text-muted-foreground line-through' : ''}>{it.label}</div>
              {!it.done && it.hint && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ChevronLeft className="h-3 w-3" />{it.hint}
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
