"use client";

import { useState } from "react";

export function Topbar() {
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-20 glass border-b border-[var(--border)] px-4 py-3 flex items-center gap-4">
      <div className="flex-1 max-w-md relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">
          🔍
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, repos, people, market..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="md:hidden w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg">
          🧵
        </button>
        <button className="relative w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg hover:bg-[var(--surface-hover)] transition-colors">
          🔔
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full text-[10px] flex items-center justify-center font-bold text-black">
            5
          </span>
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg cursor-pointer">
          🧑‍💻
        </div>
      </div>
    </header>
  );
}
