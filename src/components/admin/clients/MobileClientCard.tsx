/**
 * Mobile-only Client card. Native CRM-style.
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Phone, MessageCircle, MoreVertical, Mail, ExternalLink } from 'lucide-react';

interface ClientLite {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
}

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

interface Props {
  client: ClientLite;
  statusLabel: string;
  statusColor: string;
  onOpen: () => void;
}

export const MobileClientCard = ({ client, statusLabel, statusColor, onOpen }: Props) => {
  const wa = waLink(client.phone);
  const initial = (client.full_name || '?').charAt(0).toUpperCase();

  return (
    <div
      onClick={onOpen}
      className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-3.5 active:bg-muted/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary">{initial}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-[15px] leading-tight truncate">
              {client.full_name || '—'}
            </h4>
            <Badge variant="outline" className={`${statusColor} text-[10px] px-2 py-0.5 shrink-0`}>
              {statusLabel}
            </Badge>
          </div>
          {(client.phone || client.email) && (
            <div className="mt-1 text-xs text-muted-foreground truncate" dir="ltr">
              {client.phone || client.email}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Button size="sm" className="flex-1 h-9 rounded-xl" onClick={onOpen}>
          פתח פרופיל
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 rounded-xl shrink-0"
              aria-label="פעולות"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs">פעולות</DropdownMenuLabel>
            <DropdownMenuItem onClick={onOpen}>
              <ExternalLink className="h-4 w-4 ms-2" /> פתח פרופיל
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {client.phone && (
              <DropdownMenuItem asChild>
                <a href={`tel:${client.phone}`} dir="ltr">
                  <Phone className="h-4 w-4 ms-2" /> חייג
                </a>
              </DropdownMenuItem>
            )}
            {wa && (
              <DropdownMenuItem asChild>
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 ms-2" /> WhatsApp
                </a>
              </DropdownMenuItem>
            )}
            {client.email && (
              <DropdownMenuItem asChild>
                <a href={`mailto:${client.email}`}>
                  <Mail className="h-4 w-4 ms-2" /> אימייל
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileClientCard;
