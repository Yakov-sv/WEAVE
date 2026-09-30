"use client";

import { currentUser, formatNumber } from "@/lib/mock-data";

export default function ProfilePage() {
  const user = currentUser;

  return (
    <div>
      <div className="h-48 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-amber-500/30 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-16 relative">
        <div className="flex items-end gap-4">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-[var(--background)] flex items-center justify-center text-5xl shadow-xl">
            {user.avatar}
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              {user.verified && <span className="text-[var(--primary)] text-xl">✓</span>}
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                👑 Creator
              </span>
            </div>
            <div className="text-sm text-[var(--muted)]">@{user.username}</div>
          </div>
          <div className="flex gap-2 pb-2">
            <button className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors">
              Edit profile
            </button>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
              Share
            </button>
          </div>
        </div>

        <p className="text-sm mt-4 leading-relaxed">{user.bio}</p>

        <div className="flex items-center gap-4 mt-3 text-sm text-[var(--muted)]">
          <span>📍 {user.location}</span>
          <span>🔗 {user.website}</span>
        </div>

        <div className="flex items-center gap-5 mt-4 text-sm">
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(user.following)}</span>
            <span className="text-[var(--muted)] ml-1">Following</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(user.followers)}</span>
            <span className="text-[var(--muted)] ml-1">Followers</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold">{formatNumber(user.reputation)}</span>
            <span className="text-[var(--muted)] ml-1">Reputation</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {[
            { label: "Posts", value: "142", icon: "📋" },
            { label: "Repos", value: "8", icon: "📦" },
            { label: "Channels", value: "3", icon: "💬" },
            { label: "Sales", value: "1.2K", icon: "🛒" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-lg">{s.value}</div>
              <div className="text-xs text-[var(--muted)]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-8 border-b border-[var(--border)]">
          {["Posts", "Repos", "Channels", "Market", "Activity"].map((tab, i) => (
            <button
              key={tab}
              className={`px-5 py-3 text-sm font-medium relative transition-colors ${
                i === 0 ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab}
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-amber-500" />
              )}
            </button>
          ))}
        </div>

        <div className="py-6 space-y-4">
          {[
            { icon: "📋", content: "Just shipped a new feature for WEAVE — real-time messaging is now 2x faster! ⚡", time: "2h ago", likes: 89, replies: 12 },
            { icon: "📦", content: "New repo: weave-sdk — Official WEAVE SDK for JavaScript/TypeScript. Build plugins and integrations.", time: "1d ago", likes: 234, replies: 45 },
            { icon: "💰", content: "My Premium channel now has 890 subscribers! Thank you all for the support 🙏", time: "3d ago", likes: 567, replies: 89 },
          ].map((p, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border)] transition-colors">
              <div className="flex gap-3">
                <div className="text-2xl">{p.icon}</div>
                <div className="flex-1">
                  <div className="text-sm">{p.content}</div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--muted)]">
                    <span>❤️ {p.likes}</span>
                    <span>💬 {p.replies}</span>
                    <span className="ml-auto">{p.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
