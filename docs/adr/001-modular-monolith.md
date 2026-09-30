# ADR-001: Modular Monolith вместо Microservices

**Status:** Accepted
**Date:** 2026-09-30
**Decision Maker:** Founder

## Context

WEAVE имеет 6 модулей (Identity, Feed, Messaging, Git, Market, Payments). Нужно выбрать архитектурный стиль: modular monolith или microservices.

## Options

### Option A: Microservices
- Каждый модуль — отдельный сервис
- Independent deployment, scaling
- Сложная инфраструктура (service mesh, distributed tracing, inter-service auth)
- 6+ сервисов → 6+ Docker containers → больше ресурсов на старте

### Option B: Modular Monolith
- Все модули в одном NestJS-приложении
- Модули изолированы логически (separate controllers, services, DTOs)
- Общая БД (с разделением по схемам/таблицам)
- Event bus для межмодульной коммуникации

### Option C: Hybrid
- Identity + Payments как отдельные сервисы (security/compliance)
- Остальные в монолите

## Decision

**Option B: Modular Monolith**

## Rationale

1. **Speed to MVP** — один сервис быстрее разработать, задеплоить, отладить
2. **Simpler infrastructure** — один Docker container, один process, проще мониторинг
3. **Lower cost** — меньше серверов на старте ($200/мес vs $600+ для microservices)
4. **Easier debugging** — один процесс, один stack trace, локальная разработка проще
5. **Team size** — 2–5 инженеров не могут эффективно поддерживать 6+ сервисов
6. **Event bus preserved** — модули общаются через события, что облегчает будущий переход к microservices

## Consequences

### Positive
- Быстрее разработка и деплой
- Проще инфраструктура и мониторинг
- Меньше затраты
- Atomic transactions across modules (одна БД)

### Negative
- Один модуль может уронить весь процесс (mitigation: graceful shutdown, circuit breakers)
- Сильнее связанность (mitigation: event bus, не прямые вызовы)
- Масштабирование — только целиком (mitigation: выделить realtime в отдельный процесс)

### Migration path
- При росте: выделить Realtime → отдельный процесс (месяц 6)
- При росте: выделить Git Gateway → отдельный процесс (месяц 10)
- При росте: выделить Payments → отдельный сервис (фаза 2, compliance)
- Event bus (Redis Streams) уже используется → миграция безопасна
