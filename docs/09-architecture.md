# WEAVE — Архитектурный документ

## 1. Высокоуровневая архитектура

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WEAVE PLATFORM                                  │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  IDENTITY │  │   FEED   │  │ MESSAGING│  │   GIT    │  │  MARKET  │ │
│  │  (ядро)   │  │  ENGINE  │  │  ENGINE  │  │  ENGINE  │  │  ENGINE  │ │
│  │           │  │          │  │          │  │          │  │          │ │
│  │ • Профиль │  │ • Лента  │  │ • Чаты   │  │ • Репо   │  │ • Витрина│ │
│  │ • SSO/Auth│  │ • Алгоритм│ │ • Каналы │  │ • Коммиты│  │ • Покупки│ │
│  │ • Репутац.│  │ • Подписки│ │ • Группы │  │ • PR/MR  │  │ • Эскроу │ │
│  │ • Подписк.│  │ • Медиа  │  │ • Stories│  │ • Ветки  │  │ • Подписк│ │
│  └─────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│        │             │             │             │             │        │
│        └─────────────┴─────────────┼─────────────┴─────────────┘        │
│                                      │                                    │
│                          ┌───────────┴───────────┐                      │
│                          │   EVENT BUS / CORE    │                      │
│                          │   (ядро интеграции)    │                      │
│                          │                       │                      │
│                          │ • Cross-module events │                      │
│                          │ • Notification router │                      │
│                          │ • Activity log        │                      │
│                          │ • Search indexer      │                      │
│                          └───────────┬───────────┘                      │
│                                      │                                    │
│  ┌──────────┐  ┌──────────┐  ┌───────┴────┐  ┌──────────┐             │
│  │ PAYMENTS │  │  MEDIA   │  │   SEARCH   │  │   CDN    │             │
│  │ GATEWAY  │  │ STORAGE  │  │  ENGINE    │  │          │             │
│  └──────────┘  └──────────┘  └────────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Принципы архитектуры

1. **Modular monolith → Microservices** — стартуем как модульный монолит (быстрее MVP), выделяем сервисы по мере роста
2. **Event-driven core** — все межмодульные взаимодействия через Event Bus (не прямые вызовы)
3. **Plugin-ready** — модули реализуют общий интерфейс; в MVP все встроены, позже открывается Plugin SDK
4. **Identity-first** — единый профиль = единая точка правды; все модули ссылаются на identity
5. **API-first** — каждый модуль имеет REST + WebSocket API; фронтенд — просто consumer
6. **Shared nothing** — модули не делят таблицы БД; общаются через события и API
7. **Idempotent operations** — все платёжные и критические операции идемпотентны

## 3. Модули

### 3.1. IDENTITY (ядро)

```
Identity Module
├── Profile (username, bio, avatar, links, verified)
├── Auth (OAuth2, WebAuthn, passkeys, email/pass)
├── Sessions (device management, token rotation)
├── Reputation (score, badges, endorsements)
├── Subscriptions (following/followers, block/mute)
├── Roles (user, creator, team_member, admin)
└── Settings (privacy, notifications, module toggles)
```

### 3.2. FEED ENGINE

```
Feed Module
├── Posts (text, media, links, code-snippets)
├── Threads (ответы, цитирования, репосты)
├── Feed algorithm (chronological + algorithmic + curated)
├── Media (images, video, live-streams)
├── Stories (ephemeral content, 24h)
├── Reactions (likes, boosts, bookmarks)
└── Hashtags / Topics
```

### 3.3. MESSAGING ENGINE

```
Messaging Module
├── Direct messages (1:1, E2E-encrypted)
├── Group chats (small groups)
├── Channels (broadcast, one-to-many)
├── Channel posts (with media, code, paywall)
├── Paid channels (subscription-gated)
├── Stories / Status (ephemeral)
└── Voice rooms (LiveKit integration, future)
```

### 3.4. GIT ENGINE

```
Git Module
├── Repositories (public, private, paid)
├── Commits / Branches / Tags
├── Pull/Merge Requests
├── Issues / Discussions
├── Code browser (syntax-highlighted, LSP-powered)
├── Webhooks (CI/CD triggers)
├── Import (from GitHub/GitLab)
└── Paid repos (subscription-gated access)
```

**Техническая реализация:** Gitea как backend-сервис, WEAVE оборачивает своим API-слоем.

```
User → WEAVE API → WEAVE Git Gateway → Gitea API
                         ↓
                    Auth Bridge (WEAVE session → Gitea token)
                         ↓
                    Paywall Layer (paid repo access check)
```

### 3.5. MARKET ENGINE

```
Market Module
├── Listings (code, templates, courses, media, services)
├── Purchases (one-time, with escrow)
├── Subscriptions (recurring, tiered)
├── Tipping / Donations
├── Escrow (hold funds until delivery confirmation)
├── Reviews / Ratings
└── Revenue dashboard (for creators)
```

### 3.6. PAYMENTS GATEWAY

```
Payments Module
├── Stripe (cards, Apple Pay, Google Pay)
├── Crypto (optional: USDC, BTC, ETH)
├── Payouts (to creators' bank accounts / wallets)
├── Fee calculation (platform commission)
├── Invoicing / Tax handling
├── Fraud detection (basic rules + ML later)
└── Webhook handler (payment events → module events)
```

## 4. Event Bus / Core

### Принцип
Все межмодульные коммуникации — через события. Модули не вызывают друг друга напрямую.

### Ключевые события

| Событие | Источник | Consumer(s) | Описание |
|---|---|---|---|
| `user.registered` | Identity | Feed, Search | Новый пользователь |
| `user.followed` | Identity | Feed, Messaging | Подписка |
| `post.created` | Feed | Search, Notification | Новый пост |
| `channel.post.created` | Messaging | Feed, Notification | Пост в канале |
| `repo.pushed` | Git | Feed, Notification | Push в репо |
| `payment.succeeded` | Payments | Market, Messaging | Оплата → доступ |
| `subscription.expired` | Payments | Market, Messaging, Git | Отмена → закрыть доступ |
| `listing.purchased` | Market | Git, Notification | Покупка кода → доступ к репо |
| `message.sent` | Messaging | Notification, Realtime | Сообщение → WebSocket |

### Реализация

- **MVP:** PostgreSQL LISTEN/NOTIFY + in-process event dispatcher
- **Scale:** Redis Streams или NATS JetStream (надёжная доставка, ретраи, DLQ)
- **Pattern:** каждый модуль публикует события + подписывается на нужные через event router

## 5. Realtime-архитектура

```
                    ┌─────────────────────────────┐
                    │      CLIENT (Web/Desktop)    │
                    │  WebSocket Connection        │
                    │  (wss://api.weave.app/realtime)│
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │     REALTIME GATEWAY         │
                    │     (ws / Centrifugo)        │
                    │                              │
                    │  • Connection registry       │
                    │  • Channel subscriptions     │
                    │  • Presence tracking         │
                    │  • Message fan-out           │
                    └──────────┬──────────────────┘
                               │
                    ┌──────────▼──────────────────┐
                    │      EVENT BUS               │
                    │   (Redis Streams / NATS)     │
                    │                              │
                    │  Realtime Gateway подписан   │
                    │  на события, маршрутизирует  │
                    │  подключённым клиентам       │
                    └──────────┬──────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌────────────┐    ┌────────────┐    ┌────────────┐
    │ Messaging  │    │   Feed     │    │  Payments  │
    │  Module    │    │  Module    │    │  Module    │
    │            │    │            │    │            │
    │ message    │    │ post       │    │ payment    │
    │ .sent      │    │ .created   │    │ .confirmed │
    └────────────┘    └────────────┘    └────────────┘
```

### Realtime-события (server → client)

| Событие | Назначение |
|---|---|
| `message.new` | Новое сообщение в DM/группе |
| `channel.post.new` | Новый пост в подписанном канале |
| `feed.post.new` | Новый пост в ленте (real-time) |
| `notification.new` | Уведомление |
| `presence.update` | Пользователь online/offline |
| `repo.push` | Новый push в отслеживаемый репо |
| `payment.confirmed` | Подтверждение платежа |

### Realtime-события (client → server)

| Событие | Назначение |
|---|---|
| `presence.heartbeat` | Keepalive / online status |
| `conversation.read` | Отметить прочитанным |
| `typing.start` | Индикатор набора |

## 6. Интеграционная архитектура Git

```
┌─────────────────────────────────────────────────────┐
│                    WEAVE API                          │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │              GIT GATEWAY                          │ │
│  │                                                   │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │ │
│  │  │   Auth   │  │ Paywall  │  │   Webhook    │  │ │
│  │  │  Bridge  │  │  Layer   │  │   Handler    │  │ │
│  │  │          │  │          │  │              │  │ │
│  │  │ WEAVE    │  │ Check    │  │ Gitea events │  │ │
│  │  │ session  │  │ paid     │  │ → WEAVE      │  │ │
│  │  │ → Gitea  │  │ repo     │  │ events       │  │ │
│  │  │ token    │  │ access   │  │              │  │ │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │ │
│  │       └──────────────┴───────────────┘          │ │
│  │                      │                           │ │
│  └──────────────────────┼───────────────────────────┘ │
│                         │                              │
└─────────────────────────┼──────────────────────────────┘
                          │
          ┌───────────────▼───────────────┐
          │          GITEA SERVICE         │
          │          (self-hosted)         │
          │                               │
          │  • Git over SSH/HTTP          │
          │  • REST API                   │
          │  • Webhooks                   │
          │  • User management            │
          │  • Repo storage               │
          └───────────────────────────────┘
```

### Поток запроса к Git

```
1. User → WEAVE API: GET /api/v1/repos/{owner}/{name}/tree/{branch}
2. WEAVE Auth → проверка сессии
3. Git Gateway → Auth Bridge: получение Gitea-токена для пользователя
4. Git Gateway → Paywall Layer: проверка доступа (public/private/paid)
5. Git Gateway → Gitea API: GET /api/v1/repos/{owner}/{name}/git/trees/{branch}
6. Gitea → ответ (JSON)
7. WEAVE → ответ клиенту (с обогащением: stars, owner profile, etc.)
```

### Поток push в репозиторий

```
1. User → git push (через SSH/HTTPS к Gitea напрямую)
2. Gitea → webhook → WEAVE Git Gateway
3. WEAVE → Event Bus: repo.pushed {repo_id, user_id, branch, commits}
4. Event Bus → Feed Module: создание поста (опционально, по настройкам)
5. Event Bus → Notification Module: уведомить подписчиков репо
6. Event Bus → Realtime Gateway: push connected watchers
```

## 7. Интеграционная архитектура Payments

```
┌──────────────────────────────────────────────────┐
│                   WEAVE API                       │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │            PAYMENTS MODULE                    │ │
│  │                                               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  │ │
│  │  │ Checkout │  │ Webhook  │  │  Payout   │  │ │
│  │  │ Handler  │  │ Handler  │  │  Engine   │  │ │
│  │  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │ │
│  │       │              │              │         │ │
│  └───────┼──────────────┼──────────────┼─────────┘ │
│          │              │              │            │
└──────────┼──────────────┼──────────────┼────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────────────────────────────────────┐
    │              STRIPE CONNECT               │
    │                                           │
    │  • Checkout Sessions                      │
    │  • Subscriptions                          │
    │  • Webhooks (payment_succeeded, etc.)    │
    │  • Connect (payouts to creators)          │
    │  • Customer Portal                        │
    └───────────────────────────────────────────┘
```

### Поток платной подписки на канал

```
1. User → WEAVE API: POST /api/v1/conversations/{id}/subscribe
2. Payments Module → Stripe: create Checkout Session
3. Stripe → URL → User (redirect to checkout)
4. User → Stripe: оплата картой
5. Stripe → WEAVE Webhook: payment_succeeded
6. Payments Module → Event Bus: payment.succeeded {user, plan, channel}
7. Event Bus → Messaging Module: открыть доступ к каналу
8. Event Bus → Market Module: создать active_subscription
9. Event Bus → Notification: уведомить пользователя и автора
10. (Ежемесячно) Stripe → WEAVE Webhook: invoice.paid → продление
11. (При отмене) Stripe → WEAVE Webhook: subscription.deleted → закрыть доступ
```

## 8. Архитектура фронтенда

```
┌─────────────────────────────────────────────────────┐
│                   WEAVE WEB (PWA)                    │
│                   Next.js 15 + React 19              │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │                  APP SHELL                      │ │
│  │  • Sidebar (navigation: Feed, Chat, Git, etc.) │ │
│  │  • TopBar (search, notifications, profile)     │ │
│  │  • CommandPalette (Cmd+K)                      │ │
│  └────────────────────┬───────────────────────────┘ │
│                       │                              │
│  ┌─────────┬──────────┼──────────┬────────────────┐ │
│  │  FEED   │ MESSAGING│   GIT    │    MARKET      │ │
│  │  PAGE   │  PAGE    │  PAGE    │    PAGE        │ │
│  │         │          │          │                │ │
│  │ • Posts │ • Chats  │ • Repos  │ • Listings     │ │
│  │ • Media │ • Channel│ • Code   │ • Purchases    │ │
│  │ • Story │ • Msgs   │ • PRs    │ • Dashboard    │ │
│  └─────────┴──────────┼──────────┴────────────────┘ │
│                       │                              │
│  ┌────────────────────▼───────────────────────────┐ │
│  │              SHARED STATE                       │ │
│  │  Zustand (UI state) + TanStack Query (server)  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              API CLIENT (tRPC)                  │ │
│  │  Type-safe RPC to WEAVE API                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              REALTIME CLIENT                    │ │
│  │  WebSocket → Zustand stores → reactive UI       │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### Desktop (Tauri)

```
┌─────────────────────────────────────────────────────┐
│                 WEAVE DESKTOP (Tauri)                │
│                                                      │
│  ┌──────────────────┐  ┌────────────────────────┐  │
│  │   Rust Backend    │  │   WebView (Web Frontend)│  │
│  │   (src-tauri/)    │  │   (reuses web/ code)    │  │
│  │                   │  │                          │  │
│  │  • Window mgmt    │  │  • Full web app          │  │
│  │  • Tray icon      │  │  • Native notifications  │  │
│  │  • Auto-update    │  │  • File system access    │  │
│  │  • Native notify  │  │  • Drag-drop             │  │
│  │  • Deep links     │  │                          │  │
│  └──────────────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 9. Диаграмма развёртывания

```
                    ┌──────────────────┐
                    │   Cloudflare      │
                    │   (CDN + WAF)     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Load Balancer   │
                    │   (Caddy/Nginx)   │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                  ▼
    ┌────────────┐  ┌──────────────┐  ┌──────────────┐
    │  WEB SSR   │  │   API SERVER │  │   REALTIME   │
    │  (Next.js) │  │   (NestJS)   │  │   GATEWAY    │
    │            │  │              │  │   (ws/Centr.)│
    │  2+ inst.  │  │  2+ inst.   │  │  2+ inst.    │
    └────────────┘  └──────┬───────┘  └──────┬───────┘
                           │                  │
                    ┌──────▼──────────────────▼──┐
                    │        REDIS CLUSTER         │
                    │  (cache + sessions + events) │
                    └──────────┬──────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                    ▼
    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
    │ POSTGRESQL │    │    GITEA     │    │    MINIO     │
    │  (primary  │    │  (Git host)  │    │  (S3 media)  │
    │  + replica)│    │              │    │              │
    └────────────┘    └──────────────┘    └──────────────┘
                               │
                    ┌──────────▼──────────┐
                    │      STRIPE         │
                    │   (external SaaS)   │
                    └─────────────────────┘
```

## 10. Масштабирование

| Компонент | Стратегия |
|---|---|
| API Server | Horizontal scaling (stateless), load balancer |
| Web SSR | Horizontal scaling, ISR caching |
| Realtime | Sticky sessions → Centrifugo (horizon. scaling) |
| PostgreSQL | Read replicas → sharding (год 3+) |
| Redis | Cluster mode (cache + pub/sub) |
| Gitea | Multiple instances + shared storage (NFS/S3) |
| MinIO | Distributed mode (erasure coding) |
| Search | PostgreSQL FTS → Meilisearch (отдельный кластер) |

## 11. Безопасность (кратко)

Подробно — в [Безопасность](18-security.md).

- TLS everywhere (Cloudflare → origin)
- E2E-encryption для DM (Signal protocol)
- RBAC (role-based access control)
- Rate limiting (Redis)
- CSRF tokens, CSP headers
- Secrets in Vault/SOPS
- Audit log для всех действий
- Bug bounty program (с года 2)
