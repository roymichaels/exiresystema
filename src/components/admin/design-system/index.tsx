/**
 * Admin Design System — shared primitives for the Exire OS v2 admin panel.
 *
 * Rules:
 * - 8-point spacing rhythm: 4, 8, 12, 16, 24, 32, 48, 64
 * - Consistent card radius, padding, shadows, hover states
 * - No local layout hacks; solve layout here
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* PageHeader                                                                 */
/* -------------------------------------------------------------------------- */

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 lg:mb-5', className)}>
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && (
          <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-[22px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          {actions}
        </div>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* SectionHeader                                                              */
/* -------------------------------------------------------------------------- */

export interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-3 mb-2 lg:mb-3', className)}>
      <div className="min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/90">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MetricCard                                                                 */
/* -------------------------------------------------------------------------- */

export interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'warn' | 'good' | 'info';
  className?: string;
  onClick?: () => void;
}

const METRIC_TONE = {
  warn: 'border-amber-500/25 bg-amber-500/[0.04]',
  good: 'border-emerald-500/25 bg-emerald-500/[0.04]',
  info: 'border-cyan-500/25 bg-cyan-500/[0.04]',
  default: 'border-border/40 bg-card/60',
};

const METRIC_ICON_TONE = {
  warn: 'bg-amber-500/15 text-amber-500',
  good: 'bg-emerald-500/15 text-emerald-500',
  info: 'bg-cyan-500/15 text-cyan-400',
  default: 'bg-muted/60 text-muted-foreground/70',
};

export function MetricCard({ label, value, hint, icon: Icon, tone = 'default', className, onClick }: MetricCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-xl border p-2.5 lg:p-3 text-start transition-all duration-200',
        'hover:border-primary/40',
        onClick && 'active:scale-[0.98] cursor-pointer',
        METRIC_TONE[tone],
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className={cn('h-7 w-7 shrink-0 rounded-md flex items-center justify-center', METRIC_ICON_TONE[tone])}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="text-base lg:text-lg font-semibold leading-tight">{value}</div>
          {hint && <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{hint}</div>}
        </div>
      </div>
    </Wrapper>
  );
}

/* -------------------------------------------------------------------------- */
/* DataList / DataRow                                                         */
/* -------------------------------------------------------------------------- */

export interface DataRowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

export function DataRow({ leading, title, subtitle, meta, trailing, onClick, className, compact }: DataRowProps) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-3 text-start',
        'border-b border-border/30 last:border-b-0',
        'transition-colors',
        onClick && 'hover:bg-muted/30 cursor-pointer',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
        className,
      )}
    >
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate" dir="auto">{title}</span>
          {meta && <span className="text-[11px] text-muted-foreground shrink-0">{meta}</span>}
        </div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</div>}
      </div>
      {trailing && <div className="shrink-0 flex items-center gap-2">{trailing}</div>}
    </Wrapper>
  );
}

export interface DataListProps {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  skeletonRows?: number;
}

export function DataList({ children, className, loading, skeletonRows = 4 }: DataListProps) {
  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border/40 bg-card/40 overflow-hidden', className)}>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-border/30 last:border-b-0">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cn('rounded-2xl border border-border/40 bg-card/60 overflow-hidden', className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EmptyState                                                                 */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center px-6 py-10 lg:py-12', className)}>
      {Icon && <Icon className="h-10 w-10 text-muted-foreground/40 mb-3" strokeWidth={1.5} />}
      <h3 className="text-sm font-medium text-foreground/90">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && (
        <Button size="sm" variant="outline" className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ActionCard                                                                 */
/* -------------------------------------------------------------------------- */

export interface ActionCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  tone?: 'default' | 'primary' | 'good' | 'warn';
  className?: string;
  compact?: boolean;
}

const ACTION_TONE = {
  primary: 'border-primary/25 bg-primary/[0.05] hover:border-primary/40 hover:bg-primary/[0.08]',
  good: 'border-emerald-500/25 bg-emerald-500/[0.04] hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]',
  warn: 'border-amber-500/25 bg-amber-500/[0.04] hover:border-amber-500/40 hover:bg-amber-500/[0.06]',
  default: 'border-border/40 bg-card/60 hover:border-primary/40 hover:bg-card/80',
};

export function ActionCard({ icon: Icon, title, subtitle, onClick, tone = 'default', className, compact }: ActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-start rounded-xl border transition-all duration-200',
        'active:scale-[0.98]',
        'flex items-center gap-2.5',
        compact ? 'px-3 py-2.5 min-h-[52px]' : 'px-3.5 py-3 min-h-[60px]',
        ACTION_TONE[tone],
        className,
      )}
    >
      {Icon && (
        <div className={cn(
          'rounded-lg flex items-center justify-center shrink-0',
          tone === 'primary' ? 'bg-primary/10 text-primary' : 'bg-muted/60 text-muted-foreground/80',
          compact ? 'h-7 w-7' : 'h-8 w-8',
        )}>
          <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={1.7} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={cn('font-medium leading-tight truncate', compact ? 'text-[13px]' : 'text-sm')}>
          {title}
        </div>
        {subtitle && (
          <div className={cn('text-muted-foreground truncate', compact ? 'text-[11px]' : 'text-xs')}>
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* PanelCard                                                                  */
/* -------------------------------------------------------------------------- */

export interface PanelCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  flush?: boolean;
}

export function PanelCard({ title, subtitle, action, children, className, flush }: PanelCardProps) {
  return (
    <Card className={cn('border-border/40 bg-card/60 overflow-hidden', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <CardContent className={cn(!title && !action && 'pt-5', flush && 'p-0')}>{children}</CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* PageGrid / MetricGrid                                                      */
/* -------------------------------------------------------------------------- */

export function MetricGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-3 lg:gap-4', className)}>
      {children}
    </div>
  );
}

export function ActionGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-2 lg:gap-3', className)}>
      {children}
    </div>
  );
}
