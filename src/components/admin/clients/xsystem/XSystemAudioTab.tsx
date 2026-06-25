/**
 * XSYSTEM Audio Assignments tab — assign existing hypnosis audios to a client.
 */
import { useState } from 'react';
import { Plus, Headphones, Pause, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useXSystemAudioAssignments,
  useCreateXSystemAudioAssignment,
  useUpdateXSystemAudioAssignment,
  useHypnosisAudiosLibrary,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

const FREQUENCIES = ['once', 'daily', 'weekly', 'nightly'] as const;

export default function XSystemAudioTab({ clientId }: { clientId: string }) {
  const { data: assignments = [] } = useXSystemAudioAssignments(clientId);
  const { data: library = [] } = useHypnosisAudiosLibrary();
  const create = useCreateXSystemAudioAssignment();
  const update = useUpdateXSystemAudioAssignment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    audio_id: string; frequency: string; instructions: string; due_at: string;
  }>({ audio_id: '', frequency: 'once', instructions: '', due_at: '' });

  const libMap = Object.fromEntries(library.map((a) => [a.id, a]));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> שייך הקלטה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>שיוך הקלטה ללקוח</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>הקלטה</Label>
                <Select value={form.audio_id} onValueChange={(v) => setForm({ ...form, audio_id: v })}>
                  <SelectTrigger><SelectValue placeholder="בחר הקלטה מהספריה" /></SelectTrigger>
                  <SelectContent>
                    {library.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>תדירות</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>תאריך יעד</Label>
                <Input type="datetime-local" value={form.due_at}
                  onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
              </div>
              <div>
                <Label>הוראות</Label>
                <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
              <Button
                disabled={!form.audio_id || create.isPending}
                onClick={async () => {
                  await create.mutateAsync({
                    client_id: clientId,
                    audio_id: form.audio_id,
                    frequency: form.frequency,
                    instructions: form.instructions || null,
                    due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
                    status: 'active',
                  } as any);
                  setOpen(false);
                  setForm({ audio_id: '', frequency: 'once', instructions: '', due_at: '' });
                }}
              >שמור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 && <EmptyState label="אין הקלטות משויכות." />}
      {assignments.map((a) => {
        const lib = libMap[a.audio_id];
        return (
          <Row key={a.id}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Headphones className="h-4 w-4" /> {lib?.title || a.audio_id}
                </div>
                <div className="text-xs text-muted-foreground">
                  {a.frequency} · הוקצה {new Date(a.assigned_at).toLocaleDateString('he-IL')}
                  {a.due_at && ` · יעד ${new Date(a.due_at).toLocaleDateString('he-IL')}`}
                  {' · '}נוגן {a.play_count}×
                </div>
                {a.instructions && <div className="text-xs mt-1">{a.instructions}</div>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{a.status}</Badge>
                {a.status === 'active' && (
                  <Button size="sm" variant="ghost"
                    onClick={() => update.mutate({ id: a.id, updates: { status: 'paused' } as any })}>
                    <Pause className="h-4 w-4" />
                  </Button>
                )}
                {a.status === 'paused' && (
                  <Button size="sm" variant="ghost"
                    onClick={() => update.mutate({ id: a.id, updates: { status: 'active' } as any })}>
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                {a.status !== 'done' && (
                  <Button size="sm" variant="ghost"
                    onClick={() => update.mutate({ id: a.id, updates: { status: 'done' } as any })}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Row>
        );
      })}
    </div>
  );
}
