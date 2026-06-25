/**
 * Small shared bits for XSYSTEM client tab components.
 */
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-sm text-muted-foreground py-10 text-center border border-dashed rounded-lg">
      {label}
    </div>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}

export const SESSION_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
export const SESSION_MODES = ['in_person', 'online', 'phone'] as const;
export const NOTE_KINDS = ['observation', 'insight', 'homework', 'next_step', 'risk'] as const;
export const BELIEF_STATUSES = ['active', 'reframed', 'archived'] as const;
export const BELIEF_POLARITY = ['limiting', 'empowering', 'neutral'] as const;
export const PATTERN_STATUSES = ['active', 'resolved', 'archived'] as const;
export const PART_STATUSES = ['unblended', 'blended', 'integrated'] as const;
export const PART_ROLES = ['protector', 'exile', 'manager', 'firefighter', 'other'] as const;
export const ROOM_STATES = ['locked', 'open', 'active', 'completed'] as const;

export function statusLabel(s: string) {
  return s.replace(/_/g, ' ');
}
