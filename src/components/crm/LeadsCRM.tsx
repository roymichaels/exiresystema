import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Phone, Mail, MessageCircle, Search, Users, Clock, CheckCircle, Calendar,
  Trash2, UserPlus, Sparkles, ChevronRight, UserCheck,
} from 'lucide-react';
import {
  useLeads, useLeadStats, useUpdateLead, useDeleteLead, useAddLead, type Lead,
} from '@/hooks/useLeads';
import { useConvertLeadToClient, useClientByLeadId } from '@/hooks/useClients';
import { EmailDialog, WhatsAppDialog, ScheduleDialog } from '@/components/crm/LeadQuickActions';
import { useLeadActivity } from '@/hooks/useLeadActivity';
import { useCreateXSystemLeadFollowup } from '@/hooks/xsystem';
import { MessageTemplatePicker } from '@/components/admin/clients/xsystem/MessageTemplatePicker';
import { Send } from 'lucide-react';

interface LeadsCRMProps {
  scope?: 'admin' | 'coach';
}

const SOURCE_LABELS: Record<string, string> = {
  intake_chat: 'צ׳אט אינטייק',
  landing_page: 'דף נחיתה',
  exit_intent: 'פופאפ יציאה',
  manual: 'הוזן ידנית',
  affiliate: 'שותף',
  hero: 'היירו',
  discovery: 'שיחת היכרות',
  invitation: 'הזמנה אישית',
  exit_popup: 'פופאפ יציאה',
  floating: 'כפתור צף',
  general: 'כללי',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'חדש',
  contacted: 'נוצר קשר',
  scheduled: 'נקבעה פגישה',
  converted: 'הומר',
  lost: 'אבד',
};

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  contacted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  scheduled: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  converted: 'bg-primary/15 text-primary border-primary/30',
  lost: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const STATUS_OPTIONS = ['new', 'contacted', 'scheduled', 'converted', 'lost'] as const;

const normalizePhone = (phone: string | null) => {
  if (!phone) return null;
  let p = phone.replace(/[^\d+]/g, '');
  if (p.startsWith('0')) p = '+972' + p.slice(1);
  if (!p.startsWith('+')) p = '+' + p;
  return p;
};

const waLink = (phone: string | null) => {
  const p = normalizePhone(phone);
  return p ? `https://wa.me/${p.replace(/\+/g, '')}` : null;
};

export const LeadsCRM = ({ scope = 'admin' }: LeadsCRMProps) => {
  const { data: leads = [], isLoading } = useLeads();
  const { stats } = useLeadStats();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const addLead = useAddLead();
  const convertLead = useConvertLeadToClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [toDelete, setToDelete] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [draftNotes, setDraftNotes] = useState('');

  const sourcesPresent = useMemo(
    () => Array.from(new Set(leads.map(l => l.source))).sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter(l => {
      const matchesQ = !q ||
        l.name?.toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.email || '').toLowerCase().includes(q);
      const matchesS = sourceFilter === 'all' || l.source === sourceFilter;
      const matchesSt = statusFilter === 'all' || l.status === statusFilter;
      return matchesQ && matchesS && matchesSt;
    });
  }, [leads, search, sourceFilter, statusFilter]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setDraftNotes(lead.notes || '');
  };

  const saveNotes = () => {
    if (!selected) return;
    updateLead.mutate(
      { id: selected.id, updates: { notes: draftNotes } },
      { onSuccess: () => setSelected(null) },
    );
  };

  const changeStatus = (lead: Lead, status: string) => {
    updateLead.mutate({ id: lead.id, updates: { status } });
  };

  const handleAdd = () => {
    if (!form.name || (!form.phone && !form.email)) return;
    addLead.mutate(
      { ...form, source: 'manual' },
      {
        onSuccess: () => {
          setAddOpen(false);
          setForm({ name: '', phone: '', email: '', notes: '' });
        },
      },
    );
  };

  const statCards = [
    { label: 'סה״כ', value: stats.total, icon: Users, color: 'text-primary' },
    { label: 'חדשים', value: stats.new, icon: Clock, color: 'text-blue-400' },
    { label: 'נוצר קשר', value: stats.contacted, icon: Phone, color: 'text-amber-400' },
    { label: 'נקבעה פגישה', value: stats.scheduled, icon: Calendar, color: 'text-emerald-400' },
    { label: 'הומרו', value: stats.converted, icon: CheckCircle, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">
            {scope === 'admin' ? 'ניהול לידים' : 'הלקוחות הפוטנציאליים שלי'}
          </h2>
          <p className="text-sm text-muted-foreground">
            כל הלידים מכל המקורות במקום אחד
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              ליד חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת ליד ידני</DialogTitle>
              <DialogDescription>הוסף ליד שהגיע מערוץ חיצוני</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>שם</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>טלפון</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <Label>אימייל</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <Label>הערות</Label>
                <Textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <Button
                onClick={handleAdd}
                disabled={!form.name || (!form.phone && !form.email) || addLead.isPending}
                className="w-full"
              >
                שמור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
                <s.icon className={`h-5 w-5 opacity-50 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם, טלפון או אימייל..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pe-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="מקור" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המקורות</SelectItem>
                {sourcesPresent.map(s => (
                  <SelectItem key={s} value={s}>{SOURCE_LABELS[s] || s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="סטטוס" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {STATUS_OPTIONS.map(s => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">
            לידים ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">אין לידים להצגה</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(lead => {
                const wa = waLink(lead.phone);
                return (
                  <div
                    key={lead.id}
                    className="group flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => openLead(lead)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {(lead.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm">{lead.name}</h4>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {SOURCE_LABELS[lead.source] || lead.source}
                          </Badge>
                          {typeof lead.readiness_score === 'number' && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Sparkles className="h-3 w-3" /> {lead.readiness_score}/10
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                          {lead.phone && (
                            <span dir="ltr" className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />{lead.phone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />{lead.email}
                            </span>
                          )}
                          <span>
                            {format(new Date(lead.created_at), 'dd MMM HH:mm', { locale: he })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {lead.phone && (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a href={`tel:${lead.phone}`} aria-label="חייג"><Phone className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {wa && (
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                          <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="ווטסאפ">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <MessageTemplatePicker
                        channel="whatsapp"
                        category="lead_reply"
                        phone={lead.phone}
                        recipientName={lead.name}
                        leadId={lead.id}
                        defaultVars={{ lead_name: lead.name, first_name: (lead.name || '').split(' ')[0] }}
                        title="WhatsApp · מענה לליד"
                        trigger={
                          <Button size="sm" variant="ghost" className="h-8 px-2 gap-1" disabled={!lead.phone}>
                            <Send className="h-3.5 w-3.5" /> שלח תבנית
                          </Button>
                        }
                      />
                      <Badge variant="outline" className={STATUS_COLOR[lead.status] || ''}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {SOURCE_LABELS[selected.source] || selected.source} ·{' '}
                  {format(new Date(selected.created_at), 'PPp', { locale: he })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Quick actions — integrated CRM */}
                <div className="flex flex-wrap gap-2">
                  {selected.phone && (
                    <Button asChild variant="outline" size="sm" className="gap-2">
                      <a href={`tel:${selected.phone}`} dir="ltr"><Phone className="h-4 w-4" />Call</a>
                    </Button>
                  )}
                  <EmailDialog lead={selected} />
                  <WhatsAppDialog lead={selected} />
                  <ScheduleDialog lead={selected} />
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={convertLead.isPending}
                    onClick={() => {
                      const lead = selected;
                      convertLead.mutate(
                        { id: lead.id, name: lead.name, phone: lead.phone, email: lead.email, notes: lead.notes },
                        {
                          onSuccess: (client) => {
                            setSelected(null);
                            navigate(`/clients/${client.id}`);
                          },
                        },
                      );
                    }}
                  >
                    <UserCheck className="h-4 w-4" />
                    המר ללקוח XSYSTEM
                  </Button>
                  <LeadFollowupButton leadId={selected.id} />
                </div>

                <LeadLinkedClient leadId={selected.id} />

                <ActivityFeed leadId={selected.id} />

                {/* Status */}
                <div>
                  <Label className="text-xs">סטטוס</Label>
                  <Select value={selected.status} onValueChange={v => changeStatus(selected, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Intake snapshot */}
                {(selected.pain_category || selected.transformation_vision || selected.readiness_score) && (
                  <div className="rounded-lg border border-border/50 p-3 space-y-2 bg-muted/20">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase">תמונת אינטייק</h4>
                    {selected.pain_category && (
                      <Field label="כאב" value={selected.pain_category} />
                    )}
                    {selected.pain_duration && <Field label="משך" value={selected.pain_duration} />}
                    {selected.prior_attempts?.length ? (
                      <Field label="ניסיונות קודמים" value={selected.prior_attempts.join(', ')} />
                    ) : null}
                    {selected.desired_outcome && <Field label="תוצאה רצויה" value={selected.desired_outcome} />}
                    {selected.transformation_vision && <Field label="חזון" value={selected.transformation_vision} />}
                    {typeof selected.readiness_score === 'number' && (
                      <Field label="מוכנות" value={`${selected.readiness_score}/10`} />
                    )}
                    {selected.intent && <Field label="כוונה" value={selected.intent} />}
                  </div>
                )}

                {/* AI analysis */}
                {selected.ai_analysis && Object.keys(selected.ai_analysis).length > 0 && (
                  <details className="rounded-lg border border-border/50 p-3">
                    <summary className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">
                      ניתוח AI
                    </summary>
                    <pre className="mt-2 text-xs whitespace-pre-wrap" dir="auto">
                      {JSON.stringify(selected.ai_analysis, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Conversation */}
                {Array.isArray(selected.conversation) && selected.conversation.length > 0 && (
                  <details className="rounded-lg border border-border/50 p-3">
                    <summary className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">
                      תמליל שיחה ({selected.conversation.length} הודעות)
                    </summary>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {(selected.conversation as Array<{ role?: string; content?: string }>).map((m, i) => (
                        <div
                          key={i}
                          className={`text-xs rounded-lg p-2 ${
                            m.role === 'user' ? 'bg-primary/10' : 'bg-muted/40'
                          }`}
                          dir="auto"
                        >
                          <span className="font-semibold opacity-60">{m.role}: </span>
                          {m.content}
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Notes */}
                <div>
                  <Label className="text-xs">הערות</Label>
                  <Textarea
                    value={draftNotes}
                    onChange={e => setDraftNotes(e.target.value)}
                    rows={3}
                    placeholder="הערות פנימיות..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={saveNotes} disabled={updateLead.isPending} className="flex-1">
                    שמור הערות
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => { setToDelete(selected); setSelected(null); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הליד?</AlertDialogTitle>
            <AlertDialogDescription>פעולה זו אינה ניתנת לביטול.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) deleteLead.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
              }}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="text-sm">
    <span className="text-xs text-muted-foreground">{label}: </span>
    <span dir="auto">{value}</span>
  </div>
);

const ActivityFeed = ({ leadId }: { leadId: string }) => {
  const { data: activity = [], isLoading } = useLeadActivity(leadId);
  if (isLoading) return null;
  if (activity.length === 0) return null;
  return (
    <details className="rounded-lg border border-border/50 p-3" open>
      <summary className="text-xs font-semibold text-muted-foreground uppercase cursor-pointer">
        Activity ({activity.length})
      </summary>
      <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
        {activity.map(a => (
          <div key={a.id} className="text-xs rounded-lg p-2 bg-muted/30" dir="auto">
            <span className="font-semibold opacity-70">[{a.kind}]</span>{' '}
            {a.subject && <span className="font-medium">{a.subject} · </span>}
            <span>{a.body}</span>
            <div className="text-[10px] opacity-50 mt-0.5">
              {format(new Date(a.created_at), 'dd MMM HH:mm', { locale: he })}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
};

const LeadLinkedClient = ({ leadId }: { leadId: string }) => {
  const { data: linked } = useClientByLeadId(leadId);
  const navigate = useNavigate();
  if (!linked) return null;
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 flex items-center justify-between">
      <div className="text-xs">
        <span className="text-muted-foreground">לקוח מקושר: </span>
        <span className="font-medium">{linked.full_name}</span>
      </div>
      <Button size="sm" variant="ghost" className="gap-1" onClick={() => navigate(`/clients/${linked.id}`)}>
        פרופיל <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
};

const LeadFollowupButton = ({ leadId }: { leadId: string }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const create = useCreateXSystemLeadFollowup();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Clock className="h-4 w-4" /> פולואפ
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>פולואפ ללליד</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>כותרת</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="לחזור אליו עם הצעה" />
          </div>
          <div>
            <Label>תאריך יעד</Label>
            <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
          <Button
            disabled={!title || create.isPending}
            onClick={async () => {
              await create.mutateAsync({
                lead_id: leadId, title,
                due_at: due ? new Date(due).toISOString() : null,
              });
              setTitle(''); setDue(''); setOpen(false);
            }}
          >שמור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadsCRM;
