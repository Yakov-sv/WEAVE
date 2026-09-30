# ADR-003: Event-Driven Core

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE имеет 6 модулей, которые должны взаимодействовать (например: платеж → открыть доступ к каналу → уведомить пользователя). Нужно выбрать паттерн межмодульной коммуникации.

## Options

### Option A: Direct method calls
- Модули вызывают методы друг друга напрямую
- Просто, но сильная связанность
- Транзакции across modules (одна БД)

### Option B: Event-driven (Event Bus)
- Модули публикуют события, не зная кто их слушает
- Слабая связанность
- Async по природе

### Option C: CQRS + Event Sourcing
- Command bus + event store
- Максимальная сложность, overkill для MVP

## Decision

**Option B: Event-Driven (Event Bus)**

## Rationale

1. **Decoupling** — модули не зависят друг от друга → легче выделять в microservices
2. **Extensibility** — новый модуль может подписаться на события без изменения других
3. **Plugin-ready** — сторонние плагины могут слушать события (фаза 3)
4. **Audit trail** — события логируются → audit + analytics
5. **Resilience** — если consumer упал, события в очереди (Redis Streams), не потеряются

## Implementation

### MVP: In-process + PostgreSQL LISTEN/NOTIFY

```typescript
// event-bus.service.ts
@Injectable()
export class EventBusService {
  publish(event: Event): void {
    // 1. Save to events table (audit)
    // 2. Notify subscribers (in-process)
    // 3. LISTEN/NOTIFY for cross-process (if multiple API instances)
  }

  subscribe(eventType: string, handler: EventHandler): void {
    // Register handler
  }
}
```

### Scale: Redis Streams

```typescript
// When multiple API instances:
publish(event) → Redis XADD
                    ↓
              Multiple consumers (XREADGROUP)
                    ↓
              Each module's handler
```

### Event schema

```typescript
interface Event {
  id: UUID;
  type: string;          // e.g. "payment.succeeded"
  source: string;        // module name
  payload: any;          // event-specific data
  timestamp: Date;
  correlationId?: UUID;  // for tracing
}
```

### Key events

| Event | Publisher | Subscribers |
|---|---|---|
| user.registered | Identity | Feed, Search |
| user.followed | Identity | Feed, Notification |
| post.created | Feed | Search, Notification |
| channel.post.created | Messaging | Feed, Notification |
| repo.pushed | Git | Feed, Notification |
| payment.succeeded | Payments | Market, Messaging, Git, Notification |
| subscription.expired | Payments | Market, Messaging, Git |
| listing.purchased | Market | Git, Notification |
| message.sent | Messaging | Realtime, Notification |

## Consequences

### Positive
- Слабая связанность модулей
- Лёгкое добавление новых модулей/плагинов
- Audit trail всех событий
- Путь к microservices без переписывания

### Negative
- Eventual consistency (не сразу видно эффект)
- Сложнее отладка (события async)
- Need idempotent consumers (события могут дублироваться)
- Дополнительная инфраструктура (Redis Streams при масштабе)

### Mitigations
- Correlation ID для трассировки
- Idempotency keys в обработчиках
- Event catalog (документация всех событий)
- Dead-letter queue для failed events
