# ADR-002: Gitea как Git Backend

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE включает Git-хостинг (репозитории, коммиты, ветки, PR). Нужно решить: написать свой Git-движок или использовать существующий open-source.

## Options

### Option A: Собственный Git-движок (isomorphic-git / libgit2)
- Полный контроль
- Нативная интеграция с WEAVE-аутентификацией
- Огромный объём разработки (Git protocol, SSH, HTTP smart protocol, packfiles, LFS)

### Option B: Gitea (self-hosted)
- Зрелый (10+ лет), Go binary, лёгкий
- REST API, webhooks, SSH/HTTP access
- User management, repo management из коробки
- WEAVE оборачивает своим API-слоем (auth-bridge, paywall)

### Option C: GitLab CE
- Полнофункциональный, но тяжёлый (Ruby, PostgreSQL, Redis, Sidekiq)
- Overkill: CI/CD, wiki, registry — не нужно для MVP

### Option D: Forgejo (форк Gitea)
- Community-driven форк Gitea
- API-совместим
- Более активная community, но меньше enterprise-adoption

## Decision

**Option B: Gitea (self-hosted)**

## Rationale

1. **Maturity** — Gitea стабильна, 10+ лет развития, миллионы инсталляций
2. **Lightweight** — один Go binary + встроенный SSH-сервер, ~50MB RAM
3. **REST API** — полный CRUD для repos, commits, branches, PRs, issues
4. **Webhooks** — push events → WEAVE event bus
5. **SSH/HTTPS access** — нативный git push/pull без нашего кода
6. **Self-hosted** — нет vendor lock-in, контроль над данными
7. **Speed of integration** — WEAVE Git Gateway = ~1 неделя vs написание своего = ~3 месяца

## Implementation

```
WEAVE API → Git Gateway → Gitea API
               ↓
          Auth Bridge (WEAVE session → Gitea token)
               ↓
          Paywall Layer (paid repo access check)
               ↓
          Gitea (Git storage + SSH/HTTP + webhooks)
```

### Auth Bridge
- При регистрации в WEAVE → создать пользователя в Gitea (API)
- WEAVE session → Gitea token (mapped, stored in Redis)
- Git push/pull → Gitea напрямую (SSH key или HTTP basic auth)

### Paywall Layer
- Перед каждым запросом к приватному/платному репо → проверка `repo_access` таблицы
- Если paid и нет активной подписки → 403

### Webhooks
- Gitea webhook → WEAVE Git Gateway → event bus → `repo.pushed` event
- Feed Module может создать пост (опционально)

## Consequences

### Positive
- Быстрая интеграция (недели, а не месяцы)
- Зрелый, протестированный Git-движок
- Нативный git CLI работает (clone, push, pull)
- Бесплатно (open-source)

### Negative
- Дополнительный сервис в инфраструктуре (+$30–50/мес)
- Два источника правды для пользователей (WEAVE + Gitea) → sync нужен
- Gitea UI не используется (всё через WEAVE) → возможны расхождения
- Gitea rate limits могут отличаться от WEAVE

### Migration path
- При росте: Forgejo (drop-in replacement, API-совместим)
- При глобальном масштабе: выделить Gitea в кластер (shared storage)
