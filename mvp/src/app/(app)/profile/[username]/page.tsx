"use client";

import { useState } from "react";
import { currentUser, formatNumber } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";

export default function ProfilePage() {
  const user = currentUser;
  const { t } = useLang();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(user.followers);
  const [activeTab, setActiveTab] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const toggleFollow = () => {
    setFollowing(!following);
    setFollowerCount(following ? followerCount - 1 : followerCount + 1);
  };

  const stats = [
    { label: t("posts"), value: "142", icon: "📋" },
    { label: t("repos"), value: "8", icon: "📦" },
    { label: t("channels"), value: "3", icon: "💬" },
    { label: t("sales"), value: "1.2K", icon: "🛒" },
  ];

  const tabs = [t("posts"), t("repos"), t("channels"), t("market"), t("activity")];

  const activity = [
    { icon: "📋", content: t("activity1"), time: "2h ago", likes: 89, replies: 12 },
    { icon: "📦", content: t("activity2"), time: "1d ago", likes: 234, replies: 45 },
    { icon: "💰", content: t("activity3"), time: "3d ago", likes: 567, replies: 89 },
  ];

  return (
    <div>
      <div className="h-32 sm:h-48 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-amber-500/30 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 relative">
        <div className="flex items-end gap-3 sm:gap-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-[var(--background)] flex items-center justify-center text-3xl sm:text-5xl shadow-xl shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 pb-2 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{user.displayName}</h1>
              {user.verified && <span className="text-[var(--primary)] text-base sm:text-xl shrink-0">✓</span>}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
                👑 {t("creator")}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-[var(--muted)]">@{user.username}</div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors">
            {t("editProfile")}
          </button>
          <button
            onClick={toggleFollow}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              following
                ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                : "bg-gradient-to-r from-indigo-500 to-amber-500 text-white hover:opacity-90"
            }`}
          >
            {following ? t("following") : t("follow")}
          </button>
          <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors">
            {t("share")}
          </button>
        </div>

        <p className="text-sm mt-4 leading-relaxed">{user.bio}</p>

        <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-[var(--muted)] flex-wrap">
          <span>📍 {user.location}</span>
          <span>🔗 {user.website}</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-5 mt-4 text-sm">
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(user.following)}</span>
            <span className="text-[var(--muted)] ml-1 text-xs sm:text-sm">{t("following")}</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(followerCount)}</span>
            <span className="text-[var(--muted)] ml-1 text-xs sm:text-sm">{t("followers")}</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(user.reputation)}</span>
            <span className="text-[var(--muted)] ml-1 text-xs sm:text-sm">{t("rep")}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <div className="text-xl sm:text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-base sm:text-lg">{s.value}</div>
              <div className="text-[10px] sm:text-xs text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-6 sm:mt-8 border-b border-[var(--border)] overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 sm:px-5 py-3 text-xs sm:text-sm font-medium relative transition-colors whitespace-nowrap ${
                activeTab === i ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab}
              {activeTab === i && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-amber-500" />
              )}
            </button>
          ))}
        </div>

        <div className="py-4 sm:py-6 space-y-3 sm:space-y-4">
          {activity.map((p, i) => {
            const liked = likedPosts[i] ?? false;
            return (
              <div key={i} className="p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors">
                <div className="flex gap-3">
                  <div className="text-xl sm:text-2xl shrink-0">{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm break-words">{p.content}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted)]">
                      <button
                        onClick={() => setLikedPosts({ ...likedPosts, [i]: !liked })}
                        className={`hover:text-red-400 transition-colors ${liked ? "text-red-400" : ""}`}
                      >
                        {liked ? "❤️" : "🤍"} {liked ? p.likes + 1 : p.likes}
                      </button>
                      <span>💬 {p.replies}</span>
                      <span className="ml-auto">{p.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
