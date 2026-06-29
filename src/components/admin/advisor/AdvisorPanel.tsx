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
import { Brain, Send, Loader2, Sparkles, AlertTriangle, Lightbulb, ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

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
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

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
        body: { messages: next },
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
      <div className="w-full max-w-6xl mx-auto h-full min-h-0 px-2 md:px-0" dir="rtl">
        <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm flex flex-col h-full min-h-0 overflow-hidden p-3 md:p-4 gap-0">
          <div className="shrink-0 pb-1">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[12px] text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {language === 'he' ? 'חזרה לעוד' : language === 'es' ? 'Volver a Más' : 'Back to More'}
            </button>
          </div>
          {renderHeader()}
          {!hasMessages && renderCommandCards()}
          {renderConversation()}
          {renderComposer()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 gap-0" dir="rtl">
      {renderHeader()}
      {!hasMessages && renderCommandCards()}
      {renderConversation()}
      {renderComposer()}
    </div>
  );

  function renderHeader() {
    return (
      <div className="shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-1.5 md:p-2 shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base md:text-lg font-bold leading-tight">
              {language === 'he' ? 'המוח העסקי' : language === 'es' ? 'Asesor de negocios' : 'Business Advisor'}
            </h1>
            <p className="text-[11px] md:text-[12px] text-muted-foreground truncate">
              {language === 'he' ? 'אסטרטגיה, סדר עדיפויות ופעולות להיום' : language === 'es' ? 'Estrategia, prioridades y acciones para hoy' : 'Strategy, priorities and next actions'}
            </p>
          </div>
          {onClose && variant === 'widget' && (
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted/50 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {showRateNote && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl px-3 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {RATE_LIMIT_NOTE(language)}
          </div>
        )}
      </div>
    );
  }

  function renderCommandCards() {
    return (
      <div className="shrink-0 pb-1">
        <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-2.5 md:p-3">
          <p className="text-[11px] md:text-[12px] font-semibold mb-2 flex items-center gap-1.5 text-muted-foreground/80">
            <Sparkles className="h-3 w-3 text-primary" />
            {language === 'he' ? 'תתחיל בשאלה' : language === 'es' ? 'Empieza con una pregunta' : 'Start with a question'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED(language).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className={cn(
                  'rounded-xl border border-border/50 bg-card/90',
                  'px-3 py-3 min-h-[48px] leading-snug font-medium',
                  'text-[13px] md:text-[14px]',
                  'hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-sm',
                  'active:scale-[0.97] transition-all disabled:opacity-50',
                  'flex items-center gap-2.5 text-start w-full',
                )}
              >
                <Lightbulb className="h-4 w-4 shrink-0 text-primary/50" />
                <span className="flex-1">{s}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderConversation() {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="space-y-2.5 py-0.5">
          {!hasMessages && (
            <div className="text-center py-4 md:py-5 flex flex-col items-center gap-1.5">
              <div className="rounded-2xl bg-primary/5 p-2">
                <Brain className="h-6 w-6 text-primary/60" />
              </div>
              <p className="text-[13px] md:text-[14px] font-semibold text-foreground">
                {surfacePrompt}
              </p>
              <p className="text-[12px] text-muted-foreground max-w-md">
                {language === 'he'
                  ? 'אני יכול לעזור לך לחשוב על לידים, כסף, משפך, סשנים וסדר עדיפויות.'
                  : language === 'es'
                    ? 'Puedo ayudarte a pensar en leads, dinero, embudo, sesiones y prioridades.'
                    : 'I can help you think about leads, money, funnel, sessions and priorities.'}
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
      <div className="shrink-0 pt-1">
        <div className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-xl p-2 flex items-end gap-2 shadow-sm">
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
            className="resize-none min-h-[48px] max-h-32 border-0 bg-transparent focus-visible:ring-0 text-[14px] md:text-[15px] p-3"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="shrink-0 rounded-xl h-11 w-11"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-[9.5px] text-muted-foreground/40 text-center mt-0.5">
          {language === 'he' ? 'קריאה בלבד. המוח לא שולח הודעות ולא משנה נתונים.' : language === 'es' ? 'Solo lectura. El asesor no envía mensajes ni modifica datos.' : 'Read-only. The advisor doesn\'t send messages or change data.'}
        </div>
      </div>
    );
  }
}
