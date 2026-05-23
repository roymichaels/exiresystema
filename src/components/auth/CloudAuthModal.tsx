import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthModalInternal } from "@/contexts/AuthModalContext";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function CloudAuthModal() {
  const { isAuthFlowOpen, completeAuthFlow, cancelAuthFlow, failAuthFlow } = useAuthModalInternal();
  const { isRTL } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    void trackEvent("login_start", "auth", "google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) {
        void trackEvent("login_success", "auth", "google");
        toast({ title: isRTL ? "התחברתם" : "Signed in" });
        completeAuthFlow();
      }
    } catch (err: any) {
      void trackEvent("login_failed", "auth", "google", { message: err?.message });
      failAuthFlow(err?.message || (isRTL ? "ההתחברות עם Google נכשלה" : "Google sign-in failed"));
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthFlowOpen} onOpenChange={(open) => !open && cancelAuthFlow()}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isRTL ? "text-right" : undefined}>
            {isRTL ? "ברוכים הבאים" : "Welcome"}
          </DialogTitle>
          <DialogDescription className={isRTL ? "text-right" : undefined}>
            {isRTL
              ? "התחברו עם חשבון Google כדי להמשיך."
              : "Sign in with Google to continue."}
          </DialogDescription>
        </DialogHeader>

        <Button type="button" onClick={handleGoogle} disabled={loading} className="w-full">
          {loading && <Loader2 className={`${isRTL ? "ms-2" : "mr-2"} h-4 w-4 animate-spin`} />}
          {isRTL ? "המשיכו עם Google" : "Continue with Google"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
