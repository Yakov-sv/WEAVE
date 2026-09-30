# ADR-005: Tauri для Desktop-приложения

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE targeting Desktop + Web. Нужен фреймворк для desktop-приложения (Windows, macOS, Linux).

## Options

### Option A: Tauri 2.0
- Rust backend + WebView frontend
- 3–10MB binary (vs 150MB+ Electron)
- Нативные API (tray, notifications, file system)
- Reuses web code (Next.js build)
- Безопасность (Rust, sandboxed WebView)

### Option B: Electron
- Node.js + Chromium
- 150MB+ binary
- Зрелый, огромная экосистема (VS Code, Slack, Discord)
- Высокий RAM usage (each window = Chromium process)

### Option C: Native (Swift/macOS, C#/Windows, Qt/Linux)
- Лучший UX, но 3 отдельных кодовых баз
- 3x команда для разработки

### Option D: PWA only (no desktop app)
- Простейший вариант
- Нет нативных features (tray, auto-launch, deep links)

## Decision

**Option A: Tauri 2.0**

## Rationale

1. **Size** — 3–10MB vs 150MB+ Electron → лучше UX, быстрее загрузка
2. **Performance** — Rust backend, меньше RAM (50MB vs 200MB+)
3. **Security** — Rust memory safety, sandboxed WebView, no Node.js in production
4. **Web reuse** — переиспользуем 100% веб-кода (Next.js build в WebView)
5. **Cross-platform** — Windows, macOS, Linux из одной кодовой базы
6. **Mobile roadmap** — Tauri 2.0 supports iOS/Android → будущая мобильная версия
7. **Native APIs** — tray icon, notifications, deep links (weave://), auto-update
8. **Modern** — активная разработка, growing community

## Implementation

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                 WEAVE Desktop (Tauri)                │
│                                                      │
│  ┌──────────────────┐  ┌────────────────────────┐  │
│  │   Rust Backend    │  │   WebView (Web Frontend)│  │
│  │   (src-tauri/)    │  │   (Next.js static build) │  │
│  │                   │  │                          │  │
│  │  • Window mgmt    │  │  • Full web app          │  │
│  │  • Tray icon      │  │  • tRPC → API            │  │
│  │  • Auto-update    │  │  • WebSocket → Realtime  │  │
│  │  • Native notify  │  │  • Local state (Zustand) │  │
│  │  • Deep links     │  │                          │  │
│  │  • File system    │  │  IPC via Tauri commands  │  │
│  │  • Clipboard      │  │                          │  │
│  └──────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Tauri commands (IPC)

```rust
// src-tauri/src/commands/window.rs
#[tauri::command]
fn minimize_window(window: tauri::Window) {
    window.minimize().unwrap();
}

#[tauri::command]
fn show_tray_icon(app: tauri::AppHandle) {
    // Tray icon management
}

// src-tauri/src/commands/deep_link.rs
#[tauri::command]
fn handle_weave_url(url: String) -> String {
    // Parse weave://profile/johndoe → navigate
    url
}
```

### Auto-update

```json
// tauri.conf.json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://api.weave.app/desktop/updates/{{target}}/{{current_version}}"
    ],
    "pubkey": "..."
  }
}
```

### Deep links

```
weave://profile/johndoe      → open profile
weave://channel/uuid         → open channel
weave://repo/owner/name      → open repository
weave://post/uuid            → open post
```

## Consequences

### Positive
- Лёгкое, быстрое, безопасное desktop-приложение
- 100% переиспользование веб-кода
- Нативные features (tray, notifications, deep links)
- Путь к mobile (Tauri 2.0)
- Маленький binary → быстрее установка

### Negative
- Меньше экосистемы чем Electron (но растёт)
- WebView differences (Edge WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux)
- Rust knowledge needed for native features (но минимально)
- Tauri 2.0 — относительно новый (возможны breaking changes)

### Mitigations
- WebView differences: feature detection + polyfills
- Rust: минимальный Rust-код (только IPC commands), основная логика в TypeScript
- Breaking changes: pin version, monitor Tauri releases
