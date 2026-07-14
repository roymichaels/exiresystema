/**
 * AdvisorPanel — Chat UI for Exire Advisor ("המוח העסקי").
 *
 * Two variants:
 *   'widget' — compact layout for use inside a Sheet (triggered from header)
 *   'page'   — full-page layout centered with back button (route fallback)
 *
 * Read-only — Advisor cannot mutate data; it only suggests next actions.
 * Hebrew-first — admin UI always shows Hebrew labels.
 */
import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Brain, Send, Loader2, Sparkles, Lightbulb, ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

type AdvisorModelKey = 'uncensored' | 'smart_mini' | 'smart_advanced';

const ADVISOR_MODEL_OPTIONS: Array<{
  key: AdvisorModelKey;
  label: Record<'he' | 'en' | 'es', string>;
  description: Record<'he' | 'en' | 'es', string>;
}> = [
  {
    key: 'smart_mini',
    label: { he: 'חכם מיני', en: 'Smart Mini', es: 'Smart Mini' },
    description: {
      he: 'מהיר וחסכוני לשיחות יומיומיות',
      en: 'Fast, efficient everyday model',
      es: 'Rápido y eficiente para el día a día',
    },
  },
  {
    key: 'smart_advanced',
    label: { he: 'חכם מתקדם', en: 'Smart Advanced', es: 'Smart Advanced' },
    description: {
      he: 'החזק ביותר לאסטרטגיה וניתוח מעמיק',
      en: 'Most powerful for strategy & analysis',
      es: 'Máximo poder para estrategia y análisis',
    },
  },
  {
    key: 'uncensored',
    label: { he: 'ללא מגבלות', en: 'Uncensored', es: 'Sin censura' },
    description: {
      he: 'מודל חופשי עם סינון מינימלי',
      en: 'Unrestricted, minimal filtering',
      es: 'Sin restricciones, filtrado mínimo',
    },
  },
];

const ADVISOR_MODEL_STORAGE_KEY = 'exire.advisor.model';
const DEFAULT_ADVISOR_MODEL: AdvisorModelKey = 'smart_mini';

function loadStoredModel(): AdvisorModelKey {
  if (typeof window === 'undefined') return DEFAULT_ADVISOR_MODEL;
  try {
    const stored = window.localStorage.getItem(ADVISOR_MODEL_STORAGE_KEY);
    if (stored && ADVISOR_MODEL_OPTIONS.some((o) => o.key === stored)) {
      return stored as AdvisorModelKey;
    }
  } catch { /* ignore */ }
  return DEFAULT_ADVISOR_MODEL;
}

const RATE_LIMIT_MSG = (lang: string) =>
  lang === 'he'
    ? 'המודל עמוס כרגע. נסה שוב בעוד רגע.'
    : lang === 'es'
      ? 'El modelo está ocupado. Intenta de nuevo en un momento.'
      : 'The model is busy. Try again in a moment.';

const RATE_LIMIT_NOTE = (lang: string) =>
  lang === 'he'
    ? 'המוח העסקי מחובר, אבל המודל עמוס כרגע'
    : lang === 'es'
      ? 'El asesor está conectado, pero el modelo está ocupado'
      : 'The advisor is connected, but the model is busy right now';

const SUGGESTED = (lang: string): string[] =>
  lang === 'he'
    ? [
        'מה הדבר הבא שאני צריך לעשות?',
        'סכם לי את היום',
        'איזה לידים הכי חשובים?',
        'מה חסר במשפך?',
        'איפה הכסף תקוע?',
      ]
    : lang === 'es'
      ? [
          '¿Qué debo hacer ahora?',
          'Resúmeme el día',
          '¿Qué leads son más importantes?',
          '¿Qué falta en el embudo?',
          '¿Dónde está bloqueado el dinero?',
        ]
      : [
          'What should I do next?',
          'Summarize today',
          'Which leads matter most?',
          'What is missing in the funnel?',
          'Where is the money stuck?',
        ];

const SURFACE_PROMPTS = (lang: string): Record<string, string> =>
  lang === 'he'
    ? {
        today: 'מה הדבר הבא להיום?',
        leads: 'איזה ליד הכי חשוב?',
        clients: 'מה הפוקוס למתאמנים?',
        studio: 'מה חסר במשפך?',
        more: 'מה לשפר במערכת?',
      }
    : lang === 'es'
      ? {
          today: '¿Qué sigue para hoy?',
          leads: '¿Qué lead es más importante?',
          clients: '¿Cuál es el enfoque para clientes?',
          studio: '¿Qué falta en el embudo?',
          more: '¿Qué mejorar en el sistema?',
        }
      : {
          today: "What's next today?",
          leads: 'Which lead matters most?',
          clients: "What's the focus for clients?",
          studio: "What's missing in the funnel?",
          more: 'What to improve in the system?',
        };

async function readResponseBody(ctx: any): Promise<{ status: number; body: any }> {
  const status = ctx?.status ?? 0;
  let body: any = null;
  if (ctx && typeof ctx.json === 'function') {
    try { body = await ctx.json(); } catch { /* ignore */ }
  }
  return { status, body };
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_hr]:my-2 [&_code]:text-[12.5px] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:text-[12.5px] [&_strong]:font-semibold">
      <ReactMarkdown
        components={{
          a: ({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2" {...props}>
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface AdvisorPanelProps {
  variant?: 'widget' | 'page';
  onClose?: () => void;
}

export default function AdvisorPanel({ variant = 'widget', onClose }: AdvisorPanelProps) {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [modelKey, setModelKey] = useState<AdvisorModelKey>(() => loadStoredModel());
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => {
    try { window.localStorage.setItem(ADVISOR_MODEL_STORAGE_KEY, modelKey); } catch { /* ignore */ }
  }, [modelKey]);

  const activeTab = searchParams.get('tab') || 'today';
  const surfacePrompt = SURFACE_PROMPTS(language)[activeTab] || (language === 'he'
    ? 'שאל אותי מה הדבר הבא שצריך לעשות בעסק'
    : language === 'es'
      ? 'Pregúntame qué sigue en tu negocio'
      : 'Ask me what\'s next in your business');

  const handleBack = () => navigate('/admin-hub?tab=more');

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    setRateLimited(false);
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    let isRateLimit = false;
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('exire-advisor', {
        body: { messages: next, model: modelKey },
      });
      if (fnErr) {
        const { status, body } = await readResponseBody((fnErr as any).context);
        console.warn('[Advisor] invoke error', { message: fnErr.message, status, body });
        const code = body?.code ?? '';
        if (code === 'RATE_LIMIT' || status === 429) {
          isRateLimit = true;
          throw new Error(RATE_LIMIT_MSG(language));
        }
        throw new Error(body?.message || fnErr.message || (language === 'he' ? 'שגיאת שרת' : language === 'es' ? 'Error del servidor' : 'Server error'));
      }
      const d = data as any;
      if (d?.error) {
        console.warn('[Advisor] data error', { code: d.code, message: d.message });
        if (d.code === 'RATE_LIMIT') {
          isRateLimit = true;
          throw new Error(RATE_LIMIT_MSG(language));
        }
        throw new Error(d.message || d.details || (language === 'he' ? 'שגיאה לא צפויה' : language === 'es' ? 'Error inesperado' : 'Unexpected error'));
      }
      const reply = d?.reply || (language === 'he' ? 'לא התקבלה תשובה.' : language === 'es' ? 'No se recibió respuesta.' : 'No response received.');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      if (isRateLimit) {
        setRateLimited(true);
        setError(RATE_LIMIT_MSG(language));
      } else {
        setError(e?.message || (language === 'he' ? 'שגיאה לא צפויה — נסה שוב בעוד רגע' : language === 'es' ? 'Error inesperado — intenta de nuevo en un momento' : 'Unexpected error — try again in a moment'));
      }
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const hasMessages = messages.length > 0;
  const showRateNote = rateLimited;

  if (variant === 'page') {
    return (
      <div className="w-full max-w-[1100px] mx-auto h-full min-h-0 px-1 md:px-2" dir="rtl">
        {/* One compact back chip — visible on mobile & desktop */}
        <div className="shrink-0 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/70 px-3 h-9 text-[12.5px] font-medium text-foreground/80 hover:bg-muted/60 hover:text-foreground active:scale-95 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'he' ? 'חזרה ל"עוד"' : language === 'es' ? 'Volver a Más' : 'Back to More'}
          </button>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm flex flex-col h-[calc(100%-3rem)] min-h-0 overflow-hidden p-3 md:p-4 gap-0 shadow-sm">
          {!hasMessages && renderCommandCards()}
          {renderConversation()}
          {renderComposer()}
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full min-h-0 gap-0" dir="rtl">
      {/* Header */}
      <div className="shrink-0 pb-1.5">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
            <Brain className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] md:text-base font-bold leading-tight">
              {language === 'he' ? 'המוח העסקי' : language === 'es' ? 'Asesor de negocios' : 'Business Advisor'}
            </h1>
            <p className="text-[10px] md:text-[11px] text-muted-foreground truncate">
              {language === 'he' ? 'אסטרטגיה, סדר עדיפויות' : language === 'es' ? 'Estrategia, prioridades' : 'Strategy, priorities'}
            </p>
          </div>
          {onClose && variant === 'widget' && (
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {showRateNote && (
          <div className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2.5 py-1">
            {RATE_LIMIT_NOTE(language)}
          </div>
        )}
      </div>
      {!hasMessages && renderCommandCards()}
      {renderConversation()}
      {renderComposer()}
    </div>
  );

  function renderCommandCards() {
    return (
      <div className="shrink-0 pb-2">
        <p className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5 px-1 text-muted-foreground/80">
          <Sparkles className="h-3 w-3 text-primary" /><span>{language === 'he' ? 'תתחיל בשאלה' : language === 'es' ? 'Empieza con una pregunta' : 'Start with a question'}</span>
        </p>
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
          {SUGGESTED(language).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={loading}
              className={cn(
                'rounded-xl border border-border/50 bg-card/90',
                'px-2.5 py-2 min-h-[42px] font-medium',
                'text-[12.5px] leading-tight',
                'hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-sm',
                'active:scale-[0.97] transition-all disabled:opacity-50',
                'flex items-center gap-2 text-start w-full',
              )}
            >
              <Lightbulb className="h-3.5 w-3.5 shrink-0 text-primary/50" />
              <span className="flex-1">{s}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

function renderConversation() {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="space-y-2.5 py-0.5">
          {!hasMessages && (
            <div className="text-center py-6 flex flex-col items-center gap-2">
              <div className="rounded-xl bg-primary/5 p-1.5">
                <Brain className="h-5 w-5 text-primary/60" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">
                {surfacePrompt}
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[92%] md:max-w-[85%] rounded-2xl px-4 py-3 text-[14px] md:text-[15px] leading-relaxed',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/50 text-foreground rounded-bl-sm border border-border/40',
                )}
              >
                {m.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <MarkdownContent content={m.content} />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted/50 border border-border/40 px-4 py-3 text-[13px] text-muted-foreground flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                {language === 'he' ? 'המוח חושב…' : language === 'es' ? 'El asesor está pensando…' : 'The advisor is thinking…'}
              </div>
            </div>
          )}
          {error && (
            <div className={cn(
              'text-[12px] rounded-xl px-3.5 py-2',
              rateLimited
                ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40'
                : 'text-destructive bg-destructive/10 border border-destructive/30',
            )}>
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    );
  }

  function renderComposer() {
    return (
      <div className="shrink-0 pt-1.5">
        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl p-1.5 flex items-end gap-1.5 shadow-sm">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder={language === 'he' ? 'שאל את המוח…' : language === 'es' ? 'Pregunta al asesor…' : 'Ask the advisor…'}
            disabled={loading}
            rows={1}
            className="resize-none min-h-[42px] max-h-28 border-0 bg-transparent focus-visible:ring-0 text-[13.5px] p-2.5"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl h-10 w-10"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
        <div className="text-[9px] text-muted-foreground/40 text-center mt-1 px-2 pb-1">
          {language === 'he' ? 'קריאה בלבד' : language === 'es' ? 'Solo lectura' : 'Read-only'}
        </div>
      </div>
    );
  }
}
