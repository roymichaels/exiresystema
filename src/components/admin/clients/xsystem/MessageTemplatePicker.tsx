/**
 * MessageTemplatePicker — small dialog that picks an Exire Systema message template,
 * fills variables, and either copies/sends via WhatsApp deep link or via email.
 */
import { useEffect, useMemo, useState } from 'react';
import { Copy, MessageCircle, Mail, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  useXSystemMessageTemplates,
  renderTemplate,
  extractTemplateVars,
  type MsgCategory,
  type MsgChannel,
  type XSysMessageTemplate,
} from '@/hooks/xsystem/templates';
import { whatsappLink } from '@/lib/whatsappLink';

export interface MessageTemplatePickerProps {
  trigger: React.ReactNode;
  channel: MsgChannel;
  /** Optional category to filter templates (recommended). */
  category?: MsgCategory;
  /** Pre-filled variable values; user can edit them in the dialog. */
  defaultVars?: Record<string, string | undefined | null>;
  /** Phone (whatsapp). Required for whatsapp channel. */
  phone?: string | null;
  /** Email recipient. Required for email channel. */
  email?: string | null;
  recipientName?: string;
  /** Optional lead id for activity logging. */
  leadId?: string | null;
  /** Title for the dialog. */
  title?: string;
  /** Called after a successful send/open. */
  onSent?: () => void;
}

export function MessageTemplatePicker({
  trigger, channel, category, defaultVars = {}, phone, email,
  recipientName, leadId, title, onSent,
}: MessageTemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const { data: templates = [] } = useXSystemMessageTemplates({ channel, category });
  const [tplId, setTplId] = useState<string>('');
  const [vars, setVars] = useState<Record<string, string>>({});
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const selected: XSysMessageTemplate | undefined = useMemo(
    () => templates.find((t) => t.id === tplId),
    [templates, tplId],
  );

  // Auto-pick first template when opened
  useEffect(() => {
    if (open && !tplId && templates.length > 0) setTplId(templates[0].id);
  }, [open, templates, tplId]);

  // Rebuild body/vars when template changes
  useEffect(() => {
    if (!selected) return;
    const refs = extractTemplateVars(selected.body + ' ' + (selected.subject || ''));
    const next: Record<string, string> = {};
    refs.forEach((k) => { next[k] = String(defaultVars[k] ?? ''); });
    setVars(next);
    setSubject(selected.subject || '');
    setBody(selected.body);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const renderedBody = renderTemplate(body, vars);
  const renderedSubject = renderTemplate(subject, vars);

  const sendWhatsApp = () => {
    const url = whatsappLink(phone, renderedBody);
    if (!url) { toast({ title: 'אין מספר טלפון', variant: 'destructive' }); return; }
    window.open(url, '_blank');
    onSent?.(); setOpen(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(renderedBody);
      toast({ title: 'הועתק' });
    } catch {
      toast({ title: 'העתקה נכשלה', variant: 'destructive' });
    }
  };

  const sendEmail = async () => {
    if (!email) { toast({ title: 'אין אימייל', variant: 'destructive' }); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-coach-email', {
        body: {
          to: email,
          subject: renderedSubject || 'הודעה',
          html: renderedBody.replace(/\n/g, '<br/>'),
          lead_id: leadId || undefined,
        },
      });
      const err = (data as { error?: string })?.error;
      if (error || err) throw new Error(err || error?.message);
      toast({ title: 'נשלח' });
      onSent?.(); setOpen(false);
    } catch (e: any) {
      toast({ title: 'שליחה נכשלה', description: e?.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            {title || (channel === 'email' ? 'שליחת אימייל מתבנית' : 'שליחה מתבנית')}
            {recipientName && <span className="text-xs text-muted-foreground">· {recipientName}</span>}
          </DialogTitle>
        </DialogHeader>

        {templates.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded">
            אין תבניות בקטגוריה זו. צור תבנית חדשה ב-Admin → תבניות הודעות.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">תבנית</Label>
              <Select value={tplId} onValueChange={setTplId}>
                <SelectTrigger><SelectValue placeholder="בחר תבנית" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Object.keys(vars).length > 0 && (
              <div className="space-y-2 rounded-md border border-border/40 p-2">
                <div className="text-[11px] text-muted-foreground">משתנים</div>
                {Object.keys(vars).map((k) => (
                  <div key={k} className="grid grid-cols-[80px_1fr] items-center gap-2">
                    <Label className="text-xs font-mono">{`{{${k}}}`}</Label>
                    <Input
                      value={vars[k]}
                      onChange={(e) => setVars((p) => ({ ...p, [k]: e.target.value }))}
                      className="h-8"
                      dir="auto"
                    />
                  </div>
                ))}
              </div>
            )}

            {channel === 'email' && (
              <div>
                <Label className="text-xs">נושא</Label>
                <Input value={renderedSubject} onChange={(e) => setSubject(e.target.value)} dir="auto" />
              </div>
            )}

            <div>
              <Label className="text-xs">תוכן (תצוגה מקדימה)</Label>
              <Textarea rows={8} value={renderedBody} onChange={(e) => setBody(e.target.value)} dir="auto" />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={copy} className="gap-2">
            <Copy className="h-4 w-4" /> העתק
          </Button>
          {channel === 'whatsapp' && (
            <Button size="sm" disabled={!phone} onClick={sendWhatsApp} className="gap-2">
              <MessageCircle className="h-4 w-4" /> פתח ב-WhatsApp
            </Button>
          )}
          {channel === 'email' && (
            <Button size="sm" disabled={!email || sending} onClick={sendEmail} className="gap-2">
              <Mail className="h-4 w-4" /> שלח
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MessageTemplatePicker;
