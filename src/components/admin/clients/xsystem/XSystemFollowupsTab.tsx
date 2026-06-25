/**
 * XSYSTEM Follow-ups tab.
 */
import { useState } from 'react';
import { Plus, Pencil, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useXSystemFollowups,
  useCreateXSystemFollowup,
  useUpdateXSystemFollowup,
  type XSysFollowup,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

const PRIORITIES = ['low', 'normal', 'high'] as const;
const STATUSES = ['open', 'done', 'snoozed'] as const;
const SOURCES = ['manual', 'session', 'checkin', 'form', 'payment'] as const;

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function FollowupDialog({
  clientId, followup, trigger,
}: { clientId: string; followup?: XSysFollowup; trigger: React.ReactNode }) {
  const create = useCreateXSystemFollowup();
  const update = useUpdateXSystemFollowup();
  const [open, setOpen] = useState(false);
  const editing = !!followup;
  const [form, setForm] = useState({
    title: followup?.title || '',
    body: followup?.body || '',
    due_at: toLocalInput(followup?.due_at),
    priority: followup?.priority || 'normal',
    status: followup?.status || 'open',
    source: followup?.source || 'manual',
  });

  const submit = async () => {
    const body: any = {
      title: form.title, body: form.body || null,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      priority: form.priority, status: form.status, source: form.source,
      done_at: form.status === 'done' ? new Date().toISOString() : null,
    };
    if (editing) await update.mutateAsync({ id: followup!.id, updates: body });
    else await create.mutateAsync({ client_id: clientId, ...body });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'עריכת פולואפ' : 'פולואפ חדש'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>כותרת</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>תיאור</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>יעד</Label><Input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></div>
            <div>
              <Label>עדיפות</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>מקור</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SOURCES.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={submit} disabled={!form.title || create.isPending || update.isPending}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemFollowupsTab({ clientId }: { clientId: string }) {
  const { data: followups = [] } = useXSystemFollowups(clientId);
  const update = useUpdateXSystemFollowup();

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <FollowupDialog clientId={clientId}
          trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" />פולואפ</Button>} />
      </div>

      {followups.length === 0 && <EmptyState label="אין פולואפים." />}
      {followups.map((f) => (
        <Row key={f.id}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">{f.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                {f.due_at && <><Clock className="h-3 w-3" />{new Date(f.due_at).toLocaleString('he-IL')}</>}
                · {f.source}
              </div>
              {f.body && <div className="text-xs mt-1 whitespace-pre-wrap">{f.body}</div>}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline">{f.priority}</Badge>
              <Badge variant="outline">{f.status}</Badge>
              {f.status !== 'done' && (
                <Button size="sm" variant="ghost"
                  onClick={() => update.mutate({ id: f.id, updates: { status: 'done', done_at: new Date().toISOString() } as any })}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <FollowupDialog clientId={clientId} followup={f}
                trigger={<Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
            </div>
          </div>
        </Row>
      ))}
    </div>
  );
}
