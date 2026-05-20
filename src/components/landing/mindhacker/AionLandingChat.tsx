/**
 * AionLandingChat — session-only chatbot for the mindhacker landing page.
 * Trained (via system prompt in the edge function) on landing copy + Exire Systema.
 * Renders a right-side drawer that matches the cinematic theme.
 * The assistant can emit `[[OPEN_INTAKE]]` to surface a CTA button that opens the intake modal.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { X, ArrowUp } from 'lucide-react';

const ENDPOINT = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/aion-landing-chat`;

const SUGGESTIONS = [
  'מה זה Exire Systema?',
  'מה ההבדל בין היפנוזה רגילה לעבודה שלך?',
  'איך מתחילים?',
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenIntake: () => void;
}

export default function AionLandingChat({ open, onOpenChange, onOpenIntake }: Props) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: ENDPOINT,
        headers: { 'Content-Type': 'application/json' },
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const formInputRef = useRef<string>('');

  // Auto-scroll to bottom on new messages / streaming
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status, open]);

  // Focus the textarea when opening or after streaming finishes
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, status]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || status === 'streaming' || status === 'submitted') return;
    sendMessage({ text: value });
    if (inputRef.current) inputRef.current.value = '';
    formInputRef.current = '';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" dir="rtl">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="סגור"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside
        className="absolute inset-y-0 end-0 flex w-full flex-col border-s border-[hsl(var(--mh-line))] bg-[hsl(var(--mh-bg))] sm:max-w-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[hsl(var(--mh-line))] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--mh-sand))] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(var(--mh-sand))]" />
            </span>
            <div className="flex flex-col">
              <span dir="ltr" className="mh-serif text-base text-[hsl(var(--mh-ink))]">
                AION
              </span>
              <span className="mh-eyebrow text-[0.55rem] text-[hsl(var(--mh-mute))]">
                שואל על הדף הזה
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="סגור שיחה"
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--mh-mute))] transition-colors hover:bg-[hsl(var(--mh-bg-2))] hover:text-[hsl(var(--mh-ink))]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          {messages.length === 0 ? (
            <EmptyState onPick={submit} />
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <MessageRow
                  key={m.id}
                  role={m.role}
                  text={extractText(m)}
                  onOpenIntake={() => {
                    onOpenChange(false);
                    onOpenIntake();
                  }}
                />
              ))}
              {(status === 'submitted' || status === 'streaming') && (
                <div className="flex items-center gap-2 text-[hsl(var(--mh-mute))]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--mh-sand))]" />
                  <span className="mh-eyebrow text-[0.6rem]">AION חושב…</span>
                </div>
              )}
              {error && (
                <p className="text-sm text-red-400/80">משהו נתקע. נסה שוב בעוד רגע.</p>
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(formInputRef.current);
          }}
          className="border-t border-[hsl(var(--mh-line))] bg-[hsl(var(--mh-bg))] px-4 py-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-[hsl(var(--mh-line))] bg-[hsl(var(--mh-bg-2))] px-3 py-2 focus-within:border-[hsl(var(--mh-sand))]">
            <textarea
              ref={inputRef}
              rows={1}
              dir="rtl"
              placeholder="שאל את AION על המסע…"
              defaultValue=""
              onChange={(e) => {
                formInputRef.current = e.target.value;
                const ta = e.target as HTMLTextAreaElement;
                ta.style.height = 'auto';
                ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submit(formInputRef.current);
                }
              }}
              className="max-h-[140px] flex-1 resize-none bg-transparent text-[0.95rem] leading-relaxed text-[hsl(var(--mh-ink))] outline-none placeholder:text-[hsl(var(--mh-mute))]"
            />
            <button
              type="submit"
              disabled={status === 'streaming' || status === 'submitted'}
              aria-label="שלח"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--mh-sand))] text-[hsl(var(--mh-bg))] transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

/* ─────────────── Sub-components ─────────────── */

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <p className="mh-serif text-2xl leading-snug text-[hsl(var(--mh-ink))]">
        אני כאן בשביל לענות.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--mh-mute))]">
        תשאל אותי על השיטה, על Exire Systema, או על מה שעולה לך מהדף.
      </p>
      <div className="mt-8 space-y-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="w-full rounded-2xl border border-[hsl(var(--mh-line))] bg-[hsl(var(--mh-bg-2))] px-4 py-3 text-start text-sm text-[hsl(var(--mh-ink))] transition-colors hover:border-[hsl(var(--mh-sand))]"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

const INTAKE_TOKEN = '[[OPEN_INTAKE]]';

function MessageRow({
  role,
  text,
  onOpenIntake,
}: {
  role: string;
  text: string;
  onOpenIntake: () => void;
}) {
  const hasIntake = text.includes(INTAKE_TOKEN);
  const cleaned = text.replace(INTAKE_TOKEN, '').trim();

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-[hsl(var(--mh-bg-2))] px-4 py-2.5 text-[0.95rem] leading-relaxed text-[hsl(var(--mh-ink))]">
          {cleaned}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap text-[0.95rem] leading-[1.85] text-[hsl(var(--mh-ink))]">
        {cleaned}
      </div>
      {hasIntake && (
        <button type="button" onClick={onOpenIntake} className="mh-cta-primary">
          התחל את השכתוב
        </button>
      )}
    </div>
  );
}

/* ─────────────── Helpers ─────────────── */

function extractText(msg: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!msg.parts) return '';
  return msg.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}
