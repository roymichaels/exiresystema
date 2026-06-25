import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateXSystemSession,
  useUpdateXSystemSession,
  useXSystemSessions,
  useXSystemSessionNotes,
  useCreateXSystemSessionNote,
  type XSysSession,
} from '@/hooks/xsystem';
import { EmptyState, Row, SESSION_STATUSES, SESSION_MODES, NOTE_KINDS } from './_shared';

interface Props {
  clientId: string;
}

type FormState = {
  session_number?: number | null;
  scheduled_at?: string;
  duration_minutes?: number | null;
  mode?: string;
  status?: string;
  summary?: string;
  focus?: string;
  intention?: string;
};

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string) {
  return v ? new Date(v).toISOString() : null;
}

function SessionDialog({
  clientId,
  session,
  trigger,
}: {
  clientId: string;
  session?: XSysSession;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateXSystemSession();
  const update = useUpdateXSystemSession();
  const editing = !!session;

  const existingSummary = (() => {
    if (!session?.summary) return { summary: '', focus: '', intention: '' };
    try {
      const parsed = JSON.parse(session.summary);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
    return { summary: session.summary, focus: '', intention: '' };
  })();

  const [form, setForm] = useState<FormState>({
    session_number: session?.session_number ?? null,
    scheduled_at: toLocalInput(session?.scheduled_at),
    duration_minutes: session?.duration_minutes ?? 60,
    mode: session?.mode ?? 'in_person',
    status: session?.status ?? 'scheduled',
    summary: existingSummary.summary || '',
    focus: existingSummary.focus || '',
    intention: existingSummary.intention || '',
  });

  const save = async () => {
    const summaryPayload = JSON.stringify({
      summary: form.summary || '',
      focus: form.focus || '',
      intention: form.intention || '',
    });
    const payload: any = {
      session_number: form.session_number || null,
      scheduled_at: fromLocalInput(form.scheduled_at || ''),
      duration_minutes: form.duration_minutes || null,
      mode: form.mode,
      status: form.status,
      summary: summaryPayload,
    };
    if (editing) {
      await update.mutateAsync({ id: session!.id, updates: payload });
    } else {
      await create.mutateAsync({ client_id: clientId, ...payload });
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'עריכת סשן' : 'סשן חדש'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>מספר סשן</Label>
              <Input
                type="number"
                value={form.session_number ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    session_number: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
            <div>
              <Label>משך (דק׳)</Label>
              <Input
                type="number"
                value={form.duration_minutes ?? ''}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    duration_minutes: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <Label>מועד</Label>
            <Input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>סוג מפגש</Label>
              <Select
                value={form.mode}
                onValueChange={(v) => setForm((f) => ({ ...f, mode: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_MODES.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SESSION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>פוקוס</Label>
            <Input
              value={form.focus}
              onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))}
            />
          </div>
          <div>
            <Label>כוונה</Label>
            <Input
              value={form.intention}
              onChange={(e) => setForm((f) => ({ ...f, intention: e.target.value }))}
            />
          </div>
          <div>
            <Label>סיכום</Label>
            <Textarea
              rows={4}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={save} disabled={create.isPending || update.isPending}>
            {editing ? 'שמירה' : 'יצירה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotesDialog({
  clientId,
  session,
  trigger,
}: {
  clientId: string;
  session: XSysSession;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { data: notes = [] } = useXSystemSessionNotes(open ? session.id : undefined);
  const create = useCreateXSystemSessionNote();
  const [kind, setKind] = useState<string>('observation');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const submit = async () => {
    if (!body.trim()) return;
    await create.mutateAsync({
      session_id: session.id,
      client_id: clientId,
      kind,
      body: body.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setBody('');
    setTags('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הערות סשן {session.session_number ?? ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label>סוג</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTE_KINDS.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>תגיות (מופרדות בפסיק)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>תוכן</Label>
            <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={create.isPending || !body.trim()} className="w-full">
            הוספת הערה
          </Button>

          <div className="space-y-2 pt-3 border-t">
            {notes.length === 0 && <EmptyState label="עדיין אין הערות לסשן זה." />}
            {notes.map((n) => (
              <Row key={n.id}>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{n.kind}</Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.created_at).toLocaleString('he-IL')}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap mt-2">{n.body}</p>
                {n.tags && n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {n.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                    ))}
                  </div>
                )}
              </Row>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemSessionsTab({ clientId }: Props) {
  const { data: sessions = [], isLoading } = useXSystemSessions(clientId);
  const update = useUpdateXSystemSession();

  const setStatus = (id: string, status: string) =>
    update.mutate({ id, updates: { status } as any });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <SessionDialog
          clientId={clientId}
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> סשן חדש
            </Button>
          }
        />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">טוען…</div>}
      {!isLoading && sessions.length === 0 && <EmptyState label="עדיין אין סשנים." />}

      {sessions.map((s) => {
        let summary = s.summary || '';
        let focus = '';
        try {
          const parsed = JSON.parse(s.summary || '');
          if (parsed && typeof parsed === 'object') {
            summary = parsed.summary || '';
            focus = parsed.focus || '';
          }
        } catch {}

        return (
          <Row key={s.id}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">
                    סשן {s.session_number ?? '—'}
                  </span>
                  <Badge variant="outline">{s.status}</Badge>
                  <Badge variant="secondary">{s.mode}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString('he-IL') : 'לא תוזמן'}
                  {s.duration_minutes ? ` · ${s.duration_minutes} דק׳` : ''}
                </div>
                {focus && <div className="text-xs mt-1">פוקוס: {focus}</div>}
                {summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">
                    {summary}
                  </p>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {s.status !== 'completed' && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(s.id, 'completed')}>
                    סיים
                  </Button>
                )}
                {s.status !== 'cancelled' && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(s.id, 'cancelled')}>
                    ביטול
                  </Button>
                )}
                <NotesDialog
                  clientId={clientId}
                  session={s}
                  trigger={
                    <Button size="sm" variant="outline">הערות</Button>
                  }
                />
                <SessionDialog
                  clientId={clientId}
                  session={s}
                  trigger={
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                  }
                />
              </div>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
