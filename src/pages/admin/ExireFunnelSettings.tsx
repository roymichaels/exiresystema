/**
 * Admin → Coach → Exire Funnel settings.
 * Edit landing VSL URL (or upload mp4/webm), WhatsApp number, CTA labels, intake form.
 * Also shows landing URLs, quick funnel KPIs, latest leads, and a setup checklist.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, ExternalLink, Save, Sparkles, Loader2, Upload, Video, CheckCircle2, Circle,
} from 'lucide-react';
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
  useExireFunnelSettings, useUpdateExireFunnelSettings,
  parseVideoEmbed, isWhatsAppConfigured, normalizeWhatsApp,
  type ExireFunnelSettings,
} from '@/hooks/xsystem/funnelSettings';
import { useExireFunnelMetrics } from '@/hooks/xsystem/exireFunnel';
import { useLeadFormMappings } from '@/hooks/xsystem/leadFormSync';
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
  const { data: mappings = [] } = useLeadFormMappings();
  const update = useUpdateExireFunnelSettings();
  const [form, setForm] = useState<ExireFunnelSettings | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { if (settings && !form) setForm(settings); }, [settings, form]);

  if (isLoading || !form) {
    return <div className="text-sm text-muted-foreground">טוען…</div>;
  }

  const landingUrl = `${window.location.origin}/exire`;
  const homeUrl = `${window.location.origin}/`;
  const set = <K extends keyof ExireFunnelSettings>(k: K, v: string) => setForm({ ...form, [k]: v });
  const video = parseVideoEmbed(form.exire_landing_video_url || '');
  const waOk = isWhatsAppConfigured(form.exire_whatsapp_number);
  const waNormalized = normalizeWhatsApp(form.exire_whatsapp_number);

  const save = async () => {
    try {
      await update.mutateAsync(form);
      toast.success('נשמר ✨');
    } catch (e) {
      toast.error((e as Error)?.message || 'שמירה נכשלה');
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success('הועתק'); }
    catch { toast.error('העתקה נכשלה'); }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (!/\.(mp4|webm|mov)$/i.test(file.name) && !file.type.startsWith('video/')) {
      toast.error('יש להעלות קובץ וידאו (mp4 / webm / mov)');
      return;
    }
    if (file.size > 150 * 1024 * 1024) {
      toast.error('גודל מקסימלי: 150MB. השתמש בקישור YouTube/Vimeo עבור קבצים גדולים יותר.');
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const path = `exire-vsl/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('site-videos')
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || `video/${ext}` });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('site-videos').getPublicUrl(path);
      if (!pub?.publicUrl) throw new Error('כתובת ציבורית לא נוצרה');
      set('exire_landing_video_url', pub.publicUrl);
      await update.mutateAsync({ exire_landing_video_url: pub.publicUrl });
      toast.success('הסרטון הועלה ונשמר');
    } catch (e) {
      toast.error((e as Error)?.message || 'העלאה נכשלה');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeMappings = mappings.filter((m) => m.is_active).length;
  const checklist = [
    { ok: !!form.exire_landing_video_url, label: 'סרטון VSL הוגדר' },
    { ok: waOk, label: 'מספר WhatsApp הוגדר' },
    { ok: !!form.exire_intake_form_id, label: 'טופס קבלה נבחר' },
    { ok: activeMappings > 0, label: 'מיפוי טפסי לידים פעיל' },
    { ok: (funnel?.leadsThisMonth ?? 0) > 0 || (funnel?.leadsToday ?? 0) > 0, label: 'התקבל ליד בדיקה' },
  ];
  const doneCount = checklist.filter((c) => c.ok).length;

  return (
    <div dir="rtl" className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Compact mobile header / wider desktop header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> הגדרות פאנל Exire
          </h2>
          <p className="hidden md:block text-xs text-muted-foreground mt-1">
            ניהול וידאו, WhatsApp וטופס קבלה עבור עמוד הנחיתה.
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 px-2.5">
            <a href="/exire" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /><span className="hidden sm:inline">פתח</span> /exire</a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 px-2.5">
            <a href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /><span className="hidden sm:inline">פתח</span> /</a>
          </Button>
        </div>
      </div>

      {/* Landing URLs strip */}
      <Card className="border-border/40 rounded-2xl">
        <CardContent className="p-2.5 grid gap-2 sm:grid-cols-2">
          {[
            { label: 'דף הבית', url: homeUrl },
            { label: 'אליאס', url: landingUrl },
          ].map((row) => (
            <div key={row.url} className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-muted-foreground">{row.label}</div>
                <div className="text-[11px] md:text-xs font-mono truncate" dir="ltr">{row.url}</div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(row.url)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                  <a href={row.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* KPI strip */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <KPI label="לידים היום" value={funnel?.leadsToday ?? 0} />
        <KPI label="החודש"      value={funnel?.leadsThisMonth ?? 0} />
        <KPI label="הומרו"      value={funnel?.converted ?? 0} />
        <KPI label="ממתין למענה" value={funnel?.awaitingFirstReply ?? 0} tone="warn" />
      </div>

      {/* === Settings groups — each is its own card so mobile feels like a settings screen === */}

      {/* VSL / Hero video card */}
      <details open className="md:open group rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">סרטון VSL / Hero</span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate max-w-[40%]" dir="ltr">
            {form.exire_landing_video_url ? '✓ מוגדר' : 'לא הוגדר'}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-xs">קישור (YouTube / Vimeo / Loom / mp4 / webm)</Label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 h-8"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                העלה קובץ
              </Button>
              {form.exire_landing_video_url && (
                <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => set('exire_landing_video_url', '')}>
                  הסר
                </Button>
              )}
            </div>
          </div>
          <Input value={form.exire_landing_video_url} dir="ltr"
            placeholder="https://youtu.be/... או https://.../video.mp4"
            onChange={(e) => set('exire_landing_video_url', e.target.value)}
            className="text-xs md:text-sm" />
          <p className="text-[11px] text-muted-foreground">
            עד 150MB. ריק → Placeholder עיצובי בדף.
          </p>
          <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30 aspect-video w-full max-w-xl">
            {video.type === 'iframe' ? (
              <iframe src={video.src} className="w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="preview" />
            ) : video.type === 'mp4' ? (
              <video src={video.src} controls playsInline className="w-full h-full object-cover bg-black" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                <Video className="h-4 w-4" /> אין סרטון מוגדר
              </div>
            )}
          </div>
        </div>
      </details>

      {/* WhatsApp card */}
      <details open className="rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">WhatsApp</span>
          <span className="text-[11px] text-muted-foreground" dir="ltr">
            {waOk ? `+${waNormalized}` : 'לא הוגדר'}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <Label className="text-xs">מספר WhatsApp (פורמט בינלאומי, ללא +)</Label>
          <Input value={form.exire_whatsapp_number} dir="ltr" inputMode="tel"
            placeholder="972501234567"
            onChange={(e) => set('exire_whatsapp_number', e.target.value.replace(/\D/g, ''))} />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            {waOk
              ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> תקין</>
              : <><Circle className="h-3 w-3 text-amber-500" /> אם ריק — כפתורי WhatsApp בדף יוסתרו.</>}
          </p>
        </div>
      </details>

      {/* Intake form card */}
      <details open className="rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">טופס קבלה</span>
          <span className="text-[11px] text-muted-foreground">
            {form.exire_intake_form_id ? '✓ נבחר' : '— ללא —'}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <Label className="text-xs">ברירת מחדל (יוצג בדף תודה)</Label>
          <Select value={form.exire_intake_form_id || 'none'}
            onValueChange={(v) => set('exire_intake_form_id', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="בחר טופס" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— ללא (יוסתר בדף תודה) —</SelectItem>
              {forms.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.title}{f.status === 'published' ? '' : ' (טיוטה)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </details>

      {/* CTA labels card */}
      <details className="rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">תוויות כפתורים</span>
          <span className="text-[11px] text-muted-foreground truncate max-w-[55%]">
            {form.exire_primary_cta_label}
          </span>
        </summary>
        <div className="px-4 pb-4 grid gap-3 md:grid-cols-2 border-t border-border/30 pt-3">
          <div>
            <Label className="text-xs">כפתור ראשי</Label>
            <Input value={form.exire_primary_cta_label}
              onChange={(e) => set('exire_primary_cta_label', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">כפתור משני (WhatsApp)</Label>
            <Input value={form.exire_secondary_cta_label}
              onChange={(e) => set('exire_secondary_cta_label', e.target.value)} />
          </div>
        </div>
      </details>



      {/* Setup checklist */}
      <Card className="border-primary/30 bg-primary/[0.02]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">רשימת מוכנות ({doneCount}/{checklist.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="grid gap-1.5 sm:grid-cols-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm">
                {c.ok
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
                <span className={c.ok ? 'text-muted-foreground line-through' : ''}>{c.label}</span>
              </li>
            ))}
          </ul>
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

      {/* Save bar — sits at end of content, above bottom nav */}
      <div className="sticky bottom-[5.25rem] md:static z-10 -mx-3 md:mx-0 px-3 md:px-0 pt-2">
        <div className="md:flex md:justify-end rounded-2xl md:rounded-none bg-background/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-0 border md:border-0 border-border/40 p-2 md:p-0">
          <Button onClick={save} disabled={update.isPending} className="gap-2 w-full md:w-auto">
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            שמור הגדרות
          </Button>
        </div>
      </div>
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
