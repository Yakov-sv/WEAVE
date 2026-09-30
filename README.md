# WEAVE

> **Where everything connects** — модульная платформа, объединяющая мессенджер, соцсеть, медиа, Git и маркетплейс монетизации в единую ткань.

## Концепция

WEAVE — это Federated Layers платформа, где один профиль пользователя даёт доступ к шести модулям:

| Модуль | Аналог | Назначение |
|---|---|---|
| **Identity** | — | Единый профиль, SSO, репутация |
| **Feed** | X / Instagram | Лента постов, медиа, stories |
| **Messaging** | Telegram | Чаты, каналы, платные подписки |
| **Git** | GitHub | Репозитории, PR, issues |
| **Market** | Patreon / Gumroad | Маркетплейс кода, курсов, шаблонов |
| **Payments** | Stripe | Подписки, разовые покупки, эскроу |

## Документация

Полная документация находится в [`docs/`](docs/) и [`specs/`](specs/).

### Бизнес-документы

- [01 — Видение и концепция](docs/01-vision.md)
- [02 — Анализ рынка](docs/02-market-analysis.md)
- [03 — Обоснование названия](docs/03-naming.md)
- [04 — Бизнес-план](docs/04-business-plan.md)
- [05 — Go-to-market стратегия](docs/05-gtm-strategy.md)
- [06 — Монетизация](docs/06-monetization.md)
- [07 — Финансовая модель](docs/07-financial-model.md)
- [08 — Анализ рисков](docs/08-risk-analysis.md)

### Архитектурные документы

- [09 — Архитектура](docs/09-architecture.md)
- [10 — Схема БД](docs/10-data-schema.md)
- [11 — Спецификация API](docs/11-api-spec.md)
- [12 — Технологический стек](docs/12-tech-stack.md)
- [13 — Структура монорепо](docs/13-monorepo-structure.md)

### Технические задания и планирование

- [14 — ТЗ на MVP](docs/14-tz-mvp.md)
- [15 — Roadmap](docs/15-roadmap.md)
- [16 — Команда и роли](docs/16-team-and-roles.md)
- [17 — Юридическая структура](docs/17-legal-compliance.md)
- [18 — Безопасность](docs/18-security.md)
- [19 — Деплой](docs/19-deployment.md)
- [20 — CI/CD](docs/20-ci-cd.md)

### Architecture Decision Records

- [ADR-001: Modular Monolith](docs/adr/001-modular-monolith.md)
- [ADR-002: Gitea as Git Backend](docs/adr/002-gitea-as-git-backend.md)
- [ADR-003: Event-Driven Core](docs/adr/003-event-driven-core.md)
- [ADR-004: Stripe for Payments](docs/adr/004-stripe-for-payments.md)
- [ADR-005: Tauri for Desktop](docs/adr/005-tauri-for-desktop.md)
- [ADR-006: Prisma ORM](docs/adr/006-prisma-orm.md)
- [ADR-007: Redis for Realtime](docs/adr/007-redis-for-realtime.md)

### Спецификации модулей

- [Identity Module](specs/identity-module.md)
- [Feed Module](specs/feed-module.md)
- [Messaging Module](specs/messaging-module.md)
- [Git Module](specs/git-module.md)
- [Market Module](specs/market-module.md)
- [Payments Module](specs/payments-module.md)
- [Realtime Module](specs/realtime-module.md)

## Технологический стек

| Слой | Технология |
|---|---|
| Web | Next.js 15 + React 19 + Tailwind CSS + shadcn/ui |
| Desktop | Tauri 2.0 |
| Backend | NestJS (Node.js / TypeScript) |
| ORM | Prisma |
| Database | PostgreSQL 16 + pgvector |
| Cache/Queue | Redis 7 |
| Git Backend | Gitea (self-hosted) |
| Realtime | ws → Centrifugo (scale) |
| Media | MinIO (S3-compatible) |
| Payments | Stripe Connect |
| Auth | Better Auth + WebAuthn |
| Monorepo | pnpm + Turborepo |

## Статус

**Pre-alpha** — стадия планирования и документирования.

## Лицензия

TBD (рассматривается: BSL для ядра + Apache 2.0 для SDK)
