import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Inbox,
  Clock,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Edit,
  FileEdit,
  Copy,
  Eye,
  Globe,
  Lock,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FormsList from "@/components/admin/forms/FormsList";
import FormDialog from "@/components/admin/forms/FormDialog";
import FormFieldsEditor from "@/components/admin/forms/FormFieldsEditor";
import FormSubmissionsViewer from "@/components/admin/forms/FormSubmissionsViewer";
import AIFormWizard from "@/components/admin/forms/AIFormWizard";
import { useTranslation } from "@/hooks/useTranslation";

const Forms = () => {
  const { language } = useTranslation();
  const isRTL = language === "he";
  const { currentTenant } = useTenant();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isAIWizardOpen, setIsAIWizardOpen] = useState(false);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [fieldEditorFormId, setFieldEditorFormId] = useState<string | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const { data: forms, refetch } = useQuery({
    queryKey: ["custom-forms", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("tenant_id", currentTenant.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ["all-form-submissions-count", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("form_submissions")
        .select("id, status, form_id")
        .eq("tenant_id", currentTenant.id);
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    totalForms: forms?.length || 0,
    totalSubmissions: submissions.length,
    newSubmissions: submissions.filter((s) => s.status === "new").length,
    processed: submissions.filter((s) => s.status === "processed").length,
  };

  const selectedForm = useMemo(
    () => forms?.find((f) => f.id === selectedFormId) || null,
    [forms, selectedFormId]
  );
  const selectedFormNewCount = useMemo(
    () =>
      submissions.filter(
        (s) => s.form_id === selectedFormId && s.status === "new"
      ).length,
    [submissions, selectedFormId]
  );

  const handleEdit = (formId: string) => {
    setEditingFormId(formId);
    setIsFormDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsFormDialogOpen(false);
    setEditingFormId(null);
  };

  const copyLink = async (token: string) => {
    const link = `${window.location.origin}/form/${token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: isRTL ? "הקישור הועתק ללוח! 🔗" : "Link copied! 🔗" });
    } catch {
      prompt(isRTL ? "העתק ידנית:" : "Copy manually:", link);
    }
  };

  const toggleStatus = async () => {
    if (!selectedForm || !currentTenant?.id) return;
    const newStatus = selectedForm.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("custom_forms")
      .update({ status: newStatus })
      .eq("id", selectedForm.id)
      .eq("tenant_id", currentTenant.id);
    if (error) {
      toast({ title: isRTL ? "שגיאה" : "Error", variant: "destructive" });
    } else {
      toast({
        title:
          newStatus === "published"
            ? isRTL
              ? "הטופס פורסם!"
              : "Form published!"
            : isRTL
            ? "הטופס הוסתר"
            : "Form hidden",
      });
      refetch();
    }
  };

  const deleteForm = async () => {
    if (!selectedForm || !currentTenant?.id) return;
    if (
      !confirm(
        isRTL
          ? "האם למחוק את הטופס? כל התשובות יימחקו גם כן."
          : "Delete this form? All submissions will also be deleted."
      )
    )
      return;
    const { error } = await supabase
      .from("custom_forms")
      .delete()
      .eq("id", selectedForm.id)
      .eq("tenant_id", currentTenant.id);
    if (error) {
      toast({ title: isRTL ? "שגיאה במחיקה" : "Error", variant: "destructive" });
    } else {
      toast({ title: isRTL ? "הטופס נמחק" : "Form deleted" });
      setSelectedFormId(null);
      refetch();
    }
  };

  // ============ Detail view ============
  if (selectedForm) {
    const BackIcon = isRTL ? ArrowRight : ArrowLeft;
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Back + title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFormId(null)}
              className="gap-1.5 shrink-0"
            >
              <BackIcon className="h-4 w-4" />
              {isRTL ? "חזרה לטפסים" : "Back to forms"}
            </Button>
          </div>
        </div>

        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold break-words">
                    {selectedForm.title}
                  </h1>
                  {selectedForm.status === "published" ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Globe className="h-3 w-3 ml-1" />
                      {isRTL ? "פורסם" : "Published"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 ml-1" />
                      {isRTL ? "טיוטה" : "Draft"}
                    </Badge>
                  )}
                  {selectedFormNewCount > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {selectedFormNewCount} {isRTL ? "חדשות" : "new"}
                    </Badge>
                  )}
                </div>
                {selectedForm.description && (
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {selectedForm.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions bar */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(selectedForm.access_token)}
                className="gap-1.5"
              >
                <Copy className="h-4 w-4" />
                {isRTL ? "העתק לינק" : "Copy link"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(`/form/${selectedForm.access_token}`, "_blank")
                }
                className="gap-1.5"
              >
                <Eye className="h-4 w-4" />
                {isRTL ? "תצוגה מקדימה" : "Preview"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFieldEditorFormId(selectedForm.id)}
                className="gap-1.5"
              >
                <FileEdit className="h-4 w-4" />
                {isRTL ? "ערוך שדות" : "Edit fields"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(selectedForm.id)}
                className="gap-1.5"
              >
                <Edit className="h-4 w-4" />
                {isRTL ? "ערוך פרטים" : "Edit details"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStatus}
                className="gap-1.5"
              >
                {selectedForm.status === "published" ? (
                  <>
                    <Lock className="h-4 w-4" />
                    {isRTL ? "הסתר" : "Hide"}
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    {isRTL ? "פרסם" : "Publish"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deleteForm}
                className="gap-1.5 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                {isRTL ? "מחק" : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inline submissions */}
        <Card className="glass-panel border-white/10">
          <CardContent className="pt-6">
            <FormSubmissionsViewer formId={selectedForm.id} inline />
          </CardContent>
        </Card>

        {/* Field editor modal */}
        {fieldEditorFormId && (
          <FormFieldsEditor
            formId={fieldEditorFormId}
            onClose={() => setFieldEditorFormId(null)}
          />
        )}

        {/* Edit-details dialog */}
        <FormDialog
          open={isFormDialogOpen}
          onOpenChange={handleDialogClose}
          formId={editingFormId}
          onSuccess={() => {
            handleDialogClose();
            refetch();
          }}
        />
      </div>
    );
  }

  // ============ List view ============
  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg md:text-2xl font-bold">
            {isRTL ? "טפסים" : language === "es" ? "Formularios" : "Forms"}
          </h1>
          <p className="hidden md:block text-muted-foreground text-sm">
            {isRTL
              ? "יצירה וניהול טפסים ותשובות"
              : language === "es"
              ? "Crear y gestionar formularios y respuestas"
              : "Create and manage forms and submissions"}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button
            onClick={() => setIsAIWizardOpen(true)}
            size="sm"
            variant="default"
            className="gap-1.5 h-9"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-[12.5px]">
              {isRTL ? "צור עם AI" : language === "es" ? "Crear con IA" : "Create with AI"}
            </span>
          </Button>
          <Button
            onClick={() => setIsFormDialogOpen(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 h-9"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-[12.5px]">
              {isRTL ? "טופס חדש" : language === "es" ? "Nuevo Formulario" : "New Form"}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-panel border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'סה"כ טפסים' : "Total Forms"}
                </p>
                <p className="text-2xl font-bold text-primary">{stats.totalForms}</p>
              </div>
              <FileText className="h-6 w-6 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'סה"כ תשובות' : "Total Submissions"}
                </p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalSubmissions}</p>
              </div>
              <Inbox className="h-6 w-6 text-blue-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "חדשות" : "New"}</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.newSubmissions}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? "טופלו" : "Processed"}</p>
                <p className="text-2xl font-bold text-green-400">{stats.processed}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms list — clicking a form opens the detail view */}
      <FormsList
        forms={forms || []}
        onEdit={handleEdit}
        onEditFields={setFieldEditorFormId}
        onViewSubmissions={setSelectedFormId}
        onRefresh={refetch}
      />

      <FormDialog
        open={isFormDialogOpen}
        onOpenChange={handleDialogClose}
        formId={editingFormId}
        onSuccess={() => {
          handleDialogClose();
          refetch();
        }}
      />

      <AIFormWizard
        open={isAIWizardOpen}
        onOpenChange={setIsAIWizardOpen}
        onCreated={(formId) => {
          refetch();
          setFieldEditorFormId(formId);
        }}
      />

      {fieldEditorFormId && (
        <FormFieldsEditor
          formId={fieldEditorFormId}
          onClose={() => setFieldEditorFormId(null)}
        />
      )}
    </div>
  );
};

export default Forms;

