"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { lang, setLang } = useLangStore();
  const t = translations[lang].login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth(data.token, data.user);
      toast.success(t.loginSuccess);
      router.replace("/");
    } catch {
      toast.error(t.loginError);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      toast.success(t.forgotSuccess);
      setShowForgot(false);
    } catch {
      toast.success(t.forgotSuccess);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="rounded-2xl border bg-card p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                ⚔
              </div>
              <span className="text-xl font-semibold">SW Farm</span>
            </div>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-primary/70 hover:text-primary w-full text-right"
                >
                  {t.forgot}
                </button>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.logging : t.login}
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">
                  {t.access}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="space-y-1">
                <p className="font-medium text-sm">{t.forgotTitle}</p>
                <p className="text-xs text-muted-foreground">{t.forgotSub}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t.email}</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="ton@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.sending : t.send}
              </Button>
              <button
                type="button"
                onClick={() => setShowForgot(false)}
                className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
              >
                ← {t.back}
              </button>
            </form>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "text-xs px-3 py-1 rounded border transition-colors uppercase",
                lang === l
                  ? "border-primary/50 text-primary bg-primary/10"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
