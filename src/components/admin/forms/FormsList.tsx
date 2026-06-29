import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  Edit,
  Eye,
  FileEdit,
  Inbox,
  MoreVertical,
  Trash2,
  Globe,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { es } from "date-fns/locale";
import { useTranslation } from '@/hooks/useTranslation';

interface Form {
  id: string;
  title: string;
  description: string | null;
  access_token: string;
  status: string;
  created_at: string;
}

interface FormsListProps {
  forms: Form[];
  onEdit: (formId: string) => void;
  onEditFields: (formId: string) => void;
  onViewSubmissions: (formId: string) => void;
  onRefresh: () => void;
}

const FormsList = ({
  forms,
  onEdit,
  onEditFields,
  onViewSubmissions,
  onRefresh,
}: FormsListProps) => {
  const { language } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = async (token: string, formId: string) => {
    const link = `${window.location.origin}/form/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(formId);
      toast({ title: language === 'he' ? 'הקישור הועתק ללוח! 🔗' : language === 'es' ? '¡Enlace copiado! 🔗' : 'Link copied! 🔗' });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt(language === 'he' ? 'הקישור נוצר בהצלחה! העתק אותו ידנית:' : language === 'es' ? '¡Enlace creado! Cópialo manualmente:' : 'Link created successfully! Copy it manually:', link);
      toast({ title: language === 'he' ? 'הקישור נוצר - העתק ידנית' : language === 'es' ? 'Enlace creado - cópialo manualmente' : 'Link created - copy manually' });
    }
  };

  const toggleStatus = async (formId: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("custom_forms")
      .update({ status: newStatus })
      .eq("id", formId);

    if (error) {
      toast({ title: language === 'he' ? 'שגיאה בעדכון סטטוס' : language === 'es' ? 'Error al actualizar estado' : 'Error updating status', variant: "destructive" });
    } else {
      toast({
        title: newStatus === "published" ? (language === 'he' ? 'הטופס פורסם!' : language === 'es' ? '¡Formulario publicado!' : 'Form published!') : (language === 'he' ? 'הטופס הוסתר' : language === 'es' ? 'Formulario oculto' : 'Form hidden'),
      });
      onRefresh();
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm(language === 'he' ? 'האם למחוק את הטופס? כל התשובות יימחקו גם כן.' : language === 'es' ? '¿Eliminar el formulario? Todas las respuestas también se eliminarán.' : 'Delete the form? All submissions will also be deleted.')) return;

    const { error } = await supabase
      .from("custom_forms")
      .delete()
      .eq("id", formId);

    if (error) {
      toast({ title: language === 'he' ? 'שגיאה במחיקה' : language === 'es' ? 'Error al eliminar' : 'Error deleting', variant: "destructive" });
    } else {
      toast({ title: language === 'he' ? 'הטופס נמחק' : language === 'es' ? 'Formulario eliminado' : 'Form deleted' });
      onRefresh();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Globe className="h-3 w-3 ml-1" />
            {language === 'he' ? 'פורסם' : language === 'es' ? 'Publicado' : 'Published'}
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary">
            <Lock className="h-3 w-3 ml-1" />
            {language === 'he' ? 'טיוטה' : language === 'es' ? 'Borrador' : 'Draft'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (forms.length === 0) {
    return (
      <Card className="glass-panel border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileEdit className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{language === 'he' ? 'אין טפסים עדיין' : language === 'es' ? 'No hay formularios todavía' : 'No forms yet'}</h3>
          <p className="text-muted-foreground">{language === 'he' ? 'צור את הטופס הראשון שלך' : language === 'es' ? 'Crea tu primer formulario' : 'Create your first form'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <Card key={form.id} className="glass-panel border-white/10 hover:border-primary/30 transition-colors overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
                <CardTitle className="text-lg line-clamp-2 break-words">{form.title}</CardTitle>
                {form.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                    {form.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(form.id)}>
                    <Edit className="h-4 w-4 ml-2" />
                    {language === 'he' ? 'ערוך פרטים' : language === 'es' ? 'Editar detalles' : 'Edit details'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditFields(form.id)}>
                    <FileEdit className="h-4 w-4 ml-2" />
                    {language === 'he' ? 'ערוך שדות' : language === 'es' ? 'Editar campos' : 'Edit fields'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewSubmissions(form.id)}>
                    <Inbox className="h-4 w-4 ml-2" />
                    {language === 'he' ? 'צפה בתשובות' : language === 'es' ? 'Ver respuestas' : 'View submissions'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleStatus(form.id, form.status)}
                  >
                    {form.status === "published" ? (
                      <>
                        <Lock className="h-4 w-4 ml-2" />
                        {language === 'he' ? 'הסתר טופס' : language === 'es' ? 'Ocultar formulario' : 'Hide form'}
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 ml-2" />
                        {language === 'he' ? 'פרסם טופס' : language === 'es' ? 'Publicar formulario' : 'Publish form'}
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteForm(form.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 ml-2" />
                    {language === 'he' ? 'מחק' : language === 'es' ? 'Eliminar' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              {getStatusBadge(form.status)}
              <span className="text-xs text-muted-foreground">
                {format(new Date(form.created_at), "dd/MM/yyyy", { locale: language === 'he' ? he : language === 'es' ? es : undefined })}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => copyLink(form.access_token, form.id)}
              >
                {copiedId === form.id ? (
                  language === 'he' ? 'הועתק! ✓' : language === 'es' ? '¡Copiado! ✓' : 'Copied! ✓'
                ) : (
                  <>
                    <Copy className="h-4 w-4 ml-1" />
                    {language === 'he' ? 'העתק לינק' : language === 'es' ? 'Copiar enlace' : 'Copy link'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`/form/${form.access_token}`, "_blank")
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormsList;
