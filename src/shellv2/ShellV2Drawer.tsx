/**
 * ShellV2Drawer — top-level account/system drawer.
 *
 * IA-7B — In admin context, the drawer is NOT a second navigation tree.
 * Bottom-nav + Studio + More already expose all admin surfaces.
 * The drawer is now a slim account/utility panel:
 *   account · language · legacy app · sign out.
 *
 * Outside admin we keep the canonical client surfaces list.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  LogOut,
  Shield,
  Globe,
  ExternalLink,
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

import { useEffect } from 'react';
import { useChamberIdle } from '@/shellv2/hooks/useChamberIdle';

import type { LucideIcon } from 'lucide-react';
interface DrawerItem {
  id: string;
  icon: LucideIcon;
  labelEn: string;
  labelHe: string;
  onSelect: () => void | Promise<void>;
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

  // Admin drawer = account/system only. No bottom-nav / Studio / More duplication.
  const adminAccountItems: DrawerItem[] = [
    {
      id: 'admin-settings',
      icon: SettingsIcon,
      labelEn: 'System settings',
      labelHe: 'הגדרות מערכת',
      onSelect: () => go('/admin-hub?tab=more&sub=settings'),
    },
    {
      id: 'admin-legacy',
      icon: ExternalLink,
      labelEn: 'Open legacy app',
      labelHe: 'מעבר לאפליקציה הישנה',
      onSelect: () => go('/home'),
    },
  ];

  const clientItems: DrawerItem[] = CANONICAL_SURFACES.map((s) => ({
    id: s.id,
    icon: s.icon,
    labelEn: s.labelEn,
    labelHe: s.labelHe,
    onSelect: s.id === 'profile' ? goProfile : () => go(s.path),
  }));

  const sections: DrawerSection[] = isAdminContext
    ? [{ id: 'admin-account', items: adminAccountItems }]
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

  const languages: { code: 'he' | 'en' | 'es'; label: string }[] = [
    { code: 'he', label: 'עברית' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  return (
    <Sheet open={binding.open} onOpenChange={binding.onOpenChange}>
      <SheetContent
        side={isRTL ? 'right' : 'left'}
        className="w-[280px] sm:w-[300px] p-0 bg-background/95 backdrop-blur-2xl border-0 shadow-none overflow-hidden h-dvh"
      >
        <div
          className="relative flex h-full min-h-0 flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            paddingTop: 'max(env(safe-area-inset-top), 0.5rem)',
            paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
          }}
        >
          {/* Compact account row at top — replaces large brand/logo block */}
          <button
            type="button"
            onClick={goProfile}
            className="mx-2 mt-1 flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-foreground/[0.04] transition-colors text-start"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-foreground/[0.06] ring-1 ring-white/10 inline-flex items-center justify-center">
              <User className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-foreground/45 truncate">
                {language === 'he' ? 'חשבון' : 'Account'}
              </div>
            </div>
          </button>

          <div className="mx-3 mt-2 mb-1 h-px bg-border/40" />

          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-2">
            {sections.map((section) => (
              <div key={section.id}>
                {(section.titleEn || section.titleHe) && (
                  <div className="px-3 pt-1 pb-1 text-[9px] tracking-[0.22em] uppercase text-foreground/35">
                    {language === 'he' ? section.titleHe : section.titleEn}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onSelect}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 h-10 rounded-2xl text-start transition-colors',
                          'text-[13.5px] text-foreground/85 hover:bg-foreground/[0.04] active:bg-foreground/[0.07]',
                        )}
                      >
                        <Icon className="shrink-0 opacity-60 h-[16px] w-[16px]" strokeWidth={1.5} />
                        <span className="flex-1 truncate">
                          {language === 'he' ? item.labelHe : item.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Language switcher — compact */}
            <div className="pt-1">
              <div className="px-3 pb-1 text-[9px] tracking-[0.22em] uppercase text-foreground/35 flex items-center gap-1.5">
                <Globe className="h-3 w-3" />
                {language === 'he' ? 'שפה' : language === 'es' ? 'Idioma' : 'Language'}
              </div>
              <div className="px-2 flex gap-1">
                {languages.map((l) => {
                  const active = l.code === language;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={cn(
                        'flex-1 h-8 rounded-xl text-[11.5px] font-medium transition-colors',
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

          {/* Footer — sign out only */}
          <div className="p-2 pt-1 border-t border-border/30">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full h-10 flex items-center gap-3 px-3 rounded-2xl text-[13px] text-foreground/65 hover:text-foreground hover:bg-foreground/[0.04] transition-colors text-start"
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
