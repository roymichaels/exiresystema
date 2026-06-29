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
import { useTranslation } from '@/hooks/useTranslation';
import {
  useCoachIntegrations, useSaveCoachIntegrations, useIntegrationStatus,
} from '@/hooks/useCoachIntegrations';

const Integrations = () => {
  const { language, isRTL } = useTranslation();
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
      toast.error((data as { error?: string })?.error || error?.message || (language === 'he' ? 'נכשל' : language === 'es' ? 'Falló' : 'Failed'));
    } else {
      toast.success(language === 'he' ? 'אימייל בדיקה נשלח' : language === 'es' ? 'Correo de prueba enviado' : 'Test email sent');
    }
  };

  const testWhatsApp = async () => {
    const to = prompt('Send test WhatsApp to (E.164, e.g. +15551234567):');
    if (!to) return;
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { to, body: 'Test from Exire Systema 👋' },
    });
    if (error || (data as { error?: string })?.error) {
      toast.error((data as { error?: string })?.error || error?.message || (language === 'he' ? 'נכשל' : language === 'es' ? 'Falló' : 'Failed'));
    } else {
      toast.success(language === 'he' ? 'WhatsApp בדיקה נשלח' : language === 'es' ? 'WhatsApp de prueba enviado' : 'Test WhatsApp sent');
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
            <h2 className="text-2xl font-bold">{language === 'he' ? 'אינטגרציות' : language === 'es' ? 'Integraciones' : 'Integrations'}</h2>
            <p className="text-sm text-muted-foreground">
              {language === 'he' ? 'חבר את הכלים שהעסק שלך רץ עליהם.' : language === 'es' ? 'Conecta las herramientas con las que funciona tu negocio de coaching.' : 'Connect the tools your coaching business runs on.'}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>{language === 'he' ? 'רענן סטטוס' : language === 'es' ? 'Actualizar estado' : 'Refresh status'}</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <IntegrationCard
          icon={Mail}
          name={language === 'he' ? 'אימייל (Resend)' : language === 'es' ? 'Correo (Resend)' : 'Email (Resend)'}
          description={language === 'he' ? 'שלח אימייל ממותג ללידים ולקוחות מה-CRM.' : language === 'es' ? 'Envía correos electrónicos de marca a prospectos y clientes desde el CRM.' : 'Send branded email to leads & clients from the CRM.'}
          status={status?.email}
          isLoading={statusLoading}
          onTest={testEmail}
          helpUrl="https://resend.com/domains"
        >
          <div className="space-y-2">
            <Label className="text-xs">{language === 'he' ? 'כתובת שולח' : language === 'es' ? 'Dirección del remitente' : 'From address'}</Label>
            <Input
              placeholder={language === 'he' ? 'שם מאמן <hello@yourdomain.com>' : language === 'es' ? 'Nombre del Coach <hello@yourdomain.com>' : 'Coach Name <hello@yourdomain.com>'}
              value={form.email_from}
              onChange={e => setForm(p => ({ ...p, email_from: e.target.value }))}
            />
            <Label className="text-xs">{language === 'he' ? 'חתימה (HTML מותר)' : language === 'es' ? 'Firma (HTML permitido)' : 'Signature (HTML allowed)'}</Label>
            <Textarea
              rows={2}
              placeholder={language === 'he' ? '— שם מאמן · exiresystema.com' : language === 'es' ? '— Nombre del Coach · exiresystema.com' : '— Coach Name · exiresystema.com'}
              value={form.email_signature}
              onChange={e => setForm(p => ({ ...p, email_signature: e.target.value }))}
            />
          </div>
        </IntegrationCard>

        <IntegrationCard
          icon={MessageCircle}
          name={language === 'he' ? 'וואטסאפ ו-SMS (Twilio)' : language === 'es' ? 'WhatsApp y SMS (Twilio)' : 'WhatsApp & SMS (Twilio)'}
          description={language === 'he' ? 'וואטסאפ ו-SMS בלחיצה אחת מכל ליד. נופל ל-wa.me עד שחיבור.' : language === 'es' ? 'WhatsApp y SMS con un solo toque desde cualquier prospecto. Vuelve a wa.me hasta que esté conectado.' : 'One-tap WhatsApp & SMS from any lead. Falls back to wa.me until connected.'}
          status={status?.whatsapp}
          isLoading={statusLoading}
          onTest={testWhatsApp}
          helpUrl="https://console.twilio.com/"
        >
          <div className="space-y-2">
            <Label className="text-xs">{language === 'he' ? 'שולח וואטסאפ (E.164)' : language === 'es' ? 'Remitente de WhatsApp (E.164)' : 'WhatsApp sender (E.164)'}</Label>
            <Input
              dir="ltr"
              placeholder="+15551234567"
              value={form.twilio_whatsapp_from}
              onChange={e => setForm(p => ({ ...p, twilio_whatsapp_from: e.target.value }))}
            />
            {status?.whatsapp !== 'connected' && (
              <p className="text-xs text-amber-500">
                {language === 'he' ? 'חבר את Twilio ב-Lovable → Connectors כדי לאפשר שליחה.' : language === 'es' ? 'Conecta Twilio en Lovable → Connectors para habilitar el envío.' : 'Connect the Twilio connector in Lovable → Connectors to enable sending.'}
              </p>
            )}
          </div>
        </IntegrationCard>

        <IntegrationCard
          icon={Calendar}
          name={language === 'he' ? 'Google Calendar + Meet' : language === 'es' ? 'Google Calendar + Meet' : 'Google Calendar + Meet'}
          description={language === 'he' ? 'תזמן סשנים עם קישורי Meet אוטומטיים.' : language === 'es' ? 'Programa sesiones con enlaces de Meet generados automáticamente.' : 'Schedule sessions with auto-generated Meet links.'}
          status={status?.calendar}
          isLoading={statusLoading}
          helpUrl="https://calendar.google.com/"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">{language === 'he' ? 'מזהה יומן' : language === 'es' ? 'ID de calendario' : 'Calendar ID'}</Label>
              <Input
                value={form.default_calendar_id}
                onChange={e => setForm(p => ({ ...p, default_calendar_id: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs">{language === 'he' ? 'משך ברירת מחדל (דק)' : language === 'es' ? 'Duración predeterminada (min)' : 'Default duration (min)'}</Label>
              <Input
                type="number"
                value={form.default_session_duration_min}
                onChange={e => setForm(p => ({ ...p, default_session_duration_min: Number(e.target.value) }))}
              />
            </div>
          </div>
          {status?.calendar !== 'connected' && (
            <p className="text-xs text-amber-500">
              {language === 'he' ? 'חבר את Google Calendar ב-Lovable → Connectors כדי לאפשר תזמון.' : language === 'es' ? 'Conecta Google Calendar en Lovable → Connectors para habilitar la programación.' : 'Connect Google Calendar in Lovable → Connectors to enable scheduling.'}
            </p>
          )}
        </IntegrationCard>

        <IntegrationCard
          icon={CreditCard}
          name={language === 'he' ? 'תשלומי Stripe' : language === 'es' ? 'Pagos con Stripe' : 'Stripe Payments'}
          description={language === 'he' ? 'מכור סשנים 1:1, חבילות ותוכניות.' : language === 'es' ? 'Vende sesiones 1:1, paquetes y planes.' : 'Sell 1:1 sessions, packages, and plans.'}
          status={status?.stripe}
          isLoading={statusLoading}
          helpUrl="https://dashboard.stripe.com/"
        >
          <div>
            <Label className="text-xs">{language === 'he' ? 'מחיר ברירת מחדל לסשן (USD)' : language === 'es' ? 'Precio predeterminado de sesión (USD)' : 'Default session price (USD)'}</Label>
            <Input
              type="number"
              value={form.default_session_price_usd}
              onChange={e => setForm(p => ({ ...p, default_session_price_usd: Number(e.target.value) }))}
            />
            {status?.stripe !== 'connected' && (
              <p className="text-xs text-amber-500 mt-2">
                {language === 'he' ? 'הפעל Lovable Payments → Stripe כדי להפעיל תשלום.' : language === 'es' ? 'Activa Lovable Payments → Stripe para habilitar el pago.' : 'Enable Lovable Payments → Stripe to activate checkout.'}
              </p>
            )}
          </div>
        </IntegrationCard>
      </div>

      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {language === 'he' ? 'ההגדרות חלות על כל תהליכי הלידים והלקוחות.' : language === 'es' ? 'La configuración aplica a todos los flujos de prospectos y clientes.' : 'Settings apply to all leads & clients flows.'}
        </p>
        <Button onClick={handleSave} disabled={save.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {save.isPending ? (language === 'he' ? 'שומר…' : language === 'es' ? 'Guardando…' : 'Saving…') : (language === 'he' ? 'שמור הגדרות' : language === 'es' ? 'Guardar configuración' : 'Save settings')}
        </Button>
      </Card>
    </div>
  );
};

export default Integrations;
