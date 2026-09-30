"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/feed", label: "Feed", icon: "📋" },
  { href: "/messages", label: "Messages", icon: "💬", badge: 3 },
  { href: "/repos", label: "Repositories", icon: "📦" },
  { href: "/market", label: "Market", icon: "🛒" },
  { href: "/profile/you", label: "Profile", icon: "🧑‍💻" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
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
          href="/market"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span>💰</span>
          <span>Monetize</span>
        </Link>
        <div className="mt-3 px-3 text-[10px] text-[var(--muted)]">
          WEAVE MVP v0.3.0 — Pre-alpha
        </div>
      </div>
    </aside>
  );
}
