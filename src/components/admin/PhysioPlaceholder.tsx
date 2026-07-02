/**
 * PhysioPlaceholder — internal placeholder shown while tenant_id is not yet
 * wired into the database.
 *
 * Phase 1 only. No data fetching. No Exire components.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, CreditCard } from 'lucide-react';

export default function PhysioPlaceholder() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Physio Therapy</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Foundation ready</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Patient dashboard foundation is ready. Patient data will be enabled after tenant-scoped database migration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start gap-2" disabled>
              <Users className="h-4 w-4" />
              Patients
            </Button>
            <Button variant="outline" className="justify-start gap-2" disabled>
              <Calendar className="h-4 w-4" />
              Appointments
            </Button>
            <Button variant="outline" className="justify-start gap-2" disabled>
              <CreditCard className="h-4 w-4" />
              Billing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
