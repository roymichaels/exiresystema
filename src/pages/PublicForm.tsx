import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Star } from "lucide-react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  is_required: boolean | null;
  options: any;
  order_index: number | null;
}

interface CustomForm {
  id: string;
  title: string;
  description: string | null;
  status: string;
  settings: any;
}

export default function PublicForm() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<CustomForm | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      setLoading(true);
      const { data: formData, error } = await supabase
        .from("custom_forms")
        .select("id, title, description, status, settings")
        .eq("access_token", token)
        .eq("status", "published")
        .maybeSingle();

      if (cancelled) return;
      if (error || !formData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setForm(formData);

      const { data: fieldsData } = await supabase
        .from("form_fields")
        .select("id, type, label, placeholder, is_required, options, order_index")
        .eq("form_id", formData.id)
        .order("order_index", { ascending: true });
      if (cancelled) return;
      setFields(fieldsData || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setVal = (id: string, v: any) =>
    setResponses((r) => ({ ...r, [id]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    for (const f of fields) {
      if (f.is_required) {
        const v = responses[f.id];
        if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) {
          toast({ title: `שדה חובה: ${f.label}`, variant: "destructive" });
          return;
        }
      }
    }

    setSubmitting(true);
    const emailField = fields.find((f) => f.type === "email");
    const email = emailField ? responses[emailField.id] : null;

    const payload: Record<string, any> = {};
    for (const f of fields) {
      payload[f.label] = responses[f.id] ?? null;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("form_submissions").insert({
      form_id: form.id,
      responses: payload,
      email: email || null,
      user_id: user?.id || null,
      status: "new",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "שגיאה בשליחת הטופס", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full glass-panel">
          <CardContent className="pt-6 text-center space-y-2">
            <h1 className="text-xl font-bold">הטופס לא נמצא</h1>
            <p className="text-muted-foreground text-sm">
              ייתכן שהקישור שגוי או שהטופס אינו זמין כרגע.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    const thankYou =
      form.settings?.thank_you_message || "תודה על מילוי הטופס!";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full glass-panel">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 mx-auto text-green-500" />
            <h1 className="text-2xl font-bold">{thankYou}</h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-2xl">{form.title}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground text-sm">{form.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((f) => {
                const opts: string[] = Array.isArray(f.options) ? f.options : [];
                const val = responses[f.id];
                return (
                  <div key={f.id} className="space-y-2">
                    <Label>
                      {f.label}
                      {f.is_required && <span className="text-destructive mr-1">*</span>}
                    </Label>
                    {f.type === "textarea" ? (
                      <Textarea
                        value={val || ""}
                        onChange={(e) => setVal(f.id, e.target.value)}
                        placeholder={f.placeholder || ""}
                        required={!!f.is_required}
                      />
                    ) : f.type === "select" ? (
                      <Select value={val || ""} onValueChange={(v) => setVal(f.id, v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={f.placeholder || "בחר..."} />
                        </SelectTrigger>
                        <SelectContent>
                          {opts.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "radio" ? (
                      <RadioGroup value={val || ""} onValueChange={(v) => setVal(f.id, v)}>
                        {opts.map((o) => (
                          <div key={o} className="flex items-center gap-2">
                            <RadioGroupItem value={o} id={`${f.id}-${o}`} />
                            <Label htmlFor={`${f.id}-${o}`} className="font-normal">{o}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : f.type === "checkbox" ? (
                      <div className="space-y-2">
                        {opts.map((o) => {
                          const arr: string[] = Array.isArray(val) ? val : [];
                          const checked = arr.includes(o);
                          return (
                            <div key={o} className="flex items-center gap-2">
                              <Checkbox
                                id={`${f.id}-${o}`}
                                checked={checked}
                                onCheckedChange={(c) => {
                                  const next = c
                                    ? [...arr, o]
                                    : arr.filter((x) => x !== o);
                                  setVal(f.id, next);
                                }}
                              />
                              <Label htmlFor={`${f.id}-${o}`} className="font-normal">{o}</Label>
                            </div>
                          );
                        })}
                      </div>
                    ) : f.type === "rating" ? (
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setVal(f.id, n)}
                            className="p-1"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                (val || 0) >= n
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Input
                        type={
                          f.type === "email"
                            ? "email"
                            : f.type === "phone"
                            ? "tel"
                            : f.type === "number"
                            ? "number"
                            : f.type === "date"
                            ? "date"
                            : "text"
                        }
                        value={val || ""}
                        onChange={(e) => setVal(f.id, e.target.value)}
                        placeholder={f.placeholder || ""}
                        required={!!f.is_required}
                      />
                    )}
                  </div>
                );
              })}

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    שולח...
                  </>
                ) : (
                  "שלח"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
