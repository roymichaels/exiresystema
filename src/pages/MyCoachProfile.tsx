/**
 * MyCoachProfile — logged-in coach's own public profile rendered
 * inside the protected shell. Reuses PractitionerProfileHeader +
 * PractitionerFeedTabs (same widgets the public PractitionerProfile uses).
 */
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { PageShell } from '@/components/aurora-ui/PageShell';
import { useMyCoachProfile, useFirstCoachSlug, useCoach } from '@/domain/coaches';
import {
  PractitionerProfileHeader,
  PractitionerFeedTabs,
} from '@/components/practitioner-landing';

export default function MyCoachProfile() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { data: myProfile } = useMyCoachProfile();
  const { data: fallbackSlug } = useFirstCoachSlug(!myProfile?.slug);
  const slug = myProfile?.slug || fallbackSlug;
  const { data: practitioner, isLoading } = useCoach(slug);

  const { data: postsCount = 0 } = useQuery({
    queryKey: ['practitioner-posts-count', practitioner?.user_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', practitioner!.user_id);
      return error ? 0 : (count || 0);
    },
    enabled: !!practitioner?.user_id,
  });

  if (isLoading || !practitioner) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div dir={isHe ? 'rtl' : 'ltr'} className="max-w-2xl mx-auto w-full pb-24">
        <PractitionerProfileHeader practitioner={practitioner} postsCount={postsCount} />
        <PractitionerFeedTabs practitioner={practitioner} />
      </div>
    </PageShell>
  );
}
