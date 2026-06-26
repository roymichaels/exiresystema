/**
 * Exire Systema premium landing funnel.
 * Hebrew-first, RTL, mobile-first, conversion-focused.
 * Inserts leads with source='exire_landing' and logs lead_activity + conversion_events.
 */
import React, { useEffect, useMemo, useState } from 'react';
// Helmet not required — we set document.title in an effect to keep deps minimal
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import {
  Sparkles, MessageCircle, ArrowLeft, CheckCircle2, X, Play,
  Brain, HeartPulse, Users2, Clock, Waves, ChevronDown, ShieldCheck, Loader2,
  LogIn,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDefaultIntakeForm } from '@/hooks/xsystem/forms';
import {
  useExireFunnelSettings, parseVideoEmbed,
  normalizeWhatsApp, isWhatsAppConfigured,
} from '@/hooks/xsystem/funnelSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useUserRoles } from '@/hooks/useUserRoles';

const DEFAULT_WHATSAPP_HELLO =
  'היי, ראיתי את העמוד של Exire Systema ואני רוצה לבדוק התאמה לתהליך 🙏';

const leadSchema = z.object({
  full_name: z.string().trim().min(2, 'נא למלא שם מלא').max(120),
  phone: z.string().trim().min(8, 'נא למלא טלפון תקין').max(40),
  email: z.string().trim().email('אימייל לא תקין').max(255).optional().or(z.literal('')),
  instagram_handle: z.string().trim().max(80).optional().or(z.literal('')),
  main_challenge: z.string().trim().min(3, 'נא לפרט מעט').max(2000),
  desired_result: z.string().trim().min(3, 'נא לפרט מעט').max(2000),
  what_have_you_tried: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'נדרש אישור' }) }),
});

type LeadForm = z.infer<typeof leadSchema>;

const initialForm: LeadForm = {
  full_name: '', phone: '', email: '', instagram_handle: '',
  main_challenge: '', desired_result: '', what_have_you_tried: '',
  consent: false as unknown as true,
};

const fade = { initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.5 } };

function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`w-full px-4 sm:px-6 py-14 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionTitle({ kicker, title, subtitle }: { kicker?: string; title: string; subtitle?: string }) {
  return (
    <motion.div {...fade} className="text-center mb-10 sm:mb-14">
      {kicker && (
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/80 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> {kicker}
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

function CtaRow({
  onPrimary, whatsapp, helloText, primaryLabel, secondaryLabel, onSecondaryClick,
}: {
  onPrimary: () => void; whatsapp: string; helloText: string;
  primaryLabel: string; secondaryLabel: string; onSecondaryClick?: () => void;
}) {
  const hasWa = whatsapp.length >= 8;
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
      <Button size="lg" onClick={onPrimary} className="gap-2 h-12 px-7 text-base">
        {primaryLabel} <ArrowLeft className="h-4 w-4" />
      </Button>
      {hasWa && (
        <Button asChild size="lg" variant="outline" className="gap-2 h-12 px-7 text-base">
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(helloText)}`}
            target="_blank" rel="noopener noreferrer"
            onClick={onSecondaryClick}
          >
            <MessageCircle className="h-4 w-4" /> {secondaryLabel}
          </a>
        </Button>
      )}
    </div>
  );
}

export default function ExireLanding() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<LeadForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof LeadForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string } | null>(null);
  const { data: settings } = useExireFunnelSettings();
  // Phase 2N: respect admin-selected default intake form, fall back to latest published.
  const { data: intakeForm } = useDefaultIntakeForm(settings?.exire_intake_form_id);
  const formStartedRef = React.useRef(false);

  const whatsappNumber = normalizeWhatsApp(settings?.exire_whatsapp_number);
  const waConfigured = isWhatsAppConfigured(settings?.exire_whatsapp_number);
  const primaryLabel  = settings?.exire_primary_cta_label   || 'בדוק התאמה לתהליך';
  const secondaryLabel = settings?.exire_secondary_cta_label || 'שלח לי פרטים בוואטסאפ';
  const video = parseVideoEmbed(settings?.exire_landing_video_url || '');

  const utm = useMemo(() => ({
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_term: params.get('utm_term') || null,
    utm_content: params.get('utm_content') || null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    path: typeof window !== 'undefined' ? window.location.pathname : null,
  }), [params]);

  // Lightweight tracker — fire-and-forget, never throws.
  const track = React.useCallback((event_type: string, extra?: Record<string, unknown>) => {
    void supabase.from('conversion_events').insert({
      event_type,
      event_category: 'exire_funnel',
      source: 'exire_landing',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '/exire',
      event_data: { ...utm, ...(extra || {}) },
    } as never).then(() => {}, () => {});
  }, [utm]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Exire Systema — אימון תודעתי לתת־המודע';
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta('description', 'שיטת אימון תודעתי המשלבת היפנוזה, NLP ועבודה עם תת־המודע כדי לזהות ולשנות דפוסים, אמונות וחסימות שחוזרות על עצמן.');
    setMeta('og:title', 'Exire Systema — אימון תודעתי לתת־המודע', 'property');
    setMeta('og:description', 'שיטת אימון תודעתי המשלבת היפנוזה, NLP ועבודה עם תת־המודע.', 'property');
    setMeta('og:type', 'website', 'property');
    return () => { document.title = prev; };
  }, []);

  useEffect(() => { track('landing_view'); }, [track]);

  const scrollToForm = () => {
    track('cta_clicked', { target: 'lead_form' });
    document.getElementById('exire-lead-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const update = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => {
    if (!formStartedRef.current) { formStartedRef.current = true; track('lead_form_started'); }
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse(form);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof LeadForm, string>> = {};
      for (const k of Object.keys(flat) as (keyof LeadForm)[]) {
        next[k] = (flat[k] as string[] | undefined)?.[0];
      }
      setErrors(next);
      toast.error('יש שדות שדורשים תיקון');
      return;
    }
    const v = parsed.data;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-landing-lead', {
        body: {
          source: 'exire_landing',
          full_name: v.full_name,
          phone: v.phone,
          email: v.email || null,
          main_challenge: v.main_challenge,
          desired_result: v.desired_result,
          what_have_you_tried: v.what_have_you_tried || null,
          instagram_handle: v.instagram_handle || null,
          utm,
        },
      });
      if (error) throw error;
      const resp = (data || {}) as { ok?: boolean; lead_id?: string; duplicate?: boolean; error?: string };
      if (!resp.ok || !resp.lead_id) throw new Error(resp.error || 'שליחה נכשלה');

      // Fire-and-forget tracking (do not block UX on this)
      track(resp.duplicate ? 'lead_resubmitted' : 'lead_submitted', {
        source: 'exire_landing',
        duplicate: !!resp.duplicate,
      });

      setDone({ id: resp.lead_id });
      setForm(initialForm);
      toast.success(resp.duplicate ? 'קיבלנו את העדכון שלך ✨' : 'הפרטים התקבלו ✨');
    } catch (err) {
      const msg = (err as Error)?.message || 'שליחה נכשלה';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div dir="rtl" lang="he" className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20 md:pb-0">
      {/* SEO handled via useEffect below */}

      {/* Minimal top bar — brand + login. Reuses the global AuthModal/admin shell. */}
      <ExireTopBar />





      {/* HERO */}
      <Section className="pt-20 sm:pt-28 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <motion.div {...fade} className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-5 gap-1.5">
            <Sparkles className="h-3 w-3" /> Exire Systema
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold leading-[1.1] tracking-tight">
            לא נתקעת כי חסר לך מידע.<br />
            <span className="text-primary">נתקעת כי דפוס תת-מודע חוזר על עצמו.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Exire Systema הוא תהליך עומק לעבודה עם המקור — לא רק עם הסימפטום.
            שילוב של היפנוזה, NLP, אימון תת-מודע ועבודה עם חלקים פנימיים.
          </p>
          <div className="mt-8"><CtaRow onPrimary={scrollToForm} whatsapp={whatsappNumber} helloText={DEFAULT_WHATSAPP_HELLO} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onSecondaryClick={() => track("whatsapp_clicked", { location: "cta_row" })} /></div>
          <p className="mt-3 text-xs text-muted-foreground">תהליך אישי · 1-on-1 · שיחת התאמה לפני קבלה</p>
        </motion.div>

        {/* VSL — configurable via Admin → Funnel Settings */}
        <motion.div
          {...fade}
          className="mt-12 sm:mt-16 max-w-3xl mx-auto"
          onViewportEnter={() => track('vsl_section_seen')}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Card className="overflow-hidden border-primary/20">
            <div className="aspect-video relative bg-gradient-to-br from-primary/10 via-background to-primary/5">
              {video.type === 'iframe' ? (
                <iframe
                  src={video.src}
                  title="Exire Systema — סרטון הסבר"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : video.type === 'mp4' ? (
                <video
                  src={video.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/15 backdrop-blur flex items-center justify-center mb-3">
                      <Play className="h-7 w-7 text-primary ms-0.5" />
                    </div>
                    <p className="text-sm text-muted-foreground">סרטון הסבר על התהליך · יעלה בקרוב</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* PROBLEM */}
      <Section className="bg-muted/30">
        <SectionTitle
          kicker="הבעיה האמיתית"
          title="אתה יודע מה לעשות. אז למה זה לא קורה?"
          subtitle="רוב האנשים שתקועים — לא חסר להם ידע. הם נתקלים שוב ושוב באותה תקרה פנימית."
        />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            'דפוס חוזר בכסף — תקרה שלא נשברת',
            'פחד, דחיינות, וקפיאה בזמני אמת',
            'חוסר ביטחון עצמי שמלווה אותך שנים',
            'לולאות רגשיות שחוזרות באותו תסריט',
            'דפוסים חוזרים במערכות יחסים',
            'הרגשה של תקיעות גם אחרי שניסית הרבה דברים',
          ].map((t) => (
            <motion.div key={t} {...fade}>
              <Card className="h-full border-border/50 hover:border-primary/40 transition">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{t}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><CtaRow onPrimary={scrollToForm} whatsapp={whatsappNumber} helloText={DEFAULT_WHATSAPP_HELLO} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onSecondaryClick={() => track("whatsapp_clicked", { location: "cta_row" })} /></div>
      </Section>

      {/* NEW MECHANISM */}
      <Section>
        <SectionTitle
          kicker="המנגנון"
          title="במקום להילחם בסימפטום — לעבוד עם המבנה שמייצר אותו"
          subtitle="Exire Systema משלב היפנוזה, NLP, אימון תת-מודע ועבודה עם חלקים פנימיים — כדי לזהות את הקוד שמפעיל את הדפוס, ולכתוב אותו מחדש מהשורש."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Brain, title: 'תת-מודע, לא מודע', text: 'הסיבה לדפוס לא נמצאת בלוגיקה. היא יושבת עמוק יותר — שם בדיוק נעשית העבודה.' },
            { icon: Waves, title: 'חוויה, לא רק הבנה', text: 'אנחנו לא רק מדברים על השינוי — חווים אותו בתוך מצב תודעה מותאם.' },
            { icon: HeartPulse, title: 'מבנה, לא מקריות', text: 'כל סשן הוא חלק מתהליך מובנה: אמונות, רגש, חלקים פנימיים, זיכרון, אנרגיה.' },
          ].map(({ icon: Icon, title, text }) => (
            <motion.div key={title} {...fade}>
              <Card className="h-full bg-card/60 border-border/60">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ROOMS MODEL */}
      <Section className="bg-gradient-to-b from-background via-muted/20 to-background">
        <SectionTitle
          kicker="מודל החדרים"
          title="חמישה חדרים פנימיים — מערכת אחת"
          subtitle="כל חדר הוא שכבה אחרת בתת-המודע. בתהליך נכנסים אליהם בסדר מדויק."
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Brain, title: 'חדר האמונות', text: 'הקוד התת-מודע שמגדיר מה אפשרי לך ומה לא.' },
            { icon: HeartPulse, title: 'חדר הרגש והאנרגיה', text: 'המטען הרגשי שמחזיק את הדפוס יציב.' },
            { icon: Users2, title: 'חדר החלקים הפנימיים', text: 'החלקים שמגנים, מפחדים או מנהלים אותך מבפנים.' },
            { icon: Clock, title: 'חדר הזמן והזיכרונות', text: 'הרגעים שיצרו את ההחלטה הראשונית — ועדיין שולטים בהווה.' },
            { icon: Waves, title: 'הים המרכזי · מרכז אנרגטי', text: 'הליבה ממנה מתחיל כל שינוי אמיתי ויציב.' },
          ].map(({ icon: Icon, title, text }) => (
            <motion.div key={title} {...fade}>
              <Card className="h-full border-primary/15 hover:border-primary/40 transition group">
                <CardContent className="p-5">
                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><CtaRow onPrimary={scrollToForm} whatsapp={whatsappNumber} helloText={DEFAULT_WHATSAPP_HELLO} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onSecondaryClick={() => track("whatsapp_clicked", { location: "cta_row" })} /></div>
      </Section>

      {/* FOR / NOT FOR */}
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          <motion.div {...fade}>
            <Card className="h-full border-emerald-500/30">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-semibold">למי זה מתאים</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-foreground/90">
                  {[
                    'אנשים שמרגישים תקועים בנקודה שלא זזה',
                    'אנשים שחוזרים על אותם דפוסים',
                    'אנשים שכבר עברו טיפול / אימון / פיתוח אישי — ועדיין חוסם',
                    'אנשים שרוצים עבודת עומק עם תת-המודע',
                    'אנשים שמוכנים לקחת אחריות ולעשות עבודה פנימית',
                  ].map((t) => (
                    <li key={t} className="flex gap-2"><span className="text-emerald-500 mt-1">•</span>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div {...fade}>
            <Card className="h-full border-destructive/30">
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <X className="h-5 w-5 text-destructive" />
                  <h3 className="text-lg font-semibold">למי זה לא מתאים</h3>
                </div>
                <ul className="space-y-2.5 text-sm text-foreground/90">
                  {[
                    'מי שמחפש קסם או פתרון מיידי',
                    'מי שרוצה שמישהו אחר יעשה את העבודה במקומו',
                    'לא תחליף לטיפול רפואי או פסיכיאטרי',
                    'לא מענה למצבי חירום נפשיים',
                  ].map((t) => (
                    <li key={t} className="flex gap-2"><span className="text-destructive mt-1">•</span>{t}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* PROCESS */}
      <Section className="bg-muted/30">
        <SectionTitle
          kicker="התהליך"
          title="איך זה עובד · שלב אחרי שלב"
          subtitle="תהליך מובנה, אישי, ובטוח. בלי הפתעות."
        />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            { n: '01', title: 'השארת פרטים', text: 'ממלא טופס קצר — מה האתגר, מה הרצוי, מה ניסית.' },
            { n: '02', title: 'שיחת התאמה', text: 'שיחה קצרה לבדיקה הדדית של התאמה לתהליך.' },
            { n: '03', title: 'טופס קבלה', text: 'מילוי מעמיק שמכין את הסשן הראשון.' },
            { n: '04', title: 'סשן Exire ראשון', text: 'כניסה למבנה הפנימי ועבודה עם המקור.' },
            { n: '05', title: 'אינטגרציה אישית', text: 'הקלטות מותאמות, צ׳ק-אינים ותרגול בין סשנים.' },
            { n: '06', title: 'מעקב והשכבה הבאה', text: 'פולואפ צמוד והעמקה לרובד הבא של התהליך.' },
          ].map((s) => (
            <motion.div key={s.n} {...fade}>
              <Card className="h-full border-border/60">
                <CardContent className="p-5">
                  <div className="text-xs font-mono text-primary mb-2">{s.n}</div>
                  <h3 className="text-base font-semibold mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-10"><CtaRow onPrimary={scrollToForm} whatsapp={whatsappNumber} helloText={DEFAULT_WHATSAPP_HELLO} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onSecondaryClick={() => track("whatsapp_clicked", { location: "cta_row" })} /></div>
      </Section>

      {/* LEAD FORM */}
      <Section id="exire-lead-form">
        <div className="max-w-2xl mx-auto">
          <SectionTitle
            kicker="השארת פרטים"
            title="בדוק התאמה לתהליך"
            subtitle="ממלאים את הפרטים — חוזרים אליך לתיאום שיחת התאמה קצרה."
          />

          {done ? (
            <motion.div {...fade}>
              <Card className="border-primary/40">
                <CardContent className="p-7 text-center">
                  <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">הפרטים התקבלו ✨</h3>
                  <p className="text-muted-foreground mb-6">
                    השלב הבא הוא שיחת התאמה קצרה. נחזור אליך בהקדם.
                    אפשר גם לכתוב לנו ישירות בוואטסאפ כדי לקצר תהליכים.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg" className="gap-2">
                      <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(DEFAULT_WHATSAPP_HELLO)}`}
                        target="_blank" rel="noopener noreferrer"
                        onClick={() => track('whatsapp_clicked', { location: 'thank_you', lead_id: done.id })}>
                        <MessageCircle className="h-4 w-4" /> דבר איתי בוואטסאפ
                      </a>
                    </Button>
                    {intakeForm?.url && (
                      <Button asChild size="lg" variant="outline" className="gap-2">
                        <a href={intakeForm.url} target="_blank" rel="noopener noreferrer"
                          onClick={() => track('intake_clicked', { lead_id: done.id })}>
                          מילוי טופס קבלה <ArrowLeft className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.form {...fade} onSubmit={submit} className="space-y-4" noValidate>
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="full_name">שם מלא *</Label>
                      <Input id="full_name" value={form.full_name} maxLength={120}
                        onChange={(e) => update('full_name', e.target.value)} autoComplete="name" />
                      {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">טלפון / וואטסאפ *</Label>
                      <Input id="phone" value={form.phone} maxLength={40} dir="ltr"
                        inputMode="tel" autoComplete="tel"
                        onChange={(e) => update('phone', e.target.value)} />
                      {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="email">אימייל (אופציונלי)</Label>
                      <Input id="email" type="email" value={form.email} maxLength={255} dir="ltr"
                        autoComplete="email"
                        onChange={(e) => update('email', e.target.value)} />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="instagram_handle">אינסטגרם (אופציונלי)</Label>
                      <Input id="instagram_handle" value={form.instagram_handle} maxLength={80} dir="ltr"
                        placeholder="@username"
                        onChange={(e) => update('instagram_handle', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="main_challenge">מה האתגר המרכזי שלך כרגע? *</Label>
                    <Textarea id="main_challenge" value={form.main_challenge} rows={3} maxLength={2000}
                      onChange={(e) => update('main_challenge', e.target.value)} />
                    {errors.main_challenge && <p className="text-xs text-destructive mt-1">{errors.main_challenge}</p>}
                  </div>
                  <div>
                    <Label htmlFor="desired_result">איך נראית התוצאה הרצויה? *</Label>
                    <Textarea id="desired_result" value={form.desired_result} rows={3} maxLength={2000}
                      onChange={(e) => update('desired_result', e.target.value)} />
                    {errors.desired_result && <p className="text-xs text-destructive mt-1">{errors.desired_result}</p>}
                  </div>
                  <div>
                    <Label htmlFor="what_have_you_tried">מה כבר ניסית עד היום? (אופציונלי)</Label>
                    <Textarea id="what_have_you_tried" value={form.what_have_you_tried} rows={2} maxLength={2000}
                      onChange={(e) => update('what_have_you_tried', e.target.value)} />
                  </div>
                  <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
                    <Checkbox
                      checked={form.consent as unknown as boolean}
                      onCheckedChange={(c) => update('consent', (c === true) as LeadForm['consent'])}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground leading-relaxed">
                      אני מאשר/ת שייצרו איתי קשר לבדיקת התאמה לתהליך. אני מבין/ה שמדובר באימון ועבודה תת-מודעת — לא טיפול רפואי או פסיכיאטרי.
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}

                  <Button type="submit" size="lg" className="w-full gap-2 h-12" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    שלח ובדוק התאמה
                  </Button>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    הפרטים שלך נשמרים בצורה מאובטחת ולא מועברים לצד שלישי
                  </div>
                </CardContent>
              </Card>
            </motion.form>
          )}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-muted/30">
        <SectionTitle kicker="שאלות נפוצות" title="שאלות שעולות לפני שמתחילים" />
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {[
              ['מה זה Exire Systema?', 'תהליך עבודה תת-מודע שמשלב היפנוזה, NLP, אימון תת-מודע ועבודה עם חלקים פנימיים, במטרה לשחרר דפוסים חוזרים מהשורש.'],
              ['זה טיפול פסיכולוגי?', 'לא. מדובר באימון ועבודת עומק תת-מודעת. זה לא תחליף לטיפול רפואי או פסיכיאטרי.'],
              ['מה קורה בסשן עצמו?', 'אחרי שיחה קצרה נכנסים למצב תודעה מותאם ועובדים על הרובד הפנימי שמחזיק את הדפוס. הסשן בטוח, מובנה ומלווה.'],
              ['היפנוזה זה בטוח?', 'כן. נשארים עם מודעות מלאה לאורך כל התהליך, אפשר לעצור בכל רגע, ואין שליטה חיצונית.'],
              ['כמה סשנים בדרך כלל צריך?', 'משתנה לפי המטרה והעומק שאתה מחפש. בשיחת ההתאמה בודקים יחד מה הכי מתאים לך.'],
              ['ואם אני לא יודע מה בדיוק הבעיה שלי?', 'זה לגמרי בסדר. חלק מהעבודה היא לזהות יחד את המבנה שמייצר את התקיעות.'],
              ['זה מתאים לדפוסים של כסף / ביטחון / מערכות יחסים / פחד / דחיינות?', 'כן — אלה בדיוק תחומי העבודה המרכזיים של התהליך.'],
              ['מה קורה אחרי שאני משאיר פרטים?', 'חוזרים אליך לתיאום שיחת התאמה קצרה. אם יש התאמה — קובעים סשן ראשון ושולחים טופס קבלה.'],
            ].map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="text-right">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* TRUST */}
      <Section>
        <motion.div {...fade} className="max-w-3xl mx-auto">
          <Card className="border-border/60 bg-muted/20">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                  <p>Exire Systema הוא תהליך אימון ועבודה תת-מודעת, ואינו תחליף לטיפול רפואי או פסיכיאטרי.</p>
                  <p>המידע האישי שאתה משאיר משמש לצורך יצירת קשר ובדיקת התאמה לתהליך בלבד.</p>
                  <p>אם אתה במצב חירום נפשי — פנה לערוץ סיוע מיידי (ער"ן 1201 / מד"א 101).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Section>

      {/* FINAL CTA */}
      <Section className="text-center pb-24">
        <motion.div {...fade}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">מוכן לבדוק התאמה?</h2>
          <p className="text-muted-foreground mb-7 max-w-xl mx-auto">
            שיחה קצרה. בלי התחייבות. בודקים יחד אם זה הזמן והמקום הנכונים בשבילך.
          </p>
          <CtaRow onPrimary={scrollToForm} whatsapp={whatsappNumber} helloText={DEFAULT_WHATSAPP_HELLO} primaryLabel={primaryLabel} secondaryLabel={secondaryLabel} onSecondaryClick={() => track("whatsapp_clicked", { location: "cta_row" })} />
        </motion.div>
      </Section>

      {/* Sticky mobile CTA */}
      {!done && (
        <div className="md:hidden fixed bottom-3 inset-x-3 z-40">
          <button
            onClick={scrollToForm}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            {primaryLabel} <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Top bar for the Exire landing — keeps the page minimal but restores the
 * login entry point that the legacy homepage exposed. Reuses the global
 * AuthModal (no new auth system). Logged-in users with panel access go
 * straight to `/admin-hub`; logged-in non-admin users land on `/client-home`.
 */
function ExireTopBar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { hasPanelAccess } = useUserRoles();

  const onClick = () => {
    if (loading) return;
    if (user) {
      navigate(hasPanelAccess() ? '/admin-hub' : '/client-home');
      return;
    }
    openAuthModal('login');
  };

  const label = user ? (hasPanelAccess() ? 'פאנל ניהול' : 'אזור אישי') : 'כניסה';

  return (
    <header className="absolute top-0 inset-x-0 z-30 px-4 sm:px-6 pt-4 sm:pt-5">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
          Exire Systema
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClick}
          disabled={loading}
          className="h-9 gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          aria-label={label}
        >
          <LogIn className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      </div>
    </header>
  );
}
