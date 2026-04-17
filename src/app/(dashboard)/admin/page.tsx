"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Shield,
  ShieldOff,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface CreateForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

const EMPTY_FORM: CreateForm = {
  username: "",
  email: "",
  password: "",
  role: "ROLE_USER",
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => adminApi.createUser(data),
    onSuccess: () => {
      toast.success("Compte créé");
      setForm(EMPTY_FORM);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof adminApi.updateUser>[1];
    }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success("Utilisateur mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("Utilisateur supprimé");
      setConfirmDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error("Tous les champs sont requis");
      return;
    }
    createMutation.mutate(form);
  }

  function toggleAdmin(user: User) {
    const newRole = user.role === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
    updateMutation.mutate({ id: user.id, data: { role: newRole } });
  }

  function toggleActive(user: User) {
    updateMutation.mutate({ id: user.id, data: { isActive: !user.is_active } });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestion des comptes utilisateurs
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nouveau compte
        </Button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-sm font-medium mb-4">Créer un compte</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  placeholder="joueur123"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="joueur@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                >
                  <option value="ROLE_USER">Utilisateur</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Création..." : "Créer"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste utilisateurs */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-medium">
            Utilisateurs
            {users && (
              <span className="text-muted-foreground ml-2 font-normal">
                ({users.length})
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <div className="divide-y">
            {users?.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;
              const isAdmin = user.role === "ROLE_ADMIN";

              return (
                <div
                  key={user.id}
                  className={cn(
                    "px-5 py-4 flex items-center gap-4",
                    !user.is_active && "opacity-50",
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                      isAdmin
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {user.username}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">
                          (vous)
                        </span>
                      )}
                      <Badge
                        variant={isAdmin ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isAdmin ? "Admin" : "User"}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="destructive" className="text-xs">
                          Désactivé
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </span>

                  {/* Actions */}
                  {!isCurrentUser && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle admin */}
                      <button
                        type="button"
                        onClick={() => toggleAdmin(user)}
                        disabled={updateMutation.isPending}
                        title={isAdmin ? "Retirer admin" : "Donner admin"}
                        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                      >
                        {isAdmin ? (
                          <ShieldOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Shield className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Toggle actif */}
                      <button
                        type="button"
                        onClick={() => toggleActive(user)}
                        disabled={updateMutation.isPending}
                        title={user.is_active ? "Désactiver" : "Réactiver"}
                        className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                      >
                        {user.is_active ? (
                          <UserX className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>

                      {/* Supprimer */}
                      {confirmDelete === user.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => deleteMutation.mutate(user.id)}
                            disabled={deleteMutation.isPending}
                            className="text-xs text-destructive hover:underline px-1"
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs text-muted-foreground hover:underline px-1"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(user.id)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
