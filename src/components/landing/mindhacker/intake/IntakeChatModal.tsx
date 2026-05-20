/**
 * IntakeChatModal — cinematic AION consciousness scanner.
 * Quiet, mirroring, archetypal. Reuses AION orb + mh-* tokens.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsciousnessField } from '../ConsciousnessField';
import CanonicalAionModel from '@/components/orb/CanonicalAionModel';

const ENDPOINT = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/intake-chat`;

interface SaveLeadResult {
  ok: boolean;
  lead_id?: string;
  pattern_diagnosis?: string;
  whatsapp_url?: string;
}

interface ChoicesPart {
  prompt?: string;
  options: string[];
  allow_freeform?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IntakeChatModal({ open, onOpenChange }: Props) {
  const [started, setStarted] = useState(false);
  const [input, setInput] = useState('');
  const [freeformOpen, setFreeformOpen] = useState(false);
  const [revealDelayDone, setRevealDelayDone] = useState(false);
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
    if (started && status === 'ready' && freeformOpen) inputRef.current?.focus();
  }, [started, status, freeformOpen]);

  // ESC + body scroll lock
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
    if (!open) {
      setStarted(false);
      setFreeformOpen(false);
      setRevealDelayDone(false);
    }
  }, [open]);

  const tryClose = () => {
    if (messages.length > 0 && !window.confirm('לסגור את הסריקה? המידע יאבד.')) return;
    onOpenChange(false);
  };

  const startScan = () => {
    setStarted(true);
    void sendMessage({ text: 'התחל' });
  };

  const sendText = (text: string) => {
    if (!text.trim() || status === 'streaming' || status === 'submitted') return;
    void sendMessage({ text });
    setInput('');
    setFreeformOpen(false);
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText(input);
    }
  };

  // Extract latest save_lead result
  const saveResult: SaveLeadResult | null = useMemo(() => {
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
  }, [messages]);

  // Hold a 1.2s cinematic beat before revealing diagnosis
  useEffect(() => {
    if (!saveResult) {
      setRevealDelayDone(false);
      return;
    }
    const t = setTimeout(() => setRevealDelayDone(true), 1200);
    return () => clearTimeout(t);
  }, [saveResult]);

  const isBusy = status === 'streaming' || status === 'submitted';
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  // Pending offer_choices from latest assistant message
  const pendingChoices: ChoicesPart | null = useMemo(() => {
    if (!lastAssistant) return null;
    // If user already replied after this assistant turn, no choices pending
    const lastIdx = messages.indexOf(lastAssistant);
    const hasUserAfter = messages.slice(lastIdx + 1).some((m) => m.role === 'user');
    if (hasUserAfter) return null;
    for (let i = (lastAssistant.parts ?? []).length - 1; i >= 0; i--) {
      const p = lastAssistant.parts![i] as any;
      if (p?.type === 'tool-offer_choices' && p.state === 'output-available' && p.output?.options) {
        return p.output as ChoicesPart;
      }
    }
    return null;
  }, [messages, lastAssistant]);

  const showTyping = isBusy && messages[messages.length - 1]?.role === 'user';

  if (!open) return null;

  // Orb scale per state
  const orbBreathing = isBusy ? 'animate-aion-emerge' : 'mh-breathe';

  const node = (
    <div
      className="mindhacker-theme fixed inset-0 z-[100] flex flex-col"
      dir="rtl"
      lang="he"
      style={{ background: '#050207' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <ConsciousnessField intense={!started && !saveResult} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10 shrink-0">
        <div className="flex items-center gap-3">
          <span className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--mh-sand))] mh-breathe" />
          <span className="mh-eyebrow opacity-70">AION</span>
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
          <div className={cn('mb-10', orbBreathing)}>
            <CanonicalAionModel size={160} ariaLabel="AION" />
          </div>
          <h2 className="mh-serif text-3xl leading-[1.2] sm:text-5xl md:text-6xl max-w-2xl">
            רוב האנשים חיים מתוך דפוסים
            <br />
            <span className="text-[hsl(var(--mh-sand))]">שמעולם לא בחרו.</span>
          </h2>
          <p className="mt-8 max-w-md text-base leading-[2] text-[hsl(var(--mh-mute))]">
            בוא נראה מה מנהל אותך.
          </p>
          <button onClick={startScan} className="mh-cta-primary mt-12">
            התחל
          </button>
        </div>
      )}

      {/* Stage C — Reveal (cinematic beat) */}
      {saveResult && (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-10 mh-breathe">
            <CanonicalAionModel size={140} ariaLabel="AION" />
          </div>
          {revealDelayDone ? (
            <div className="animate-fade-in">
              <p className="mh-eyebrow mb-6 opacity-70">זוהה</p>
              <h2 className="mh-serif text-2xl leading-[1.3] sm:text-4xl md:text-5xl max-w-3xl">
                {saveResult.pattern_diagnosis ||
                  'זיהיתי את הדפוס שמנהל אותך כרגע.'}
              </h2>
              <p className="mt-8 max-w-md text-base leading-[2] text-[hsl(var(--mh-mute))]">
                השלב הבא כבר ממתין.
              </p>
              {saveResult.whatsapp_url ? (
                <a
                  href={saveResult.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mh-cta-primary mt-12 inline-block"
                >
                  המשך
                </a>
              ) : (
                <button onClick={() => onOpenChange(false)} className="mh-cta-primary mt-12">
                  סגור
                </button>
              )}
            </div>
          ) : (
            <div className="h-12" aria-hidden />
          )}
        </div>
      )}

      {/* Stage B — Scan */}
      {started && !saveResult && (
        <>
          {/* Floating orb above the conversation */}
          <div className="shrink-0 flex justify-center pt-2 pb-4">
            <div className={cn('transition-transform', orbBreathing)}>
              <CanonicalAionModel size={88} ariaLabel="AION" />
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-6 md:px-10">
            <div className="mx-auto flex max-w-xl flex-col gap-6">
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === 'text' ? p.text : ''))
                  .join('')
                  .trim();
                const reflectPart = m.parts.find(
                  (p: any) => p?.type === 'tool-reflect' && p.state === 'output-available',
                ) as any;
                const reflectInsight: string | undefined = reflectPart?.output?.insight;

                if (!text && !reflectInsight) return null;
                const isUser = m.role === 'user';

                return (
                  <div key={m.id} className="flex flex-col gap-3 animate-fade-in">
                    {reflectInsight && !isUser && (
                      <p
                        className="mh-serif text-center text-lg leading-[1.7] sm:text-xl text-[hsl(var(--mh-sand))] px-4"
                        style={{ fontStyle: 'italic' }}
                      >
                        {reflectInsight}
                      </p>
                    )}
                    {text && (
                      <div
                        className={cn(
                          'max-w-[90%] text-[0.98rem] leading-[1.9] whitespace-pre-wrap break-words text-[hsl(var(--mh-ink))]',
                          isUser
                            ? 'self-start rounded-2xl rounded-bl-sm bg-[hsl(var(--mh-sand)/0.10)] px-4 py-3'
                            : 'self-end px-1',
                        )}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                );
              })}

              {showTyping && (
                <div className="flex justify-end pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.8)]" />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.55)]"
                      style={{ animationDelay: '250ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-aion-breath bg-[hsl(var(--mh-sand)/0.3)]"
                      style={{ animationDelay: '500ms' }}
                    />
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

          {/* Chips OR composer */}
          <div className="shrink-0 px-4 pb-6 pt-2 md:px-10">
            <div className="mx-auto max-w-xl">
              {pendingChoices && !freeformOpen ? (
                <div className="flex flex-wrap justify-center gap-2 animate-fade-in">
                  {pendingChoices.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => sendText(opt)}
                      disabled={isBusy}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm transition-all',
                        'border border-[hsl(var(--mh-sand)/0.25)] bg-[hsl(var(--mh-sand)/0.06)]',
                        'text-[hsl(var(--mh-ink))] hover:bg-[hsl(var(--mh-sand)/0.14)]',
                        'hover:border-[hsl(var(--mh-sand)/0.5)]',
                        'disabled:opacity-40',
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                  {pendingChoices.allow_freeform !== false && (
                    <button
                      onClick={() => {
                        setFreeformOpen(true);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="rounded-full px-4 py-2 text-sm text-[hsl(var(--mh-mute))] hover:text-[hsl(var(--mh-ink))] transition-colors"
                    >
                      אחר…
                    </button>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendText(input);
                  }}
                >
                  <div className="relative flex items-end gap-3">
                    <div
                      className={cn(
                        'flex-1 relative atmo-surface-soft transition-shadow rounded-2xl',
                        'focus-within:dark:aion-glow-cyan focus-within:ring-1 focus-within:ring-[hsl(var(--mh-sand)/0.4)]',
                      )}
                    >
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="כתוב, או פשוט תרגיש"
                        disabled={isBusy}
                        rows={1}
                        dir="rtl"
                        className={cn(
                          'w-full bg-transparent px-4 py-3 text-sm',
                          'resize-none overflow-hidden',
                          'focus:outline-none disabled:opacity-50',
                          'placeholder:text-[hsl(var(--mh-mute))] text-[hsl(var(--mh-ink))]',
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
                        'disabled:opacity-40 disabled:cursor-not-allowed',
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
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
