/**
 * Admin transcripts viewer — groups landing_chat_messages by session_id
 * so you can read full conversations from the homepage AION chat and the
 * intake chat even when no lead form was completed.
 */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  session_id: string;
  source: string;
  role: string;
  content: string;
  language: string | null;
  created_at: string;
}

interface SessionGroup {
  session_id: string;
  source: string;
  first_at: string;
  last_at: string;
  messages: Message[];
}

const heSourceLabel: Record<string, string> = {
  intake_chat: "צ׳אט קליטה",
  aion_landing_chat: "צ׳אט נחיתה AION",
};

const enSourceLabel: Record<string, string> = {
  intake_chat: "Intake Chat",
  aion_landing_chat: "AION Landing Chat",
};

export const LandingChatTranscripts = () => {
  const { language } = useTranslation();
  const sourceLabel = language === 'he' ? heSourceLabel : enSourceLabel;
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("landing_chat_messages" as any)
      .select("*")
      .order("created_at", { ascending: true })
      .limit(2000);
    if (!error) setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const sessions: SessionGroup[] = useMemo(() => {
    const map = new Map<string, SessionGroup>();
    for (const m of rows) {
      const g = map.get(m.session_id);
      if (g) {
        g.messages.push(m);
        g.last_at = m.created_at;
      } else {
        map.set(m.session_id, {
          session_id: m.session_id,
          source: m.source,
          first_at: m.created_at,
          last_at: m.created_at,
          messages: [m],
        });
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime(),
    );
  }, [rows]);

  const current = sessions.find((s) => s.session_id === selected) || sessions[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="glass-panel border-primary/20">
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          {language === 'he'
            ? 'אין תמלילי צ\'אט עדיין. הם יופיעו כאן ברגע שמבקרים יתחילו שיחה בעמוד הבית.'
            : "No chat transcripts yet. They'll appear here as soon as visitors start a conversation on the homepage."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-4">
      <Card className="glass-panel border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">{language === 'he' ? 'שיחות' : 'Sessions'} ({sessions.length})</CardTitle>
          <Button size="icon" variant="ghost" onClick={fetchRows}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <ul className="divide-y divide-border">
              {sessions.map((s) => {
                const active = current && current.session_id === s.session_id;
                return (
                  <li key={s.session_id}>
                    <button
                      onClick={() => setSelected(s.session_id)}
                      className={`w-full text-left px-3 py-2 hover:bg-accent/50 transition ${
                        active ? "bg-accent/60" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {sourceLabel[s.source] || s.source}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(s.last_at), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <div className="text-xs mt-1 truncate font-mono">
                        {s.session_id.slice(0, 8)}…
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {s.messages.length} {language === 'he' ? 'הודעות' : 'messages'}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="glass-panel border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge variant="outline">{sourceLabel[current.source] || current.source}</Badge>
            <span className="font-mono text-xs">{current.session_id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-3">
              {current.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-3 text-sm ${
                    m.role === "user"
                      ? "bg-primary/10 border border-primary/30"
                      : m.role === "assistant"
                      ? "bg-card border border-border"
                      : "bg-muted/40 border border-dashed text-xs text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">
                      {m.role}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(m.created_at), "HH:mm:ss")}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingChatTranscripts;
