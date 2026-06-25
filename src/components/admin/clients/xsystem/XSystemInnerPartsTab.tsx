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
  useCreateXSystemInnerPart,
  useUpdateXSystemInnerPart,
  useXSystemInnerParts,
  type XSysInnerPart,
} from '@/hooks/xsystem';
import { EmptyState, Row, PART_ROLES, PART_STATUSES } from './_shared';

interface Props { clientId: string }

function PartDialog({
  clientId,
  part,
  trigger,
}: {
  clientId: string;
  part?: XSysInnerPart;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateXSystemInnerPart();
  const update = useUpdateXSystemInnerPart();
  const editing = !!part;

  const [form, setForm] = useState({
    name: part?.name ?? '',
    role: part?.role ?? 'protector',
    voice: part?.voice ?? '',
    intent: part?.intent ?? '',
    age_origin: part?.age_origin ?? '',
    relationship_to_self: part?.relationship_to_self ?? '',
    status: part?.status ?? 'unblended',
    notes: part?.notes ?? '',
  });

  const save = async () => {
    if (!form.name.trim()) return;
    const payload: any = {
      name: form.name.trim(),
      role: form.role,
      voice: form.voice || null,
      intent: form.intent || null,
      age_origin: form.age_origin || null,
      relationship_to_self: form.relationship_to_self || null,
      status: form.status,
      notes: form.notes || null,
    };
    if (editing) await update.mutateAsync({ id: part!.id, updates: payload });
    else await create.mutateAsync({ client_id: clientId, ...payload });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'עריכת חלק' : 'חלק חדש'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>שם</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>תפקיד</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PART_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>קול / איך מדבר</Label>
            <Input value={form.voice} onChange={(e) => setForm((f) => ({ ...f, voice: e.target.value }))} />
          </div>
          <div>
            <Label>כוונה</Label>
            <Input value={form.intent} onChange={(e) => setForm((f) => ({ ...f, intent: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>גיל מקור</Label>
              <Input value={form.age_origin} onChange={(e) => setForm((f) => ({ ...f, age_origin: e.target.value }))} />
            </div>
            <div>
              <Label>יחס לעצמי</Label>
              <Input value={form.relationship_to_self} onChange={(e) => setForm((f) => ({ ...f, relationship_to_self: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>הערות</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
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

export default function XSystemInnerPartsTab({ clientId }: Props) {
  const { data: parts = [], isLoading } = useXSystemInnerParts(clientId);
  const update = useUpdateXSystemInnerPart();

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <PartDialog clientId={clientId}
          trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> חלק חדש</Button>} />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">טוען…</div>}
      {!isLoading && parts.length === 0 && <EmptyState label="עדיין לא תועדו חלקים פנימיים." />}

      {parts.map((p) => (
        <Row key={p.id}>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-medium">{p.name}</span>
                <Badge variant="outline">{p.role}</Badge>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
              {p.intent && <p className="text-xs">כוונה: {p.intent}</p>}
              {p.voice && <p className="text-[11px] text-muted-foreground">קול: {p.voice}</p>}
              {p.notes && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{p.notes}</p>}
            </div>
            <div className="flex gap-1">
              <Select
                value={p.status}
                onValueChange={(v) => update.mutate({ id: p.id, updates: { status: v } as any })}
              >
                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <PartDialog clientId={clientId} part={p}
                trigger={<Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
            </div>
          </div>
        </Row>
      ))}
    </div>
  );
}
