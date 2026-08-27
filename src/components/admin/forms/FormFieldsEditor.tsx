import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import FieldEditorDialog from "./FieldEditorDialog";
import { useTranslation } from '@/hooks/useTranslation';

interface FormField {
  id: string;
  form_id: string;
  type: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[];
  order_index: number;
}

interface FormFieldsEditorProps {
  formId: string;
  onClose: () => void;
}

const fieldTypeLabels: Record<string, { he: string; en: string; es: string }> = {
  text: { he: "טקסט קצר", en: "Short Text", es: "Texto Corto" },
  email: { he: "אימייל", en: "Email", es: "Correo" },
  phone: { he: "טלפון", en: "Phone", es: "Teléfono" },
  textarea: { he: "טקסט ארוך", en: "Long Text", es: "Texto Largo" },
  select: { he: "בחירה מרשימה", en: "Dropdown", es: "Lista Desplegable" },
  radio: { he: "בחירה יחידה", en: "Single Choice", es: "Opción Única" },
  checkbox: { he: "תיבות סימון", en: "Checkboxes", es: "Casillas" },
  rating: { he: "דירוג כוכבים", en: "Star Rating", es: "Valoración" },
  date: { he: "תאריך", en: "Date", es: "Fecha" },
  number: { he: "מספר", en: "Number", es: "Número" },
};

const FormFieldsEditor = ({ formId, onClose }: FormFieldsEditorProps) => {
  const { language } = useTranslation();
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isAddingField, setIsAddingField] = useState(false);
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();

  const { data: form } = useQuery({
    queryKey: ["custom-form", formId, currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return null;
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("id", formId)
        .eq("tenant_id", currentTenant.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: fields = [], refetch } = useQuery({
    queryKey: ["form-fields", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("order_index");
      if (error) throw error;
      return data as FormField[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from("form_fields")
        .delete()
        .eq("id", fieldId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: language === 'he' ? 'השדה נמחק' : language === 'es' ? 'Campo eliminado' : 'Field deleted' });
      refetch();
    },
    onError: () => {
      toast({ title: language === 'he' ? 'שגיאה במחיקה' : language === 'es' ? 'Error al eliminar' : 'Error deleting', variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({
      fieldId,
      newIndex,
    }: {
      fieldId: string;
      newIndex: number;
    }) => {
      const { error } = await supabase
        .from("form_fields")
        .update({ order_index: newIndex })
        .eq("id", fieldId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const fieldIndex = fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const otherField = fields[newIndex];

    // Swap order indexes
    reorderMutation.mutate({ fieldId, newIndex: otherField.order_index });
    reorderMutation.mutate({ fieldId: otherField.id, newIndex: fields[fieldIndex].order_index });
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{language === 'he' ? 'עריכת שדות' : language === 'es' ? 'Editar campos' : 'Edit fields'} - {form?.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Button
            onClick={() => setIsAddingField(true)}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            {language === 'he' ? 'הוסף שדה' : language === 'es' ? 'Añadir campo' : 'Add field'}
          </Button>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{language === 'he' ? 'אין שדות עדיין' : language === 'es' ? 'No hay campos todavía' : 'No fields yet'}</p>
              <p className="text-sm">{language === 'he' ? 'לחץ "הוסף שדה" כדי להתחיל' : language === 'es' ? 'Haz clic en "Añadir campo" para empezar' : 'Click "Add field" to get started'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center gap-2 group"
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0 w-full">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium break-words whitespace-normal">{field.label}</span>
                        {field.is_required && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            {language === 'he' ? 'חובה' : language === 'es' ? 'Obligatorio' : 'Required'}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {fieldTypeLabels[field.type] ? (language === 'he' ? fieldTypeLabels[field.type].he : language === 'es' ? fieldTypeLabels[field.type].es : fieldTypeLabels[field.type].en) : field.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveField(field.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveField(field.id, "down")}
                      disabled={index === fields.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingField(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => {
                        if (confirm(language === 'he' ? 'למחוק את השדה?' : language === 'es' ? '¿Eliminar el campo?' : 'Delete this field?')) {
                          deleteMutation.mutate(field.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {(isAddingField || editingField) && (
          <FieldEditorDialog
            formId={formId}
            field={editingField}
            nextIndex={fields.length}
            onClose={() => {
              setIsAddingField(false);
              setEditingField(null);
            }}
            onSuccess={() => {
              setIsAddingField(false);
              setEditingField(null);
              refetch();
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FormFieldsEditor;
