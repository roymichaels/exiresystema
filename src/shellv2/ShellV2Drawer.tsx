/**
 * ShellV2Drawer — top-level drawer.
 * Context-aware: in /admin and /admin-hub it renders the Exire Systema admin
 * navigation; elsewhere it renders the canonical client surfaces.
 * Includes language switcher (he / en / es) in the Account footer.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  Shield,
  Globe,
  Rocket,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Users as UsersIcon,
  Plug,
  Home as HomeIcon,
  Layers,
  Archive,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay, useOverlayBinding } from '@/shell/overlay/OverlayController';
import { supabase } from '@/integrations/supabase/client';
import { useProfileModal } from '@/contexts/ProfileModalContext';
import { cn } from '@/lib/utils';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';
import { AionOrb } from '@/components/aion/ui';

import { useEffect } from 'react';
import { useChamberIdle } from '@/shellv2/hooks/useChamberIdle';

import type { LucideIcon } from 'lucide-react';
interface DrawerItem {
  id: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  onSelect: () => void | Promise<void>;
  active?: boolean;
}

interface DrawerSection {
  id: string;
  titleEn?: string;
  titleHe?: string;
  items: DrawerItem[];
}

export default function ShellV2Drawer() {
  const { language, isRTL } = useTranslation();
  const { setLanguage } = useLanguage();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const overlay = useOverlay();
  const binding = useOverlayBinding('drawer');
  const { openProfile } = useProfileModal();
  const { hideNav } = useChamberIdle();

  const isAdminContext = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (binding.open) hideNav();
  }, [binding.open, hideNav]);

  const go = (path: string) => {
    overlay.close();
    navigate(path);
  };

  const goProfile = () => {
    overlay.close();
    openProfile();
  };

  // Admin drawer = control drawer (primary + utility shortcuts + legacy).
  const adminPrimaryItems: DrawerItem[] = [
    {
      id: 'admin-home',
      icon: HomeIcon,
      labelEn: 'Today',
      labelHe: 'היום',
      onSelect: () => go('/admin-hub?tab=today'),
    },
    {
      id: 'admin-studio',
      icon: Layers,
      labelEn: 'Studio',
      labelHe: 'סטודיו',
      onSelect: () => go('/admin-hub?tab=studio'),
    },
    {
      id: 'admin-more',
      icon: SettingsIcon,
      labelEn: 'More / Settings',
      labelHe: 'עוד / הגדרות',
      onSelect: () => go('/admin-hub?tab=more&sub=more-home'),
    },
  ];

  const adminUtilityItems: DrawerItem[] = [
    { id: 'u-landing',     icon: Rocket,          labelEn: 'Landing',           labelHe: 'דף נחיתה',         onSelect: () => go('/admin-hub?tab=studio&sub=exire-funnel') },
    { id: 'u-forms',       icon: ClipboardList,   labelEn: 'Forms',             labelHe: 'טפסים',            onSelect: () => go('/admin-hub?tab=studio&sub=forms') },
    { id: 'u-templates',   icon: MessageSquare,   labelEn: 'Message templates', labelHe: 'תבניות הודעה',     onSelect: () => go('/admin-hub?tab=studio&sub=templates') },
    { id: 'u-analytics',   icon: BarChart3,       labelEn: 'Analytics',         labelHe: 'אנליטיקס',         onSelect: () => go('/admin-hub?tab=more&sub=analytics') },
    { id: 'u-users',       icon: UsersIcon,       labelEn: 'Users & roles',     labelHe: 'משתמשים והרשאות',  onSelect: () => go('/admin-hub?tab=more&sub=users') },
    { id: 'u-integrations',icon: Plug,            labelEn: 'Integrations',      labelHe: 'אינטגרציות',       onSelect: () => go('/admin-hub?tab=more&sub=integrations') },
  ];

  // Legacy / secondary
  const legacyItems: DrawerItem[] = [
    { id: 'legacy-app',     icon: Globe,    labelEn: 'Open legacy app',     labelHe: 'מעבר לאפליקציה הישנה', onSelect: () => go('/home') },
    { id: 'legacy-archive', icon: Archive,  labelEn: 'Archive / old tools', labelHe: 'ארכיון / כלים ישנים',  onSelect: () => go('/admin-hub?tab=legacy') },
  ];

  const clientItems: DrawerItem[] = CANONICAL_SURFACES.map((s) => ({
    id: s.id,
    icon: s.icon,
    labelEn: s.labelEn,
    labelHe: s.labelHe,
    onSelect: s.id === 'profile' ? goProfile : () => go(s.path),
  }));

  const sections: DrawerSection[] = isAdminContext
    ? [
        { id: 'admin-quick',   titleEn: 'Exire Systema', titleHe: 'Exire Systema', items: adminPrimaryItems },
        { id: 'admin-utility', titleEn: 'Shortcuts',     titleHe: 'קיצורים',       items: adminUtilityItems },
        { id: 'legacy-app',    titleEn: 'Legacy',        titleHe: 'ישן',           items: legacyItems },
      ]
    : [
        { id: 'surfaces', items: clientItems },
        {
          id: 'account',
          titleEn: 'Account',
          titleHe: 'חשבון',
          items: [
            { id: 'settings', icon: SettingsIcon, labelEn: 'Settings', labelHe: 'הגדרות', onSelect: () => go('/subscriptions') },
            ...(isAdmin
              ? [{ id: 'admin', icon: Shield, labelEn: 'Admin', labelHe: 'ניהול', onSelect: () => go('/admin-hub') }]
              : []),
          ],
        },
      ];
        { id: 'surfaces', items: clientItems },
        {
          id: 'account',
          titleEn: 'Account',
          titleHe: 'חשבון',
          items: [
            { id: 'settings', icon: SettingsIcon, labelEn: 'Settings', labelHe: 'הגדרות', onSelect: () => go('/subscriptions') },
            ...(isAdmin
              ? [{ id: 'admin', icon: Shield, labelEn: 'Admin', labelHe: 'ניהול', onSelect: () => go('/admin-hub') }]
              : []),
          ],
        },
      ];

  const handleLogout = async () => {
    overlay.close();
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    (language === 'he' ? 'אורח' : 'Guest');

  const brandLabel = isAdminContext ? 'EXIRE SYSTEMA' : 'AION';
  const languages: { code: 'he' | 'en' | 'es'; label: string }[] = [
    { code: 'he', label: 'עברית' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <Sheet open={binding.open} onOpenChange={binding.onOpenChange}>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[300px] sm:w-[320px] p-0 bg-background/55 backdrop-blur-2xl border-0 shadow-none overflow-hidden"
        style={{ height: '100dvh' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 h-56 w-56"
          style={{
            [isRTL ? 'right' : 'left']: '-3rem' as unknown as string,
            background:
              'radial-gradient(closest-side, hsl(var(--aion-violet) / 0.22) 0%, hsl(var(--aion-cyan) / 0.08) 45%, transparent 75%)',
            filter: 'blur(6px)',
          }}
        />
        <div
          className="relative flex h-full min-h-0 flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 1rem)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 5.5rem)',
          }}
        >
          {/* Identity row */}
          <div className="flex items-center gap-3 px-4 pt-2 pb-4">
            <AionOrb size="md" />
            <div
              className="aion-text-hero text-[13px] font-semibold tracking-[0.28em] leading-none truncate"
              style={{
                textShadow:
                  '0 0 14px hsl(var(--aion-violet) / 0.35), 0 0 32px hsl(var(--aion-cyan) / 0.12)',
              }}
            >
              {brandLabel}
            </div>
          </div>

          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto px-2 py-1.5 space-y-2.5">
            {sections.map((section) => {
              const collapsible = isAdminContext && section.id === 'legacy-app';
              const items = (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onSelect}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 rounded-2xl text-start transition-colors',
                          collapsible
                            ? 'h-9 text-[12.5px] text-foreground/55 hover:bg-foreground/[0.04]'
                            : 'h-11 text-[14px] text-foreground/85 hover:bg-foreground/[0.04] active:bg-foreground/[0.07]',
                        )}
                      >
                        <Icon
                          className={cn('shrink-0 opacity-60', collapsible ? 'h-[14px] w-[14px]' : 'h-[17px] w-[17px]')}
                          strokeWidth={1.5}
                        />
                        <span className="flex-1 truncate">
                          {language === 'he' ? item.labelHe : item.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );

              if (collapsible) {
                return (
                  <details key={section.id} className="group rounded-xl">
                    <summary className="list-none cursor-pointer px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-foreground/30 hover:text-foreground/50 flex items-center justify-between">
                      <span>{language === 'he' ? section.titleHe : section.titleEn}</span>
                      <span className="text-[9px] opacity-60 group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    {items}
                  </details>
                );
              }

              return (
                <div key={section.id}>
                  {(section.titleEn || section.titleHe) && (
                    <div className="px-3 pt-1 pb-1.5 text-[9px] tracking-[0.22em] uppercase text-foreground/35">
                      {language === 'he' ? section.titleHe : section.titleEn}
                    </div>
                  )}
                  {items}
                </div>
              );
            })}

            {/* Language switcher */}
            <div>
              <div className="px-3 pt-1 pb-1.5 text-[9px] tracking-[0.22em] uppercase text-foreground/35 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                {language === 'he' ? 'שפה' : language === 'es' ? 'Idioma' : 'Language'}
              </div>
              <div className="px-2 flex gap-1.5">
                {languages.map((l) => {
                  const active = l.code === language;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={cn(
                        'flex-1 h-9 rounded-2xl text-[12px] font-medium transition-colors',
                        active
                          ? 'bg-foreground/[0.08] text-foreground ring-1 ring-foreground/15'
                          : 'text-foreground/55 hover:bg-foreground/[0.04]',
                      )}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="relative p-3 space-y-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -top-6 h-6"
              style={{
                background:
                  'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.6) 100%)',
              }}
            />
            <button
              type="button"
              onClick={goProfile}
              className="w-full h-12 flex items-center gap-3 px-2 rounded-2xl hover:bg-foreground/[0.04] transition-colors text-start"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-foreground/[0.06] ring-1 ring-white/10 inline-flex items-center justify-center">
                <User className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground truncate">
                  {displayName}
                </div>
                <div className="text-[11px] text-foreground/45 truncate">
                  {language === 'he' ? 'פרופיל' : 'Profile'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-full text-[13px] text-foreground/60 hover:text-foreground/90 hover:bg-foreground/[0.04] transition-colors text-start"
            >
              <LogOut className="h-[15px] w-[15px] opacity-70" strokeWidth={1.5} />
              {language === 'he' ? 'התנתקות' : 'Sign out'}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
