import { useState } from 'react';
import { Plus, Pencil, Archive } from 'lucide-react';
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
  useCreateXSystemBelief,
  useUpdateXSystemBelief,
  useXSystemBeliefs,
  type XSysBelief,
} from '@/hooks/xsystem';
import { EmptyState, Row, BELIEF_POLARITY, BELIEF_STATUSES } from './_shared';

interface Props { clientId: string }

function BeliefDialog({
  clientId,
  belief,
  trigger,
}: {
  clientId: string;
  belief?: XSysBelief;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const create = useCreateXSystemBelief();
  const update = useUpdateXSystemBelief();
  const editing = !!belief;

  const evidenceText = belief?.evidence
    ? ((belief.evidence as any).text ?? '')
    : '';

  const [form, setForm] = useState({
    belief: belief?.belief ?? '',
    polarity: belief?.polarity ?? 'limiting',
    strength: belief?.strength ?? 5,
    status: belief?.status ?? 'active',
    reframe: belief?.reframe ?? '',
    evidence: evidenceText as string,
  });

  const save = async () => {
    if (!form.belief.trim()) return;
    const payload: any = {
      belief: form.belief.trim(),
      polarity: form.polarity,
      strength: form.strength,
      status: form.status,
      reframe: form.reframe || null,
      evidence: form.evidence ? { text: form.evidence } : {},
    };
    if (editing) await update.mutateAsync({ id: belief!.id, updates: payload });
    else await create.mutateAsync({ client_id: clientId, ...payload });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'עריכת אמונה' : 'אמונה חדשה'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>אמונה</Label>
            <Textarea
              rows={2}
              value={form.belief}
              onChange={(e) => setForm((f) => ({ ...f, belief: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>קוטביות</Label>
              <Select
                value={form.polarity}
                onValueChange={(v) => setForm((f) => ({ ...f, polarity: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BELIEF_POLARITY.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>עוצמה (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.strength}
                onChange={(e) => setForm((f) => ({ ...f, strength: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>סטטוס</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BELIEF_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>ריפרוז</Label>
            <Textarea
              rows={2}
              value={form.reframe}
              onChange={(e) => setForm((f) => ({ ...f, reframe: e.target.value }))}
            />
          </div>
          <div>
            <Label>עדויות (טקסט חופשי)</Label>
            <Textarea
              rows={2}
              value={form.evidence}
              onChange={(e) => setForm((f) => ({ ...f, evidence: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={save} disabled={create.isPending || update.isPending}>
            שמירה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemBeliefsTab({ clientId }: Props) {
  const { data: beliefs = [], isLoading } = useXSystemBeliefs(clientId);
  const update = useUpdateXSystemBelief();

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <BeliefDialog
          clientId={clientId}
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> אמונה חדשה
            </Button>
          }
        />
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">טוען…</div>}
      {!isLoading && beliefs.length === 0 && <EmptyState label="עדיין לא מופו אמונות." />}

      {beliefs.map((b) => (
        <Row key={b.id}>
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={b.polarity === 'limiting' ? 'destructive' : 'default'}>
                  {b.polarity}
                </Badge>
                <Badge variant="outline">{b.status}</Badge>
                {b.strength && <Badge variant="secondary">עוצמה {b.strength}</Badge>}
              </div>
              <div className="text-sm font-medium whitespace-pre-wrap">{b.belief}</div>
              {b.reframe && (
                <p className="text-xs text-muted-foreground mt-1">↺ {b.reframe}</p>
              )}
              {(b.evidence as any)?.text && (
                <p className="text-xs text-muted-foreground mt-1">
                  עדויות: {(b.evidence as any).text}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              {b.status !== 'reframed' && b.reframe && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => update.mutate({ id: b.id, updates: { status: 'reframed' } as any })}
                >
                  סמן כריפרזה
                </Button>
              )}
              {b.status !== 'archived' && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => update.mutate({ id: b.id, updates: { status: 'archived' } as any })}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
              <BeliefDialog
                clientId={clientId}
                belief={b}
                trigger={
                  <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                }
              />
            </div>
          </div>
        </Row>
      ))}
    </div>
  );
}
