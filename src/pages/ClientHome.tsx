/**
 * ClientHome — post-login home for the coach app (client point of view).
 *
 * NOT the AION chat shell. The floating AION orb (InteractiveAIONHost,
 * mounted globally in App.tsx) is still available as a widget.
 */
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  User,
  Shield,
  ArrowRight,
  Mic,
  Video,
  Package,
  Library,
  Send,
  FileText,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useTranslation } from '@/hooks/useTranslation';
import { useSEO } from '@/hooks/useSEO';
import OfferCard from '@/components/courses/OfferCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const ClientHome = () => {
  const { user } = useAuth();
  const { isRTL, language } = useTranslation();
  const { hasRole } = useUserRoles();
  const isAdmin = hasRole('admin');
  const isCoach = isAdmin || hasRole('practitioner');
  const isHe = language === 'he';

  useSEO({
    title: isHe ? 'הבית שלך — Exire Systema' : 'Your Home — Exire Systema',
    description: isHe
      ? 'הקורסים, הקהילה והמסע שלך במקום אחד.'
      : 'Your courses, community, and journey in one place.',
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['home-offers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('status', 'active')
        .eq('landing_page_enabled', true)
        .order('created_at', { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const greeting = isHe
    ? `ברוך/ה הבא/ה${user?.email ? '' : ''}`
    : 'Welcome back';

  const shortcuts = [
    {
      to: '/courses',
      icon: GraduationCap,
      label: isHe ? 'קורסים' : 'Courses',
      desc: isHe ? 'הקטלוג שלך' : 'Browse the catalog',
    },
    {
      to: '/community',
      icon: Users,
      label: isHe ? 'קהילה' : 'Community',
      desc: isHe ? 'דיונים וחברים' : 'Discussions & members',
    },
    {
      to: '/me',
      icon: User,
      label: isHe ? 'הפרופיל שלי' : 'My Profile',
      desc: isHe ? 'הגדרות והתקדמות' : 'Settings & progress',
    },
    ...(isAdmin
      ? [{
          to: '/admin-hub',
          icon: Shield,
          label: isHe ? 'ניהול' : 'Admin',
          desc: isHe ? 'פאנל מאמן' : 'Coach panel',
        }]
      : []),
  ];

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-background text-foreground"
    >
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
        {/* Hero */}
        <header className="space-y-2">
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {isHe ? 'הבית שלך' : 'Your home'}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {isHe
              ? 'מכאן את/ה ניגש/ת לקורסים, לקהילה ולפרופיל. כל יתר הכלים זמינים בתפריט.'
              : 'From here you reach your courses, the community, and your profile. Everything else lives in the menu.'}
          </p>
        </header>

        {/* Shortcuts */}
        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          aria-label={isHe ? 'קיצורי דרך' : 'Shortcuts'}
        >
          {shortcuts.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur p-4 hover:border-primary/50 hover:bg-card transition-colors group"
            >
              <Icon className="h-6 w-6 text-primary mb-3" />
              <div className="font-medium">{label}</div>
              <div className="text-xs text-muted-foreground mt-1">{desc}</div>
            </Link>
          ))}
        </section>

        {/* Catalog strip */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">
              {isHe ? 'הקטלוג' : 'Catalog'}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/courses" className="gap-1">
                {isHe ? 'הכל' : 'See all'}
                <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : offers && offers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isHe ? 'אין פריטים בקטלוג כרגע.' : 'No items in the catalog yet.'}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default ClientHome;
