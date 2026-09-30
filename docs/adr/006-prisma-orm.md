# ADR-006: Prisma ORM

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE использует PostgreSQL. Нужен ORM/query builder для Node.js/TypeScript backend.

## Options

### Option A: Prisma
- Schema-first (prisma/schema.prisma)
- Type-safe generated client
- Migration system (prisma migrate)
- Query builder + raw SQL fallback
- PostgreSQL-first, отличная поддержка

### Option B: Drizzle ORM
- TypeScript-first, lightweight
- SQL-like API
- Быстрее runtime (no codegen)
- Меньше зрелый, меньше экосистема

### Option C: TypeORM
- Decorator-based (Active Record / Data Mapper)
- Зрелый, но проблемы с migration flow
- Меньше type-safety

### Option D: Raw SQL (pg driver)
- Максимум control и performance
- Нет type-safety, много boilerplate
- Manual migrations

### Option E: Kysely
- TypeScript query builder
- Type-safe, SQL-like
- No migrations (нужен отдельный tool)

## Decision

**Option A: Prisma** (+ Drizzle для hot-path queries, опционально)

## Rationale

1. **Type safety** — generated client полностью типобезопасен, изменения схемы → типы автоматически
2. **Schema-first** — единый source of truth (schema.prisma), генерирует и типы, и клиент, и миграции
3. **Migration system** — `prisma migrate dev` (dev) + `prisma migrate deploy` (prod), version-controlled
4. **PostgreSQL-first** — отличная поддержка PG-фич: JSONB, arrays, enums, full-text search, extensions
5. **Developer experience** — Prisma Studio (GUI for DB), excellent docs, large community
6. **Raw SQL fallback** — `prisma.$queryRaw` для сложных queries (full-text search, aggregations)
7. **Relations** — automatic joins, eager/lazy loading, nested writes

## Implementation

### Schema example

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  username     String   @unique
  displayName  String?  @map("display_name")
  bio          String   @default("")
  avatarUrl    String?  @map("avatar_url")
  verified     Boolean  @default(false)
  role         String   @default("user")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  posts        Post[]
  subscriptions Subscription[] @relation("follower")
  followers    Subscription[] @relation("following")

  @@map("users")
  @@index([createdAt(sort: Desc)])
}

model Post {
  id          String   @id @default(uuid())
  authorId    String   @map("author_id")
  type        String
  content     String   @default("")
  visibility  String   @default("public")
  createdAt   DateTime @default(now()) @map("created_at")

  author      User     @relation(fields: [authorId], references: [id])

  @@map("posts")
  @@index([authorId, createdAt(sort: Desc)])
}
```

### Usage

```typescript
// Create post
const post = await prisma.post.create({
  data: {
    authorId: userId,
    type: 'text',
    content: 'Hello world!',
  },
  include: { author: true },
});

// Query feed (cursor pagination)
const posts = await prisma.post.findMany({
  where: {
    authorId: { in: followingIds },
    deletedAt: null,
  },
  cursor: cursor ? { id: cursor } : undefined,
  take: 20,
  orderBy: { createdAt: 'desc' },
  include: { author: true, reactions: true },
});

// Raw SQL for full-text search
const results = await prisma.$queryRaw`
  SELECT * FROM posts
  WHERE to_tsvector('english', content) @@ to_tsquery('english', ${query})
  ORDER BY ts_rank(to_tsvector('english', content), to_tsquery('english', ${query})) DESC
  LIMIT 20
`;
```

## Consequences

### Positive
- Полная type-safety от БД до API
- Schema как single source of truth
- Отличная DX (Studio, docs, error messages)
- Version-controlled migrations
- PostgreSQL-специфичные фичи доступны

### Negative
- Codegen step (prisma generate) — замедляет dev loop на ~2 сек
- Bundle size (~3MB for client)
- N+1 queries possible (mitigation: include/select, Prisma analyzes)
- Complex joins — иногда нужен raw SQL
- Cold start: connection pooling (mitigation: PgBouncer)

### Mitigations
- Hot-path queries: Drizzle (опционально, для performance-critical)
- Connection pooling: PgBouncer (transaction mode)
- N+1: Prisma query analysis + code review
- Codegen: turbo cache + pre-commit hook
