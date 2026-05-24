import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Calendar, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

const normalizePhone = (phone: string | null) => {
  if (!phone) return null;
  let p = phone.replace(/[^\d+]/g, '');
  if (p.startsWith('0')) p = '+972' + p.slice(1);
  if (!p.startsWith('+')) p = '+' + p;
  return p;
};

export const EmailDialog = ({ lead }: { lead: Lead }) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();

  if (!lead.email) return null;

  const send = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-coach-email', {
        body: { to: lead.email, subject, text: body, lead_id: lead.id },
      });
      const err = (data as { error?: string })?.error;
      if (error || err) throw new Error(err || error?.message);
      toast.success('Email sent');
      qc.invalidateQueries({ queryKey: ['lead_activity', lead.id] });
      setOpen(false); setSubject(''); setBody('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" /> Email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email {lead.name}</DialogTitle>
          <DialogDescription dir="ltr">{lead.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea rows={6} value={body} onChange={e => setBody(e.target.value)} /></div>
          <Button onClick={send} disabled={!subject || !body || sending} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WhatsAppDialog = ({ lead }: { lead: Lead }) => {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();
  const phone = normalizePhone(lead.phone);

  if (!phone) return null;

  const send = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: { to: phone, body, lead_id: lead.id },
      });
      const err = (data as { error?: string; kind?: string })?.error;
      if (error || err) {
        // Fallback: open wa.me with the typed message
        const url = `https://wa.me/${phone.replace(/\+/g, '')}?text=${encodeURIComponent(body)}`;
        window.open(url, '_blank');
        toast.message('Opened WhatsApp Web (Twilio not configured)');
        setOpen(false); setBody('');
        return;
      }
      toast.success('WhatsApp sent');
      qc.invalidateQueries({ queryKey: ['lead_activity', lead.id] });
      setOpen(false); setBody('');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WhatsApp {lead.name}</DialogTitle>
          <DialogDescription dir="ltr">{phone}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea rows={5} value={body} onChange={e => setBody(e.target.value)} placeholder="Hi…" />
          <Button onClick={send} disabled={!body || sending} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />} Send
          </Button>
          <p className="text-xs text-muted-foreground">
            Falls back to wa.me deep link if Twilio isn't connected yet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ScheduleDialog = ({ lead }: { lead: Lead }) => {
  const [open, setOpen] = useState(false);
  const [startIso, setStartIso] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [summary, setSummary] = useState(`Session with ${lead.name}`);
  const [sending, setSending] = useState(false);
  const qc = useQueryClient();

  const book = async () => {
    if (!startIso) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          lead_id: lead.id,
          attendee_email: lead.email,
          attendee_name: lead.name,
          start_iso: new Date(startIso).toISOString(),
          duration_min: minutes,
          summary,
        },
      });
      const err = (data as { error?: string })?.error;
      if (error || err) throw new Error(err || error?.message);
      const meet = (data as { meet_link?: string })?.meet_link;
      toast.success(meet ? `Booked — Meet link: ${meet}` : 'Booked');
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead_activity', lead.id] });
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" /> Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a session</DialogTitle>
          <DialogDescription>Creates a Google Calendar event with a Meet link.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={summary} onChange={e => setSummary(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input type="datetime-local" value={startIso} onChange={e => setStartIso(e.target.value)} />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input type="number" value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
            </div>
          </div>
          <Button onClick={book} disabled={!startIso || sending} className="w-full gap-2">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />} Book
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
