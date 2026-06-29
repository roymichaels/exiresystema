/**
 * Mobile-only Lead card.
 * Goal: native mobile CRM feel — compact, scannable, one primary action,
 * everything else behind a kebab menu. Reuses existing data and actions.
 */
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Phone, MessageCircle, MoreVertical, Sparkles, Send, Calendar, UserCheck, Clock, ExternalLink,
} from 'lucide-react';
import type { Lead } from '@/hooks/useLeads';

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

const leadMeta = (l: Lead): Record<string, unknown> =>
  (l.metadata && typeof l.metadata === 'object' ? (l.metadata as Record<string, unknown>) : {});

const isResubmitted = (l: Lead): boolean => {
  const m = leadMeta(l);
  const tags = (l as unknown as { tags?: string[] | null }).tags;
  return !!m.latest_submission
    || (typeof m.resubmit_count === 'number' && (m.resubmit_count as number) > 0)
    || (Array.isArray(tags) && tags.includes('resubmitted'));
};

interface Props {
  lead: Lead;
  sourceLabel: string;
  statusLabel: string;
  statusColor: string;
  onOpen: () => void;
  onConvert: () => void;
}

export const MobileLeadCard = ({
  lead, sourceLabel, statusLabel, statusColor, onOpen, onConvert,
}: Props) => {
  const wa = waLink(lead.phone);
  const primaryHref = wa || (lead.phone ? `tel:${lead.phone}` : null);
  const challenge = lead.pain_category || (leadMeta(lead).latest_submission as { main_challenge?: string } | undefined)?.main_challenge;
  const desired = lead.desired_outcome;

  return (
    <div
      className="rounded-xl border border-border/40 bg-card/60 px-3 py-2.5 active:bg-muted/30 transition-colors"
      onClick={onOpen}
    >
      <div className="flex items-start gap-2">
        {/* Main column: name, meta, challenge */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-semibold text-[14px] leading-tight truncate">{lead.name || '—'}</h4>
            <Badge variant="outline" className={`${statusColor} text-[10px] px-1.5 py-0 h-4 rounded-full font-medium`}>
              {statusLabel}
            </Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 flex-wrap text-[10.5px] text-muted-foreground">
            <span>{sourceLabel}</span>
            {isResubmitted(lead) && <span className="text-amber-400">· חזר</span>}
            {typeof lead.readiness_score === 'number' && (
              <span className="inline-flex items-center gap-0.5">
                · <Sparkles className="h-3 w-3" />{lead.readiness_score}/10
              </span>
            )}
            <span className="ms-auto shrink-0 opacity-80">
              {format(new Date(lead.created_at), 'dd MMM HH:mm', { locale: he })}
            </span>
          </div>
          {challenge && (
            <p className="mt-1 text-[12.5px] text-foreground/75 line-clamp-1 leading-snug" dir="auto">
              {String(challenge)}
            </p>
          )}
        </div>

        {/* Compact action column */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {wa ? (
            <Button asChild size="icon" className="h-9 w-9 rounded-full" aria-label="WhatsApp">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
              </a>
            </Button>
          ) : lead.phone ? (
            <Button asChild size="icon" className="h-9 w-9 rounded-full" aria-label="חייג">
              <a href={`tel:${lead.phone}`} dir="ltr">
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full" aria-label="פעולות נוספות">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-[11px]">פעולות</DropdownMenuLabel>
              <DropdownMenuItem onClick={onOpen} className="text-[12.5px]">
                <ExternalLink className="h-3.5 w-3.5 ms-2" /> פתח כרטיס ליד
              </DropdownMenuItem>
              {lead.phone && (
                <DropdownMenuItem asChild className="text-[12.5px]">
                  <a href={`tel:${lead.phone}`} dir="ltr">
                    <Phone className="h-3.5 w-3.5 ms-2" /> חייג
                  </a>
                </DropdownMenuItem>
              )}
              {wa && (
                <DropdownMenuItem asChild className="text-[12.5px]">
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5 ms-2" /> WhatsApp
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={!lead.phone} onClick={onOpen} className="text-[12.5px]">
                <Send className="h-3.5 w-3.5 ms-2" /> הודעת פתיחה
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!lead.phone} onClick={onOpen} className="text-[12.5px]">
                <Calendar className="h-3.5 w-3.5 ms-2" /> קביעת שיחה
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onConvert} className="text-[12.5px]">
                <UserCheck className="h-3.5 w-3.5 ms-2" /> המר ללקוח
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MobileLeadCard;
