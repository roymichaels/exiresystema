/**
 * IntakeChatModal — fullscreen cinematic AION consciousness scanner overlay.
 * Streams from the `intake-chat` edge function; reveals a WhatsApp CTA after `save_lead`.
 *
 * Uses the AION visual language (atmo-surface, aion-glow, rounded-full send button)
 * directly — without the auth-bound AION hooks — because this runs anonymously
 * on the landing page (no user, no GameState, no Supabase RPCs).
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AmbientBackdrop } from '../AmbientBackdrop';

const ENDPOINT = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/intake-chat`;

interface SaveLeadResult {
  ok: boolean;
  lead_id?: string;
  pattern_diagnosis?: string;
  whatsapp_url?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IntakeChatModal({ open, onOpenChange }: Props) {
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: ENDPOINT }),
  });

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Refocus textarea after streaming
  useEffect(() => {
    if (started && status === 'ready') inputRef.current?.focus();
  }, [started, status]);

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') tryClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, messages.length]);

  // Reset when reopened
  useEffect(() => {
    if (!open) setStarted(false);
  }, [open]);

  const tryClose = () => {
    if (messages.length > 0 && !window.confirm('לסגור את הסריקה? המידע יאבד.')) return;
    onOpenChange(false);
  };

  const startScan = () => {
    setStarted(true);
    void sendMessage({ text: 'התחל' });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || status === 'streaming' || status === 'submitted') return;
    void sendMessage({ text });
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Extract save_lead tool result
  const saveResult: SaveLeadResult | null = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as UIMessage;
      for (const part of m.parts ?? []) {
        const anyPart = part as any;
        if (
          anyPart?.type === 'tool-save_lead' &&
          anyPart.state === 'output-available' &&
          anyPart.output?.ok
        ) {
          return anyPart.output as SaveLeadResult;
        }
      }
    }
    return null;
  })();

  const isBusy = status === 'streaming' || status === 'submitted';
  const showTyping =
    isBusy && messages[messages.length - 1]?.role === 'user';

  if (!open) return null;

  const node = (
    <div
      className="mindhacker-theme fixed inset-0 z-[100] flex flex-col"
      dir="rtl"
      lang="he"
      style={{ background: 'hsl(var(--mh-bg) / 0.97)', backdropFilter: 'blur(24px)' }}
    >
      <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
        <AmbientBackdrop variant="hero" showOrb />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="block h-2 w-2 rounded-full bg-[hsl(var(--mh-sand))] mh-breathe" />
          <span className="mh-eyebrow">AION · Consciousness Scan</span>
        </div>
        <button
          onClick={tryClose}
          aria-label="סגור"
          className="rounded-full p-2 text-[hsl(var(--mh-mute))] transition-colors hover:text-[hsl(var(--mh-ink))]"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Stage A — Hook */}
      {!started && !saveResult && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="mh-eyebrow mb-8">פרק ראשון</p>
          <h2 className="mh-serif text-3xl leading-[1.15] sm:text-5xl md:text-6xl">
            רוב האנשים חיים מתוך דפוסים
            <br />
            <span className="text-[hsl(var(--mh-sand))]">שמעולם לא בחרו.</span>
          </h2>
          <p className="mt-8 max-w-xl text-base leading-[2] text-[hsl(var(--mh-mute))]">
            בוא נבין מה מנהל אותך כרגע.
          </p>
          <button onClick={startScan} className="mh-cta-primary mt-12">
            התחל את הסריקה
          </button>
        </div>
      )}

      {/* Stage C — Reveal */}
      {saveResult && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="mh-eyebrow mb-8">הסריקה הושלמה</p>
          <h2 className="mh-serif text-2xl leading-[1.2] sm:text-4xl md:text-5xl max-w-3xl">
            {saveResult.pattern_diagnosis ||
              'המערכת זיהתה את הדפוסים שמנהלים אותך כרגע.'}
          </h2>
          <p className="mt-8 max-w-xl text-base leading-[2] text-[hsl(var(--mh-mute))]">
            השלב הבא הוא לבנות אותך מחדש בצורה מדויקת.
          </p>
          {saveResult.whatsapp_url ? (
            <a
              href={saveResult.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mh-cta-primary mt-12"
            >
              המשך לוואטסאפ
            </a>
          ) : (
            <button onClick={() => onOpenChange(false)} className="mh-cta-primary mt-12">
              סגור
            </button>
          )}
        </div>
      )}

      {/* Stage B — AION-styled chat */}
      {started && !saveResult && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 md:px-10"
          >
            <div className="mx-auto flex max-w-2xl flex-col gap-5">
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === 'text' ? p.text : ''))
                  .join('');
                if (!text.trim()) return null;
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={cn('group', isUser && 'flex flex-col items-start')}
                  >
                    <div className="mb-1.5">
                      <span className="text-xs font-medium text-[hsl(var(--mh-mute))]">
                        {isUser ? 'את/ה' : 'AION'}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 max-w-[90%] text-[0.95rem] leading-[1.85] whitespace-pre-wrap break-words text-[hsl(var(--mh-ink))]',
                        isUser
                          ? 'bg-[hsl(var(--mh-sand)/0.12)] rounded-bl-sm'
                          : 'atmo-surface-soft dark:aion-glow-cyan rounded-br-sm'
                      )}
                    >
                      {text}
                    </div>
                  </div>
                );
              })}

              {showTyping && (
                <div className="flex flex-col items-end">
                  <div className="atmo-surface-soft dark:aion-glow-cyan rounded-2xl px-4 py-3 animate-aion-emerge">
                    <p className="mb-2 text-xs font-medium text-[hsl(var(--mh-mute))]">
                      AION סורק...
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.7)]" />
                      <span
                        className="w-2 h-2 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.5)]"
                        style={{ animationDelay: '300ms' }}
                      />
                      <span
                        className="w-2 h-2 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.3)]"
                        style={{ animationDelay: '600ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-400/80 text-center">
                  שגיאה: {(error as Error).message}
                </div>
              )}
            </div>
          </div>

          {/* AION-styled composer */}
          <div className="shrink-0 border-t border-[hsl(var(--mh-mute)/0.15)] px-4 py-4 md:px-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mx-auto max-w-2xl"
            >
              <div className="relative flex items-end gap-3">
                <div
                  className={cn(
                    'flex-1 relative atmo-surface-soft transition-shadow rounded-2xl',
                    'focus-within:dark:aion-glow-cyan focus-within:ring-1 focus-within:ring-aion-cyan/30'
                  )}
                >
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="כתוב את תשובתך..."
                    disabled={isBusy}
                    rows={1}
                    dir="rtl"
                    className={cn(
                      'w-full bg-transparent px-4 py-3 text-sm',
                      'resize-none overflow-hidden',
                      'focus:outline-none disabled:opacity-50',
                      'placeholder:text-[hsl(var(--mh-mute))] text-[hsl(var(--mh-ink))]'
                    )}
                    style={{ maxHeight: '200px' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isBusy || !input.trim()}
                  className={cn(
                    'rounded-full h-11 w-11 shrink-0 flex items-center justify-center',
                    'dark:bg-aion-blue bg-[hsl(var(--mh-sand))] text-[hsl(var(--mh-bg))]',
                    'dark:hover:bg-aion-blue/90 hover:opacity-90',
                    'dark:aion-glow-soft transition-opacity',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  aria-label="שלח"
                >
                  {isBusy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
