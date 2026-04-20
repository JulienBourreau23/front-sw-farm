"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { translations } from "@/lib/i18n";
import { useLangStore } from "@/store/lang.store";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { lang, setLang } = useLangStore();
  const t = translations[lang].resetPassword;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast.error(t.errorNoToken);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t.errorMismatch);
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t.errorLength);
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.success(t.success);
      setDone(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch {
      toast.error(t.errorInvalid);
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
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          {!token ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-destructive">{t.errorNoToken}</p>
              <Button variant="ghost" size="sm" onClick={() => router.replace("/login")}>
                ← {t.backToLogin}
              </Button>
            </div>
          ) : done ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-green-500">{t.success}</p>
              <p className="text-xs text-muted-foreground">Redirection...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">{t.minLength}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t.submitting : t.submit}
              </Button>
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
              >
                ← {t.backToLogin}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
