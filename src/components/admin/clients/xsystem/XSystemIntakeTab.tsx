/**
 * XSYSTEM Intake tab — attached form submissions + attach existing + intake link tools.
 */
import { useState } from 'react';
import { FileText, Link2, Copy, MessageCircle } from 'lucide-react';
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
import { useDefaultIntakeForm, useAllPublishedForms } from '@/hooks/xsystem/forms';
import { useClient } from '@/hooks/useClients';
import { MessageTemplatePicker } from './MessageTemplatePicker';
import { toast } from '@/hooks/use-toast';
import { EmptyState, Row } from './_shared';

export default function XSystemIntakeTab({
  clientId, subconsciousSummary,
}: { clientId: string; subconsciousSummary?: string | null }) {
  const { data: submissions = [] } = useClientFormSubmissions(clientId);
  const { data: unattached = [] } = usePractitionerUnattachedSubmissions();
  const { data: client } = useClient(clientId);
  const { data: defaultForm } = useDefaultIntakeForm();
  const { data: allForms = [] } = useAllPublishedForms();
  const attach = useAttachFormSubmissionToClient();
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<string>('');

  const activeForm = selectedFormId
    ? allForms.find((f) => f.id === selectedFormId) || defaultForm
    : defaultForm;
  const intakeLink = activeForm?.url || null;
  const phone = client?.whatsapp || client?.phone || '';
  const firstName = (client?.full_name || '').split(' ')[0] || '';

  const copyLink = async () => {
    if (!intakeLink) return;
    try { await navigator.clipboard.writeText(intakeLink); toast({ title: 'הקישור הועתק' }); }
    catch { toast({ title: 'העתקה נכשלה', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-3">
      {subconsciousSummary && (
        <Row>
          <div className="text-xs text-muted-foreground mb-1">סיכום תת-מודע</div>
          <p className="text-sm whitespace-pre-wrap">{subconsciousSummary}</p>
        </Row>
      )}

      <Row>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="text-sm font-medium">קישור טופס קבלה</div>
          {allForms.length > 1 && (
            <Select value={activeForm?.id || ''} onValueChange={setSelectedFormId}>
              <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="בחר טופס" /></SelectTrigger>
              <SelectContent>
                {allForms.map((f) => <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
        {intakeLink ? (
          <>
            <div className="text-xs text-muted-foreground mb-2 break-all" dir="ltr">{intakeLink}</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copyLink}>
                <Copy className="h-3.5 w-3.5" /> העתק קישור
              </Button>
              <MessageTemplatePicker
                channel="whatsapp" category="onboarding"
                phone={phone} recipientName={client?.full_name}
                defaultVars={{ first_name: firstName, client_name: client?.full_name || '', intake_link: intakeLink }}
                title="שלח טופס קבלה ב-WhatsApp"
                trigger={
                  <Button size="sm" className="gap-1.5" disabled={!phone}>
                    <MessageCircle className="h-3.5 w-3.5" /> שלח ב-WhatsApp
                  </Button>
                }
              />
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground">לא נבחר טופס. צור טופס מפורסם בלשונית "טפסים".</div>
        )}
      </Row>

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
