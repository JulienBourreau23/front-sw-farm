"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const NAV_LINKS = [
  { href: "/", label: { fr: "Dashboard", en: "Dashboard" } },
  { href: "/runes", label: { fr: "Runes", en: "Runes" } },
  { href: "/import", label: { fr: "Import", en: "Import" } },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [lang, setLang] = useState<"fr" | "en">("fr");

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 max-w-7xl h-14 flex items-center justify-between">
        {/* Logo */}
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

          {/* Nav links */}
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
                {link.label[lang]}
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
                {lang === "fr" ? "Admin" : "Admin"}
              </Link>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Lang toggle */}
          <div className="flex gap-1">
            {(["fr", "en"] as const).map((l) => (
              <button
                type="button"
                key={l}
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

          {/* Theme toggle */}
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

          {/* User + logout */}
          <div className="flex items-center gap-2 pl-2 border-l">
            <span className="text-xs text-muted-foreground">
              {user?.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
