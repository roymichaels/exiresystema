import { useState } from "react";
import { Sparkles, Loader2, Wand2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIField {
  type: string;
  label: string;
  placeholder: string;
  is_required: boolean;
  options: string[];
  order_index: number;
}

interface AIResult {
  title: string;
  description: string;
  intro_title: string;
  intro_subtitle: string;
  thank_you_message: string;
  fields: AIField[];
}

const QUICK_PICKS = [
  { id: "lead", label: "טופס לידים" },
  { id: "quiz", label: "שאלון/חידון" },
  { id: "intake", label: "טופס שאלות פתיחה" },
  { id: "feedback", label: "משוב" },
  { id: "assessment", label: "אבחון" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (formId: string) => void;
}

export default function AIFormWizard({ open, onOpenChange, onCreated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [intent, setIntent] = useState<string>("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const reset = () => {
    setPrompt("");
    setIntent("general");
    setResult(null);
    setLoading(false);
    setSaving(false);
  };

  const close = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "נא לתאר איזה טופס לבנות", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-form", {
        body: { prompt: prompt.trim(), intent },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as AIResult);
    } catch (err) {
      console.error(err);
      toast({
        title: "שגיאה ביצירת הטופס",
        description: err instanceof Error ? err.message : "נסה שוב",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: formRow, error: formErr } = await supabase
        .from("custom_forms")
        .insert({
          title: result.title,
          description: result.description || null,
          settings: {
            thank_you_message: result.thank_you_message,
            show_progress: true,
            show_intro: true,
            intro_title: result.intro_title,
            intro_subtitle: result.intro_subtitle,
          },
          created_by: userData.user?.id,
        })
        .select("id")
        .single();
      if (formErr) throw formErr;

      if (result.fields.length > 0) {
        const { error: fieldsErr } = await supabase.from("form_fields").insert(
          result.fields.map((f) => ({
            form_id: formRow.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder || null,
            is_required: f.is_required,
            options: f.options,
            order_index: f.order_index,
          })),
        );
        if (fieldsErr) throw fieldsErr;
      }

      toast({ title: "הטופס נוצר בהצלחה!", description: `${result.fields.length} שדות נוספו` });
      onCreated(formRow.id);
      close(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "שגיאה בשמירת הטופס",
        description: err instanceof Error ? err.message : "נסה שוב",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            יצירת טופס/שאלון עם AI
          </DialogTitle>
          <DialogDescription>
            תאר מה אתה רוצה — AION יבנה את כל השדות בשבילך
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-2">
            {!result && (
              <>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PICKS.map((q) => (
                    <Badge
                      key={q.id}
                      variant={intent === q.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setIntent(q.id)}
                    >
                      {q.label}
                    </Badge>
                  ))}
                </div>

                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='לדוגמה: "שאלון אבחון של 8 שאלות לבדוק את רמת הלחץ של מתאמן חדש, עם דירוגים 1-5 ושאלה פתוחה בסוף"'
                  rows={8}
                  className="resize-none"
                  dir="rtl"
                />

                <div className="text-xs text-muted-foreground">
                  טיפ: כתוב כמה שדות, איזה סוג שאלות, ולמי הטופס מיועד
                </div>
              </>
            )}

            {result && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">תצוגה מקדימה</span>
                  </div>
                  <div className="text-lg font-bold">{result.title}</div>
                  {result.description && (
                    <div className="text-sm text-muted-foreground">{result.description}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    שדות ({result.fields.length})
                  </div>
                  {result.fields.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-lg border bg-card p-3 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          {i + 1}. {f.label}
                          {f.is_required && <span className="text-destructive ms-1">*</span>}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {f.type}
                        </Badge>
                      </div>
                      {f.options.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {f.options.join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 justify-end pt-3 border-t">
          {!result ? (
            <>
              <Button variant="outline" onClick={() => close(false)} disabled={loading}>
                ביטול
              </Button>
              <Button onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {loading ? "יוצר..." : "צור עם AI"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setResult(null)} disabled={saving}>
                שנה תיאור
              </Button>
              <Button onClick={handleGenerate} variant="outline" disabled={saving} className="gap-2">
                <Wand2 className="h-4 w-4" />
                צור מחדש
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? "שומר..." : "צור את הטופס"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
