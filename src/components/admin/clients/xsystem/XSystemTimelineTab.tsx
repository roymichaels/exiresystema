/**
 * XSYSTEM Timeline tab — read-only chronological aggregation of all client events.
 */
import { useMemo } from 'react';
import {
  Calendar, Brain, Repeat, Users, DoorOpen, ListChecks, Headphones,
  ClipboardCheck, CreditCard, FileText, MessageSquare,
} from 'lucide-react';
import {
  useXSystemSessions,
  useXSystemBeliefs,
  useXSystemPatterns,
  useXSystemInnerParts,
  useXSystemClientRooms,
  useXSystemAudioAssignments,
  useXSystemCheckins,
  useXSystemPayments,
  useXSystemFollowups,
  useXSystemClientProtocolApplications,
} from '@/hooks/xsystem';
import { Row, EmptyState } from './_shared';
import { Badge } from '@/components/ui/badge';

type Entry = {
  id: string;
  ts: string;
  type: string;
  title: string;
  desc?: string;
  icon: any;
};

export default function XSystemTimelineTab({ clientId }: { clientId: string }) {
  const { data: sessions = [] } = useXSystemSessions(clientId);
  const { data: beliefs = [] } = useXSystemBeliefs(clientId);
  const { data: patterns = [] } = useXSystemPatterns(clientId);
  const { data: parts = [] } = useXSystemInnerParts(clientId);
  const { data: clientRooms = [] } = useXSystemClientRooms(clientId);
  const { data: audio = [] } = useXSystemAudioAssignments(clientId);
  const { data: checkins = [] } = useXSystemCheckins(clientId);
  const { data: payments = [] } = useXSystemPayments(clientId);
  const { data: followups = [] } = useXSystemFollowups(clientId);
  const { data: protocols = [] } = useXSystemClientProtocolApplications(clientId);

  const entries = useMemo<Entry[]>(() => {
    const e: Entry[] = [];
    sessions.forEach((s) =>
      e.push({
        id: `s-${s.id}`, ts: s.scheduled_at || s.created_at, type: 'session',
        title: `סשן ${s.session_number ?? ''}`.trim(), desc: s.status, icon: Calendar,
      }),
    );
    beliefs.forEach((b) =>
      e.push({ id: `b-${b.id}`, ts: b.updated_at || b.created_at, type: 'belief',
        title: b.belief, desc: `${b.polarity} · ${b.status}`, icon: Brain }),
    );
    patterns.forEach((p) =>
      e.push({ id: `p-${p.id}`, ts: p.updated_at || p.created_at, type: 'pattern',
        title: p.name, desc: p.status, icon: Repeat }),
    );
    parts.forEach((p) =>
      e.push({ id: `pa-${p.id}`, ts: p.updated_at || p.created_at, type: 'part',
        title: p.name, desc: `${p.role} · ${p.status}`, icon: Users }),
    );
    clientRooms.forEach((r) =>
      e.push({ id: `r-${r.id}`, ts: r.entered_at || r.created_at, type: 'room',
        title: 'חדר', desc: r.state, icon: DoorOpen }),
    );
    audio.forEach((a) =>
      e.push({ id: `a-${a.id}`, ts: a.assigned_at, type: 'audio',
        title: `הקלטה (${a.frequency})`, desc: a.status, icon: Headphones }),
    );
    checkins.forEach((c) => {
      const p = (c.payload as any) || {};
      e.push({ id: `c-${c.id}`, ts: c.submitted_at, type: 'checkin',
        title: `צ׳ק-אין ${c.kind}${typeof c.mood === 'number' ? ` · ${c.mood}/10` : ''}`,
        desc: p.coach_summary || c.notes || undefined, icon: ClipboardCheck });
    });
    payments.forEach((py) =>
      e.push({ id: `pay-${py.id}`, ts: py.paid_at || py.due_at || py.created_at, type: 'payment',
        title: `תשלום ${(py.amount_cents / 100).toFixed(0)} ${py.currency}`,
        desc: `${py.kind} · ${py.status}`, icon: CreditCard }),
    );
    followups.forEach((f) =>
      e.push({ id: `f-${f.id}`, ts: f.done_at || f.due_at || f.created_at, type: 'followup',
        title: f.title, desc: `${f.priority} · ${f.status}`, icon: FileText }),
    );
    protocols.forEach((pr: any) =>
      e.push({
        id: `pr-${pr.id}`, ts: pr.created_at, type: 'protocol',
        title: pr.xsystem_protocols?.title || 'פרוטוקול',
        desc: pr.outcome || undefined, icon: ListChecks,
      }),
    );
    return e
      .filter((x) => !!x.ts)
      .sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
  }, [sessions, beliefs, patterns, parts, clientRooms, audio, checkins, payments, followups, protocols]);

  if (entries.length === 0) return <EmptyState label="ציר הזמן ריק. כל פעולה במערכת תופיע כאן." />;

  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const Icon = e.icon || MessageSquare;
        return (
          <Row key={e.id}>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-muted p-2 mt-0.5">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.ts).toLocaleString('he-IL')}
                </div>
                {e.desc && <div className="text-xs mt-1 truncate">{e.desc}</div>}
              </div>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
