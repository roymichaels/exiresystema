/**
 * Admin: Exire Systema message templates CRUD.
 */
import { useState } from 'react';
import { Plus, Edit3, Archive, ArchiveRestore } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  useXSystemMessageTemplates,
  useCreateXSystemMessageTemplate,
  useUpdateXSystemMessageTemplate,
  extractTemplateVars,
  type XSysMessageTemplate, type MsgCategory, type MsgChannel,
} from '@/hooks/xsystem/templates';

const CHANNELS: MsgChannel[] = ['whatsapp', 'email', 'internal'];
const CATEGORIES: { key: MsgCategory; label: string }[] = [
  { key: 'lead_reply', label: 'מענה לליד' },
  { key: 'onboarding', label: 'אונבורדינג' },
  { key: 'session_prep', label: 'הכנה לסשן' },
  { key: 'post_session', label: 'אחרי סשן' },
  { key: 'checkin', label: 'צ׳ק-אין' },
  { key: 'payment', label: 'תשלום' },
  { key: 'audio_assignment', label: 'הקלטה' },
  { key: 'followup', label: 'פולואפ' },
];
const catLabel = (k: string) => CATEGORIES.find((c) => c.key === k)?.label || k;

export default function MessageTemplates() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: templates = [], isLoading } = useXSystemMessageTemplates({ includeArchived });
  const [editing, setEditing] = useState<XSysMessageTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const update = useUpdateXSystemMessageTemplate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">תבניות הודעות</h2>
          <p className="text-sm text-muted-foreground">
            תבניות WhatsApp / אימייל לשימוש מהיר מול לידים ומתאמנים.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIncludeArchived((v) => !v)}>
            {includeArchived ? 'הסתר ארכיון' : 'הצג ארכיון'}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> תבנית חדשה
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">טוען…</p>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">אין תבניות עדיין</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} className={t.is_archived ? 'opacity-60' : ''}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">{t.channel}</Badge>
                    <Badge variant="outline" className="text-[10px]">{catLabel(t.category)}</Badge>
                    {t.is_default && <Badge className="text-[10px]">דיפולט</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {t.subject && <p className="text-xs"><span className="text-muted-foreground">נושא: </span>{t.subject}</p>}
                <p className="text-xs whitespace-pre-wrap text-muted-foreground line-clamp-4" dir="auto">{t.body}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => setEditing(t)}>
                    <Edit3 className="h-3.5 w-3.5" /> ערוך
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="h-7 px-2 gap-1"
                    onClick={() => update.mutate({ id: t.id, updates: { is_archived: !t.is_archived } })}
                  >
                    {t.is_archived
                      ? <><ArchiveRestore className="h-3.5 w-3.5" /> שחזר</>
                      : <><Archive className="h-3.5 w-3.5" /> ארכב</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateDialog
        open={creating || !!editing}
        template={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
      />
    </div>
  );
}

function TemplateDialog({
  open, template, onClose,
}: { open: boolean; template: XSysMessageTemplate | null; onClose: () => void }) {
  const create = useCreateXSystemMessageTemplate();
  const update = useUpdateXSystemMessageTemplate();
  const [name, setName] = useState(template?.name || '');
  const [channel, setChannel] = useState<MsgChannel>(template?.channel || 'whatsapp');
  const [category, setCategory] = useState<MsgCategory>(template?.category || 'onboarding');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');

  // Reset when template changes
  if (open && template && template.id !== (template as any)._lastId) {
    // no-op; keep simple — reset via key prop below
  }

  const variables = extractTemplateVars(body + ' ' + subject);

  const save = async () => {
    const payload = { name, channel, category, subject: subject || null, body, variables };
    if (template) {
      await update.mutateAsync({ id: template.id, updates: payload });
    } else {
      await create.mutateAsync(payload as any);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" key={template?.id || 'new'}>
        <DialogHeader><DialogTitle>{template ? 'עריכת תבנית' : 'תבנית חדשה'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>שם</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ערוץ</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as MsgChannel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>קטגוריה</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as MsgCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {channel === 'email' && (
            <div><Label>נושא</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          )}
          <div>
            <Label>תוכן · השתמש ב-{`{{first_name}}`} וכו׳</Label>
            <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} dir="auto" />
          </div>
          {variables.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              משתנים שזוהו: {variables.map((v) => `{{${v}}}`).join(', ')}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={save} disabled={!name || !body}>שמור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
