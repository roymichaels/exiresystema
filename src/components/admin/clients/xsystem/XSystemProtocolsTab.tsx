import { useState } from 'react';
import { Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useXSystemProtocols,
  useXSystemSessions,
  useApplyXSystemProtocol,
  useXSystemClientProtocolApplications,
  type XSysProtocol,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

interface Props { clientId: string }

function ProtocolView({
  protocol,
  trigger,
}: {
  protocol: XSysProtocol;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const steps = (protocol.steps as any[]) || [];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{protocol.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Badge variant="outline">{protocol.category}</Badge>
          {protocol.body && (
            <p className="text-sm whitespace-pre-wrap">{protocol.body}</p>
          )}
          {steps.length > 0 && (
            <ol className="list-decimal pr-5 text-sm space-y-1">
              {steps.map((s, i) => (
                <li key={i}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>
              ))}
            </ol>
          )}
          {protocol.default_duration_minutes && (
            <p className="text-xs text-muted-foreground">
              משך מומלץ: {protocol.default_duration_minutes} דק׳
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplyDialog({
  clientId,
  protocol,
  trigger,
}: {
  clientId: string;
  protocol: XSysProtocol;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: sessions = [] } = useXSystemSessions(open ? clientId : undefined);
  const apply = useApplyXSystemProtocol();
  const [sessionId, setSessionId] = useState<string>('');
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');

  const submit = async () => {
    if (!sessionId) return;
    await apply.mutateAsync({
      session_id: sessionId,
      client_id: clientId,
      protocol_id: protocol.id,
      outcome: outcome || undefined,
      notes: notes || undefined,
    });
    setOpen(false);
    setOutcome('');
    setNotes('');
    setSessionId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>החלת פרוטוקול: {protocol.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>סשן</Label>
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger><SelectValue placeholder="בחר סשן" /></SelectTrigger>
              <SelectContent>
                {sessions.length === 0 && (
                  <div className="p-2 text-xs text-muted-foreground">אין סשנים זמינים</div>
                )}
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    סשן {s.session_number ?? ''} ·{' '}
                    {s.scheduled_at
                      ? new Date(s.scheduled_at).toLocaleDateString('he-IL')
                      : '—'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>תוצאה</Label>
            <Textarea rows={2} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </div>
          <div>
            <Label>הערות</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={submit} disabled={!sessionId || apply.isPending}>החל</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemProtocolsTab({ clientId }: Props) {
  const { data: protocols = [], isLoading } = useXSystemProtocols();
  const { data: applied = [] } = useXSystemClientProtocolApplications(clientId);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs text-muted-foreground mb-2">היסטוריית שימוש</div>
        {applied.length === 0 && <EmptyState label="עדיין לא הוחל פרוטוקול." />}
        <div className="space-y-2">
          {applied.slice(0, 10).map((a) => (
            <Row key={a.id}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {a.xsystem_protocols?.title ?? '—'}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    סשן {a.xsystem_sessions?.session_number ?? '—'} ·{' '}
                    {new Date(a.created_at).toLocaleDateString('he-IL')}
                  </div>
                  {a.outcome && <div className="text-xs mt-1">תוצאה: {a.outcome}</div>}
                </div>
                {a.xsystem_protocols?.category && (
                  <Badge variant="outline">{a.xsystem_protocols.category}</Badge>
                )}
              </div>
            </Row>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs text-muted-foreground mb-2">ספריית פרוטוקולים</div>
        {isLoading && <div className="text-sm text-muted-foreground">טוען…</div>}
        {!isLoading && protocols.length === 0 && <EmptyState label="אין פרוטוקולים." />}
        <div className="space-y-2">
          {protocols.map((p) => (
            <Row key={p.id}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{p.title}</span>
                    <Badge variant="outline">{p.category}</Badge>
                  </div>
                  {p.body && (
                    <p className="text-xs text-muted-foreground truncate">{p.body}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <ProtocolView
                    protocol={p}
                    trigger={
                      <Button size="icon" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    }
                  />
                  <ApplyDialog
                    clientId={clientId}
                    protocol={p}
                    trigger={
                      <Button size="sm" variant="outline" className="gap-1">
                        <Sparkles className="h-4 w-4" /> החל
                      </Button>
                    }
                  />
                </div>
              </div>
            </Row>
          ))}
        </div>
      </div>
    </div>
  );
}
