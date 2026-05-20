/**
 * IntakeChatModal — fullscreen cinematic AION consciousness scanner overlay.
 * Streams from the `intake-chat` edge function; reveals a WhatsApp CTA after `save_lead`.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { X } from 'lucide-react';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
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

  // Refocus textarea
  useEffect(() => {
    if (started && status === 'ready') inputRef.current?.focus();
  }, [started, status]);

  // ESC to close
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
  }, [open, messages.length]);

  // Reset when reopened from scratch
  useEffect(() => {
    if (!open) setStarted(false);
  }, [open]);

  const tryClose = () => {
    if (messages.length > 0 && !window.confirm('לסגור את הסריקה? המידע יאבד.')) return;
    onOpenChange(false);
  };

  const startScan = () => {
    setStarted(true);
    // Kick off the AI with an empty user signal so AION opens with its Hook
    void sendMessage({ text: 'התחל' });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || status === 'streaming' || status === 'submitted') return;
    void sendMessage({ text });
    setInput('');
  };

  // Extract save_lead tool result (final reveal)
  const saveResult: SaveLeadResult | null = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as UIMessage;
      for (const part of m.parts ?? []) {
        // AI SDK v6 tool part shape: { type: 'tool-<name>', state, output }
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

  if (!open) return null;

  const node = (
    <div
      className="mindhacker-theme fixed inset-0 z-[100] flex flex-col"
      dir="rtl"
      lang="he"
      style={{ background: 'hsl(var(--mh-bg) / 0.97)', backdropFilter: 'blur(24px)' }}
    >
      <div className="absolute inset-0 -z-10 opacity-40">
        <AmbientBackdrop variant="hero" showOrb />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
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

      {/* Stage B — Chat */}
      {started && !saveResult && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-6 md:px-10"
          >
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              {messages.map((m) => {
                const text = m.parts
                  .map((p) => (p.type === 'text' ? p.text : ''))
                  .join('');
                if (!text.trim()) return null;
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={isUser ? 'flex justify-start' : 'flex justify-end'}
                  >
                    <div
                      className={
                        isUser
                          ? 'max-w-[85%] rounded-2xl bg-[hsl(var(--mh-sand)/0.12)] px-5 py-3 text-[0.98rem] leading-[1.85] text-[hsl(var(--mh-ink))]'
                          : 'max-w-[90%] text-[1.02rem] leading-[2] text-[hsl(var(--mh-ink))] whitespace-pre-wrap'
                      }
                    >
                      {text}
                    </div>
                  </div>
                );
              })}
              {(status === 'submitted' || status === 'streaming') &&
                messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-end">
                    <Shimmer>AION סורק...</Shimmer>
                  </div>
                )}
              {error && (
                <div className="text-sm text-red-400/80">
                  שגיאה: {(error as Error).message}
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t border-[hsl(var(--mh-mute)/0.15)] px-4 py-4 md:px-10">
            <div className="mx-auto max-w-2xl">
              <PromptInput
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <PromptInputTextarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="כתוב את תשובתך..."
                  dir="rtl"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit
                    status={status}
                    disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(node, document.body);
}
