/**
 * Quick WhatsApp/Email action bar for a client — opens a template picker per category.
 */
import { MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageTemplatePicker } from './MessageTemplatePicker';
import type { Client } from '@/hooks/useClients';

interface Props { client: Client; intakeLink?: string | null; }

const CATS: Array<{ key: any; label: string }> = [
  { key: 'onboarding',       label: 'אונבורדינג' },
  { key: 'session_prep',     label: 'הכנה לסשן' },
  { key: 'post_session',     label: 'אחרי סשן' },
  { key: 'checkin',          label: 'צ׳ק-אין' },
  { key: 'payment',          label: 'תזכורת תשלום' },
  { key: 'audio_assignment', label: 'הקלטה' },
  { key: 'followup',         label: 'פולואפ' },
];

export default function WhatsAppQuickActions({ client, intakeLink }: Props) {
  const phone = client.whatsapp || client.phone || '';
  const firstName = (client.full_name || '').split(' ')[0] || '';
  const defaults = {
    client_name: client.full_name,
    first_name: firstName,
    intake_link: intakeLink || '',
    coach_name: '',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATS.map((c) => (
        <MessageTemplatePicker
          key={c.key}
          channel="whatsapp"
          category={c.key}
          phone={phone}
          recipientName={client.full_name}
          defaultVars={defaults}
          title={`WhatsApp · ${c.label}`}
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5" disabled={!phone}>
              <MessageCircle className="h-3.5 w-3.5" /> {c.label}
            </Button>
          }
        />
      ))}
      {client.email && (
        <MessageTemplatePicker
          channel="email"
          category="onboarding"
          email={client.email}
          recipientName={client.full_name}
          defaultVars={defaults}
          title="אימייל אונבורדינג"
          trigger={
            <Button size="sm" variant="outline" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" /> שלח אימייל
            </Button>
          }
        />
      )}
    </div>
  );
}
