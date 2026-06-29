import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Search, Eye, User, CheckCircle2, Clock, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Json } from '@/integrations/supabase/types';

interface BusinessJourney {
  id: string;
  user_id: string;
  business_name: string | null;
  current_step: number;
  journey_complete: boolean;
  step_1_vision: Json | null;
  step_2_business_model: Json | null;
  step_3_target_audience: Json | null;
  step_4_value_proposition: Json | null;
  step_5_challenges: Json | null;
  step_6_resources: Json | null;
  step_7_financial: Json | null;
  step_8_marketing: Json | null;
  step_9_operations: Json | null;
  step_10_action_plan: Json | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
  profile_id: string;
}

const Businesses = () => {
  const { language, t } = useTranslation();
  const isHebrew = language === 'he';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessJourney | null>(null);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_journeys')
        .select(`
          *,
          profiles!business_journeys_user_id_fkey (
            id,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        user_name: item.profiles?.full_name || null,
        profile_id: item.profiles?.id || item.user_id,
      })) as BusinessJourney[];
    },
  });

  // Calculate stats
  const totalBusinesses = businesses.length;
  const completedCount = businesses.filter(b => b.journey_complete).length;
  const inProgressCount = businesses.filter(b => !b.journey_complete).length;
  const todayCount = businesses.filter(b => {
    const created = new Date(b.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  // Filter businesses
  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      (business.business_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (business.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'completed' && business.journey_complete) ||
      (statusFilter === 'in-progress' && !business.journey_complete);

    return matchesSearch && matchesStatus;
  });

  const getIndustry = (stepData: Json | null): string => {
    if (!stepData || typeof stepData !== 'object') return '-';
    const data = stepData as Record<string, any>;
    return data.industry || data.businessType || '-';
  };

  const renderStepData = (title: string, data: Json | null) => {
    if (!data) return null;
    
    return (
      <div className="border rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm text-primary">{title}</h4>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {typeof data === 'object' ? (
            <div className="space-y-1">
              {Object.entries(data as Record<string, any>).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}: </span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            String(data)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Briefcase}
        titleKey={language === 'he' ? 'עסקים' : language === 'es' ? 'Negocios' : 'Businesses'}
        subtitleKey={language === 'he' ? 'ניהול מסעות עסקיים של משתמשים' : language === 'es' ? 'Gestionar los viajes de negocios de los usuarios' : 'Manage user business journeys'}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'he' ? 'סה"כ עסקים' : language === 'es' ? 'Total de negocios' : 'Total Businesses'}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBusinesses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'he' ? 'בתהליך' : language === 'es' ? 'En progreso' : 'In Progress'}
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
{language === 'he' ? 'הושלמו' : language === 'es' ? 'Completados' : 'Completed'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {language === 'he' ? 'נוצרו היום' : language === 'es' ? 'Creados hoy' : 'Created Today'}
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'he' ? 'חיפוש לפי שם עסק או משתמש...' : language === 'es' ? 'Buscar por nombre de negocio o usuario...' : 'Search by business or user name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={language === 'he' ? 'סטטוס' : language === 'es' ? 'Estado' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'he' ? 'הכל' : language === 'es' ? 'Todos' : 'All'}</SelectItem>
            <SelectItem value="in-progress">{language === 'he' ? 'בתהליך' : language === 'es' ? 'En progreso' : 'In Progress'}</SelectItem>
            <SelectItem value="completed">{language === 'he' ? 'הושלמו' : language === 'es' ? 'Completados' : 'Completed'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'he' ? 'שם העסק' : language === 'es' ? 'Nombre del negocio' : 'Business Name'}</TableHead>
                <TableHead>{language === 'he' ? 'משתמש' : language === 'es' ? 'Usuario' : 'User'}</TableHead>
                <TableHead>{language === 'he' ? 'התקדמות' : language === 'es' ? 'Progreso' : 'Progress'}</TableHead>
                <TableHead>{language === 'he' ? 'סטטוס' : language === 'es' ? 'Estado' : 'Status'}</TableHead>
                <TableHead>{language === 'he' ? 'תעשייה' : language === 'es' ? 'Industria' : 'Industry'}</TableHead>
                <TableHead>{language === 'he' ? 'נוצר' : language === 'es' ? 'Creado' : 'Created'}</TableHead>
                <TableHead>{language === 'he' ? 'פעולות' : language === 'es' ? 'Acciones' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {language === 'he' ? 'טוען...' : language === 'es' ? 'Cargando...' : 'Loading...'}
                  </TableCell>
                </TableRow>
              ) : filteredBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {language === 'he' ? 'לא נמצאו עסקים' : language === 'es' ? 'No se encontraron negocios' : 'No businesses found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses.map((business) => (
                  <TableRow key={business.id}>
                    <TableCell className="font-medium">
                      {business.business_name || (language === 'he' ? 'ללא שם' : language === 'es' ? 'Sin nombre' : 'Unnamed')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {business.user_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{business.current_step}/10</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={business.journey_complete ? 'default' : 'secondary'}>
                        {business.journey_complete 
                          ? (language === 'he' ? 'הושלם' : language === 'es' ? 'Completado' : 'Completed')
                          : (language === 'he' ? 'בתהליך' : language === 'es' ? 'En progreso' : 'In Progress')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>{getIndustry(business.step_2_business_model)}</TableCell>
                    <TableCell>{format(new Date(business.created_at), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedBusiness(business)}
                      >
                        <Eye className="h-4 w-4 me-1" />
                        {language === 'he' ? 'צפה' : language === 'es' ? 'Ver' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={() => setSelectedBusiness(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {selectedBusiness?.business_name || (language === 'he' ? 'פרטי מסע עסקי' : language === 'es' ? 'Detalles del viaje de negocios' : 'Business Journey Details')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pe-4">
            {selectedBusiness && (
              <div className="space-y-4">
                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-4">
                  <div>
                    <span className="font-medium">{language === 'he' ? 'משתמש: ' : language === 'es' ? 'Usuario: ' : 'User: '}</span>
                    {selectedBusiness.user_name || '-'}
                  </div>
                  <div>
                    <span className="font-medium">{language === 'he' ? 'התקדמות: ' : language === 'es' ? 'Progreso: ' : 'Progress: '}</span>
                    {selectedBusiness.current_step}/10
                  </div>
                  <div>
                    <span className="font-medium">{language === 'he' ? 'נוצר: ' : language === 'es' ? 'Creado: ' : 'Created: '}</span>
                    {format(new Date(selectedBusiness.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                {/* AI Summary */}
                {selectedBusiness.ai_summary && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-primary mb-2">
                      {language === 'he' ? 'סיכום AI' : language === 'es' ? 'Resumen de IA' : 'AI Summary'}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedBusiness.ai_summary}</p>
                  </div>
                )}

                {/* Steps Data */}
                <div className="space-y-3">
                  {renderStepData(language === 'he' ? 'שלב 1: חזון' : language === 'es' ? 'Paso 1: Visión' : 'Step 1: Vision', selectedBusiness.step_1_vision)}
                  {renderStepData(language === 'he' ? 'שלב 2: מודל עסקי' : language === 'es' ? 'Paso 2: Modelo de negocio' : 'Step 2: Business Model', selectedBusiness.step_2_business_model)}
                  {renderStepData(language === 'he' ? 'שלב 3: קהל יעד' : language === 'es' ? 'Paso 3: Público objetivo' : 'Step 3: Target Audience', selectedBusiness.step_3_target_audience)}
                  {renderStepData(language === 'he' ? 'שלב 4: הצעת ערך' : language === 'es' ? 'Paso 4: Propuesta de valor' : 'Step 4: Value Proposition', selectedBusiness.step_4_value_proposition)}
                  {renderStepData(language === 'he' ? 'שלב 5: אתגרים' : language === 'es' ? 'Paso 5: Desafíos' : 'Step 5: Challenges', selectedBusiness.step_5_challenges)}
                  {renderStepData(language === 'he' ? 'שלב 6: משאבים' : language === 'es' ? 'Paso 6: Recursos' : 'Step 6: Resources', selectedBusiness.step_6_resources)}
                  {renderStepData(language === 'he' ? 'שלב 7: תוכנית פיננסית' : language === 'es' ? 'Paso 7: Plan financiero' : 'Step 7: Financial Plan', selectedBusiness.step_7_financial)}
                  {renderStepData(language === 'he' ? 'שלב 8: שיווק' : language === 'es' ? 'Paso 8: Marketing' : 'Step 8: Marketing', selectedBusiness.step_8_marketing)}
                  {renderStepData(language === 'he' ? 'שלב 9: תפעול' : language === 'es' ? 'Paso 9: Operaciones' : 'Step 9: Operations', selectedBusiness.step_9_operations)}
                  {renderStepData(language === 'he' ? 'שלב 10: תוכנית פעולה' : language === 'es' ? 'Paso 10: Plan de acción' : 'Step 10: Action Plan', selectedBusiness.step_10_action_plan)}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Businesses;
