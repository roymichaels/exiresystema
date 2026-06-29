import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, Home, Brain, Mic, Layout, Eye, Edit, Copy, 
  MoreVertical, ExternalLink, Trash2, CheckCircle, XCircle, PanelTop
} from "lucide-react";
import { TemplateGallery, Template } from "@/components/admin/landing/TemplateGallery";
import { motion } from "framer-motion";

interface LandingPageListItem {
  id: string;
  slug: string;
  template_type: string;
  title_he: string | null;
  title_en: string | null;
  is_published: boolean;
  is_homepage: boolean;
  view_count: number;
  brand_color: string | null;
  created_at: string;
  updated_at: string;
}

const getTemplateIcon = (type: string) => {
  switch (type) {
    case 'homepage': return Home;
    case 'product': return Brain;
    case 'lead_capture': return Mic;
    default: return Layout;
  }
};

const getTemplateLabel = (type: string, language: string) => {
  const labels: Record<string, { he: string; en: string; es: string }> = {
    homepage: { he: 'דף בית', en: 'Homepage', es: 'Página principal' },
    product: { he: 'מוצר', en: 'Product', es: 'Producto' },
    lead_capture: { he: 'לכידת לידים', en: 'Lead Capture', es: 'Captura de leads' },
    custom: { he: 'מותאם אישית', en: 'Custom', es: 'Personalizado' },
  };
  return language === 'he' ? labels[type]?.he : language === 'es' ? labels[type]?.es : labels[type]?.en || type;
};

const LandingPages = () => {
  const { t, isRTL, language } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['landing-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .order('is_homepage', { ascending: false })
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as LandingPageListItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({ title: language === 'he' ? 'הדף נמחק בהצלחה' : language === 'es' ? 'Página eliminada correctamente' : 'Page deleted successfully' });
    },
    onError: () => {
      toast({ 
        title: language === 'he' ? 'שגיאה במחיקת הדף' : language === 'es' ? 'Error al eliminar la página' : 'Error deleting page',
        variant: 'destructive'
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (page: LandingPageListItem) => {
      const { id, created_at, updated_at, is_homepage, ...pageData } = page;
      const newSlug = `${page.slug}-copy-${Date.now()}`;
      
      const { error } = await supabase
        .from('landing_pages')
        .insert({
          ...pageData,
          slug: newSlug,
          title_he: page.title_he ? `${page.title_he} (העתק)` : null,
          title_en: page.title_en ? `${page.title_en} (Copy)` : null,
          is_published: false,
          is_homepage: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages'] });
      toast({ title: language === 'he' ? 'הדף שוכפל בהצלחה' : language === 'es' ? 'Página duplicada correctamente' : 'Page duplicated successfully' });
    },
    onError: () => {
      toast({ 
        title: language === 'he' ? 'שגיאה בשכפול הדף' : language === 'es' ? 'Error al duplicar la página' : 'Error duplicating page',
        variant: 'destructive'
      });
    },
  });

  const handleTemplateSelect = (template: Template) => {
    setShowTemplateGallery(false);
    navigate(`/admin/landing-pages/new?template=${template.type}`);
  };

  const handleEdit = (page: LandingPageListItem) => {
    navigate(`/admin/landing-pages/edit/${page.id}`);
  };

  const handlePreview = (page: LandingPageListItem) => {
    const route = page.is_homepage ? '/' : `/lp/${page.slug}`;
    window.open(route, '_blank');
  };

  const getPageTitle = (page: LandingPageListItem) => {
    return language === 'he' ? page.title_he : page.title_en || page.slug;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary hidden sm:flex">
            <PanelTop className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black cyber-glow flex items-center gap-2">
              <PanelTop className="h-6 w-6 sm:hidden text-primary" />
              {language === 'he' ? "דפי נחיתה" : language === 'es' ? "Páginas de destino" : "Landing Pages"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {language === 'he' ? "ניהול דפי נחיתה ותבניות" : language === 'es' ? "Gestionar páginas de destino y plantillas" : "Manage landing pages and templates"}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowTemplateGallery(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'he' ? 'דף חדש' : language === 'es' ? 'Nueva página' : 'New Page'}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {language === 'he' ? 'הדפים שלך' : language === 'es' ? 'Tus páginas' : 'Your Pages'}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages?.map((page, index) => {
                const TemplateIcon = getTemplateIcon(page.template_type);
                
                return (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="group hover:border-primary/50 transition-all duration-300 overflow-hidden"
                    >
                      <div 
                        className="h-32 relative overflow-hidden"
                        style={{ 
                          background: `linear-gradient(135deg, ${page.brand_color || '#8B5CF6'}15 0%, ${page.brand_color || '#8B5CF6'}05 100%)` 
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div 
                            className="w-20 h-20 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${page.brand_color || '#8B5CF6'}20` }}
                          >
                            <TemplateIcon 
                              className="w-10 h-10" 
                              style={{ color: page.brand_color || '#8B5CF6' }}
                            />
                          </div>
                        </div>
                        
                        <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3">
                          <Badge 
                            variant={page.is_published ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {page.is_published ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {language === 'he' ? 'פורסם' : language === 'es' ? 'Publicado' : 'Published'}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                {language === 'he' ? 'טיוטה' : language === 'es' ? 'Borrador' : 'Draft'}
                              </>
                            )}
                          </Badge>
                        </div>

                        {page.is_homepage && (
                          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                            <Badge variant="outline" className="text-xs bg-background/80">
                              <Home className="w-3 h-3 mr-1" />
                              {language === 'he' ? 'ראשי' : language === 'es' ? 'Inicio' : 'Home'}
                            </Badge>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEdit(page)}
                            className="gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            {language === 'he' ? 'עריכה' : language === 'es' ? 'Editar' : 'Edit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(page)}
                            className="gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {language === 'he' ? 'תצוגה' : language === 'es' ? 'Vista previa' : 'Preview'}
                          </Button>
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate mb-1">
                              {getPageTitle(page)}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono truncate">
                                {page.is_homepage ? '/' : `/lp/${page.slug}`}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {page.view_count.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(page)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {language === 'he' ? 'עריכה' : language === 'es' ? 'Editar' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePreview(page)}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {language === 'he' ? 'תצוגה' : language === 'es' ? 'Vista previa' : 'Preview'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateMutation.mutate(page)}>
                                <Copy className="w-4 h-4 mr-2" />
                                {language === 'he' ? 'שכפל' : language === 'es' ? 'Duplicar' : 'Duplicate'}
                              </DropdownMenuItem>
                              {!page.is_homepage && (
                                <DropdownMenuItem 
                                  onClick={() => deleteMutation.mutate(page.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {language === 'he' ? 'מחק' : language === 'es' ? 'Eliminar' : 'Delete'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {pages?.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{language === 'he' ? 'אין דפי נחיתה עדיין' : language === 'es' ? 'Aún no hay páginas de destino' : 'No landing pages yet'}</p>
                    <Button onClick={() => setShowTemplateGallery(true)} className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      {language === 'he' ? 'צור דף ראשון' : language === 'es' ? 'Crear primera página' : 'Create First Page'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={showTemplateGallery} onOpenChange={setShowTemplateGallery}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {language === 'he' ? 'בחר תבנית' : language === 'es' ? 'Elige una plantilla' : 'Choose a Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <TemplateGallery onSelect={handleTemplateSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPages;
