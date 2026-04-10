"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useLanguage } from "@/context/LanguageContext";
import { Compass, LogOut } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { language, changeLanguage, t } = useLanguage();

  if (!session || pathname === '/' || pathname.startsWith('/odilon')) return null;

  const NavItem = ({ href, label }: { href: string; label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "px-4 py-2 rounded-lg transition-colors duration-200 font-label",
          isActive
            ? "bg-primary text-on-primary"
            : "text-on-surface/60 hover:text-primary hover:bg-surface-container-high",
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-surface-container-low/80 backdrop-blur-md sticky top-0 z-50" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/favorites" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Compass className="w-6 h-6 text-on-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-headline">
                ContentCompass
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <NavItem href="/favorites" label={t("favorites")} />
              <NavItem href="/discover" label={t("discover")} />
              <NavItem href="/saved" label={t("saved")} />
              <NavItem href="/library" label={t("library")} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-surface-container p-1 rounded-xl border border-outline-variant">
              <button
                onClick={() => changeLanguage("EN")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 font-label",
                  language === "EN"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface/50 hover:text-primary",
                )}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("TR")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 font-label",
                  language === "TR"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface/50 hover:text-primary",
                )}
              >
                TR
              </button>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm text-on-surface/60 font-body">{t("email")}</span>
              <span className="text-sm font-medium text-on-surface font-label">
                {session.user?.email}
              </span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors"
              title={t("signOut")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
