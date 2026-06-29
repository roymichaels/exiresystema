/**
 * Admin → Coach → Exire Funnel settings.
 * Edit landing VSL URL (or upload mp4/webm), WhatsApp number, CTA labels, intake form.
 * Also shows landing URLs, quick funnel KPIs, latest leads, and a setup checklist.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
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
  const { language } = useTranslation();
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
    return <div className="text-sm text-muted-foreground">{language === 'he' ? 'טוען…' : language === 'es' ? 'Cargando…' : 'Loading…'}</div>;
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
      toast.success(language === 'he' ? 'נשמר ✨' : language === 'es' ? 'Guardado ✨' : 'Saved ✨');
    } catch (e) {
      toast.error((e as Error)?.message || (language === 'he' ? 'שמירה נכשלה' : language === 'es' ? 'Error al guardar' : 'Save failed'));
    }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(language === 'he' ? 'הועתק' : language === 'es' ? 'Copiado' : 'Copied'); }
    catch { toast.error(language === 'he' ? 'העתקה נכשלה' : language === 'es' ? 'Error al copiar' : 'Copy failed'); }
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (!/\.(mp4|webm|mov)$/i.test(file.name) && !file.type.startsWith('video/')) {
      toast.error(language === 'he' ? 'יש להעלות קובץ וידאו (mp4 / webm / mov)' : language === 'es' ? 'Debes subir un archivo de video (mp4 / webm / mov)' : 'Must upload a video file (mp4 / webm / mov)');
      return;
    }
    if (file.size > 150 * 1024 * 1024) {
      toast.error(language === 'he' ? 'גודל מקסימלי: 150MB. השתמש בקישור YouTube/Vimeo עבור קבצים גדולים יותר.' : language === 'es' ? 'Tamaño máximo: 150MB. Usa un enlace de YouTube/Vimeo para archivos más grandes.' : 'Max size: 150MB. Use YouTube/Vimeo link for larger files.');
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
      if (!pub?.publicUrl) throw new Error(language === 'he' ? 'כתובת ציבורית לא נוצרה' : language === 'es' ? 'No se creó la URL pública' : 'Public URL was not created');
      set('exire_landing_video_url', pub.publicUrl);
      await update.mutateAsync({ exire_landing_video_url: pub.publicUrl });
      toast.success(language === 'he' ? 'הסרטון הועלה ונשמר' : language === 'es' ? 'Video subido y guardado' : 'Video uploaded and saved');
    } catch (e) {
      toast.error((e as Error)?.message || (language === 'he' ? 'העלאה נכשלה' : language === 'es' ? 'Error al subir' : 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const activeMappings = mappings.filter((m) => m.is_active).length;
  const checklist = [
    { ok: !!form.exire_landing_video_url, label: language === 'he' ? 'סרטון VSL הוגדר' : language === 'es' ? 'Video VSL configurado' : 'VSL Video configured' },
    { ok: waOk, label: language === 'he' ? 'מספר WhatsApp הוגדר' : language === 'es' ? 'Número de WhatsApp configurado' : 'WhatsApp number configured' },
    { ok: !!form.exire_intake_form_id, label: language === 'he' ? 'טופס קבלה נבחר' : language === 'es' ? 'Formulario de admisión seleccionado' : 'Intake form selected' },
    { ok: activeMappings > 0, label: language === 'he' ? 'מיפוי טפסי לידים פעיל' : language === 'es' ? 'Mapeo de formularios de leads activo' : 'Lead form mapping active' },
    { ok: (funnel?.leadsThisMonth ?? 0) > 0 || (funnel?.leadsToday ?? 0) > 0, label: language === 'he' ? 'התקבל ליד בדיקה' : language === 'es' ? 'Lead de prueba recibido' : 'Test lead received' },
  ];
  const doneCount = checklist.filter((c) => c.ok).length;

  return (
    <div dir="rtl" className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Compact mobile header / wider desktop header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div className="min-w-0">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> {language === 'he' ? 'הגדרות פאנל Exire' : language === 'es' ? 'Configuración del Panel Exire' : 'Exire Panel Settings'}
          </h2>
          <p className="hidden md:block text-xs text-muted-foreground mt-1">
            {language === 'he' ? 'ניהול וידאו, WhatsApp וטופס קבלה עבור עמוד הנחיתה.' : language === 'es' ? 'Gestiona video, WhatsApp y formulario de admisión para la página de aterrizaje.' : 'Manage video, WhatsApp and intake form for landing page.'}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 px-2.5">
            <a href="/exire" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /><span className="hidden sm:inline">{language === 'he' ? 'פתח' : language === 'es' ? 'Abrir' : 'Open'}</span> /exire</a>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5 h-8 px-2.5">
            <a href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /><span className="hidden sm:inline">{language === 'he' ? 'פתח' : language === 'es' ? 'Abrir' : 'Open'}</span> /</a>
          </Button>
        </div>
      </div>

      {/* Landing URLs strip */}
      <Card className="border-border/40 rounded-2xl">
        <CardContent className="p-2.5 grid gap-2 sm:grid-cols-2">
          {[
            { label: language === 'he' ? 'דף הבית' : language === 'es' ? 'Página de inicio' : 'Home page', url: homeUrl },
            { label: language === 'he' ? 'אליאס' : 'Elias', url: landingUrl },
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
        <KPI label={language === 'he' ? 'לידים היום' : language === 'es' ? 'Leads hoy' : 'Leads today'} value={funnel?.leadsToday ?? 0} />
        <KPI label={language === 'he' ? 'החודש' : language === 'es' ? 'Este mes' : 'This month'}      value={funnel?.leadsThisMonth ?? 0} />
        <KPI label={language === 'he' ? 'הומרו' : language === 'es' ? 'Convertidos' : 'Converted'}      value={funnel?.converted ?? 0} />
        <KPI label={language === 'he' ? 'ממתין למענה' : language === 'es' ? 'Esperando respuesta' : 'Awaiting reply'} value={funnel?.awaitingFirstReply ?? 0} tone="warn" />
      </div>

      {/* === Settings groups — each is its own card so mobile feels like a settings screen === */}

      {/* VSL / Hero video card */}
      <details open className="md:open group rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Video className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">{language === 'he' ? 'סרטון VSL / Hero' : language === 'es' ? 'Video VSL / Hero' : 'VSL / Hero Video'}</span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate max-w-[40%]" dir="ltr">
            {form.exire_landing_video_url ? (language === 'he' ? '✓ מוגדר' : language === 'es' ? '✓ Configurado' : '✓ Configured') : (language === 'he' ? 'לא הוגדר' : language === 'es' ? 'No configurado' : 'Not configured')}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-xs">{language === 'he' ? 'קישור (YouTube / Vimeo / Loom / mp4 / webm)' : language === 'es' ? 'Enlace (YouTube / Vimeo / Loom / mp4 / webm)' : 'Link (YouTube / Vimeo / Loom / mp4 / webm)'}</Label>
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
                {language === 'he' ? 'העלה קובץ' : language === 'es' ? 'Subir archivo' : 'Upload file'}
              </Button>
              {form.exire_landing_video_url && (
                <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => set('exire_landing_video_url', '')}>
                  {language === 'he' ? 'הסר' : language === 'es' ? 'Eliminar' : 'Remove'}
                </Button>
              )}
            </div>
          </div>
          <Input value={form.exire_landing_video_url} dir="ltr"
            placeholder={language === 'he' ? 'https://youtu.be/... או https://.../video.mp4' : language === 'es' ? 'https://youtu.be/... o https://.../video.mp4' : 'https://youtu.be/... or https://.../video.mp4'}
            onChange={(e) => set('exire_landing_video_url', e.target.value)}
            className="text-xs md:text-sm" />
          <p className="text-[11px] text-muted-foreground">
            {language === 'he' ? 'עד 150MB. ריק → Placeholder עיצובי בדף.' : language === 'es' ? 'Hasta 150MB. Vacío → Placeholder de diseño en la página.' : 'Up to 150MB. Empty → Design placeholder on page.'}
          </p>
          <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30 aspect-video w-full max-w-xl">
            {video.type === 'iframe' ? (
              <iframe src={video.src} className="w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="preview" />
            ) : video.type === 'mp4' ? (
              <video src={video.src} controls playsInline className="w-full h-full object-cover bg-black" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground gap-2">
                <Video className="h-4 w-4" /> {language === 'he' ? 'אין סרטון מוגדר' : language === 'es' ? 'No hay video configurado' : 'No video configured'}
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
            {waOk ? `+${waNormalized}` : (language === 'he' ? 'לא הוגדר' : language === 'es' ? 'No configurado' : 'Not configured')}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <Label className="text-xs">{language === 'he' ? 'מספר WhatsApp (פורמט בינלאומי, ללא +)' : language === 'es' ? 'Número de WhatsApp (formato internacional, sin +)' : 'WhatsApp number (international format, no +)'}</Label>
          <Input value={form.exire_whatsapp_number} dir="ltr" inputMode="tel"
            placeholder="972501234567"
            onChange={(e) => set('exire_whatsapp_number', e.target.value.replace(/\D/g, ''))} />
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            {waOk
              ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {language === 'he' ? 'תקין' : language === 'es' ? 'Válido' : 'Valid'}</>
              : <><Circle className="h-3 w-3 text-amber-500" /> {language === 'he' ? 'אם ריק — כפתורי WhatsApp בדף יוסתרו.' : language === 'es' ? 'Si está vacío — los botones de WhatsApp se ocultarán.' : 'If empty — WhatsApp buttons will be hidden.'}</>}
          </p>
        </div>
      </details>

      {/* Intake form card */}
      <details open className="rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{language === 'he' ? 'טופס קבלה' : language === 'es' ? 'Formulario de admisión' : 'Intake form'}</span>
          <span className="text-[11px] text-muted-foreground">
            {form.exire_intake_form_id ? (language === 'he' ? '✓ נבחר' : language === 'es' ? '✓ Seleccionado' : '✓ Selected') : (language === 'he' ? '— ללא —' : language === 'es' ? '— Sin —' : '— None —')}
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
          <Label className="text-xs">{language === 'he' ? 'ברירת מחדל (יוצג בדף תודה)' : language === 'es' ? 'Predeterminado (se muestra en la página de agradecimiento)' : 'Default (shown on thank you page)'}</Label>
          <Select value={form.exire_intake_form_id || 'none'}
            onValueChange={(v) => set('exire_intake_form_id', v === 'none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder={language === 'he' ? 'בחר טופס' : language === 'es' ? 'Seleccionar formulario' : 'Select form'} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{language === 'he' ? '— ללא (יוסתר בדף תודה) —' : language === 'es' ? '— Sin (oculto en página de agradecimiento) —' : '— None (hidden on thank you page) —'}</SelectItem>
              {forms.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.title}{f.status === 'published' ? '' : (language === 'he' ? ' (טיוטה)' : language === 'es' ? ' (Borrador)' : ' (Draft)')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </details>

      {/* CTA labels card */}
      <details className="rounded-2xl border border-border/40 bg-card/40">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{language === 'he' ? 'תוויות כפתורים' : language === 'es' ? 'Etiquetas de botones' : 'Button labels'}</span>
          <span className="text-[11px] text-muted-foreground truncate max-w-[55%]">
            {form.exire_primary_cta_label}
          </span>
        </summary>
        <div className="px-4 pb-4 grid gap-3 md:grid-cols-2 border-t border-border/30 pt-3">
          <div>
            <Label className="text-xs">{language === 'he' ? 'כפתור ראשי' : language === 'es' ? 'Botón principal' : 'Primary button'}</Label>
            <Input value={form.exire_primary_cta_label}
              onChange={(e) => set('exire_primary_cta_label', e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{language === 'he' ? 'כפתור משני (WhatsApp)' : language === 'es' ? 'Botón secundario (WhatsApp)' : 'Secondary button (WhatsApp)'}</Label>
            <Input value={form.exire_secondary_cta_label}
              onChange={(e) => set('exire_secondary_cta_label', e.target.value)} />
          </div>
        </div>
      </details>



      {/* Setup checklist */}
      <Card className="border-primary/30 bg-primary/[0.02]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">{language === 'he' ? `רשימת מוכנות (${doneCount}/${checklist.length})` : language === 'es' ? `Lista de verificación (${doneCount}/${checklist.length})` : `Readiness checklist (${doneCount}/${checklist.length})`}</CardTitle>
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
            <span>{language === 'he' ? 'לידים אחרונים מ-Exire' : language === 'es' ? 'Últimos leads de Exire' : 'Recent leads from Exire'}</span>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin?tab=coach&sub=leads&source=exire_landing">{language === 'he' ? 'לכל הלידים' : language === 'es' ? 'Todos los leads' : 'All leads'}</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!funnel?.latest?.length ? (
            <p className="text-sm text-muted-foreground">{language === 'he' ? 'אין עדיין לידים מהפאנל.' : language === 'es' ? 'Aún no hay leads del panel.' : 'No leads from the panel yet.'}</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {funnel.latest.map((l) => (
                <li key={l.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{l.name || (language === 'he' ? 'ללא שם' : language === 'es' ? 'Sin nombre' : 'No name')}</div>
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
            {language === 'he' ? 'שמור הגדרות' : language === 'es' ? 'Guardar configuración' : 'Save settings'}
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
