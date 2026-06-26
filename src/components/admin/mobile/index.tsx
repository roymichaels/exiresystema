/**
 * Mobile-native admin UI primitives.
 *
 * Goal: shared building blocks so admin screens feel like a mobile app
 * (Telegram / CRM inbox / clean settings) instead of a responsive
 * dashboard. Mobile-only — desktop is intentionally left alone.
 *
 * Rules these primitives enforce:
 *  - single column, max-w-full, no horizontal overflow
 *  - rounded-2xl cards, calm borders, no neon glow
 *  - 44px+ touch targets
 *  - one primary action per surface, secondary behind menus/sheets
 *  - muted secondary information
 *  - consistent compact padding
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, type LucideIcon } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/* -------------------------------- screen --------------------------------- */

export interface MobileAdminScreenProps {
  children: React.ReactNode;
  className?: string;
}

/** Wraps a mobile admin page body. Single column, no horizontal overflow. */
export function MobileAdminScreen({ children, className }: MobileAdminScreenProps) {
  return (
    <div
      className={cn(
        'md:hidden w-full max-w-full overflow-x-hidden space-y-3',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------- header --------------------------------- */

export interface MobileAdminHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

/** Compact page sub-header (sits below the global app bar, not in place of it). */
export function MobileAdminHeader({ title, subtitle, right }: MobileAdminHeaderProps) {
  return (
    <div className="md:hidden flex items-end justify-between gap-3 px-0.5">
      <div className="min-w-0 flex-1">
        <h2 className="text-[17px] font-semibold leading-tight truncate">{title}</h2>
        {subtitle && (
          <p className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0 flex items-center gap-1.5">{right}</div>}
    </div>
  );
}

/* ------------------------------ section card ----------------------------- */

export interface MobileSectionCardProps {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Render with no inner padding (for tight lists). */
  flush?: boolean;
}

/** Standard mobile container card. Rounded-2xl, subtle border, calm tone. */
export function MobileSectionCard({
  title, hint, action, children, className, flush,
}: MobileSectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2">
          <div className="min-w-0">
            {title && <h3 className="text-[13px] font-semibold truncate">{title}</h3>}
            {hint && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{hint}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={flush ? '' : 'px-3.5 pb-3'}>{children}</div>
    </section>
  );
}

/* ------------------------------ action card ------------------------------ */

export interface MobileActionCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'good' | 'warn' | 'primary';
  className?: string;
}

/** Tappable card with title/subtitle and a chevron — for primary CTAs. */
export function MobileActionCard({
  icon: Icon, title, subtitle, badge, onClick, tone = 'default', className,
}: MobileActionCardProps) {
  const toneClass =
    tone === 'good' ? 'border-emerald-500/25 bg-emerald-500/[0.04]'
    : tone === 'warn' ? 'border-amber-500/25 bg-amber-500/[0.04]'
    : tone === 'primary' ? 'border-primary/30 bg-primary/[0.05]'
    : 'border-border/40 bg-card/60';
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-start rounded-2xl border backdrop-blur-sm',
        'px-3.5 py-3 min-h-[56px] flex items-center gap-3',
        'active:bg-muted/40 transition-colors',
        toneClass, className,
      )}
    >
      {Icon && (
        <div className="rounded-xl bg-muted p-2 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium leading-tight truncate">{title}</div>
        {subtitle && (
          <div className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{subtitle}</div>
        )}
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
      <ChevronLeft className="h-4 w-4 text-muted-foreground/60 shrink-0" />
    </button>
  );
}

/* -------------------------------- list item ------------------------------ */

export interface MobileListItemProps {
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Single-line list row, telegram-like density. */
export function MobileListItem({
  title, subtitle, meta, trailing, onClick, className,
}: MobileListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-start flex items-center gap-3 px-3.5 py-2.5 min-h-[48px]',
        'active:bg-muted/40 transition-colors',
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium truncate">{title}</span>
          {meta && <span className="text-[11px] text-muted-foreground shrink-0">{meta}</span>}
        </div>
        {subtitle && (
          <div className="text-[11.5px] text-muted-foreground mt-0.5 truncate">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </button>
  );
}

/* ----------------------------- metric summary ---------------------------- */

export interface MobileMetric {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'good' | 'warn';
}

export interface MobileMetricSummaryProps {
  hero?: { label: string; value: React.ReactNode; hint?: string };
  metrics: MobileMetric[];
  className?: string;
}

/** Single compact summary card. Optional hero + small metric strip. */
export function MobileMetricSummary({ hero, metrics, className }: MobileMetricSummaryProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-4 space-y-3',
        className,
      )}
    >
      {hero && (
        <div>
          <div className="text-[11px] text-muted-foreground">{hero.label}</div>
          <div className="text-[28px] font-bold leading-tight">{hero.value}</div>
          {hero.hint && (
            <div className="text-[11px] text-muted-foreground mt-0.5">{hero.hint}</div>
          )}
        </div>
      )}
      {metrics.length > 0 && (
        <div
          className={cn(
            'grid gap-2 pt-3 border-t border-border/40',
            metrics.length === 2 ? 'grid-cols-2'
            : metrics.length === 3 ? 'grid-cols-3'
            : 'grid-cols-4',
          )}
        >
          {metrics.map((m) => {
            const tone = m.tone === 'good' ? 'text-emerald-500'
              : m.tone === 'warn' ? 'text-amber-500' : '';
            return (
              <div key={m.label} className="text-center min-w-0">
                <div className={cn('text-base font-semibold leading-tight', tone)}>{m.value}</div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">{m.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* --------------------- bottom-sheet style action list -------------------- */

export interface MobileSheetAction {
  label: string;
  icon?: LucideIcon;
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  destructive?: boolean;
}

export interface MobileBottomSheetActionListProps {
  trigger: React.ReactNode;
  label?: string;
  groups: Array<{ label?: string; actions: MobileSheetAction[] }>;
}

/** Dropdown-menu based action sheet (single overlay, no nested cards). */
export function MobileBottomSheetActionList({
  trigger, label, groups,
}: MobileBottomSheetActionListProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {label && <DropdownMenuLabel className="text-xs">{label}</DropdownMenuLabel>}
        {groups.map((g, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <DropdownMenuSeparator />}
            {g.label && (
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                {g.label}
              </DropdownMenuLabel>
            )}
            {g.actions.map((a, ai) => {
              const Icon = a.icon;
              const body = (
                <>
                  {Icon && <Icon className="h-4 w-4 ms-2" />}
                  <span className={a.destructive ? 'text-destructive' : ''}>{a.label}</span>
                </>
              );
              if (a.href) {
                return (
                  <DropdownMenuItem key={ai} asChild disabled={a.disabled}>
                    <a href={a.href} target="_blank" rel="noopener noreferrer">{body}</a>
                  </DropdownMenuItem>
                );
              }
              return (
                <DropdownMenuItem key={ai} disabled={a.disabled} onClick={a.onSelect}>
                  {body}
                </DropdownMenuItem>
              );
            })}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ----------------------------- empty state ------------------------------- */

export interface MobileEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function MobileEmptyState({
  icon: Icon, title, description, action,
}: MobileEmptyStateProps) {
  return (
    <div className="text-center py-10 px-6">
      {Icon && <Icon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />}
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {action && (
        <Button size="sm" variant="ghost" className="mt-3" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
