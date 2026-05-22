import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Admin toggle: open/close new-user registration.
 * Source of truth = site_settings.signup_enabled
 */
export function SignupGateCard() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "signup_enabled")
        .maybeSingle();
      setEnabled(data?.setting_value === "true");
      setLoading(false);
    })();
  }, []);

  const onToggle = async (next: boolean) => {
    setSaving(true);
    const prev = enabled;
    setEnabled(next);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { setting_key: "signup_enabled", setting_value: next ? "true" : "false", setting_type: "boolean" },
        { onConflict: "setting_key" },
      );
    setSaving(false);
    if (error) {
      setEnabled(prev);
      toast({ title: "שמירה נכשלה", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: next ? "ההרשמה נפתחה" : "ההרשמה נסגרה",
      description: next
        ? "משתמשים חדשים יכולים להירשם דרך מודל ההתחברות."
        : "טאב ההרשמה מוסתר ובקשות חדשות יידחו.",
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          {enabled ? (
            <ShieldCheck className="h-5 w-5 text-primary" />
          ) : (
            <ShieldOff className="h-5 w-5 text-muted-foreground" />
          )}
          <CardTitle>הרשמת משתמשים חדשים</CardTitle>
        </div>
        <CardDescription>
          סגור או פתח את ההרשמה לחברים חדשים. כאשר סגור, טאב ההרשמה נעלם ממודל ההתחברות וניסיונות הרשמה יידחו.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border bg-card/40 px-4 py-3">
          <Label htmlFor="signup-gate" className="cursor-pointer">
            {enabled ? "ההרשמה פתוחה" : "ההרשמה סגורה"}
          </Label>
          <div className="flex items-center gap-2">
            {(loading || saving) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            <Switch
              id="signup-gate"
              checked={enabled}
              disabled={loading || saving}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
