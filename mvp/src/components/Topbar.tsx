"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";

export function Topbar() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-4">
      {/* Mobile logo */}
      <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
          W
        </div>
      </Link>

      {/* Search */}
      <div className={`flex-1 max-w-md relative ${searchOpen ? "block" : "hidden sm:block"}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm pointer-events-none">
          🔍
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
        {/* Mobile search toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className={`sm:hidden w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base hover:bg-[var(--surface-hover)] transition-colors ${searchOpen ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
        >
          {searchOpen ? "✕" : "🔍"}
        </button>

        {/* Language switcher */}
        <button
          onClick={toggleLang}
          className="px-2.5 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-bold hover:bg-[var(--surface-hover)] transition-colors text-[var(--primary-hover)]"
        >
          {lang === "ru" ? "RU" : "EN"}
        </button>

        <button className="relative w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base hover:bg-[var(--surface-hover)] transition-colors">
          🔔
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full text-[10px] flex items-center justify-center font-bold text-black">
            5
          </span>
        </button>
        <Link href="/profile/you" className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base cursor-pointer">
          🧑‍💻
        </Link>
      </div>
    </header>
  );
}
