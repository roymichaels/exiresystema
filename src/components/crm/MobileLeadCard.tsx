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
  onFollowup: () => void;
  onSendTemplate: () => void;
  onSendOpening: () => void;
  onSendScheduling: () => void;
}

export const MobileLeadCard = ({
  lead, sourceLabel, statusLabel, statusColor,
  onOpen, onConvert, onFollowup, onSendTemplate, onSendOpening, onSendScheduling,
}: Props) => {
  const wa = waLink(lead.phone);
  const primaryHref = wa || (lead.phone ? `tel:${lead.phone}` : null);
  const challenge = lead.pain_category || (leadMeta(lead).latest_submission as { main_challenge?: string } | undefined)?.main_challenge;
  const desired = lead.desired_outcome;

  return (
    <div
      className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3.5 active:bg-muted/30 transition-colors"
      onClick={onOpen}
    >
      {/* Row 1: name + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-[15px] leading-tight truncate">{lead.name || '—'}</h4>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] text-muted-foreground">{sourceLabel}</span>
            {isResubmitted(lead) && (
              <span className="text-[10px] text-amber-400">· 🔁</span>
            )}
            {typeof lead.readiness_score === 'number' && (
              <span className="text-[10.5px] text-muted-foreground inline-flex items-center gap-0.5">
                · <Sparkles className="h-3 w-3" />{lead.readiness_score}/10
              </span>
            )}
          </div>
        </div>
        <Badge variant="outline" className={`${statusColor} text-[10px] px-2 py-0.5 shrink-0`}>
          {statusLabel}
        </Badge>
      </div>

      {/* Row 2: contact */}
      {(lead.phone || lead.email) && (
        <div className="mt-2 text-xs text-muted-foreground truncate" dir="ltr">
          {lead.phone || lead.email}
        </div>
      )}

      {/* Row 3: challenge / desired */}
      {(challenge || desired) && (
        <div className="mt-2 space-y-0.5 text-[13px] leading-snug">
          {challenge && (
            <p className="text-foreground/90 line-clamp-2" dir="auto">{String(challenge)}</p>
          )}
          {desired && (
            <p className="text-muted-foreground line-clamp-1" dir="auto">→ {desired}</p>
          )}
        </div>
      )}

      {/* Row 4: meta */}
      <div className="mt-2 text-[10.5px] text-muted-foreground">
        {format(new Date(lead.created_at), 'dd MMM HH:mm', { locale: he })}
      </div>

      {/* Bottom: primary CTA + secondary menu */}
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {primaryHref ? (
          <Button
            asChild
            size="sm"
            className="flex-1 h-9 rounded-xl gap-1.5"
          >
            <a href={primaryHref} target={wa ? '_blank' : undefined} rel="noopener noreferrer">
              {wa ? <MessageCircle className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              שלח הודעה
            </a>
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="flex-1 h-9 rounded-xl" onClick={onOpen}>
            פתח
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl shrink-0" aria-label="פעולות נוספות">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">פעולות</DropdownMenuLabel>
            <DropdownMenuItem onClick={onOpen}>
              <ExternalLink className="h-4 w-4 ms-2" /> פתח כרטיס ליד
            </DropdownMenuItem>
            {lead.phone && (
              <DropdownMenuItem asChild>
                <a href={`tel:${lead.phone}`} dir="ltr">
                  <Phone className="h-4 w-4 ms-2" /> חייג
                </a>
              </DropdownMenuItem>
            )}
            {wa && (
              <DropdownMenuItem asChild>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 ms-2" /> פתח WhatsApp
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!lead.phone} onClick={onSendOpening}>
              <Send className="h-4 w-4 ms-2" /> שלח הודעת פתיחה
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!lead.phone} onClick={onSendScheduling}>
              <Calendar className="h-4 w-4 ms-2" /> שלח קביעת שיחה
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!lead.phone} onClick={onSendTemplate}>
              <Send className="h-4 w-4 ms-2" /> תבנית WhatsApp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onFollowup}>
              <Clock className="h-4 w-4 ms-2" /> צור פולואפ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onConvert}>
              <UserCheck className="h-4 w-4 ms-2" /> המר ללקוח
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileLeadCard;
