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
import { Search, UsersRound, Phone, Mail, ChevronLeft, Plus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { MobileClientCard } from './MobileClientCard';
import { useTranslation } from '@/hooks/useTranslation';
import { PageHeader, SectionHeader, EmptyState, DataList, DataRow } from '@/components/admin/design-system';

const STATUS_LABEL = (lang: string): Record<string, string> => ({
  active: lang === 'he' ? 'פעיל' : lang === 'es' ? 'Activo' : 'Active',
  paused: lang === 'he' ? 'מושהה' : lang === 'es' ? 'Pausado' : 'Paused',
  closed: lang === 'he' ? 'סגור' : lang === 'es' ? 'Cerrado' : 'Closed',
});
const STATUS_COLOR: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  closed: 'bg-muted text-muted-foreground border-border',
};

export default function XSystemClientsTab() {
  const navigate = useNavigate();
  const { language } = useTranslation();
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

  const t = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title={t('מתאמנים', 'Clients', 'Clientes')}
        subtitle={t('לקוחות Exire פעילים בליווי', 'Active clients in Exire coaching', 'Clientes activos en coaching Exire')}
      />

      {/* Search — compact on mobile, card on desktop */}
      <div className="lg:hidden relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('חיפוש שם, טלפון, אימייל…', 'Search name, phone, email…', 'Buscar nombre, teléfono, email…')}
          value={q}
          onChange={e => setQ(e.target.value)}
          className="pe-10 h-10 rounded-xl bg-card/60 border-border/40"
        />
      </div>
      <Card className="hidden lg:block border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('חיפוש לפי שם, טלפון או אימייל...', 'Search by name, phone or email...', 'Buscar por nombre, teléfono o email...')}
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pe-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile list (outside card chrome) */}
      <div className="lg:hidden">
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={q ? t('אין תוצאות', 'No results', 'Sin resultados') : t('אין מתאמנים', 'No clients', 'No hay clientes')}
            description={q ? undefined : t('המר ליד ללקוח מתוך טאב "לידים".', 'Convert a lead via the Leads tab.', 'Convierte un lead vía la pestaña Leads.')}
            action={!q ? { label: t('פתח לידים', 'Open Leads', 'Abrir Leads'), onClick: () => navigate('/admin-hub?tab=leads') } : undefined}
          />
        ) : (
          <div className="space-y-2">
            <div className="px-1 text-[11px] uppercase tracking-wider text-muted-foreground">
              {filtered.length} {t('מתאמנים', 'clients', 'clientes')}
            </div>
            {filtered.map(c => (
              <MobileClientCard
                key={c.id}
                client={c}
                statusLabel={STATUS_LABEL(language)[c.status] || c.status}
                statusColor={STATUS_COLOR[c.status] || ''}
                onOpen={() => navigate(`/clients/${c.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop list */}
      <div className="hidden lg:block">
        <SectionHeader
          title={t('רשימת לקוחות', 'Client list', 'Lista de clientes')}
          subtitle={`${filtered.length} ${t('לקוחות', 'clients', 'clientes')}`}
        />
        <DataList loading={isLoading}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title={q ? t('אין תוצאות', 'No results', 'Sin resultados') : t('אין מתאמנים', 'No clients', 'No hay clientes')}
              description={q ? undefined : t('המר ליד ללקוח מתוך טאב "לידים".', 'Convert a lead via the Leads tab.', 'Convierte un lead vía la pestaña Leads.')}
              action={!q ? { label: t('פתח לידים', 'Open Leads', 'Abrir Leads'), onClick: () => navigate('/admin-hub?tab=leads') } : undefined}
            />
          ) : (
            filtered.map(c => (
              <DataRow
                key={c.id}
                onClick={() => navigate(`/clients/${c.id}`)}
                leading={
                  <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {(c.full_name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                }
                title={<span dir="auto">{c.full_name}</span>}
                subtitle={
                  <span className="flex items-center gap-3 flex-wrap">
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
                  </span>
                }
                trailing={
                  <>
                    <Badge variant="outline" className={STATUS_COLOR[c.status] || ''}>
                      {STATUS_LABEL(language)[c.status] || c.status}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </>
                }
              />
            ))
          )}
        </DataList>
      </div>
    </div>
  );
}
