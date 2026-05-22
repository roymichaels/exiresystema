import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Reads the `signup_enabled` flag from site_settings (defaults to false = closed). */
export function useSignupEnabled() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "signup_enabled")
        .maybeSingle();
      if (!cancelled) {
        setEnabled(data?.setting_value === "true");
        setLoading(false);
      }
    })();

    const channel = supabase
      .channel("site_settings:signup_enabled")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings", filter: "setting_key=eq.signup_enabled" },
        (payload: any) => {
          const v = payload?.new?.setting_value;
          if (v !== undefined) setEnabled(v === "true");
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { enabled, loading };
}
