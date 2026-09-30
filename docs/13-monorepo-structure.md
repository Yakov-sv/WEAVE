# WEAVE — Структура монорепозитория

## Дерево

```
weave/
├── apps/
│   ├── web/                          # Next.js 15 (PWA) — основной веб-клиент
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # login, register, passkey
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   ├── (main)/           # authenticated app
│   │   │   │   │   ├── feed/         # лента
│   │   │   │   │   ├── messages/     # чаты и каналы
│   │   │   │   │   ├── repos/        # Git-репозитории
│   │   │   │   │   ├── market/       # маркетплейс
│   │   │   │   │   ├── settings/     # настройки
│   │   │   │   │   └── notifications/
│   │   │   │   ├── [username]/       # публичный профиль
│   │   │   │   │   ├── page.tsx      # профиль
│   │   │   │   │   ├── posts/        # посты пользователя
│   │   │   │   │   └── repos/        # репозитории пользователя
│   │   │   │   ├── [username]/[repo]/ # публичный репозиторий
│   │   │   │   │   ├── page.tsx      # обзор
│   │   │   │   │   ├── tree/[branch]/ # файлы
│   │   │   │   │   ├── commits/
│   │   │   │   │   ├── pulls/
│   │   │   │   │   └── issues/
│   │   │   │   ├── [username]/c/[channel]/ # публичный канал
│   │   │   │   └── explore/          # discovery
│   │   │   ├── components/           # shared UI components
│   │   │   │   ├── ui/               # shadcn/ui primitives
│   │   │   │   ├── layout/           # sidebar, topbar, command-palette
│   │   │   │   ├── post/             # post card, composer, thread
│   │   │   │   ├── message/          # message bubble, input
│   │   │   │   ├── repo/             # repo card, file browser, code view
│   │   │   │   ├── market/           # listing card, checkout
│   │   │   │   └── common/           # avatar, badge, modal, etc.
│   │   │   ├── modules/              # module-specific logic
│   │   │   │   ├── feed/
│   │   │   │   │   ├── hooks.ts      # TanStack Query hooks
│   │   │   │   │   ├── store.ts      # Zustand store
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── messaging/
│   │   │   │   ├── git/
│   │   │   │   ├── market/
│   │   │   │   └── identity/
│   │   │   ├── lib/                  # utilities
│   │   │   │   ├── api-client.ts     # tRPC client
│   │   │   │   ├── realtime.ts       # WebSocket client
│   │   │   │   ├── auth.ts           # auth helpers
│   │   │   │   └── utils.ts
│   │   │   ├── styles/
│   │   │   │   └── globals.css       # Tailwind
│   │   │   └── middleware.ts         # auth middleware
│   │   ├── public/
│   │   │   ├── manifest.json         # PWA manifest
│   │   │   ├── icons/
│   │   │   └── sw.js                 # service worker
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── desktop/                      # Tauri 2.0 — desktop client
│       ├── src-tauri/
│       │   ├── src/
│       │   │   ├── main.rs           # entry point
│       │   │   ├── commands/         # Tauri IPC commands
│       │   │   │   ├── window.rs     # window management
│       │   │   │   ├── notification.rs # native notifications
│       │   │   │   └── deep_link.rs  # weave:// protocol
│       │   │   └── tray.rs           # system tray
│       │   ├── Cargo.toml
│       │   ├── tauri.conf.json       # Tauri config
│       │   └── icons/
│       ├── src/                      # reuses web build (iframe or shared)
│       └── package.json
│
├── services/
│   ├── api/                          # NestJS — main API server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── identity/
│   │   │   │   │   ├── identity.module.ts
│   │   │   │   │   ├── identity.controller.ts
│   │   │   │   │   ├── identity.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── register.dto.ts
│   │   │   │   │   │   ├── update-profile.dto.ts
│   │   │   │   │   │   └── follow.dto.ts
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   └── jwt.guard.ts
│   │   │   │   │   └── events.ts     # event publishers
│   │   │   │   ├── feed/
│   │   │   │   │   ├── feed.module.ts
│   │   │   │   │   ├── feed.controller.ts
│   │   │   │   │   ├── feed.service.ts
│   │   │   │   │   ├── post.service.ts
│   │   │   │   │   ├── reaction.service.ts
│   │   │   │   │   ├── media.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── events.ts
│   │   │   │   ├── messaging/
│   │   │   │   │   ├── messaging.module.ts
│   │   │   │   │   ├── messaging.controller.ts
│   │   │   │   │   ├── conversation.service.ts
│   │   │   │   │   ├── message.service.ts
│   │   │   │   │   ├── channel.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── events.ts
│   │   │   │   ├── git/
│   │   │   │   │   ├── git.module.ts
│   │   │   │   │   ├── git.controller.ts
│   │   │   │   │   ├── git.service.ts
│   │   │   │   │   ├── gitea-client.ts    # Gitea API wrapper
│   │   │   │   │   ├── auth-bridge.ts     # WEAVE session → Gitea token
│   │   │   │   │   ├── paywall.ts         # paid repo access check
│   │   │   │   │   ├── import.service.ts  # GitHub import
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── events.ts
│   │   │   │   ├── market/
│   │   │   │   │   ├── market.module.ts
│   │   │   │   │   ├── market.controller.ts
│   │   │   │   │   ├── listing.service.ts
│   │   │   │   │   ├── purchase.service.ts
│   │   │   │   │   ├── subscription.service.ts
│   │   │   │   │   ├── review.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   └── events.ts
│   │   │   │   └── payments/
│   │   │   │       ├── payments.module.ts
│   │   │   │       ├── payments.controller.ts
│   │   │   │       ├── stripe.service.ts
│   │   │   │       ├── checkout.service.ts
│   │   │   │       ├── webhook.service.ts
│   │   │   │       ├── payout.service.ts
│   │   │   │       ├── dto/
│   │   │   │       └── events.ts
│   │   │   ├── core/
│   │   │   │   ├── event-bus/
│   │   │   │   │   ├── event-bus.module.ts
│   │   │   │   │   ├── event-bus.service.ts    # event dispatcher
│   │   │   │   │   └── event-handlers.ts       # cross-module handlers
│   │   │   │   ├── realtime/
│   │   │   │   │   ├── realtime.module.ts
│   │   │   │   │   ├── realtime.gateway.ts     # WebSocket gateway
│   │   │   │   │   └── connection-manager.ts
│   │   │   │   ├── search/
│   │   │   │   │   ├── search.module.ts
│   │   │   │   │   └── search.service.ts
│   │   │   │   ├── notification/
│   │   │   │   │   ├── notification.module.ts
│   │   │   │   │   └── notification.service.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   │   ├── error.middleware.ts
│   │   │   │   │   └── logging.middleware.ts
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt.guard.ts
│   │   │   │   │   └── role.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── public.decorator.ts
│   │   │   │   └── interceptors/
│   │   │   │       └── audit.interceptor.ts
│   │   │   ├── config/
│   │   │   │   ├── app.config.ts
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── gitea.config.ts
│   │   │   │   ├── stripe.config.ts
│   │   │   │   └── minio.config.ts
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma       # Prisma schema
│   │   │   │   ├── migrations/         # SQL migrations
│   │   │   │   └── seed.ts             # seed data
│   │   │   ├── main.ts                 # bootstrap
│   │   │   └── app.module.ts           # root module
│   │   ├── test/                       # e2e + unit tests
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── realtime/                      # WebSocket gateway (separate process)
│   │   ├── src/
│   │   │   ├── index.ts               # entry point
│   │   │   ├── connection-manager.ts  # connection registry
│   │   │   ├── event-router.ts        # subscribe to Redis, push to WS
│   │   │   ├── presence.ts            # online/offline tracking
│   │   │   ├── handlers/              # message handlers
│   │   │   └── auth.ts                # WS auth (token validation)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── git-gateway/                   # Gitea proxy (can be part of API in MVP)
│       ├── src/
│       │   ├── index.ts
│       │   ├── gitea-client.ts        # Gitea REST API wrapper
│       │   ├── auth-bridge.ts         # WEAVE session → Gitea token
│       │   ├── paywall.ts             # check paid repo access
│       │   ├── webhook-handler.ts     # Gitea webhooks → WEAVE events
│       │   └── sync.ts                # GitHub → Gitea import
│       ├── tsconfig.json
│       └── package.json
│
├── packages/                         # shared packages
│   ├── types/                        # shared TypeScript types
│   │   ├── src/
│   │   │   ├── identity.ts           # User, Session, Subscription types
│   │   │   ├── feed.ts               # Post, Reaction, Topic types
│   │   │   ├── messaging.ts          # Conversation, Message types
│   │   │   ├── git.ts                # Repository, Commit, PR types
│   │   │   ├── market.ts             # Listing, Purchase, Plan types
│   │   │   ├── payments.ts           # Transaction, Payout types
│   │   │   ├── events.ts             # Event schemas (all events)
│   │   │   ├── api.ts                # API request/response types
│   │   │   └── realtime.ts           # WebSocket event types
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── ui/                           # shared UI component library
│   │   ├── src/
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── textarea/
│   │   │   ├── modal/
│   │   │   ├── dropdown/
│   │   │   ├── avatar/
│   │   │   ├── badge/
│   │   │   ├── card/
│   │   │   ├── tabs/
│   │   │   ├── toast/
│   │   │   ├── code-block/           # syntax-highlighted code
│   │   │   ├── markdown/             # markdown renderer
│   │   │   ├── media-uploader/       # drag-drop upload
│   │   │   ├── paywall-gate/         # paywall UI component
│   │   │   └── theme/                # theme provider
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                   # generated API client
│   │   ├── src/
│   │   │   ├── trpc-client.ts        # tRPC client setup
│   │   │   ├── rest-client.ts        # REST fallback (for external)
│   │   │   └── hooks/                # generated React hooks
│   │   ├── index.ts
│   │   └── package.json
│   │
│   └── config/                       # shared configs
│       ├── eslint/
│       │   ├── base.js
│       │   ├── react.js
│       │   └── nestjs.js
│       ├── tsconfig/
│       │   ├── base.json
│       │   ├── react.json
│       │   └── nestjs.json
│       ├── tailwind/
│       │   └── base.js
│       └── package.json
│
├── infra/
│   ├── docker/
│   │   ├── api.Dockerfile
│   │   ├── web.Dockerfile
│   │   ├── realtime.Dockerfile
│   │   └── git-gateway.Dockerfile
│   ├── docker-compose.yml            # local dev environment
│   ├── docker-compose.prod.yml       # production compose
│   ├── gitea/
│   │   ├── app.ini                   # Gitea config
│   │   └── init.sh                   # init script
│   ├── postgres/
│   │   └── init.sql                  # extensions setup
│   ├── minio/
│   │   └── init.sh                   # bucket creation
│   ├── caddy/
│   │   └── Caddyfile                 # reverse proxy config
│   └── grafana/
│       ├── dashboards/
│       └── provisioning/
│
├── docs/                             # documentation (this repo)
│   ├── 01-vision.md
│   ├── 02-market-analysis.md
│   ├── ...
│   └── adr/
│
├── specs/                            # module specifications
│   ├── identity-module.md
│   ├── ...
│   └── realtime-module.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint + typecheck + test
│       ├── build.yml                 # build Docker images
│       └── deploy.yml                # deploy to staging/prod
│
├── package.json                      # workspace root
├── pnpm-workspace.yaml               # workspace config
├── turbo.json                        # Turborepo config
├── .gitignore
├── .editorconfig
├── .nvmrc                            # Node version
└── README.md
```

## Описание ключевых директорий

### apps/web
Next.js приложение с App Router. Группы маршрутов:
- `(auth)` — login/register/passkey (public)
- `(main)` — authenticated app (feed, messages, repos, market, settings)
- `[username]` — публичные профили (SSR для SEO)
- `[username]/[repo]` — публичные репозитории (SSR для SEO)
- `[username]/c/[channel]` — публичные каналы (SSR для SEO)

### apps/desktop
Tauri-приложение. Переиспользует веб-сборку через WebView. Rust-backend для нативных функций (tray, notifications, deep links `weave://`).

### services/api
NestJS модульный монолит. Каждый модуль WEAVE — отдельный NestJS-модуль со своим controller, service, dto, events. Core — общая инфраструктура (event-bus, realtime, middleware, guards).

### services/realtime
Отдельный процесс для WebSocket-соединений. Подписан на Redis pub/sub, маршрутизирует события подключённым клиентам. В MVP может быть частью API, выделен при масштабировании.

### services/git-gateway
Прокси к Gitea. В MVP может быть частью API-сервера (как NestJS-модуль). Выделен в отдельный сервис при необходимости (rate limiting, caching).

### packages/types
Shared TypeScript типы, используемые и на фронтенде, и на бэкенде. Source of truth для контрактов между сервисами.

### packages/ui
Shared UI-компоненты (shadcn/ui-based). Переиспользуются между web и desktop.

### packages/api-client
tRPC клиент + сгенерированные React-хуки. Используется веб-приложением.

### infra
Docker-конфигурации для разработки и продакшена. Конфиги Gitea, PostgreSQL, MinIO, Caddy, Grafana.
