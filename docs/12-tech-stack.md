# WEAVE — Технологический стек

## Обзор

| Слой | Технология | Версия | Обоснование |
|---|---|---|---|
| **Monorepo** | pnpm + Turborepo | pnpm 9+, turbo 2+ | Быстрый, кэширование, industry standard |
| **Web Frontend** | Next.js + React | 15 / 19 | SSR, PWA, RSC, огромная экосистема |
| **Desktop** | Tauri | 2.0 | Лёгкий (Rust), безопаснее Electron |
| **State (Web)** | Zustand + TanStack Query | 5+ / 5+ | Минималистичный state + server-state кэш |
| **Styling** | Tailwind CSS + shadcn/ui | 4+ / latest | Быстрая разработка, design system |
| **Code Editor** | Monaco Editor | latest | Тот же движок что VS Code, LSP-ready |
| **Backend API** | NestJS | 10+ | Модульный, декораторы, DI, зрелый |
| **ORM** | Prisma | 5+ | Типобезопасный, миграции, PostgreSQL-first |
| **Realtime** | ws → Centrifugo | latest | MVP — простой WS; масштаб — Centrifugo |
| **Git Backend** | Gitea | 1.22+ | Зрелый, REST API, лёгкий, open-source |
| **Database** | PostgreSQL + pgvector | 16+ | Реляционные данные + векторный поиск |
| **Cache/Queue** | Redis | 7+ | Кэш, сессии, rate-limiting, event queue |
| **Search** | PG FTS → Meilisearch | latest | MVP — просто; масштаб — отдельный движок |
| **Media Storage** | MinIO | latest | Self-hosted S3-совместимое хранилище |
| **Payments** | Stripe Connect | latest | Подписки, разовые, payouts, эскроу |
| **Auth** | Better Auth + WebAuthn | latest | Lightweight, passkey-ready |
| **Containerization** | Docker + Compose | 27+ | Dev + prod consistency |
| **Reverse Proxy** | Caddy | 2+ | Auto-TLS, простой конфиг |
| **CI/CD** | GitHub Actions | — | Стандарт, free tier для OSS |
| **Monitoring** | Sentry + Grafana/Loki | latest | Sentry — ошибки; Grafana — метрики |
| **API Types** | tRPC (internal) + OpenAPI (external) | 10+ | tRPC — type-safe; OpenAPI — для плагинов |

## Детальное обоснование

### Monorepo: pnpm + Turborepo

**Почему не npm/yarn workspaces:** pnpm быстрее, эффективнее хранит пакеты (content-addressable store), лучше поддерживает workspaces.
**Почему Turborepo:** кэширование сборок, параллельное выполнение, удалённый кэш (CI ускорение).
**Альтернативы:** Nx (перегружен для MVP), Bazel (enterprise-only).

### Web: Next.js 15 + React 19

**Почему Next.js:** SSR/ISR для SEO (критично для публичных профилей/постов/репо), App Router для layouts, PWA support, Vercel deployment.
**Почему не SvelteKit/SolidStart:** React — крупнейшая экосистема, больше разработчиков, больше библиотек (Monaco, shadcn/ui, TanStack).
**Почему не Remix:** Next.js 15 App Router покрывает те же возможности, плюс ISR и static generation.

### Desktop: Tauri 2.0

**Почему не Electron:** Tauri — 10x меньше по размеру (3MB vs 150MB), меньше RAM, безопаснее (Rust backend), нативные API.
**Почему Tauri 2.0:** Mobile support (iOS/Android) в roadmap — будущая мобильная версия.
**Альтернативы:** Electron (тяжёлый, но зрелый), Wails (Go, меньше экосистема).

### State: Zustand + TanStack Query

**Zustand:** UI state (sidebar, modals, theme, module toggles). Минималистичный, без boilerplate.
**TanStack Query:** Server state (posts, messages, repos) — кэширование, invalidation, optimistic updates, infinite scrolling.
**Почему не Redux:** Избыточен для MVP,太多 boilerplate.
**Почему не Jotai/Recoil:** Zustand проще, достаточно для UI state.

### Backend: NestJS

**Почему NestJS:** Модульная архитектура (каждый модуль WEAVE — NestJS-модуль), DI, декораторы, middleware, guards, interceptors — всё из коробки.
**Почему не Express/Fastify напрямую:** NestJS даёт структуру, необходимую для модульного монолита.
**Почему не Rust (Axum/Actix):** Быстрее, но медленнее разработка. MVP важнее производительности. Rust — опция для realtime-gateway в будущем.
**Почему не Go (Fiber/Echo):** NestJS + TypeScript = type safety от БД до фронтенда через tRPC.

### ORM: Prisma

**Почему Prisma:** Типобезопасный schema-first, отличная миграционная система, PostgreSQL-first, generated client.
**Почему не Drizzle:** Prisma зрелее, лучше документация, больше экосистема. Drizzle — опция для hot-path queries (raw SQL performance).
**Почему не TypeORM:** Менее интуитивный API, проблемы с migration flow.
**Почему не raw SQL (pg):** Потеря type safety, boilerplate.

### Git Backend: Gitea

**Почему Gitea, не свой движок:** Git сложен. Gitea — зрелый (10+ лет), лёгкий (Go binary), REST API, webhooks, SSH/HTTP access.
**Почему не GitLab:** Тяжёлый (Ruby/PostgreSQL/Redis/Sidekiq), overkill для проксирования.
**Почему не Forgejo:** Forgejo — форк Gitea, совместим. Можно использовать (более community-driven).
**Почему не изоморфный git (isomorphic-git):** Медленный для больших репо, нет SSH access, нет webhooks. Только для read-only operations в браузере (будущее: client-side clone).

### Database: PostgreSQL 16 + pgvector

**Почему PostgreSQL:** Универсальный, надёжный, JSONB, FTS, pgvector, extensions.
**Почему не MongoDB:** WEAVE — реляционные данные (users → posts → reactions → messages). MongoDB плох для joins.
**pgvector:** Семантический поиск (embeddings) для рекомендаций ленты и поиска контента.
**Почему не отдельная векторная БД (Pinecone/Weaviate):** pgvector достаточно для MVP, меньше инфраструктуры.

### Cache: Redis 7

**Redis:** Кэш, сессии, rate limiting, pub/sub для realtime, event queue (Streams).
**Почему не Memcached:** Нет persistence, нет pub/sub, нет data structures.
**Почему не KeyDB/Valkey:** Redis 7 достаточно. Valkey — опция если Redis меняет лицензию.

### Payments: Stripe Connect

**Почему Stripe:** Зрелый, глобальный, Connect для payouts авторам, Subscriptions, Checkout, Customer Portal, Webhooks.
**Почему не PayPal:** Хуже API, нет Connect-аналога для split payments.
**Почему не Adyen:** Enterprise-фокус, дороже.
**Крипто (будущее):** USDC (Circle) или Lightning Network для глобальных/low-fee платежей. Не на MVP.

### Realtime: ws → Centrifugo

**MVP (ws):** Простой WebSocket-сервер на Node.js, достаточно для < 10K connections.
**Scale (Centrifugo):** Go-based, horizontal scaling, presence, history, rate limiting. Когда connections > 10K.
**Почему не Socket.io:** Heavy, не нужен для простых событий. Raw WS проще.
**Почему не Ably/Pusher:** Стоимость растёт с масштабом. Self-hosted Centrifugo — дешевле.

### Search: PG FTS → Meilisearch

**MVP:** PostgreSQL Full-Text Search (tsvector, tsquery) — достаточно для < 1M записей.
**Scale:** Meilisearch — быстрый, typo-tolerant, лёгкий. Когда поиск > 100K запросов/день.
**Почему не Elasticsearch:** Heavy (JVM), overkill для MVP.
**Почему не Algolia:** Платный, дорого на масштабе.

### Media: MinIO

**Почему MinIO:** S3-compatible API, self-hosted, erasure coding, distributable.
**Почему не AWS S3 напрямую:** Дороже на масштабе, vendor lock-in. MinIO → можно мигрировать на S3 anytime.
**CDN:** Cloudflare для раздачи медиа (free tier → Pro).

### Auth: Better Auth + WebAuthn

**Better Auth:** Lightweight, framework-agnostic, OAuth2, sessions, passkeys.
**WebAuthn (passkeys):** Future-proof аутентификация, без паролей.
**Почему не Auth0/Clerk:** Дорого на масштабе, vendor lock-in.
**Почему не NextAuth (Auth.js):** Next.js-specific, меньше контроля. Better Auth — универсальнее.

### API Types: tRPC + OpenAPI

**tRPC:** Type-safe RPC между Next.js и NestJS. Изменения в API → типы на фронтенде автоматически.
**OpenAPI:** Для внешних потребителей (Plugin SDK, мобильные клиенты, third-party).
**Почему не GraphQL:** Перe-сложность для MVP, N+1 проблемы, больше boilerplate.
**Почему только REST:** Теряется type safety. tRPC даёт лучший DX.

### Containerization: Docker + Compose

**Dev:** docker-compose.yml — поднимает всё (API, DB, Redis, Gitea, MinIO) одной командой.
**Prod:** Docker images + Docker Compose (масштаб: Kubernetes на год 3+).
**Почему не Kubernetes сразу:** Overkill для MVP. Compose достаточно для 2–5 серверов.

### Reverse Proxy: Caddy

**Почему Caddy, не Nginx:** Auto-TLS (Let's Encrypt), простой конфиг (Caddyfile), HTTP/3, reverse proxy.
**Почему не Traefik:** Хорош для K8s, overkill для Compose.

### CI/CD: GitHub Actions

**Почему GitHub Actions:** Стандарт, free tier (2000 мин/мес для public repos), интеграция с GitHub.
**Пайплайны:** lint → typecheck → test → build → deploy (staging/prod).
**Почему не GitLab CI:** WEAVE может хоститься на GitHub для комьюнити.

### Monitoring: Sentry + Grafana/Loki

**Sentry:** Ошибки фронтенда и бэкенда, release tracking, performance monitoring.
**Grafana + Loki + Prometheus:** Метрики, логи, алерты. Self-hosted, бесплатно.
**Почему не Datadog/New Relic:** Дорого на масштабе. Grafana stack — open-source.
