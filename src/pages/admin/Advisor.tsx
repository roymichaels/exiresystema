/**
 * Advisor page — "המוח העסקי".
 *
 * Full-page fallback route for `/admin-hub?tab=more&sub=advisor`.
 * Reuses the same AdvisorPanel component used by the widget.
 */
import AdvisorPanel from '@/components/admin/advisor/AdvisorPanel';

export default function Advisor() {
  return <AdvisorPanel variant="page" />;
}
