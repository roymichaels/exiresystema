import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthModalInternal } from "@/contexts/AuthModalContext";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { trackEvent } from "@/lib/analytics";

export default function CloudAuthModal() {
  const { isAuthFlowOpen, completeAuthFlow, cancelAuthFlow, failAuthFlow } = useAuthModalInternal();
  const { isRTL } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    void trackEvent("login_start", "auth", "google");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (oauthError) throw oauthError;
      // Browser will redirect to Google; nothing else to do here.
    } catch (err: any) {
      void trackEvent("login_failed", "auth", "google", { message: err?.message });
      failAuthFlow(err?.message || (isRTL ? "ההתחברות עם Google נכשלה" : "Google sign-in failed"));
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(isRTL ? "נא למלא אימייל וסיסמה" : "Please enter email and password");
      return;
    }
    setLoading(true);
    void trackEvent("login_start", "auth", "email");
    try {
      if (view === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        void trackEvent("login_success", "auth", "email");
        toast({ title: isRTL ? "התחברתם" : "Signed in" });
        completeAuthFlow();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        void trackEvent("signup_success", "auth", "email");
        toast({ title: isRTL ? "נוצר חשבון! בדקו את האימייל שלכם לאישור." : "Account created! Check your email for confirmation." });
        completeAuthFlow();
      }
    } catch (err: any) {
      const msg = err?.message || "";
      setError(msg);
      void trackEvent("login_failed", "auth", "email", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isAuthFlowOpen} onOpenChange={(open) => { if (!open) cancelAuthFlow(); setError(null); }}>
      <DialogContent dir={isRTL ? "rtl" : "ltr"} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isRTL ? "text-right" : undefined}>
            {view === "login"
              ? (isRTL ? "ברוכים השבים" : "Welcome back")
              : (isRTL ? "יצירת חשבון" : "Create account")}
          </DialogTitle>
          <DialogDescription className={isRTL ? "text-right" : undefined}>
            {view === "login"
              ? (isRTL ? "התחברו עם אימייל וסיסמה או חשבון Google" : "Sign in with email & password or Google")
              : (isRTL ? "צרו חשבון חדש כדי להתחיל" : "Create a new account to get started")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="auth-email">{isRTL ? "אימייל" : "Email"}</Label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="auth-email"
                type="email"
                placeholder={isRTL ? "your@email.com" : "your@email.com"}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="ps-9"
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">{isRTL ? "סיסמה" : "Password"}</Label>
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder={isRTL ? "סיסמה" : "Password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="ps-9 pe-9"
                autoComplete={view === "login" ? "current-password" : "new-password"}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className={`${isRTL ? "ms-2" : "mr-2"} h-4 w-4 animate-spin`} />}
            {view === "login"
              ? (isRTL ? "התחברות" : "Sign in")
              : (isRTL ? "יצירת חשבון" : "Sign up")}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setView(view === "login" ? "signup" : "login"); setError(null); }}
              className="text-sm text-primary hover:underline"
            >
              {view === "login"
                ? (isRTL ? "אין לכם חשבון? צרו אחד" : "Don't have an account? Sign up")
                : (isRTL ? "כבר יש חשבון? התחברו" : "Already have an account? Sign in")}
            </button>
          </div>
        </form>

        <div className="relative my-2">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
            {isRTL ? "או" : "or"}
          </span>
        </div>

        <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full">
          {loading && <Loader2 className={`${isRTL ? "ms-2" : "mr-2"} h-4 w-4 animate-spin`} />}
          <svg className={`${isRTL ? "ms-2" : "mr-2"} h-4 w-4`} viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isRTL ? "המשיכו עם Google" : "Continue with Google"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
