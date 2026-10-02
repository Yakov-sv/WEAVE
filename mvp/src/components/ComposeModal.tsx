"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang-context";
import { currentUser } from "@/lib/mock-data";

interface ComposeModalProps {
  onClose: () => void;
  onPost?: (content: string) => void;
}

export function ComposeModal({ onClose, onPost }: ComposeModalProps) {
  const { t } = useLang();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<"text" | "media" | "code" | "link">("text");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPost?.(content);
    onClose();
  };

  const types = [
    { id: "text" as const, icon: "📝", label: t("text") },
    { id: "media" as const, icon: "🖼️", label: t("media") },
    { id: "code" as const, icon: "📦", label: t("code") },
    { id: "link" as const, icon: "🔗", label: t("link") },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[8vh] px-4 animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-base">{t("newPost")}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)] transition-colors">
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shrink-0">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium mb-2">{currentUser.displayName}</div>
              <textarea
                autoFocus
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("whatsOnYourMind")}
                rows={5}
                className="w-full bg-transparent text-[15px] resize-none focus:outline-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            {types.map((tp) => (
              <button
                key={tp.id}
                onClick={() => setPostType(tp.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  postType === tp.id
                    ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }`}
              >
                <span className="text-base">{tp.icon}</span>
                <span className="hidden sm:inline">{tp.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--muted)]">
            {content.length > 0 && <span>{content.length}/500</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-colors">
              {t("cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("post")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
