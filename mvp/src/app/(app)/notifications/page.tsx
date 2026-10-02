"use client";

import { useState } from "react";
import { notifications as initialNotifications, timeAgo } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";

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

const notifColors: Record<string, string> = {
  like: "text-red-400",
  reply: "text-blue-400",
  follow: "text-green-400",
  subscribe: "text-amber-400",
  purchase: "text-purple-400",
  tip: "text-green-400",
  repo: "text-indigo-400",
  mention: "text-orange-400",
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { t } = useLang();

  const filtered = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t("notifications")}</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs sm:text-sm text-[var(--primary-hover)] hover:underline">
            {t("markAllRead")}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === "all"
              ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("all")}
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
            filter === "unread"
              ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {t("unread")}
          {unreadCount > 0 && (
            <span className="bg-[var(--accent)] text-black text-[10px] px-1.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted)]">
          <div className="text-5xl mb-4">🔔</div>
          <div className="text-sm">{t("noNotifications")}</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 p-3 sm:p-4 rounded-2xl border transition-colors cursor-pointer hover:bg-[var(--surface-hover)] ${
                !n.read
                  ? "bg-[var(--primary)]/5 border-[var(--primary)]/30"
                  : "bg-[var(--surface)] border-[var(--border)]"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-lg">
                  {n.user.avatar}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xs">
                  {notifIcons[n.type]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-snug">
                  <span className="font-semibold">{n.user.displayName}</span>
                  <span className="text-[var(--muted)]"> {n.text}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-medium ${notifColors[n.type]}`}>
                    {notifIcons[n.type]} {t(`notif_${n.type}`)}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">·</span>
                  <span className="text-[10px] text-[var(--muted)]">{timeAgo(n.createdAt)}</span>
                </div>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
