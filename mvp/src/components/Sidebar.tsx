"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/lib/lang-context";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLang();

  const navItems = [
    { href: "/feed", label: t("feed"), icon: "📋" },
    { href: "/messages", label: t("messages"), icon: "💬", badge: 3 },
    { href: "/repos", label: t("repos"), icon: "📦" },
    { href: "/market", label: t("market"), icon: "🛒" },
    { href: "/profile/you", label: t("profile"), icon: "🧑‍💻" },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] h-screen sticky top-0">
        <div className="p-5 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
              W
            </div>
            <div>
              <div className="font-bold text-lg leading-none">WEAVE</div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">where everything connects</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-[var(--primary)] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-2 ${
              pathname === "/settings"
                ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span>{t("settings")}</span>
          </Link>
          <Link
            href="/market"
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span>💰</span>
            <span>{t("monetize")}</span>
          </Link>
          <div className="mt-3 px-3 text-[10px] text-[var(--muted)]">
            {t("preAlpha")}
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border)] flex items-center justify-around px-2 py-1.5 pb-[calc(1.5px+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors relative ${
                active
                  ? "text-[var(--primary-hover)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[9px] px-1 rounded-full min-w-[16px] text-center leading-tight">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
