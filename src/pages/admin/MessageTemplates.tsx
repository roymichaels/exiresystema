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
import { useTranslation } from '@/hooks/useTranslation';

const CHANNELS: MsgChannel[] = ['whatsapp', 'email', 'internal'];
const CATEGORIES: MsgCategory[] = ['lead_reply', 'onboarding', 'session_prep', 'post_session', 'checkin', 'payment', 'audio_assignment', 'followup'];

const CATEGORY_LABELS: Record<string, { he: string; en: string; es: string }> = {
  lead_reply: { he: 'מענה לליד', en: 'Lead Reply', es: 'Respuesta a lead' },
  onboarding: { he: 'אונבורדינג', en: 'Onboarding', es: 'Incorporación' },
  session_prep: { he: 'הכנה לסשן', en: 'Session Prep', es: 'Preparación de sesión' },
  post_session: { he: 'אחרי סשן', en: 'Post Session', es: 'Post-sesión' },
  checkin: { he: 'צ׳ק-אין', en: 'Check-in', es: 'Registro' },
  payment: { he: 'תשלום', en: 'Payment', es: 'Pago' },
  audio_assignment: { he: 'הקלטה', en: 'Audio Assignment', es: 'Asignación de audio' },
  followup: { he: 'פולואפ', en: 'Follow-up', es: 'Seguimiento' },
};

const catLabel = (k: string, language: string) => {
  const entry = CATEGORY_LABELS[k];
  if (!entry) return k;
  if (language === 'he') return entry.he;
  if (language === 'es') return entry.es;
  return entry.en;
};

export default function MessageTemplates() {
  const { language } = useTranslation();
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data: templates = [], isLoading } = useXSystemMessageTemplates({ includeArchived });
  const [editing, setEditing] = useState<XSysMessageTemplate | null>(null);
  const [creating, setCreating] = useState(false);
  const update = useUpdateXSystemMessageTemplate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'he' ? 'תבניות הודעות' : language === 'es' ? 'Plantillas de Mensajes' : 'Message Templates'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'תבניות WhatsApp / אימייל לשימוש מהיר מול לידים ומתאמנים.' : language === 'es' ? 'Plantillas de WhatsApp / Correo para uso rápido con leads y alumnos.' : 'WhatsApp / Email templates for quick use with leads and trainees.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIncludeArchived((v) => !v)}>
            {includeArchived
              ? (language === 'he' ? 'הסתר ארכיון' : language === 'es' ? 'Ocultar archivo' : 'Hide Archive')
              : (language === 'he' ? 'הצג ארכיון' : language === 'es' ? 'Mostrar archivo' : 'Show Archive')}
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> {language === 'he' ? 'תבנית חדשה' : language === 'es' ? 'Nueva plantilla' : 'New Template'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          {language === 'he' ? 'טוען…' : language === 'es' ? 'Cargando…' : 'Loading…'}
        </p>
      ) : templates.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          {language === 'he' ? 'אין תבניות עדיין' : language === 'es' ? 'Aún no hay plantillas' : 'No templates yet'}
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id} className={t.is_archived ? 'opacity-60' : ''}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-[10px]">{t.channel}</Badge>
                    <Badge variant="outline" className="text-[10px]">{catLabel(t.category, language)}</Badge>
                    {t.is_default && <Badge className="text-[10px]">
                      {language === 'he' ? 'דיפולט' : language === 'es' ? 'Predeterminada' : 'Default'}
                    </Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {t.subject && <p className="text-xs"><span className="text-muted-foreground">
                  {language === 'he' ? 'נושא: ' : language === 'es' ? 'Asunto: ' : 'Subject: '}
                </span>{t.subject}</p>}
                <p className="text-xs whitespace-pre-wrap text-muted-foreground line-clamp-4" dir="auto">{t.body}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7 px-2 gap-1" onClick={() => setEditing(t)}>
                    <Edit3 className="h-3.5 w-3.5" /> {language === 'he' ? 'ערוך' : language === 'es' ? 'Editar' : 'Edit'}
                  </Button>
                  <Button
                    size="sm" variant="ghost" className="h-7 px-2 gap-1"
                    onClick={() => update.mutate({ id: t.id, updates: { is_archived: !t.is_archived } })}
                  >
                    {t.is_archived
                      ? <><ArchiveRestore className="h-3.5 w-3.5" /> {language === 'he' ? 'שחזר' : language === 'es' ? 'Restaurar' : 'Restore'}</>
                      : <><Archive className="h-3.5 w-3.5" /> {language === 'he' ? 'ארכב' : language === 'es' ? 'Archivar' : 'Archive'}</>}
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
  const { language } = useTranslation();
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
        <DialogHeader><DialogTitle>{template ? (language === 'he' ? 'עריכת תבנית' : language === 'es' ? 'Editar plantilla' : 'Edit Template') : (language === 'he' ? 'תבנית חדשה' : language === 'es' ? 'Nueva plantilla' : 'New Template')}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>{language === 'he' ? 'שם' : language === 'es' ? 'Nombre' : 'Name'}</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{language === 'he' ? 'ערוץ' : language === 'es' ? 'Canal' : 'Channel'}</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as MsgChannel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>{language === 'he' ? 'קטגוריה' : language === 'es' ? 'Categoría' : 'Category'}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as MsgCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{catLabel(c, language)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {channel === 'email' && (
            <div><Label>{language === 'he' ? 'נושא' : language === 'es' ? 'Asunto' : 'Subject'}</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          )}
          <div>
            <Label>{language === 'he' ? 'תוכן · השתמש ב-{{first_name}} וכו׳' : language === 'es' ? 'Contenido · usa {{first_name}} etc.' : 'Content · use {{first_name}} etc.'}</Label>
            <Textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} dir="auto" />
          </div>
          {variables.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              {language === 'he' ? 'משתנים שזוהו: ' : language === 'es' ? 'Variables detectadas: ' : 'Detected variables: '}
              {variables.map((v) => `{{${v}}}`).join(', ')}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{language === 'he' ? 'ביטול' : language === 'es' ? 'Cancelar' : 'Cancel'}</Button>
          <Button onClick={save} disabled={!name || !body}>{language === 'he' ? 'שמור' : language === 'es' ? 'Guardar' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
