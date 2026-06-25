/**
 * XSYSTEM Payments tab — log, edit, mark paid/refunded.
 */
import { useState, useMemo } from 'react';
import { Plus, Pencil, Check, Undo2 } from 'lucide-react';
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
  useXSystemPayments,
  useCreateXSystemPayment,
  useUpdateXSystemPayment,
  type XSysPayment,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

const KINDS = ['session', 'package', 'upsell', 'deposit', 'refund'] as const;
const METHODS = ['cash', 'bit', 'paybox', 'stripe', 'other'] as const;
const STATUSES = ['pending', 'paid', 'refunded', 'void'] as const;

function toLocalInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function PaymentDialog({
  clientId, payment, trigger,
}: {
  clientId: string; payment?: XSysPayment; trigger: React.ReactNode;
}) {
  const create = useCreateXSystemPayment();
  const update = useUpdateXSystemPayment();
  const [open, setOpen] = useState(false);
  const editing = !!payment;
  const [form, setForm] = useState({
    amount: payment ? String((payment.amount_cents || 0) / 100) : '',
    currency: payment?.currency || 'ILS',
    kind: payment?.kind || 'session',
    method: payment?.method || 'bit',
    status: payment?.status || 'pending',
    due_at: toLocalInput(payment?.due_at),
    paid_at: toLocalInput(payment?.paid_at),
    external_ref: payment?.external_ref || '',
    notes: payment?.notes || '',
  });

  const submit = async () => {
    const amount_cents = Math.round(Number(form.amount || 0) * 100);
    const body: any = {
      amount_cents, currency: form.currency, kind: form.kind, method: form.method,
      status: form.status,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      paid_at: form.status === 'paid'
        ? (form.paid_at ? new Date(form.paid_at).toISOString() : new Date().toISOString())
        : (form.paid_at ? new Date(form.paid_at).toISOString() : null),
      external_ref: form.external_ref || null,
      notes: form.notes || null,
    };
    if (editing) await update.mutateAsync({ id: payment!.id, updates: body });
    else await create.mutateAsync({ client_id: clientId, ...body });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'עריכת תשלום' : 'תשלום חדש'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div><Label>סכום</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>מטבע</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></div>
            <div>
              <Label>סוג</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{KINDS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>אמצעי</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
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
          <div className="grid grid-cols-2 gap-2">
            <div><Label>תאריך לתשלום</Label><Input type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} /></div>
            <div><Label>שולם בתאריך</Label><Input type="datetime-local" value={form.paid_at} onChange={(e) => setForm({ ...form, paid_at: e.target.value })} /></div>
          </div>
          <div><Label>אסמכתא חיצונית</Label><Input value={form.external_ref} onChange={(e) => setForm({ ...form, external_ref: e.target.value })} /></div>
          <div><Label>הערות</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const fmt = (cents: number, ccy: string) =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency: ccy || 'ILS' }).format((cents || 0) / 100);

export default function XSystemPaymentsTab({ clientId }: { clientId: string }) {
  const { data: payments = [] } = useXSystemPayments(clientId);
  const update = useUpdateXSystemPayment();

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'paid');
    const pending = payments.filter((p) => p.status === 'pending');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthRows = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= monthStart);
    const ccy = payments[0]?.currency || 'ILS';
    return {
      paidTotal: paid.reduce((s, p) => s + (p.amount_cents || 0), 0),
      pendingTotal: pending.reduce((s, p) => s + (p.amount_cents || 0), 0),
      monthTotal: monthRows.reduce((s, p) => s + (p.amount_cents || 0), 0),
      ccy,
    };
  }, [payments]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Row><div className="text-xs text-muted-foreground">שולם</div><div className="font-semibold">{fmt(stats.paidTotal, stats.ccy)}</div></Row>
        <Row><div className="text-xs text-muted-foreground">ממתין</div><div className="font-semibold">{fmt(stats.pendingTotal, stats.ccy)}</div></Row>
        <Row><div className="text-xs text-muted-foreground">החודש</div><div className="font-semibold">{fmt(stats.monthTotal, stats.ccy)}</div></Row>
      </div>

      <div className="flex justify-end">
        <PaymentDialog clientId={clientId}
          trigger={<Button size="sm" className="gap-2"><Plus className="h-4 w-4" />תשלום</Button>} />
      </div>

      {payments.length === 0 && <EmptyState label="אין תשלומים." />}
      {payments.map((p) => (
        <Row key={p.id}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium">{fmt(p.amount_cents, p.currency)} · {p.kind}</div>
              <div className="text-xs text-muted-foreground">
                {p.method || '—'}
                {p.paid_at && ` · שולם ${new Date(p.paid_at).toLocaleDateString('he-IL')}`}
                {!p.paid_at && p.due_at && ` · יעד ${new Date(p.due_at).toLocaleDateString('he-IL')}`}
              </div>
              {p.notes && <div className="text-xs mt-1">{p.notes}</div>}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline">{p.status}</Badge>
              {p.status !== 'paid' && (
                <Button size="sm" variant="ghost"
                  onClick={() => update.mutate({ id: p.id, updates: { status: 'paid', paid_at: new Date().toISOString() } as any })}>
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {p.status === 'paid' && (
                <Button size="sm" variant="ghost"
                  onClick={() => update.mutate({ id: p.id, updates: { status: 'refunded' } as any })}>
                  <Undo2 className="h-4 w-4" />
                </Button>
              )}
              <PaymentDialog clientId={clientId} payment={p}
                trigger={<Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>} />
            </div>
          </div>
        </Row>
      ))}
    </div>
  );
}
