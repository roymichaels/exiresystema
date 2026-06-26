/**
 * XSYSTEM Clients list — first XSYSTEM-native admin surface.
 * Phase 1: list + open detail page. CRUD beyond convert lands in later phases.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UsersRound, Phone, Mail, ChevronLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { MobileClientCard } from './MobileClientCard';

const STATUS_LABEL: Record<string, string> = {
  active: 'פעיל',
  paused: 'מושהה',
  closed: 'סגור',
};
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function XSystemClientsTab() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading } = useClients();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clients;
    return clients.filter(
      c =>
        c.full_name?.toLowerCase().includes(s) ||
        (c.email || '').toLowerCase().includes(s) ||
        (c.phone || '').includes(s),
    );
  }, [clients, q]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">לקוחות XSYSTEM</h2>
        <p className="text-sm text-muted-foreground">
          לקוחות פעילים בליווי. הוספה דרך המרה מליד.
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש לפי שם, טלפון או אימייל..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pe-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">לקוחות ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <UsersRound className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                עדיין אין לקוחות. המר ליד ללקוח מתוך טאב "לידים".
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="group w-full flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-colors text-start"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(c.full_name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm break-words">{c.full_name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {c.phone && (
                          <span dir="ltr" className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />{c.phone}
                          </span>
                        )}
                        {c.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />{c.email}
                          </span>
                        )}
                        <span>{format(new Date(c.created_at), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={STATUS_COLOR[c.status] || ''}>
                      {STATUS_LABEL[c.status] || c.status}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
