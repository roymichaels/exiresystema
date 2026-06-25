/**
 * XSYSTEM Intake tab — attached form submissions + attach existing ones.
 */
import { useState } from 'react';
import { FileText, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useClientFormSubmissions,
  usePractitionerUnattachedSubmissions,
  useAttachFormSubmissionToClient,
} from '@/hooks/xsystem';
import { EmptyState, Row } from './_shared';

export default function XSystemIntakeTab({
  clientId, subconsciousSummary,
}: { clientId: string; subconsciousSummary?: string | null }) {
  const { data: submissions = [] } = useClientFormSubmissions(clientId);
  const { data: unattached = [] } = usePractitionerUnattachedSubmissions();
  const attach = useAttachFormSubmissionToClient();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState('');

  return (
    <div className="space-y-3">
      {subconsciousSummary && (
        <Row>
          <div className="text-xs text-muted-foreground mb-1">סיכום תת-מודע</div>
          <p className="text-sm whitespace-pre-wrap">{subconsciousSummary}</p>
        </Row>
      )}

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Link2 className="h-4 w-4" /> שייך טופס קיים
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>שיוך הגשת טופס ללקוח</DialogTitle></DialogHeader>
            {unattached.length === 0 ? (
              <p className="text-sm text-muted-foreground">אין טפסים שלא שויכו.</p>
            ) : (
              <Select value={pick} onValueChange={setPick}>
                <SelectTrigger><SelectValue placeholder="בחר טופס" /></SelectTrigger>
                <SelectContent>
                  {unattached.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.custom_forms?.title || s.form_id} ·{' '}
                      {new Date(s.submitted_at).toLocaleDateString('he-IL')}
                      {s.email ? ` · ${s.email}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
              <Button
                disabled={!pick || attach.isPending}
                onClick={async () => {
                  await attach.mutateAsync({ submissionId: pick, clientId });
                  setPick(''); setOpen(false);
                }}
              >שייך</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {submissions.length === 0 && <EmptyState label="אין הגשות טפסים משויכות." />}
      {submissions.map((s) => (
        <Row key={s.id}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {s.custom_forms?.title || 'טופס'}
            </div>
            <Badge variant="outline">{s.status}</Badge>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {new Date(s.submitted_at).toLocaleString('he-IL')}
            {s.email && ` · ${s.email}`}
          </div>
          <div className="space-y-1 text-sm">
            {Object.entries(s.responses || {}).map(([k, v]) => (
              <div key={k} className="border-r-2 border-primary/30 pr-2">
                <div className="text-[11px] text-muted-foreground">{k}</div>
                <div className="whitespace-pre-wrap break-words">
                  {typeof v === 'string' ? v : JSON.stringify(v)}
                </div>
              </div>
            ))}
          </div>
        </Row>
      ))}
    </div>
  );
}
