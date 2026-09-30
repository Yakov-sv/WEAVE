"use client";

import { useState } from "react";
import { conversations, messages, channelPosts, users, formatNumber, timeAgo } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";

export default function MessagesPage() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<"messages" | "posts">("messages");
  const { t } = useLang();

  const activeConv = activeId ? conversations.find((c) => c.id === activeId) : null;
  const convMessages = activeId ? (messages[activeId] || []) : [];
  const convChannelPosts = activeId ? (channelPosts[activeId] || []) : [];

  const handleSelect = (id: string) => {
    setActiveId(id);
    const conv = conversations.find((c) => c.id === id);
    setView(conv?.type === "channel" ? "posts" : "messages");
  };

  const handleBack = () => {
    setActiveId(null);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list */}
      <div className={`${activeId ? "hidden md:flex" : "flex"} w-full md:w-72 md:shrink-0 border-r border-[var(--border)] overflow-y-auto flex-col`}>
        <div className="p-4 border-b border-[var(--border)] shrink-0">
          <h2 className="font-bold text-lg">{t("messagesTitle")}</h2>
          <div className="flex gap-1 mt-2">
            <button className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary)]/15 text-[var(--primary-hover)]">{t("all")}</button>
            <button className="text-xs px-2.5 py-1 rounded-full text-[var(--muted)] hover:bg-[var(--surface)]">{t("channels")}</button>
            <button className="text-xs px-2.5 py-1 rounded-full text-[var(--muted)] hover:bg-[var(--surface)]">{t("dms")}</button>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)] flex-1">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              className={`w-full p-4 flex gap-3 hover:bg-[var(--surface-hover)] transition-colors text-left ${
                activeId === conv.id ? "bg-[var(--surface)]" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl shrink-0">
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm truncate">{conv.title}</span>
                  {conv.verified && <span className="text-[var(--primary)] text-xs shrink-0">✓</span>}
                  {conv.isPaid && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
                      ${conv.subscriptionPrice}/mo
                    </span>
                  )}
                  {conv.unread ? (
                    <span className="ml-auto w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
                  ) : null}
                </div>
                <div className="text-xs text-[var(--muted)] truncate mt-0.5">{conv.lastMessage}</div>
                <div className="text-[10px] text-[var(--muted)] mt-1">
                  {timeAgo(conv.lastMessageAt || "")}
                  {conv.subscriberCount && ` · ${formatNumber(conv.subscriberCount)} ${t("subscribers")}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${activeId ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}>
        {activeConv && (
          <>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-[var(--border)] flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={handleBack}
                className="md:hidden w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm hover:bg-[var(--surface-hover)] transition-colors shrink-0"
              >
                ←
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-lg sm:text-xl shrink-0">
                {activeConv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm sm:text-base truncate">{activeConv.title}</span>
                  {activeConv.verified && <span className="text-[var(--primary)] text-sm shrink-0">✓</span>}
                  {activeConv.isPaid && (
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
                      💎 ${activeConv.subscriptionPrice}/mo
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--muted)] truncate">
                  {activeConv.type === "channel"
                    ? `${formatNumber(activeConv.subscriberCount || 0)} ${t("subscribers")}`
                    : `${activeConv.memberCount} ${t("members")}`}
                </div>
              </div>
              {activeConv.type === "channel" && (
                <div className="flex bg-[var(--surface)] rounded-lg p-0.5 border border-[var(--border)] shrink-0">
                  <button
                    onClick={() => setView("posts")}
                    className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors ${view === "posts" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
                  >
                    {t("posts")}
                  </button>
                  <button
                    onClick={() => setView("messages")}
                    className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors ${view === "messages" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]"}`}
                  >
                    {t("chat")}
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            {view === "messages" ? (
              <>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                  {convMessages.map((msg) => {
                    const sender = users.find((u) => u.id === msg.senderId);
                    const isMe = msg.senderId === "u1";
                    return (
                      <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                        {!isMe && (
                          <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                            {sender?.avatar}
                          </div>
                        )}
                        <div className={`max-w-[75%] sm:max-w-md ${isMe ? "items-end" : ""}`}>
                          <div className={`px-3.5 py-2.5 rounded-2xl text-sm break-words ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-md"
                              : "bg-[var(--surface)] border border-[var(--border)] rounded-bl-md"
                          }`}>
                            {msg.content}
                          </div>
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                              {msg.reactions.map((r, i) => (
                                <span key={i} className={`text-xs px-1.5 py-0.5 rounded-full border ${r.reacted ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)]"} bg-[var(--surface)]`}>
                                  {r.emoji} {r.count}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className={`text-[10px] text-[var(--muted)] mt-1 ${isMe ? "text-right" : ""}`}>
                            {timeAgo(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 sm:p-4 border-t border-[var(--border)] shrink-0">
                  <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3 sm:px-4 py-2.5">
                    <input
                      placeholder={t("typeMessage")}
                      className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-[var(--muted)] min-w-0"
                    />
                    <button className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg shrink-0">😊</button>
                    <button className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg shrink-0">📎</button>
                    <button className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium shrink-0">
                      {t("send")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4">
                  {convChannelPosts.map((cp) => (
                    <div key={cp.id} className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-fade-in">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-base shrink-0">
                          {activeConv.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{activeConv.title}</div>
                          <div className="text-xs text-[var(--muted)]">{timeAgo(cp.createdAt)}</div>
                        </div>
                        {cp.isPaywall && (
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 shrink-0">
                            🔒 {t("premium")}
                          </span>
                        )}
                      </div>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{cp.content}</div>
                      <div className="flex items-center gap-3 sm:gap-4 mt-4 text-xs text-[var(--muted)]">
                        <span>👁 {formatNumber(cp.views)}</span>
                        <span>❤️ {cp.reactions}</span>
                        <span>💬 {t("reply")}</span>
                        <span className="ml-auto">🔁 {t("share")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
