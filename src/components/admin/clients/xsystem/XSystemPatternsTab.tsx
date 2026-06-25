import { useState } from 'react';
import { Plus, Pencil, Archive } from 'lucide-react';
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
  useCreateXSystemPattern,
  useUpdateXSystemPattern,
  useXSystemPatterns,
  type XSysPattern,
} from '@/hooks/xsystem';
import { EmptyState, Row, PATTERN_STATUSES } from './_shared';

interface Props { clientId: string }

function PatternDialog({
  clientId,
  pattern,
  trigger,
}: {
  clientId: string;
  pattern?: XSysPattern;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateXSystemPattern();
  const update = useUpdateXSystemPattern();
  const editing = !!pattern;
  const loop = (pattern?.loop as any) || {};

  const [form, setForm] = useState({
    name: pattern?.name ?? '',
    description: pattern?.description ?? '',
    trigger: pattern?.trigger ?? '',
    frequency: pattern?.frequency ?? '',
    severity: pattern?.severity ?? 5,
    status: pattern?.status ?? 'active',
    loop_thought: loop.thought ?? '',
    loop_feeling: loop.feeling ?? '',
    loop_action: loop.action ?? '',
  });

  const save = async () => {
    if (!form.name.trim()) return;
    const payload: any = {
      name: form.name.trim(),
      description: form.description || null,
      trigger: form.trigger || null,
      frequency: form.frequency || null,
      severity: form.severity,
      status: form.status,
      loop: {
        trigger: form.trigger || '',
        thought: form.loop_thought,
        feeling: form.loop_feeling,
        action: form.loop_action,
      },
    };
    if (editing) await update.mutateAsync({ id: pattern!.id, updates: payload });
    else await create.mutateAsync({ client_id: clientId, ...payload });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'עריכת תבנית' : 'תבנית חדשה'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>שם</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>תיאור</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>תדירות</Label>
              <Input value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} />
            </div>
            <div>
              <Label>חומרה (1-10)</Label>
              <Input type="number" min={1} max={10} value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PATTERN_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border rounded-lg p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">לולאה</div>
            <Input placeholder="טריגר" value={form.trigger} onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value }))} />
            <Input placeholder="מחשבה" value={form.loop_thought} onChange={(e) => setForm((f) => ({ ...f, loop_thought: e.target.value }))} />
            <Input placeholder="רגש" value={form.loop_feeling} onChange={(e) => setForm((f) => ({ ...f, loop_feeling: e.target.value }))} />
            <Input placeholder="פעולה" value={form.loop_action} onChange={(e) => setForm((f) => ({ ...f, loop_action: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={save} disabled={create.isPending || update.isPending}>שמירה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemPatternsTab({ clientId }: Props) {
  const { data: patterns = [], isLoading } = useXSystemPatterns(clientId);
  const update = useUpdateXSystemPattern();

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <PatternDialog
          clientId={clientId}
          trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> תבנית חדשה</Button>}
        />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">טוען…</div>}
      {!isLoading && patterns.length === 0 && <EmptyState label="עדיין לא זוהו תבניות." />}

      {patterns.map((p) => {
        const loop = (p.loop as any) || {};
        return (
          <Row key={p.id}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium">{p.name}</span>
                  <Badge variant="outline">{p.status}</Badge>
                  {p.severity && <Badge variant="secondary">חומרה {p.severity}</Badge>}
                  {p.frequency && <Badge variant="secondary">{p.frequency}</Badge>}
                </div>
                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                {(loop.trigger || loop.thought || loop.feeling || loop.action) && (
                  <div className="text-[11px] text-muted-foreground mt-1 space-x-1 space-x-reverse">
                    {loop.trigger && <span>טריגר: {loop.trigger}</span>}
                    {loop.thought && <span>· מחשבה: {loop.thought}</span>}
                    {loop.feeling && <span>· רגש: {loop.feeling}</span>}
                    {loop.action && <span>· פעולה: {loop.action}</span>}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {p.status === 'active' && (
                  <Button size="sm" variant="outline"
                    onClick={() => update.mutate({ id: p.id, updates: { status: 'resolved' } as any })}>
                    פתור
                  </Button>
                )}
                {p.status !== 'archived' && (
                  <Button size="icon" variant="ghost"
                    onClick={() => update.mutate({ id: p.id, updates: { status: 'archived' } as any })}>
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
                <PatternDialog clientId={clientId} pattern={p}
                  trigger={<Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
              </div>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
