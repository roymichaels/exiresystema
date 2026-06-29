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
      className="rounded-2xl border border-border/40 bg-card/60 p-3 active:bg-muted/30 transition-colors"
      onClick={onOpen}
    >
      {/* Row 1: name + source */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-[14px] leading-tight truncate">{lead.name || '—'}</h4>
          <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] text-muted-foreground">{sourceLabel}</span>
            {isResubmitted(lead) && (
              <span className="text-[10px] text-amber-400">· חזר</span>
            )}
            {typeof lead.readiness_score === 'number' && (
              <span className="text-[10.5px] text-muted-foreground inline-flex items-center gap-0.5">
                · <Sparkles className="h-3 w-3" />{lead.readiness_score}/10
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: challenge preview */}
      {challenge && (
        <p className="mt-1 text-[12.5px] text-foreground/80 line-clamp-1 leading-snug" dir="auto">
          {String(challenge)}
        </p>
      )}

      {/* Row 3: contact + time */}
      <div className="mt-1.5 flex items-center gap-2 text-[10.5px] text-muted-foreground">
        {lead.phone && <span dir="ltr" className="truncate">{lead.phone}</span>}
        {lead.email && <span className="truncate">{lead.email}</span>}
        <span className="shrink-0">
          {format(new Date(lead.created_at), 'dd MMM HH:mm', { locale: he })}
        </span>
      </div>

      {/* Bottom: primary CTA + menu */}
      <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {primaryHref ? (
          <Button
            asChild
            size="sm"
            className="flex-1 h-8 rounded-xl gap-1 text-[12px]"
          >
            <a href={primaryHref} target={wa ? '_blank' : undefined} rel="noopener noreferrer">
              {wa ? <MessageCircle className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
              שלח הודעה
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 h-8 rounded-xl text-[12px]" onClick={onOpen}>
            פתח
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl shrink-0" aria-label="פעולות נוספות">
              <MoreVertical className="h-3.5 w-3.5" />
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
  );
};

export default MobileLeadCard;
