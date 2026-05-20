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
import OrbView from '@/components/orb/v2/OrbView';
import { HOLO_AION_PROFILE } from './holoAionProfile';

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
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" dir="rtl">
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
        {/* Header — entity-style profile */}
        <header className="relative border-b border-[hsl(var(--mh-line))] px-5 pb-5 pt-6">
          <button
            type="button"
            aria-label="סגור שיחה"
            onClick={() => onOpenChange(false)}
            className="absolute start-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--mh-mute))] transition-colors hover:bg-[hsl(var(--mh-bg-2))] hover:text-[hsl(var(--mh-ink))]"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center gap-3">
            <span className="relative flex h-20 w-20 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-[-14px] rounded-full animate-pulse"
                style={{
                  background:
                    'radial-gradient(circle, hsl(var(--mh-sand) / 0.35) 0%, hsl(280 70% 60% / 0.18) 45%, transparent 75%)',
                  filter: 'blur(6px)',
                }}
              />
              <OrbView
                size={80}
                state="idle"
                tier="cinematic"
                profile={HOLO_AION_PROFILE}
                className="relative h-20 w-20"
                ariaLabel="AION"
              />
            </span>
            <div className="flex flex-col items-center gap-1">
              <span dir="ltr" className="mh-serif text-xl leading-none text-[hsl(var(--mh-ink))]">
                AION
              </span>
              <span className="flex items-center gap-1.5 text-[0.7rem] text-[hsl(var(--mh-mute))]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                כאן, מקשיב לך
              </span>
            </div>
          </div>
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
                <div className="flex items-start gap-3 text-[hsl(var(--mh-mute))]">
                  <OrbView
                    size={32}
                    state="thinking"
                    tier="standard"
                    profile={HOLO_AION_PROFILE}
                    className="mt-0.5 h-8 w-8 shrink-0"
                    ariaLabel=""
                  />
                  <span className="mh-eyebrow text-[0.6rem] leading-7">AION חושב…</span>
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
    <div className="flex items-start gap-3">
      <OrbView
        size={32}
        state="idle"
        tier="standard"
        profile={HOLO_AION_PROFILE}
        className="mt-1 h-8 w-8 shrink-0"
        ariaLabel=""
      />
      <div className="flex-1 space-y-3">
        <div className="whitespace-pre-wrap text-[0.95rem] leading-[1.85] text-[hsl(var(--mh-ink))]">
          {cleaned}
        </div>
        {hasIntake && (
          <button type="button" onClick={onOpenIntake} className="mh-cta-primary">
            התחל את השכתוב
          </button>
        )}
      </div>
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
