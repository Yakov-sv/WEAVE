# ADR-007: Redis для Realtime и Event Bus

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE требует: WebSocket-соединения (realtime messaging), event bus (межмодульная коммуникация), cache, session storage, rate limiting. Нужно выбрать технологию.

## Options

### Option A: Redis (single solution)
- Cache: strings, hash, sets, sorted sets
- Pub/Sub: event bus
- Streams: durable event queue
- Session storage: key-value with TTL
- Rate limiting: sliding window (sorted sets)
- Presence: sets with TTL

### Option B: Redis + RabbitMQ/NATS
- Redis для cache/sessions
- RabbitMQ/NATS для event bus (durable, routing, DLQ)
- Два сервиса вместо одного

### Option C: Redis + Centrifugo (for WebSocket)
- Redis для cache/sessions/events
- Centrifugo для WebSocket (Go-based, horizontal scaling, presence)

### Option D: PostgreSQL LISTEN/NOTIFY (no Redis)
- FTS, cache, sessions — in PostgreSQL
- LISTEN/NOTIFY for events
- WebSocket in Node.js directly
- Simpler infra, but PostgreSQL not designed for high-frequency pub/sub

## Decision

**Option A: Redis (MVP)** → **Option C: Redis + Centrifugo (scale)**

## Rationale

1. **Single service** — Redis покрывает все нужды (cache, events, sessions, rate limit, presence)
2. **Performance** — in-memory, sub-millisecond latency
3. **Versatility** — data structures (strings, hash, sets, sorted sets, streams, pub/sub)
4. **Simplicity** — один сервис, один Docker container, одна точка конфигурации
5. **Maturity** — Redis 15+ лет, production-proven, огромная экосистема
6. **Scale path** — Redis Cluster (horizontal), Sentinel (HA), Streams (durable events)

## Implementation

### Cache

```typescript
// Cache user profile
await redis.set(`user:${userId}`, JSON.stringify(profile), 'EX', 300);

// Get cached profile
const cached = await redis.get(`user:${userId}`);
```

### Sessions

```typescript
// Create session
await redis.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', 86400);

// Validate session
const session = await redis.get(`session:${sessionId}`);
```

### Event Bus (Pub/Sub for MVP → Streams for scale)

```typescript
// MVP: Pub/Sub
await redis.publish('events', JSON.stringify(event));

redis.subscribe('events', (message) => {
  const event = JSON.parse(message);
  eventRouter.handle(event);
});

// Scale: Streams (durable, consumer groups)
await redis.xadd('events', '*', 'type', event.type, 'payload', JSON.stringify(event.payload));

// Consumer group
await redis.xreadgroup('GROUP', 'messaging-module', 'worker-1', 'COUNT', 10, 'STREAMS', 'events', '>');
```

### Rate Limiting

```typescript
// Sliding window rate limiter
const key = `rate:${userId}:${endpoint}`;
const now = Date.now();
const windowStart = now - 60000; // 1 minute

await redis.zremrangebyscore(key, 0, windowStart);
const count = await redis.zcard(key);
if (count >= limit) {
  throw new RateLimitError();
}
await redis.zadd(key, now, `${now}:${Math.random()}`);
await redis.expire(key, 60);
```

### Presence (online/offline)

```typescript
// User connects via WebSocket
await redis.sadd('presence:online', userId);
await redis.expire('presence:online', 60); // TTL, refreshed by heartbeat

// Check if user is online
const isOnline = await redis.sismember('presence:online', userId);
```

### WebSocket (MVP: Node.js ws)

```typescript
// MVP: Direct WebSocket in API process
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 4001 });

wss.on('connection', (ws, req) => {
  // Auth via token
  // Subscribe to Redis channels for this user
  redis.subscribe(`user:${userId}:notifications`, (msg) => {
    ws.send(msg);
  });
});

// Scale: Centrifugo (separate process)
// Centrifugo handles WebSocket, subscribes to Redis, scales horizontally
```

## Consequences

### Positive
- Один сервис для всех нужд (simple infra)
- Sub-millisecond latency
- Versatile data structures
- Scale path: Cluster + Streams + Centrifugo
- Production-proven, огромная экосистема

### Negative
- In-memory → data loss on crash (mitigation: AOF persistence, RDB snapshots)
- Pub/Sub не durable (mitigation: Streams для critical events)
- Single-threaded (mitigation: Cluster for horizontal, multiple instances)
- Redis 7 license change → Valkey/KeyDB alternatives if needed

### Migration path
- MVP: single Redis instance + Node.js WebSocket
- Scale (10K+ connections): Centrifugo for WebSocket
- Scale (100K+ events): Redis Streams + consumer groups
- HA: Redis Sentinel → Redis Cluster
- Alternative: Valkey (Redis fork, Linux Foundation) if license concerns
