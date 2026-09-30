"use client";

import { useState } from "react";
import { posts as initialPosts, formatNumber, timeAgo } from "@/lib/mock-data";
import type { Post } from "@/lib/types";

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [bookmarked, setBookmarked] = useState(post.bookmarked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="p-5 hover:bg-[var(--surface-hover)] transition-colors animate-fade-in">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
          {post.author.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold truncate">{post.author.displayName}</span>
            {post.author.verified && <span className="text-[var(--primary)] text-xs">✓</span>}
            <span className="text-[var(--muted)]">@{post.author.username}</span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--muted)]">{timeAgo(post.createdAt)}</span>
            {post.type === "code" && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                CODE
              </span>
            )}
            {post.type === "media" && (
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium">
                MEDIA
              </span>
            )}
          </div>

          <div className="mt-2 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</div>

          {post.codeRef && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)]">
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface)] border-b border-[var(--border)] text-xs text-[var(--muted)]">
                <span>📦</span>
                <span className="font-mono">{post.codeRef.repo}</span>
                <span>·</span>
                <span className="font-mono">{post.codeRef.file}</span>
                <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">
                  {post.codeRef.language}
                </span>
              </div>
              <pre className="p-3 text-xs font-mono text-[var(--muted)] overflow-x-auto">
                <code>{`// Zero-copy JSON parser
pub fn parse(&mut self) -> Result<JsonValue, ParseError> {
    self.skip_whitespace();
    self.parse_value()
}`}</code>
              </pre>
            </div>
          )}

          {post.media && post.media.length > 0 && (
            <div className={`mt-3 grid gap-1 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
              {post.media.map((m, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-4xl hover:bg-[var(--surface-hover)] transition-colors"
                >
                  {m}
                </div>
              ))}
            </div>
          )}

          {post.linkPreview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer">
              <div className="aspect-[2:1] bg-[var(--background)] flex items-center justify-center text-5xl">
                {post.linkPreview.image}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm">{post.linkPreview.title}</div>
                <div className="text-xs text-[var(--muted)] mt-1">{post.linkPreview.description}</div>
              </div>
            </div>
          )}

          {post.topics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.topics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-hover)] hover:bg-[var(--primary)]/20 cursor-pointer transition-colors">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-5 text-[var(--muted)]">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm hover:text-red-400 transition-colors ${liked ? "text-red-400" : ""}`}
            >
              <span className="text-base">{liked ? "❤️" : "🤍"}</span>
              <span>{formatNumber(likeCount)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-blue-400 transition-colors">
              <span className="text-base">💬</span>
              <span>{formatNumber(post.replies)}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-green-400 transition-colors">
              <span className="text-base">🔁</span>
              <span>{formatNumber(post.reposts)}</span>
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex items-center gap-1.5 text-sm hover:text-amber-400 transition-colors ml-auto ${bookmarked ? "text-amber-400" : ""}`}
            >
              <span className="text-base">{bookmarked ? "🔖" : "📑"}</span>
              <span>{formatNumber(post.bookmarks)}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const [posts] = useState(initialPosts);
  const [tab, setTab] = useState<"for-you" | "following" | "discover">("for-you");

  return (
    <div>
      <div className="sticky top-0 z-10 glass border-b border-[var(--border)]">
        <div className="flex items-center px-4">
          {[
            { id: "for-you", label: "For You" },
            { id: "following", label: "Following" },
            { id: "discover", label: "Discover" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-5 py-3.5 text-sm font-medium relative transition-colors ${
                tab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-amber-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0">
              🧑‍💻
            </div>
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                rows={2}
                className="w-full bg-transparent text-[15px] resize-none focus:outline-none placeholder:text-[var(--muted)]"
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3 text-[var(--muted)]">
                  <button className="hover:text-[var(--foreground)] transition-colors text-lg">📝</button>
                  <button className="hover:text-[var(--foreground)] transition-colors text-lg">🖼️</button>
                  <button className="hover:text-[var(--foreground)] transition-colors text-lg">📦</button>
                  <button className="hover:text-[var(--foreground)] transition-colors text-lg">🔗</button>
                </div>
                <button className="px-5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        <div className="p-8 text-center text-[var(--muted)] text-sm">
          You're all caught up! 🎉
        </div>
      </div>
    </div>
  );
}
