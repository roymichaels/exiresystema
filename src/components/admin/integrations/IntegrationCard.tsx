import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, LucideIcon, ExternalLink } from 'lucide-react';
import type { IntegrationStatus } from '@/hooks/useCoachIntegrations';

interface Props {
  icon: LucideIcon;
  name: string;
  description: string;
  status: IntegrationStatus | undefined;
  isLoading?: boolean;
  onTest?: () => void;
  onConfigure?: () => void;
  helpUrl?: string;
  children?: ReactNode;
}

const statusBadge = (status: IntegrationStatus | undefined) => {
  if (!status || status === 'unknown') return <Badge variant="outline">Unknown</Badge>;
  if (status === 'connected') return (
    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 gap-1">
      <CheckCircle2 className="h-3 w-3" /> Connected
    </Badge>
  );
  if (status === 'error') return (
    <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Error</Badge>
  );
  return <Badge variant="outline" className="text-muted-foreground">Not connected</Badge>;
};

export const IntegrationCard = ({
  icon: Icon, name, description, status, isLoading,
  onTest, onConfigure, helpUrl, children,
}: Props) => {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : statusBadge(status)}
      </div>

      {children}

      <div className="flex items-center gap-2 pt-2">
        {onConfigure && (
          <Button size="sm" variant="outline" onClick={onConfigure}>Configure</Button>
        )}
        {onTest && (
          <Button size="sm" variant="ghost" onClick={onTest} disabled={status !== 'connected'}>Test</Button>
        )}
        {helpUrl && (
          <Button asChild size="sm" variant="ghost" className="ms-auto gap-1">
            <a href={helpUrl} target="_blank" rel="noopener noreferrer">
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default IntegrationCard;
