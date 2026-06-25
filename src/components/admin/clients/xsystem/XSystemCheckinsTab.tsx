/**
 * XSYSTEM Check-ins tab.
 */
import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
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
  useXSystemCheckins,
  useCreateXSystemCheckin,
  useUpdateXSystemCheckin,
  type XSysCheckin,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

const KINDS = ['mood', 'sleep', 'practice', 'free', 'form_submission'] as const;
const STATUSES = ['pending', 'submitted', 'reviewed'] as const;

function CheckinDialog({
  clientId, checkin, trigger,
}: {
  clientId: string;
  checkin?: XSysCheckin;
  trigger: React.ReactNode;
}) {
  const create = useCreateXSystemCheckin();
  const update = useUpdateXSystemCheckin();
  const [open, setOpen] = useState(false);
  const editing = !!checkin;
  const initialPayload = (checkin?.payload as any) || {};
  const [form, setForm] = useState({
    kind: checkin?.kind || 'mood',
    status: (initialPayload.status as string) || 'submitted',
    mood: checkin?.mood ?? null as number | null,
    notes: checkin?.notes || '',
    coach_summary: (initialPayload.coach_summary as string) || '',
    client_reported_shift: (initialPayload.client_reported_shift as string) || '',
    next_focus: (initialPayload.next_focus as string) || '',
  });

  const submit = async () => {
    const payload = {
      status: form.status,
      coach_summary: form.coach_summary || null,
      client_reported_shift: form.client_reported_shift || null,
      next_focus: form.next_focus || null,
    };
    if (editing) {
      await update.mutateAsync({
        id: checkin!.id,
        updates: { kind: form.kind, mood: form.mood, notes: form.notes || null, payload } as any,
      });
    } else {
      await create.mutateAsync({
        client_id: clientId,
        kind: form.kind,
        mood: form.mood,
        notes: form.notes || null,
        payload,
        submitted_at: new Date().toISOString(),
      } as any);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'עריכת צ׳ק-אין' : 'צ׳ק-אין חדש'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>סוג</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>מצב רוח (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.mood ?? ''}
              onChange={(e) => setForm({ ...form, mood: e.target.value ? Number(e.target.value) : null })} />
          </div>
          <div><Label>הערות</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div><Label>סיכום מאמן</Label><Textarea value={form.coach_summary} onChange={(e) => setForm({ ...form, coach_summary: e.target.value })} /></div>
          <div><Label>שינוי שדווח</Label><Textarea value={form.client_reported_shift} onChange={(e) => setForm({ ...form, client_reported_shift: e.target.value })} /></div>
          <div><Label>פוקוס הבא</Label><Textarea value={form.next_focus} onChange={(e) => setForm({ ...form, next_focus: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemCheckinsTab({ clientId }: { clientId: string }) {
  const { data: checkins = [] } = useXSystemCheckins(clientId);
  const moods = checkins.filter((c) => typeof c.mood === 'number').slice(0, 10).reverse();
  const avg = moods.length ? Math.round((moods.reduce((s, c) => s + (c.mood || 0), 0) / moods.length) * 10) / 10 : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {moods.length > 0 && <>ממוצע מצב רוח אחרון: <strong>{avg}/10</strong> ({moods.length} מדידות)</>}
        </div>
        <CheckinDialog clientId={clientId}
          trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" />צ׳ק-אין</Button>} />
      </div>

      {checkins.length === 0 && <EmptyState label="עוד אין צ׳ק-אינים." />}
      {checkins.map((c) => {
        const p = (c.payload as any) || {};
        return (
          <Row key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">
                  {c.kind} {typeof c.mood === 'number' ? `· ${c.mood}/10` : ''}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.submitted_at).toLocaleString('he-IL')}
                </div>
                {c.notes && <div className="text-xs mt-1 whitespace-pre-wrap">{c.notes}</div>}
                {p.coach_summary && <div className="text-xs mt-1"><strong>סיכום:</strong> {p.coach_summary}</div>}
                {p.next_focus && <div className="text-xs"><strong>פוקוס:</strong> {p.next_focus}</div>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline">{p.status || 'submitted'}</Badge>
                <CheckinDialog clientId={clientId} checkin={c}
                  trigger={<Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
              </div>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
