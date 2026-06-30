/**
 * Advisor page — "המוח העסקי".
 *
 * Full-page fallback route for `/admin-hub?tab=more&sub=advisor`.
 * Reuses the same AdvisorPanel component used by the widget.
 */
import AdvisorPanel from '@/components/admin/advisor/AdvisorPanel';
import { PageHeader } from '@/components/admin/design-system';
import { Sparkles } from 'lucide-react';

export default function Advisor() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Advisor"
        subtitle="AI strategy and business insights for Exire Systema."
        icon={Sparkles}
      />
      <AdvisorPanel variant="page" />
    </div>
  );
}
