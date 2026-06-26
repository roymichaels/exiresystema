/**
 * Admin → Coach → Exire Funnel settings.
 * Edit landing VSL URL, WhatsApp number, CTA labels, intake form.
 * Also shows quick funnel KPIs and latest leads.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, Save, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  useExireFunnelSettings, useUpdateExireFunnelSettings, type ExireFunnelSettings,
} from '@/hooks/xsystem/funnelSettings';
import { useExireFunnelMetrics } from '@/hooks/xsystem/exireFunnel';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

function useAvailableForms() {
  return useQuery({
    queryKey: ['exire_funnel_forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_forms')
        .select('id,title,status')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Array<{ id: string; title: string; status: string | null }>;
    },
  });
}

export default function ExireFunnelSettings() {
  const { data: settings, isLoading } = useExireFunnelSettings();
  const { data: forms = [] } = useAvailableForms();
  const { data: funnel } = useExireFunnelMetrics();
  const update = useUpdateExireFunnelSettings();
  const [form, setForm] = useState<ExireFunnelSettings | null>(null);

  useEffect(() => { if (settings && !form) setForm(settings); }, [settings, form]);

  if (isLoading || !form) {
    return <div className="text-sm text-muted-foreground">טוען…</div>;
  }

  const landingUrl = `${window.location.origin}/exire`;
  const homeUrl = `${window.location.origin}/`;
  const set = <K extends keyof ExireFunnelSettings>(k: K, v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.success('נשמר');
    } catch (e) {
      toast.error((e as Error)?.message || 'שמירה נכשלה');
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success('הועתק'); }
    catch { toast.error('העתקה נכשלה'); }
  };

  return (
    <div dir="rtl" className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> הגדרות פאנל Exire
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ניהול וידאו, WhatsApp וטופס קבלה עבור עמוד הנחיתה.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="/exire" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> פתח /exire</a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> פתח /</a>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KPI label="לידים היום" value={funnel?.leadsToday ?? 0} />
        <KPI label="החודש"      value={funnel?.leadsThisMonth ?? 0} />
        <KPI label="הומרו"      value={funnel?.converted ?? 0} />
        <KPI label="ממתין למענה" value={funnel?.awaitingFirstReply ?? 0} tone="warn" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">תצורת הדף</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs">קישור וידאו (YouTube / Vimeo / mp4)</Label>
            <Input value={form.exire_landing_video_url} dir="ltr"
              placeholder="https://youtu.be/..."
              onChange={(e) => set('exire_landing_video_url', e.target.value)} />
            <p className="text-[11px] text-muted-foreground">
              אם ריק — יוצג Placeholder עיצובי, ללא שבירת הפריסה.
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <Label className="text-xs">מספר WhatsApp (בינלאומי, ללא +)</Label>
              <Input value={form.exire_whatsapp_number} dir="ltr" inputMode="tel"
                placeholder="972500000000"
                onChange={(e) => set('exire_whatsapp_number', e.target.value.replace(/\D/g, ''))} />
            </div>
            <div>
              <Label className="text-xs">טופס קבלה ברירת מחדל</Label>
              <Select value={form.exire_intake_form_id || 'none'}
                onValueChange={(v) => set('exire_intake_form_id', v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="בחר טופס" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— ללא —</SelectItem>
                  {forms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.title}{f.status === 'published' ? '' : ' (טיוטה)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <Label className="text-xs">כפתור ראשי</Label>
              <Input value={form.exire_primary_cta_label}
                onChange={(e) => set('exire_primary_cta_label', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">כפתור משני</Label>
              <Input value={form.exire_secondary_cta_label}
                onChange={(e) => set('exire_secondary_cta_label', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between flex-wrap gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => copy(landingUrl)}>
                <Copy className="h-3.5 w-3.5" /> העתק קישור /exire
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => copy(homeUrl)}>
                <Copy className="h-3.5 w-3.5" /> העתק קישור /
              </Button>
            </div>
            <Button onClick={save} disabled={update.isPending} className="gap-2">
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              שמור
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>לידים אחרונים מ-Exire</span>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin?tab=coach&sub=leads&source=exire_landing">לכל הלידים</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!funnel?.latest?.length ? (
            <p className="text-sm text-muted-foreground">אין עדיין לידים מהפאנל.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {funnel.latest.map((l) => (
                <li key={l.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{l.name || 'ללא שם'}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {l.pain_category || '—'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{l.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: number | string; tone?: 'warn' }) {
  const cls = tone === 'warn' ? 'border-amber-500/30 bg-amber-500/5' : '';
  return (
    <Card className={cls}>
      <CardContent className="p-3">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
