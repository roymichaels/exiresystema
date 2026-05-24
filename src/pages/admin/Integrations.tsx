import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageCircle, Calendar, CreditCard, Save, Plug } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import IntegrationCard from '@/components/admin/integrations/IntegrationCard';
import {
  useCoachIntegrations, useSaveCoachIntegrations, useIntegrationStatus,
} from '@/hooks/useCoachIntegrations';

const Integrations = () => {
  const { data: status, isLoading: statusLoading, refetch } = useIntegrationStatus();
  const { data: integ } = useCoachIntegrations();
  const save = useSaveCoachIntegrations();

  const [form, setForm] = useState({
    email_from: integ?.email_from ?? '',
    email_signature: integ?.email_signature ?? '',
    twilio_whatsapp_from: integ?.twilio_whatsapp_from ?? '',
    default_calendar_id: integ?.default_calendar_id ?? 'primary',
    default_session_duration_min: integ?.default_session_duration_min ?? 60,
    default_session_price_usd: integ?.default_session_price_usd ?? 150,
  });

  // sync once when integ first arrives
  if (integ && form.email_from === '' && integ.email_from) {
    setForm({
      email_from: integ.email_from ?? '',
      email_signature: integ.email_signature ?? '',
      twilio_whatsapp_from: integ.twilio_whatsapp_from ?? '',
      default_calendar_id: integ.default_calendar_id ?? 'primary',
      default_session_duration_min: integ.default_session_duration_min ?? 60,
      default_session_price_usd: integ.default_session_price_usd ?? 150,
    });
  }

  const handleSave = () => save.mutate(form);

  const testEmail = async () => {
    const to = prompt('Send test email to:');
    if (!to) return;
    const { data, error } = await supabase.functions.invoke('send-coach-email', {
      body: { to, subject: 'Test from Exire Systema', text: 'This is a test email.' },
    });
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || 'Failed');
    } else {
      toast.success('Test email sent');
    }
  };

  const testWhatsApp = async () => {
    const to = prompt('Send test WhatsApp to (E.164, e.g. +15551234567):');
    if (!to) return;
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { to, body: 'Test from Exire Systema 👋' },
    });
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || 'Failed');
    } else {
      toast.success('Test WhatsApp sent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Integrations</h2>
            <p className="text-sm text-muted-foreground">
              Connect the tools your coaching business runs on.
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Refresh status</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <IntegrationCard
          icon={Mail}
          name="Email (Resend)"
          description="Send branded email to leads & clients from the CRM."
          status={status?.email}
          isLoading={statusLoading}
          onTest={testEmail}
          helpUrl="https://resend.com/domains"
        >
          <div className="space-y-2">
            <Label className="text-xs">From address</Label>
            <Input
              placeholder="Coach Name <hello@yourdomain.com>"
              value={form.email_from}
              onChange={e => setForm(p => ({ ...p, email_from: e.target.value }))}
            />
            <Label className="text-xs">Signature (HTML allowed)</Label>
            <Textarea
              rows={2}
              placeholder="— Coach Name · exiresystema.com"
              value={form.email_signature}
              onChange={e => setForm(p => ({ ...p, email_signature: e.target.value }))}
            />
          </div>
        </IntegrationCard>

        <IntegrationCard
          icon={MessageCircle}
          name="WhatsApp & SMS (Twilio)"
          description="One-tap WhatsApp & SMS from any lead. Falls back to wa.me until connected."
          status={status?.whatsapp}
          isLoading={statusLoading}
          onTest={testWhatsApp}
          helpUrl="https://console.twilio.com/"
        >
          <div className="space-y-2">
            <Label className="text-xs">WhatsApp sender (E.164)</Label>
            <Input
              dir="ltr"
              placeholder="+15551234567"
              value={form.twilio_whatsapp_from}
              onChange={e => setForm(p => ({ ...p, twilio_whatsapp_from: e.target.value }))}
            />
            {status?.whatsapp !== 'connected' && (
              <p className="text-xs text-amber-500">
                Connect the Twilio connector in Lovable → Connectors to enable sending.
              </p>
            )}
          </div>
        </IntegrationCard>

        <IntegrationCard
          icon={Calendar}
          name="Google Calendar + Meet"
          description="Schedule sessions with auto-generated Meet links."
          status={status?.calendar}
          isLoading={statusLoading}
          helpUrl="https://calendar.google.com/"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Calendar ID</Label>
              <Input
                value={form.default_calendar_id}
                onChange={e => setForm(p => ({ ...p, default_calendar_id: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">Default duration (min)</Label>
              <Input
                type="number"
                value={form.default_session_duration_min}
                onChange={e => setForm(p => ({ ...p, default_session_duration_min: Number(e.target.value) }))}
              />
            </div>
          </div>
          {status?.calendar !== 'connected' && (
            <p className="text-xs text-amber-500">
              Connect Google Calendar in Lovable → Connectors to enable scheduling.
            </p>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={CreditCard}
          name="Stripe Payments"
          description="Sell 1:1 sessions, packages, and plans."
          status={status?.stripe}
          isLoading={statusLoading}
          helpUrl="https://dashboard.stripe.com/"
        >
          <div>
            <Label className="text-xs">Default session price (USD)</Label>
            <Input
              type="number"
              value={form.default_session_price_usd}
              onChange={e => setForm(p => ({ ...p, default_session_price_usd: Number(e.target.value) }))}
            />
            {status?.stripe !== 'connected' && (
              <p className="text-xs text-amber-500 mt-2">
                Enable Lovable Payments → Stripe to activate checkout.
              </p>
            )}
          </div>
        </IntegrationCard>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Settings apply to all leads & clients flows.
        </p>
        <Button onClick={handleSave} disabled={save.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {save.isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </Card>
    </div>
  );
};

export default Integrations;
