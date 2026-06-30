/**
 * AssistantOrb — premium floating AI assistant presence.
 *
 * - Closed: glowing purple orb (desktop bottom-right, mobile above bottom nav)
 * - Suggestion: dismissible speech bubble with contextual nudge
 * - Open: compact floating chat panel (desktop 400×560, mobile bottom sheet)
 */
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, X, Send, Brain } from 'lucide-react';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantOrbProps {
  /** Contextual suggestion text shown above the orb. */
  suggestion?: string;
  /** Whether to show the suggestion bubble on mobile. Defaults to false to avoid competing with content. */
  suggestOnMobile?: boolean;
  /** Called when the user sends a message. */
  onSend?: (text: string) => void;
  className?: string;
}

export function AssistantOrb({ suggestion: initialSuggestion, suggestOnMobile = false, onSend, className }: AssistantOrbProps) {
  const [open, setOpen] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(!!initialSuggestion);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi, I'm your AI assistant. How can I help you today?",
    },
  ]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const allowSuggestion = isMobile ? suggestOnMobile : true;
    setShowSuggestion(!!initialSuggestion && !open && allowSuggestion);
  }, [initialSuggestion, open, isMobile, suggestOnMobile]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    const userMsg: AssistantMessage = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    onSend?.(text);
    // Simulate a brief assistant acknowledgement so the UI feels alive.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'I received your message. I will process this and get back to you shortly.',
        },
      ]);
    }, 600);
  };

  return (
    <div className={cn('fixed z-[70] pointer-events-none', className)}>
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* Suggestion bubble */}
        {showSuggestion && initialSuggestion && (
          <div className="relative mb-1 mr-1 max-w-[280px] sm:max-w-[320px]">
            <button
              type="button"
              onClick={() => setShowSuggestion(false)}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Dismiss suggestion"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full text-start rounded-2xl rounded-br-md border border-border/50 bg-card/90 backdrop-blur-md px-4 py-3 shadow-lg text-sm hover:bg-card transition-colors"
            >
              <span className="flex items-center gap-1.5 text-primary font-medium text-xs mb-1">
                <Sparkles className="h-3 w-3" /> AI Assistant
              </span>
              {initialSuggestion}
            </button>
          </div>
        )}

        {/* Open chat panel — desktop floating */}
        {open && (
          <>
            <div className={cn(
              'hidden lg:flex flex-col mb-3 mr-1',
              'w-[400px] h-[560px] max-h-[calc(100vh-140px)]',
              'rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden',
            )}>
              <ChatHeader onClose={() => setOpen(false)} />
              <ChatBody messages={messages} scrollRef={scrollRef} />
              <ChatComposer draft={draft} setDraft={setDraft} onSend={handleSend} />
            </div>

            {/* Mobile bottom sheet */}
            <div className={cn(
              'lg:hidden fixed inset-x-0 bottom-0 z-[80]',
              'flex flex-col h-[60vh] max-h-[520px]',
              'rounded-t-2xl border-t border-x border-border/50 bg-card/95 backdrop-blur-xl shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.4)] overflow-hidden',
            )}>
              <ChatHeader onClose={() => setOpen(false)} />
              <ChatBody messages={messages} scrollRef={scrollRef} />
              <ChatComposer draft={draft} setDraft={setDraft} onSend={handleSend} />
            </div>

            {/* Mobile backdrop */}
            <div
              className="lg:hidden fixed inset-0 z-[75] bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
          </>
        )}

        {/* Orb */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'relative rounded-full',
            'h-11 w-11 lg:h-14 lg:w-14',
            'bg-gradient-to-br from-primary to-purple-700',
            'shadow-[0_0_24px_-4px_rgba(168,85,247,0.7)]',
            'flex items-center justify-center text-white',
            'transition-transform duration-200 hover:scale-105 active:scale-95',
            open && 'ring-2 ring-primary/50',
          )}
          aria-label={open ? 'Close assistant' : 'Open assistant'}
        >
          {open ? <X className="h-4 w-4 lg:h-5 lg:w-5" /> : <Brain className="h-5 w-5 lg:h-6 lg:w-6" />}
          <span className="absolute inset-0 rounded-full animate-pulse bg-primary/20" />
        </button>
      </div>
    </div>
  );
}

function ChatHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/40 bg-muted/20">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-primary">
          <Brain className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-semibold">AI Assistant</div>
          <div className="text-[10px] text-muted-foreground">Always learning</div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ChatBody({
  messages,
  scrollRef,
}: {
  messages: AssistantMessage[];
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            'flex w-full',
            m.role === 'user' ? 'justify-end' : 'justify-start',
          )}
        >
          <div
            className={cn(
              'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
              m.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted/70 text-foreground rounded-bl-md',
            )}
          >
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatComposer({
  draft,
  setDraft,
  onSend,
}: {
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="border-t border-border/40 p-3 bg-card">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask anything..."
          className="h-10 flex-1 bg-muted/40 border-border/40"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

export default AssistantOrb;
