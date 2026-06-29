/**
 * @module domain/admin/types
 * @purpose Domain types for the Admin hub system
 * 
 * Re-exports entity types from their source hooks and defines
 * the tab configuration types used by AdminHub.
 */

import type { LucideIcon } from 'lucide-react';

// ─── Re-exported Entity Types ───────────────────────────────────────────────

export type { AdminNotification } from '@/hooks/useAdminNotifications';
export type { AdminUserData } from '@/hooks/useAdminUserView';

// ─── Tab Configuration Types ────────────────────────────────────────────────

export interface AdminSubTabConfig {
  id: string;
  labelHe: string;
  labelEn: string;
  labelEs: string;
  component: React.LazyExoticComponent<any>;
}

export interface AdminTabConfig {
  id: string;
  labelHe: string;
  labelEn: string;
  labelEs: string;
  icon: LucideIcon;
  subTabs: AdminSubTabConfig[];
  /**
   * If true, the group is hidden from the primary navigation surfaces
   * (mobile bottom-nav "More" grid + desktop inline-nav group row) but
   * remains routable and reachable through the secondary "Archive" link.
   */
  hidden?: boolean;
}
