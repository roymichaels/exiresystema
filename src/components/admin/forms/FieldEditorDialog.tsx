import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from '@/hooks/useTranslation';

const fieldTypes = [
  { value: "text", labelHe: "טקסט קצר", labelEn: "Short Text", labelEs: "Texto Corto" },
  { value: "email", labelHe: "אימייל", labelEn: "Email", labelEs: "Correo" },
  { value: "phone", labelHe: "טלפון", labelEn: "Phone", labelEs: "Teléfono" },
  { value: "textarea", labelHe: "טקסט ארוך", labelEn: "Long Text", labelEs: "Texto Largo" },
  { value: "select", labelHe: "בחירה מרשימה", labelEn: "Dropdown", labelEs: "Lista Desplegable" },
  { value: "radio", labelHe: "בחירה יחידה", labelEn: "Single Choice", labelEs: "Opción Única" },
  { value: "checkbox", labelHe: "תיבות סימון", labelEn: "Checkboxes", labelEs: "Casillas" },
  { value: "rating", labelHe: "דירוג כוכבים", labelEn: "Star Rating", labelEs: "Valoración" },
  { value: "date", labelHe: "תאריך", labelEn: "Date", labelEs: "Fecha" },
  { value: "number", labelHe: "מספר", labelEn: "Number", labelEs: "Número" },
];

const getFormSchema = (language: string) => z.object({
  type: z.string().min(1, language === 'he' ? 'נא לבחור סוג שדה' : language === 'es' ? 'Selecciona un tipo de campo' : 'Select a field type'),
  label: z.string().min(1, language === 'he' ? 'נא להזין כותרת' : language === 'es' ? 'Ingresa un título' : 'Enter a label'),
  placeholder: z.string().optional(),
  is_required: z.boolean(),
  options: z.string().optional(),
});

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

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

interface FieldEditorDialogProps {
  formId: string;
  field: FormField | null;
  nextIndex: number;
  onClose: () => void;
  onSuccess: () => void;
}

const FieldEditorDialog = ({
  formId,
  field,
  nextIndex,
  onClose,
  onSuccess,
}: FieldEditorDialogProps) => {
  const { language } = useTranslation();
  const formSchema = getFormSchema(language);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "text",
      label: "",
      placeholder: "",
      is_required: false,
      options: "",
    },
  });

  const selectedType = form.watch("type");
  const showOptions = ["select", "radio", "checkbox"].includes(selectedType);

  useEffect(() => {
    if (field) {
      form.reset({
        type: field.type,
        label: field.label,
        placeholder: field.placeholder || "",
        is_required: field.is_required,
        options: Array.isArray(field.options) ? field.options.join("\n") : "",
      });
    } else {
      form.reset({
        type: "text",
        label: "",
        placeholder: "",
        is_required: false,
        options: "",
      });
    }
  }, [field, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const options = values.options
        ? values.options.split("\n").filter((o) => o.trim())
        : [];

      const fieldData = {
        form_id: formId,
        type: values.type,
        label: values.label,
        placeholder: values.placeholder || null,
        is_required: values.is_required,
        options,
      };

      if (field) {
        const { error } = await supabase
          .from("form_fields")
          .update(fieldData)
          .eq("id", field.id);
        if (error) throw error;
        toast({ title: language === 'he' ? 'השדה עודכן!' : language === 'es' ? '¡Campo actualizado!' : 'Field updated!' });
      } else {
        const { error } = await supabase.from("form_fields").insert({
          ...fieldData,
          order_index: nextIndex,
        });
        if (error) throw error;
        toast({ title: language === 'he' ? 'השדה נוסף!' : language === 'es' ? '¡Campo añadido!' : 'Field added!' });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving field:", error);
      toast({ title: language === 'he' ? 'שגיאה בשמירה' : language === 'es' ? 'Error al guardar' : 'Error saving', variant: "destructive" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{field ? (language === 'he' ? 'עריכת שדה' : language === 'es' ? 'Editar campo' : 'Edit field') : (language === 'he' ? 'הוספת שדה' : language === 'es' ? 'Añadir campo' : 'Add field')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'he' ? 'סוג השדה' : language === 'es' ? 'Tipo de campo' : 'Field type'}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'he' ? 'בחר סוג שדה' : language === 'es' ? 'Selecciona tipo de campo' : 'Select field type'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {language === 'he' ? type.labelHe : language === 'es' ? type.labelEs : type.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'he' ? 'כותרת השאלה' : language === 'es' ? 'Título de la pregunta' : 'Question label'}</FormLabel>
                  <FormControl>
                    <Input placeholder={language === 'he' ? 'לדוגמה: מה השם שלך?' : language === 'es' ? 'Ejemplo: ¿Cuál es tu nombre?' : 'Example: What is your name?'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === 'he' ? 'טקסט עזר (Placeholder)' : language === 'es' ? 'Texto de ayuda (Placeholder)' : 'Placeholder text'}</FormLabel>
                  <FormControl>
                    <Input placeholder={language === 'he' ? 'לדוגמה: הכנס את שמך כאן...' : language === 'es' ? 'Ejemplo: Ingresa tu nombre aquí...' : 'Example: Enter your name here...'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showOptions && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === 'he' ? 'אפשרויות' : language === 'es' ? 'Opciones' : 'Options'}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={language === 'he' ? 'הכנס כל אפשרות בשורה נפרדת' : language === 'es' ? 'Ingresa cada opción en una línea separada' : 'Enter each option on a separate line'}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {language === 'he' ? 'כל אפשרות בשורה נפרדת' : language === 'es' ? 'Cada opción en una línea separada' : 'Each option on a separate line'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{language === 'he' ? 'שדה חובה' : language === 'es' ? 'Campo obligatorio' : 'Required field'}</FormLabel>
                    <FormDescription>
                      {language === 'he' ? 'המשתמש חייב למלא שדה זה' : language === 'es' ? 'El usuario debe completar este campo' : 'User must fill this field'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {language === 'he' ? 'ביטול' : language === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
              <Button type="submit">{field ? (language === 'he' ? 'עדכן' : language === 'es' ? 'Actualizar' : 'Update') : (language === 'he' ? 'הוסף' : language === 'es' ? 'Añadir' : 'Add')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldEditorDialog;
