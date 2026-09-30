"use client";

import { useState } from "react";
import { repositories, formatNumber, timeAgo } from "@/lib/mock-data";
import type { Repository } from "@/lib/types";
import { useLang } from "@/lib/lang-context";

const langColors: Record<string, string> = {
  Rust: "#dea584",
  Go: "#00ADD8",
  TypeScript: "#3178c6",
  Lua: "#000080",
  Python: "#3572A5",
};

function RepoCard({ repo, onClick }: { repo: Repository; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all text-left hover:scale-[1.01]"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-[var(--muted)] truncate">{repo.owner.username}/</span>
            <span className="font-semibold text-[var(--foreground)] text-sm sm:text-base">{repo.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
              repo.visibility === "public" ? "bg-green-500/15 text-green-400" :
              repo.visibility === "private" ? "bg-gray-500/15 text-gray-400" :
              "bg-amber-500/15 text-amber-400"
            }`}>
              {repo.visibility === "paid" ? `💰 $${repo.subscriptionPrice}/mo` : repo.visibility}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 line-clamp-2">{repo.description}</p>
          <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs text-[var(--muted)] flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColors[repo.language] || "#888" }} />
              {repo.language}
            </span>
            <span>⭐ {formatNumber(repo.stars)}</span>
            <span>🔄 {formatNumber(repo.forks)}</span>
            <span className="hidden sm:inline">Updated {timeAgo(repo.updatedAt)} ago</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {repo.topics.slice(0, 4).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-hover)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

function RepoDetail({ repo, onBack }: { repo: Repository; onBack: () => void }) {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [showFiles, setShowFiles] = useState(false);
  const { t } = useLang();

  const files = [
    { name: "src", icon: "📁", isDir: true },
    { name: "src/parser.rs", icon: "📄", isDir: false, indent: true },
    { name: "src/lib.rs", icon: "📄", isDir: false, indent: true },
    { name: "Cargo.toml", icon: "📄", isDir: false },
    { name: "README.md", icon: "📄", isDir: false },
  ];

  return (
    <div>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)]">
        <button onClick={onBack} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
          {t("backToRepos")}
        </button>
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-2xl sm:text-3xl shrink-0">
            📦
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-[var(--muted)] truncate">{repo.owner.username}/</span>
              <h1 className="text-lg sm:text-xl font-bold truncate">{repo.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                repo.visibility === "public" ? "bg-green-500/15 text-green-400" :
                repo.visibility === "paid" ? "bg-amber-500/15 text-amber-400" : "bg-gray-500/15 text-gray-400"
              }`}>
                {repo.visibility}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">{repo.description}</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button className="flex items-center gap-1.5 text-xs sm:text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                ⭐ {t("star")} <span className="font-semibold ml-1">{formatNumber(repo.stars)}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs sm:text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                🔄 {t("fork")} <span className="font-semibold ml-1">{formatNumber(repo.forks)}</span>
              </button>
              {repo.visibility === "paid" && (
                <button className="ml-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium">
                  💰 {t("subscribeRepo")} ${repo.subscriptionPrice}/mo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* File tree — sidebar on desktop, drawer on mobile */}
        <div className={`absolute md:relative z-40 inset-0 md:inset-auto bg-[var(--background)] md:bg-transparent ${showFiles ? "block" : "hidden md:block"}`}>
          <div className="w-full md:w-64 shrink-0 border-r border-[var(--border)] p-3 h-full md:h-auto overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider px-2">{t("files")}</div>
              <button onClick={() => setShowFiles(false)} className="md:hidden text-[var(--muted)] text-sm px-2">✕</button>
            </div>
            <div className="space-y-0.5">
              <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2">
                <span>📁</span> src
              </button>
              {files.filter(f => f.indent).map((f) => (
                <button
                  key={f.name}
                  onClick={() => { setActiveFile(f.name); setShowFiles(false); }}
                  className={`w-full text-left px-6 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2 text-[var(--muted)] ${activeFile === f.name ? "bg-[var(--surface)] text-[var(--foreground)]" : ""}`}
                >
                  <span>{f.icon}</span> {f.name.split("/").pop()}
                </button>
              ))}
              {files.filter(f => !f.indent).map((f) => (
                <button
                  key={f.name}
                  onClick={() => { setActiveFile(f.name); setShowFiles(false); }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2 ${activeFile === f.name ? "bg-[var(--surface)] text-[var(--foreground)]" : "text-[var(--muted)]"}`}
                >
                  <span>{f.icon}</span> {f.name}
                </button>
              ))}
            </div>

            <div className="mt-6 px-2">
              <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">{t("about")}</div>
              <div className="text-xs text-[var(--muted)] space-y-1.5">
                <div>📜 {repo.license || t("noLicense")}</div>
                <div>⭐ {formatNumber(repo.stars)} {t("stars")}</div>
                <div>🔄 {formatNumber(repo.forks)} {t("forks")}</div>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {repo.topics.map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-hover)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto min-w-0">
          {activeFile ? (
            <div>
              <div className="px-3 sm:px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-2 text-sm text-[var(--muted)]">
                <button onClick={() => setShowFiles(true)} className="md:hidden text-[var(--foreground)] hover:text-[var(--primary)] shrink-0">
                  📁
                </button>
                <span>📄</span>
                <span className="font-mono text-xs sm:text-sm truncate">{activeFile}</span>
              </div>
              <pre className="p-3 sm:p-4 text-xs sm:text-sm font-mono text-[var(--foreground)] overflow-x-auto leading-relaxed">
                <code>{activeFile === "src/parser.rs" ? `use std::io::Cursor;
use memmap2::Mmap;

/// Zero-copy JSON parser using memory-mapped buffers.
/// 3x faster than serde_json on large payloads.
pub struct FastJsonParser<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> FastJsonParser<'a> {
    pub fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    pub fn parse(&mut self) -> Result<JsonValue, ParseError> {
        self.skip_whitespace();
        self.parse_value()
    }

    fn parse_value(&mut self) -> Result<JsonValue, ParseError> {
        match self.peek_byte() {
            Some(b'{') => self.parse_object(),
            Some(b'[') => self.parse_array(),
            Some(b'"') => self.parse_string().map(JsonValue::String),
            Some(b't') | Some(b'f') => self.parse_bool(),
            Some(b'n') => self.parse_null(),
            Some(c) if c.is_ascii_digit() || c == b'-' => self.parse_number(),
            _ => Err(ParseError::UnexpectedToken),
        }
    }
}` : activeFile === "Cargo.toml" ? `[package]
name = "fast-json"
version = "0.3.0"
edition = "2021"
license = "MIT"

[dependencies]
memmap2 = "0.9"` : activeFile === "README.md" ? `# fast-json

Blazing-fast JSON parser for Rust. 3x faster than serde_json.

## Usage

let data = b'{"name": "WEAVE"}';
let mut parser = FastJsonParser::new(data);
let value = parser.parse().unwrap();` : `pub mod parser;
pub mod value;
pub mod error;

pub use parser::FastJsonParser;
pub use value::JsonValue;
pub use error::ParseError;`}</code>
              </pre>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
                <h3 className="font-semibold mb-2">{t("readme")}</h3>
                <p className="text-sm text-[var(--muted)]">{repo.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {repo.topics.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-hover)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
                  <div className="text-lg sm:text-2xl font-bold">{formatNumber(repo.stars)}</div>
                  <div className="text-xs text-[var(--muted)]">{t("stars")}</div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
                  <div className="text-lg sm:text-2xl font-bold">{formatNumber(repo.forks)}</div>
                  <div className="text-xs text-[var(--muted)]">{t("forks")}</div>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
                  <div className="text-lg sm:text-2xl font-bold truncate">{repo.license || "—"}</div>
                  <div className="text-xs text-[var(--muted)]">License</div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="text-sm font-medium mb-3">{t("recentActivity")}</div>
                <div className="space-y-2 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    Push to main · 3 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    PR #42 merged · 5 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    New release v0.3.0 · 1 day ago
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReposPage() {
  const [selected, setSelected] = useState<Repository | null>(null);
  const [filter, setFilter] = useState<"all" | "public" | "paid" | "mine">("all");
  const { t } = useLang();

  const filtered = repositories.filter((r) => {
    if (filter === "public") return r.visibility === "public";
    if (filter === "paid") return r.visibility === "paid";
    if (filter === "mine") return r.owner.username === "you";
    return true;
  });

  if (selected) {
    return <RepoDetail repo={selected} onBack={() => setSelected(null)} />;
  }

  const filters = [
    { id: "all" as const, label: t("all") },
    { id: "public" as const, label: t("public") },
    { id: "paid" as const, label: t("paid") + " 💰" },
    { id: "mine" as const, label: t("myRepos") },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">{t("repositories")}</h1>
        <button className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity">
          {t("newRepo")}
        </button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map((repo) => (
          <RepoCard key={repo.id} repo={repo} onClick={() => setSelected(repo)} />
        ))}
      </div>
    </div>
  );
}
