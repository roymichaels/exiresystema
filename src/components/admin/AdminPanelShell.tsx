/**
 * AdminPanelShell — responsive layout shell for the Exire OS v2 admin panel.
 *
 * Desktop (>=1024px):
 *   - Fixed dark-glass left sidebar (240px)
 *   - Centered main content, max-width 1280px, 32px padding
 *   - No bottom navigation
 *
 * Mobile (<1024px):
 *   - Hidden sidebar
 *   - Main content preserves top safe-area padding for the global header
 *   - Bottom nav rendered by AdminHub stays as-is
 */
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { ADMIN_TABS } from '@/domain/admin';
import { useTenant } from '@/contexts/TenantContext';
import { TENANTS, TENANT_SLUGS } from '@/config/tenants';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { AssistantOrb } from '@/components/admin/AssistantOrb';
import {
  LayoutDashboard, Users, UserCheck, Wand2, MoreHorizontal,
  Settings, Sparkles, BarChart3, Plug, UsersRound,
  Bell,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SIDEBAR_WIDTH = 210;

const PRIMARY_NAV = [
  { tabId: 'today', icon: LayoutDashboard },
  { tabId: 'leads', icon: Users },
  { tabId: 'clients', icon: UserCheck },
  { tabId: 'studio', icon: Wand2 },
  { tabId: 'more', icon: MoreHorizontal },
];

const SECONDARY_NAV = [
  { tabId: 'more', sub: 'settings', icon: Settings, labelKey: 'Settings' },
  { tabId: 'more', sub: 'advisor', icon: Sparkles, labelKey: 'Advisor' },
  { tabId: 'more', sub: 'analytics', icon: BarChart3, labelKey: 'Analytics' },
  { tabId: 'more', sub: 'integrations', icon: Plug, labelKey: 'Integrations' },
  { tabId: 'more', sub: 'users', icon: UsersRound, labelKey: 'Users & Roles' },
];

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
  compact,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-xl transition-all duration-200',
        compact ? 'px-3 py-2' : 'px-3.5 py-2.5',
        active
          ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(168,85,247,0.20)]'
          : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
      )}
    >
      <Icon className={cn('shrink-0', compact ? 'h-4 w-4' : 'h-[18px] w-[18px]')} strokeWidth={active ? 2 : 1.7} />
      <span className={cn('text-sm font-medium truncate', active && 'font-semibold')}>{label}</span>
    </button>
  );
}

export interface AdminPanelShellProps {
  children: React.ReactNode;
  activeTab: string;
  activeSubTab?: string;
  onTabChange: (tab: string, sub?: string) => void;
}

export function AdminPanelShell({ children, activeTab, activeSubTab, onTabChange }: AdminPanelShellProps) {
  const { language } = useTranslation();
  const { user } = useAuth();
  const { currentTenant, currentTenantSlug, setTenant } = useTenant();

  const tTab = (tab: typeof ADMIN_TABS[number]) =>
    language === 'he' ? tab.labelHe : language === 'es' ? tab.labelEs : tab.labelEn;

  const go = (tabId: string, subId?: string) => {
    onTabChange(tabId, subId);
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || currentTenant.brand.slice(0, 2).toUpperCase();
  const userEmail = user?.email || currentTenant.brand;

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overscroll-contain bg-background" style={{ WebkitOverflowScrolling: 'touch' as const }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-full flex-col border-r border-border/40 bg-[#0c0c12]/90 backdrop-blur-xl">
          {/* Brand */}
          <div className="px-5 pt-6 pb-4 space-y-3">
            <button
              type="button"
              onClick={() => go('today', 'exire-today')}
              className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
                {currentTenant.brand.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="text-[13px] font-bold leading-tight">{currentTenant.brand}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">BizOS</div>
              </div>
            </button>

            {/* Internal tenant switcher */}
            <label className="block">
              <span className="sr-only">Workspace</span>
              <select
                value={currentTenantSlug}
                onChange={(e) => setTenant(e.target.value as typeof currentTenantSlug)}
                className="w-full rounded-lg border border-border/40 bg-background/60 px-2.5 py-1.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/50"
              >
                {TENANT_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {TENANTS[slug].name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Primary nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            {PRIMARY_NAV.map(({ tabId, icon }) => {
              const tab = ADMIN_TABS.find((t) => t.id === tabId);
              if (!tab || tab.hidden) return null;
              return (
                <NavItem
                  key={tabId}
                  icon={icon}
                  label={tTab(tab)}
                  active={activeTab === tabId}
                  onClick={() => go(tabId, tab.subTabs[0]?.id)}
                />
              );
            })}

            <div className="pt-4 pb-2 px-1">
              <div className="h-px bg-border/40" />
            </div>

            {SECONDARY_NAV.map(({ tabId, sub, icon, labelKey }) => (
              <NavItem
                key={sub}
                icon={icon}
                label={labelKey}
                active={activeTab === tabId && activeSubTab === sub}
                onClick={() => go(tabId, sub)}
                compact
              />
            ))}
          </nav>

          {/* Bottom area */}
          <div className="border-t border-border/40 p-3 space-y-1">
            <button
              type="button"
              onClick={() => go('more', 'notifications')}
              className={cn(
                'w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'more' && activeSubTab === 'notifications'
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground/70 hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <Bell className="h-[18px] w-[18px] shrink-0" strokeWidth={1.7} />
              <span>Notifications</span>
            </button>
            <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 bg-muted/20">
              <Avatar className="h-8 w-8 border border-border/40">
                <AvatarFallback className="bg-muted text-[10px] font-semibold text-muted-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-xs font-medium truncate">{userEmail}</div>
                <div className="text-[10px] text-muted-foreground">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="w-full lg:pl-[210px]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0px)',
        }}
      >

        <div className="mx-auto w-full max-w-[1200px] px-4 pt-4 pb-20 lg:px-6 lg:pt-5 lg:pb-6">
          {children}
        </div>
      </main>
      {/* Floating AI assistant */}
      <AssistantOrb
        suggestion="Need help deciding what to do next?"
        className="bottom-[76px] right-3 lg:bottom-5 lg:right-5"
      />
    </div>
  );
}

export default AdminPanelShell;
