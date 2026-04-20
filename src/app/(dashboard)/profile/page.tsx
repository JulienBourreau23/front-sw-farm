"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileApi } from "@/lib/api";
import { translations } from "@/lib/i18n";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const { lang } = useLangStore();
  const t = translations[lang].profile;

  const [infoForm, setInfoForm] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
  });

  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const infoMutation = useMutation({
    mutationFn: (data: { username?: string; email?: string }) =>
      profileApi.update(data),
    onSuccess: (data) => {
      toast.success(t.updateSuccess);
      setAuth(data.token, data.user);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? t.errorUpdate);
    },
  });

  const pwdMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      profileApi.update(data),
    onSuccess: (data) => {
      toast.success(t.passwordSuccess);
      setAuth(data.token, data.user);
      setPwdForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message ?? t.errorPassword);
    },
  });

  function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    const changes: { username?: string; email?: string } = {};
    if (infoForm.username !== user?.username)
      changes.username = infoForm.username;
    if (infoForm.email !== user?.email) changes.email = infoForm.email;
    if (Object.keys(changes).length === 0) {
      toast.info(t.noChange);
      return;
    }
    infoMutation.mutate(changes);
  }

  function handlePwdSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      toast.error(t.errorMismatch);
      return;
    }
    if (pwdForm.new_password.length < 8) {
      toast.error(t.errorLength);
      return;
    }
    pwdMutation.mutate({
      current_password: pwdForm.current_password,
      new_password: pwdForm.new_password,
    });
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
      </div>

      <div className="rounded-xl border bg-card p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
          {user?.username?.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{user?.username}</p>
            <Badge
              variant={user?.role === "ROLE_ADMIN" ? "default" : "secondary"}
              className="text-xs shrink-0"
            >
              {user?.role === "ROLE_ADMIN" ? t.roleAdmin : t.roleUser}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-medium mb-4">{t.info}</h2>
        <form onSubmit={handleInfoSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t.username}</Label>
            <Input
              id="username"
              value={infoForm.username}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, username: e.target.value }))
              }
              minLength={3}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={infoForm.email}
              onChange={(e) =>
                setInfoForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={infoMutation.isPending}>
            {infoMutation.isPending ? t.saving : t.save}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-sm font-medium mb-4">{t.changePassword}</h2>
        <form onSubmit={handlePwdSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">{t.currentPassword}</Label>
            <Input
              id="current_password"
              type="password"
              placeholder="••••••••"
              value={pwdForm.current_password}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, current_password: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">{t.newPassword}</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="••••••••"
              value={pwdForm.new_password}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, new_password: e.target.value }))
              }
              minLength={8}
              required
            />
            <p className="text-xs text-muted-foreground">{t.minLength}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">{t.confirmPassword}</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              value={pwdForm.confirm_password}
              onChange={(e) =>
                setPwdForm((f) => ({ ...f, confirm_password: e.target.value }))
              }
              required
            />
          </div>
          <Button type="submit" size="sm" disabled={pwdMutation.isPending}>
            {pwdMutation.isPending ? t.changing : t.changeBtn}
          </Button>
        </form>
      </div>
    </div>
  );
}
