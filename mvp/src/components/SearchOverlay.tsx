"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { posts, repositories, listings, users, formatNumber } from "@/lib/mock-data";

interface SearchOverlayProps {
  query: string;
  setQuery: (q: string) => void;
  onClose: () => void;
}

export function SearchOverlay({ query, setQuery, onClose }: SearchOverlayProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<"all" | "posts" | "repos" | "market" | "people">("all");

  const q = query.toLowerCase().trim();

  const results = useMemo(() => {
    if (!q) return { posts: [], repos: [], market: [], people: [] };
    return {
      posts: posts.filter((p) => p.content.toLowerCase().includes(q) || p.topics.some((t) => t.toLowerCase().includes(q))),
      repos: repositories.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)),
      market: listings.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)),
      people: users.filter((u) => u.displayName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)),
    };
  }, [q]);

  const totalCount = results.posts.length + results.repos.length + results.market.length + results.people.length;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const tabs = [
    { id: "all" as const, label: t("all"), count: totalCount },
    { id: "posts" as const, label: t("posts"), count: results.posts.length },
    { id: "repos" as const, label: t("repos"), count: results.repos.length },
    { id: "market" as const, label: t("market"), count: results.market.length },
    { id: "people" as const, label: t("people"), count: results.people.length },
  ];

  const showTab = (tab: string) => activeTab === "all" || activeTab === tab;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <span className="text-[var(--muted)] text-lg">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-[var(--muted)]"
          />
          <button onClick={onClose} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
            ESC
          </button>
        </div>

        {q && (
          <>
            <div className="flex gap-1 px-3 pt-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && <span className="text-[10px] opacity-70">{tab.count}</span>}
                </button>
              ))}
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3">
              {totalCount === 0 ? (
                <div className="text-center py-12 text-[var(--muted)] text-sm">
                  {t("noResults")} &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="space-y-1">
                  {showTab("people") && results.people.map((u) => (
                    <Link
                      key={u.id}
                      href={`/profile/${u.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                        {u.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium flex items-center gap-1">
                          {u.displayName}
                          {u.verified && <span className="text-[var(--primary)] text-xs">✓</span>}
                        </div>
                        <div className="text-xs text-[var(--muted)]">@{u.username} · {formatNumber(u.followers)} {t("followers")}</div>
                      </div>
                    </Link>
                  ))}

                  {showTab("posts") && results.posts.map((p) => (
                    <Link
                      key={p.id}
                      href="/feed"
                      onClick={onClose}
                      className="flex gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                        {p.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[var(--muted)] mb-0.5">{p.author.displayName}</div>
                        <div className="text-sm line-clamp-2">{p.content}</div>
                      </div>
                    </Link>
                  ))}

                  {showTab("repos") && results.repos.map((r) => (
                    <Link
                      key={r.id}
                      href="/repos"
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                        📦
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium font-mono truncate">{r.name}</div>
                        <div className="text-xs text-[var(--muted)] line-clamp-1">{r.description}</div>
                      </div>
                      <div className="text-xs text-[var(--muted)] shrink-0">⭐ {formatNumber(r.stars)}</div>
                    </Link>
                  ))}

                  {showTab("market") && results.market.map((l) => (
                    <Link
                      key={l.id}
                      href="/market"
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                        {l.coverImage}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{l.title}</div>
                        <div className="text-xs text-[var(--muted)]">@{l.seller.username}</div>
                      </div>
                      <div className="text-sm font-bold shrink-0">${(l.price / 100).toFixed(2)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!q && (
          <div className="p-8 text-center text-[var(--muted)] text-sm">
            <div className="text-4xl mb-3">🔍</div>
            {t("searchHint")}
          </div>
        )}
      </div>
    </div>
  );
}
