"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { notifications as initialNotifications, timeAgo } from "@/lib/mock-data";
import { SearchOverlay } from "./SearchOverlay";

const notifIcons: Record<string, string> = {
  like: "❤️",
  reply: "💬",
  follow: "➕",
  subscribe: "💎",
  purchase: "🛒",
  tip: "💰",
  repo: "📦",
  mention: "📣",
};

export function Topbar() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const { lang, toggleLang, t, theme, toggleTheme } = useLang();

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOverlayOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const openSearch = () => {
    setSearchOpen(false);
    setSearchOverlayOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 glass border-b border-[var(--border)] px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-4">
        <Link href="/" className="md:hidden flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
        </Link>

        <div className={`flex-1 max-w-md relative ${searchOpen ? "block" : "hidden sm:block"}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm pointer-events-none">
            🔍
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={openSearch}
            placeholder={t("search")}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl pl-9 pr-12 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors cursor-pointer"
            readOnly
          />
          <button
            onClick={openSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] border border-[var(--border)] rounded px-1.5 py-0.5 hidden sm:block"
          >
            ⌘K
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <button
            onClick={openSearch}
            className={`sm:hidden w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base hover:bg-[var(--surface-hover)] transition-colors ${searchOpen ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}
          >
            {searchOpen ? "✕" : "🔍"}
          </button>

        <button
          onClick={toggleLang}
          className="px-2.5 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs font-bold hover:bg-[var(--surface-hover)] transition-colors text-[var(--primary-hover)]"
        >
          {lang === "ru" ? "RU" : "EN"}
        </button>

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base hover:bg-[var(--surface-hover)] transition-colors"
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base hover:bg-[var(--surface-hover)] transition-colors"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full text-[10px] flex items-center justify-center font-bold text-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-fade-in z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <span className="font-semibold text-sm">{t("notifications")}</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[var(--primary-hover)] hover:underline">
                      {t("markAllRead")}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border)]">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 p-3 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${!n.read ? "bg-[var(--primary)]/5" : ""}`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-base">
                          {n.user.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[10px]">
                          {notifIcons[n.type]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm leading-snug">
                          <span className="font-semibold">{n.user.displayName}</span>
                          <span className="text-[var(--muted)]"> {n.text}</span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1">{timeAgo(n.createdAt)}</div>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-[var(--border)]">
                  <Link href="/notifications" onClick={() => setNotifOpen(false)} className="w-full text-center text-xs text-[var(--primary-hover)] hover:underline py-1.5 block">
                    {t("viewAllNotifications")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/profile/you" className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base cursor-pointer">
            🧑‍💻
          </Link>
        </div>
      </header>

      {searchOverlayOpen && (
        <SearchOverlay
          query={query}
          setQuery={setQuery}
          onClose={() => setSearchOverlayOpen(false)}
        />
      )}
    </>
  );
}
