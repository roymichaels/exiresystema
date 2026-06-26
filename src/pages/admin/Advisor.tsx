/**
 * Advisor page — "המוח העסקי".
 *
 * Admin-only chat surface for Exire Advisor (Phase AI-2A).
 * Read-only — Advisor cannot mutate data; it only suggests next actions.
 */
import { useEffect, useRef, useState } from 'react';
import { Brain, Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MobileAdminScreen, MobileAdminHeader, MobileSectionCard } from '@/components/admin/mobile';
import { cn } from '@/lib/utils';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SUGGESTED: string[] = [
  'מה הדבר הבא שאני צריך לעשות?',
  'סכם לי את היום',
  'איזה לידים הכי חשובים?',
  'מה חסר במשפך?',
  'איפה הכסף תקוע?',
];

export default function Advisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('exire-advisor', {
        body: { messages: next },
      });
      if (fnErr) throw fnErr;
      if ((data as any)?.error) throw new Error((data as any).error);
      const reply = (data as any)?.reply || 'לא התקבלה תשובה.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e?.message || 'שגיאה לא צפויה');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-1 pb-24" dir="rtl">
      <MobileAdminScreen className="md:!block">
        <MobileAdminHeader
          title="המוח העסקי"
          subtitle="אסטרטגיה, סדר עדיפויות ופעולות להיום"
          right={
            <div className="rounded-full bg-primary/10 p-1.5">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          }
        />

        {/* Suggested chips */}
        <MobileSectionCard title="התחל בשאלה">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className={cn(
                  'text-[12px] rounded-full border border-border/50 bg-card/60',
                  'px-3 py-1.5 hover:border-primary/40 hover:bg-primary/5',
                  'active:scale-[0.97] transition-all disabled:opacity-50',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </MobileSectionCard>

        {/* Messages */}
        <MobileSectionCard flush>
          <div className="p-3 space-y-3 min-h-[240px]">
            {messages.length === 0 && (
              <div className="text-center text-[12.5px] text-muted-foreground py-8 flex flex-col items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary/70" />
                <div>שאל אותי מה הדבר הבא שצריך לעשות בעסק.</div>
                <div className="text-[11px]">תשובה בעברית. ללא שינויים בנתונים.</div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted/60 text-foreground rounded-bl-sm border border-border/40',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted/60 border border-border/40 px-3.5 py-2 text-[13px] text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  המוח חושב…
                </div>
              </div>
            )}
            {error && (
              <div className="text-[12px] text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </MobileSectionCard>

        {/* Input */}
        <div className="sticky bottom-0 -mx-1 px-1 pt-2 pb-3 bg-gradient-to-t from-background via-background to-background/0">
          <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur p-2 flex items-end gap-2">
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
              placeholder="שאל את המוח…"
              disabled={loading}
              rows={1}
              className="resize-none min-h-[40px] max-h-32 border-0 bg-transparent focus-visible:ring-0 text-[13.5px] p-2"
            />
            <Button
              type="button"
              size="icon"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-xl"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="text-[10.5px] text-muted-foreground/70 text-center mt-1.5">
            קריאה-בלבד · המוח לא שולח הודעות ולא משנה נתונים
          </div>
        </div>
      </MobileAdminScreen>
    </div>
  );
}
