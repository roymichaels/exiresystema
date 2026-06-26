/**
 * Phase 2K — Exire Lead Forms admin page.
 *
 * Lists every published form, lets the practitioner mark which ones act as Exire
 * lead forms, configure auto-sync / follow-up behaviour, and run a retroactive
 * import of existing submissions into the CRM leads pipeline.
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Download, ExternalLink, Inbox, CheckCircle2 } from 'lucide-react';
import {
  usePublishedFormsWithCounts,
  useLeadFormMappings,
  useUpsertLeadFormMapping,
  useDeleteLeadFormMapping,
  useImportFormSubmissions,
  type LeadFormMapping,
} from '@/hooks/xsystem/leadFormSync';
import { useNavigate } from 'react-router-dom';

export default function ExireLeadForms() {
  const { data: forms = [], isLoading } = usePublishedFormsWithCounts();
  const { data: mappings = [] } = useLeadFormMappings();
  const upsert = useUpsertLeadFormMapping();
  const remove = useDeleteLeadFormMapping();
  const importMutation = useImportFormSubmissions();
  const navigate = useNavigate();

  const mapByForm = useMemo(() => {
    const m = new Map<string, LeadFormMapping>();
    for (const r of mappings) m.set(r.form_id, r);
    return m;
  }, [mappings]);

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Mobile: compact disclosure. Desktop: explainer card. */}
      <details className="md:hidden rounded-xl border border-border/40 bg-card/40">
        <summary className="cursor-pointer px-3 py-2 text-[12.5px] font-medium flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          טפסי לידים Exire — איך זה עובד
        </summary>
        <div className="px-3 pb-3 text-[12px] text-muted-foreground space-y-1">
          <p>סמן טופס כ"טופס ליד Exire" כדי שכל הגשה תיווצר אוטומטית כליד ב-CRM.</p>
          <p><strong>טופס ליד</strong> = יוצר לידים. <strong>אינטייק</strong> = מצורף ללקוח קיים.</p>
        </div>
      </details>
      <Card className="hidden md:block border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            טפסי לידים Exire
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            סמן טופס פעיל כ"טופס ליד Exire" כדי שכל הגשה תיווצר אוטומטית כליד ב-CRM, עם פולואפ ופעילות.
          </p>
          <p className="text-xs">
            <strong>טופס ליד</strong> = יוצר לידים ב-CRM. <strong>טופס אינטייק</strong> = מצורף לפרופיל לקוח קיים.
          </p>
        </CardContent>
      </Card>

      {forms.length === 0 && (
        <div className="rounded-xl border border-border/40 bg-card/40 py-8 text-center text-[13px] text-muted-foreground">
          אין טפסים פעילים. צור טופס בלשונית "טפסים" וחזור לכאן.
        </div>
      )}


      <div className="grid gap-3">
        {forms.map((f) => {
          const mapping = mapByForm.get(f.id);
          const unsynced = Math.max(0, f.submission_count - f.synced_count);
          return (
            <FormCard
              key={f.id}
              form={f}
              mapping={mapping}
              unsynced={unsynced}
              onSave={(patch) => upsert.mutate({ form_id: f.id, ...patch })}
              onDisable={() => mapping && remove.mutate(mapping.id)}
              onImport={() => importMutation.mutate(f.id)}
              importing={importMutation.isPending}
              onViewLeads={(sourceKey) =>
                navigate(`/admin?tab=coach&sub=leads&source=${encodeURIComponent(sourceKey)}`)
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function FormCard({
  form, mapping, unsynced, onSave, onDisable, onImport, importing, onViewLeads,
}: {
  form: { id: string; title: string; access_token: string | null; submission_count: number; synced_count: number };
  mapping?: LeadFormMapping;
  unsynced: number;
  onSave: (patch: Partial<LeadFormMapping>) => void;
  onDisable: () => void;
  onImport: () => void;
  importing: boolean;
  onViewLeads: (sourceKey: string) => void;
}) {
  const [sourceKey, setSourceKey] = useState(mapping?.source_key ?? 'exire_form');
  const enabled = !!mapping?.is_active;
  return (
    <Card>
      <CardHeader className="py-3 flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
            <span className="truncate">{form.title}</span>
            {enabled && (
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                Exire Lead Form
              </Badge>
            )}
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-1 flex gap-3 flex-wrap">
            <span className="flex items-center gap-1"><Inbox className="h-3 w-3" /> {form.submission_count} הגשות</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {form.synced_count} סונכרנו</span>
            {unsynced > 0 && (
              <span className="text-amber-500">{unsynced} ממתינות לסנכרון</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {form.access_token && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <a href={`/form/${form.access_token}`} target="_blank" rel="noopener noreferrer" title="פתח טופס">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              if (v) onSave({ source_key: sourceKey, is_active: true });
              else onDisable();
            }}
          />
        </div>
      </CardHeader>

      {enabled && mapping && (
        <CardContent className="pt-0 space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label className="text-xs">מקור הליד (source_key)</Label>
              <Input
                value={sourceKey}
                onChange={(e) => setSourceKey(e.target.value)}
                onBlur={() => sourceKey !== mapping.source_key && onSave({ source_key: sourceKey })}
                placeholder="exire_form"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">סנכרון אוטומטי להגשות חדשות</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  checked={mapping.auto_sync}
                  onCheckedChange={(v) => onSave({ auto_sync: v })}
                />
                <span className="text-xs text-muted-foreground">{mapping.auto_sync ? 'פעיל' : 'כבוי'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs">יצירת פולואפ אוטומטי</Label>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  checked={mapping.create_followup}
                  onCheckedChange={(v) => onSave({ create_followup: v })}
                />
                <span className="text-xs text-muted-foreground">{mapping.create_followup ? 'פעיל' : 'כבוי'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              disabled={importing || unsynced === 0}
              onClick={onImport}
            >
              <Download className="h-4 w-4" />
              {importing ? 'מייבא...' : `ייבא לידים קיימים מהטופס (${unsynced})`}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onViewLeads(mapping.source_key)}>
              ראה לידים מהטופס הזה
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
