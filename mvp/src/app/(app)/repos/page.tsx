"use client";

import { useState } from "react";
import { repositories, formatNumber, timeAgo } from "@/lib/mock-data";
import type { Repository } from "@/lib/types";

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
      className="w-full p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all text-left hover:scale-[1.01]"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted)]">{repo.owner.username}/</span>
            <span className="font-semibold text-[var(--foreground)]">{repo.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              repo.visibility === "public" ? "bg-green-500/15 text-green-400" :
              repo.visibility === "private" ? "bg-gray-500/15 text-gray-400" :
              "bg-amber-500/15 text-amber-400"
            }`}>
              {repo.visibility === "paid" ? `💰 $${repo.subscriptionPrice}/mo` : repo.visibility}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)] mt-1.5 line-clamp-2">{repo.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColors[repo.language] || "#888" }} />
              {repo.language}
            </span>
            <span>⭐ {formatNumber(repo.stars)}</span>
            <span>🔄 {formatNumber(repo.forks)}</span>
            <span>Updated {timeAgo(repo.updatedAt)} ago</span>
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

  return (
    <div>
      <div className="p-5 border-b border-[var(--border)]">
        <button onClick={onBack} className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
          ← Back to repositories
        </button>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-3xl">
            📦
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--muted)]">{repo.owner.username}/</span>
              <h1 className="text-xl font-bold">{repo.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                repo.visibility === "public" ? "bg-green-500/15 text-green-400" :
                repo.visibility === "paid" ? "bg-amber-500/15 text-amber-400" : "bg-gray-500/15 text-gray-400"
              }`}>
                {repo.visibility}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] mt-1">{repo.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <button className="flex items-center gap-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                ⭐ Star <span className="font-semibold ml-1">{formatNumber(repo.stars)}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                🔄 Fork <span className="font-semibold ml-1">{formatNumber(repo.forks)}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                👁 Watch <span className="font-semibold ml-1">{formatNumber(repo.watchers)}</span>
              </button>
              {repo.visibility === "paid" && (
                <button className="ml-auto px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium">
                  💰 Subscribe ${repo.subscriptionPrice}/mo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 shrink-0 border-r border-[var(--border)] p-3">
          <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2 px-2">Files</div>
          <div className="space-y-0.5">
            <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2">
              <span>📁</span> src
            </button>
            <button onClick={() => setActiveFile("src/parser.rs")} className="w-full text-left px-6 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2 text-[var(--muted)]">
              <span>📄</span> parser.rs
            </button>
            <button onClick={() => setActiveFile("src/lib.rs")} className="w-full text-left px-6 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2 text-[var(--muted)]">
              <span>📄</span> lib.rs
            </button>
            <button onClick={() => setActiveFile("Cargo.toml")} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2">
              <span>📄</span> Cargo.toml
            </button>
            <button onClick={() => setActiveFile("README.md")} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[var(--surface)] text-sm flex items-center gap-2">
              <span>📄</span> README.md
            </button>
          </div>

          <div className="mt-6 px-2">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">About</div>
            <div className="text-xs text-[var(--muted)] space-y-1.5">
              <div>📜 {repo.license || "No license"}</div>
              <div>⭐ {formatNumber(repo.stars)} stars</div>
              <div>🔄 {formatNumber(repo.forks)} forks</div>
              <div>👁 {formatNumber(repo.watchers)} watching</div>
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

        <div className="flex-1 overflow-auto">
          {activeFile ? (
            <div>
              <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center gap-2 text-sm text-[var(--muted)]">
                <span>📄</span>
                <span className="font-mono">{activeFile}</span>
              </div>
              <pre className="p-4 text-sm font-mono text-[var(--foreground)] overflow-x-auto leading-relaxed">
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
memmap2 = "0.9"` : activeFile === "README.md" ? `# fast-json ⚡

Blazing-fast JSON parser for Rust. 3x faster than serde_json.

## Usage

\`\`\`rust
use fast_json::FastJsonParser;

let data = b'{"name": "WEAVE"}';
let mut parser = FastJsonParser::new(data);
let value = parser.parse().unwrap();
\`\`\`` : `pub mod parser;
pub mod value;
pub mod error;

pub use parser::FastJsonParser;
pub use value::JsonValue;
pub use error::ParseError;`}</code>
              </pre>
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h3 className="font-semibold mb-2">📖 README</h3>
                <p className="text-sm text-[var(--muted)]">{repo.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {repo.topics.map((t) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary-hover)]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-2xl font-bold">{formatNumber(repo.stars)}</div>
                  <div className="text-xs text-[var(--muted)]">Stars</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-2xl font-bold">{formatNumber(repo.forks)}</div>
                  <div className="text-xs text-[var(--muted)]">Forks</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="text-2xl font-bold">{repo.license || "—"}</div>
                  <div className="text-xs text-[var(--muted)]">License</div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                <div className="text-sm font-medium mb-3">Recent activity</div>
                <div className="space-y-2 text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Push to main · 3 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    PR #42 merged · 5 hours ago
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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

  const filtered = repositories.filter((r) => {
    if (filter === "public") return r.visibility === "public";
    if (filter === "paid") return r.visibility === "paid";
    if (filter === "mine") return r.owner.username === "you";
    return true;
  });

  if (selected) {
    return <RepoDetail repo={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Repositories</h1>
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          + New Repo
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { id: "all", label: "All" },
          { id: "public", label: "Public" },
          { id: "paid", label: "Paid 💰" },
          { id: "mine", label: "My repos" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
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
