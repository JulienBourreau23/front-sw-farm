"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { translations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useLangStore } from "@/store/lang.store";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const { lang, setLang } = useLangStore();
  const t = translations[lang].nav;

  const NAV_LINKS = [
    { href: "/",          label: t.dashboard },
    { href: "/runes",     label: t.runes },
    { href: "/artifacts", label: t.artifacts },
    { href: "/monsters",  label: t.monsters },
    { href: "/import",    label: t.import },
  ];

  function handleLogout() {
    queryClient.clear();
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 max-w-7xl h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm"
          >
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">
              ⚔
            </div>
            SW Farm
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === link.href
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === "ROLE_ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === "/admin"
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {t.admin}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["fr", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "text-xs px-2 py-1 rounded border transition-colors uppercase",
                  lang === l
                    ? "border-primary/50 text-primary bg-primary/10"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l">
            <Link
              href="/profile"
              className={cn(
                "text-xs px-2 py-1 rounded-md transition-colors",
                pathname === "/profile"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {user?.username}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title={t.logout}
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
