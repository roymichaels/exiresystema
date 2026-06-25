import { useState } from 'react';
import { DoorOpen, CheckCircle2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useXSystemRooms,
  useXSystemClientRooms,
  useUpsertXSystemClientRoom,
  useUpdateXSystemClientRoom,
  type XSysClientRoom,
  type XSysRoom,
} from '@/hooks/xsystem';
import { EmptyState, Row, ROOM_STATES } from './_shared';

interface Props { clientId: string }

function ClientRoomDialog({
  clientId,
  room,
  current,
  trigger,
}: {
  clientId: string;
  room: XSysRoom;
  current?: XSysClientRoom;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const upsert = useUpsertXSystemClientRoom();
  const update = useUpdateXSystemClientRoom();

  const [state, setState] = useState(current?.state ?? 'open');
  const [notes, setNotes] = useState(current?.notes ?? '');

  const save = async () => {
    const now = new Date().toISOString();
    if (current) {
      await update.mutateAsync({
        id: current.id,
        updates: {
          state,
          notes: notes || null,
          completed_at: state === 'completed' ? now : current.completed_at,
        } as any,
      });
    } else {
      await upsert.mutateAsync({
        client_id: clientId,
        room_id: room.id,
        state,
        notes: notes || null,
        entered_at: now,
      } as any);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{room.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {room.description && (
            <p className="text-xs text-muted-foreground">{room.description}</p>
          )}
          <div>
            <Label>סטטוס</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROOM_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>הערות חדר</Label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>ביטול</Button>
          <Button onClick={save} disabled={upsert.isPending || update.isPending}>שמירה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function XSystemRoomsTab({ clientId }: Props) {
  const { data: rooms = [], isLoading } = useXSystemRooms();
  const { data: clientRooms = [] } = useXSystemClientRooms(clientId);
  const update = useUpdateXSystemClientRoom();

  const upsert = useUpsertXSystemClientRoom();
  const openRoom = (room: XSysRoom) => {
    upsert.mutate({
      client_id: clientId,
      room_id: room.id,
      state: 'open',
      entered_at: new Date().toISOString(),
    } as any);
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">טוען…</div>;
  if (rooms.length === 0) return <EmptyState label="לא הוגדרו חדרים." />;

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const cr = clientRooms.find((c) => c.room_id === room.id);
        const state = cr?.state ?? 'locked';
        return (
          <Row key={room.id}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium">{room.name}</span>
                  <Badge variant={state === 'completed' ? 'default' : 'outline'}>{state}</Badge>
                </div>
                {room.description && (
                  <p className="text-xs text-muted-foreground">{room.description}</p>
                )}
                {cr?.notes && (
                  <p className="text-xs mt-1 whitespace-pre-wrap">{cr.notes}</p>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {!cr && (
                  <Button size="sm" className="gap-1" onClick={() => openRoom(room)}>
                    <DoorOpen className="h-4 w-4" /> פתח חדר
                  </Button>
                )}
                {cr && cr.state !== 'completed' && (
                  <Button size="sm" variant="outline" className="gap-1"
                    onClick={() => update.mutate({
                      id: cr.id,
                      updates: { state: 'completed', completed_at: new Date().toISOString() } as any,
                    })}>
                    <CheckCircle2 className="h-4 w-4" /> סיים
                  </Button>
                )}
                <ClientRoomDialog
                  clientId={clientId}
                  room={room}
                  current={cr}
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
