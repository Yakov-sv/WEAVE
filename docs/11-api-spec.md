# WEAVE — Спецификация API

## Обзор

- **Base URL:** `https://api.weave.app/api/v1`
- **Realtime:** `wss://api.weave.app/api/v1/realtime`
- **Формат:** JSON
- **Аутентификация:** Bearer token (`Authorization: Bearer {token}`)
- **Rate limits:** 100 req/мин (authenticated), 20 req/мин (anonymous)
- **Пагинация:** cursor-based (`?cursor=xxx&limit=20`)
- **Версионирование:** URL-based (`/api/v1/`)

## Аутентификация

### Регистрация
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}

→ 201 Created
{
  "user": { "id": "uuid", "username": "johndoe", ... },
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Логин
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

→ 200 OK
{
  "user": { ... },
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc..."
}
```

### Passkey-аутентификация
```http
POST /api/v1/auth/passkey/register/begin
→ 200 OK { "challenge": "...", "rp": {...}, ... }

POST /api/v1/auth/passkey/register/finish
{ "credential": {...} }
→ 200 OK { "success": true }

POST /api/v1/auth/passkey/login/begin
{ "username": "johndoe" }
→ 200 OK { "challenge": "..." }

POST /api/v1/auth/passkey/login/finish
{ "assertion": {...} }
→ 200 OK { "user": {...}, "token": "..." }
```

### Refresh token
```http
POST /api/v1/auth/refresh
{ "refresh_token": "eyJhbGc..." }
→ 200 OK { "token": "new_token", "refresh_token": "new_refresh" }
```

### Выход
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
→ 200 OK { "success": true }
```

## Identity Module

### Профиль
```http
GET    /api/v1/users/{username}
→ 200 OK { "id": "uuid", "username": "johndoe", "display_name": "John", ... }

PATCH  /api/v1/users/{username}
Authorization: Bearer {token}
{ "display_name": "John Doe", "bio": "New bio" }
→ 200 OK { "user": {...} }

DELETE /api/v1/users/{username}
Authorization: Bearer {token}
→ 204 No Content
```

### Подписки (follow)
```http
POST   /api/v1/users/{username}/follow
Authorization: Bearer {token}
→ 200 OK { "following": true }

DELETE /api/v1/users/{username}/follow
Authorization: Bearer {token}
→ 200 OK { "following": false }

GET    /api/v1/users/{username}/followers?cursor=xxx&limit=20
→ 200 OK { "items": [...], "next_cursor": "xxx", "total": 1234 }

GET    /api/v1/users/{username}/following?cursor=xxx&limit=20
→ 200 OK { "items": [...], "next_cursor": "xxx" }
```

### Связанные аккаунты
```http
POST   /api/v1/identities/link
Authorization: Bearer {token}
{ "provider": "github", "code": "oauth_code" }
→ 200 OK { "identity": {...} }

GET    /api/v1/identities
Authorization: Bearer {token}
→ 200 OK { "identities": [...] }

DELETE /api/v1/identities/{id}
Authorization: Bearer {token}
→ 204 No Content
```

### Блокировки
```http
POST   /api/v1/users/{username}/block
DELETE /api/v1/users/{username}/block
```

### Настройки
```http
GET    /api/v1/settings
PATCH  /api/v1/settings
{ "is_private": true, "allow_dms": "followers" }
```

## Feed Module

### Лента
```http
GET    /api/v1/feed?cursor=xxx&limit=20&type=algorithmic
Authorization: Bearer {token}
→ 200 OK { "items": [...posts], "next_cursor": "xxx" }

GET    /api/v1/feed/discover?cursor=xxx&limit=20
→ 200 OK { "items": [...posts] }

GET    /api/v1/feed/chronological?cursor=xxx&limit=20
Authorization: Bearer {token}
→ 200 OK { "items": [...posts] }
```

### Посты
```http
POST   /api/v1/posts
Authorization: Bearer {token}
{
  "type": "text",
  "content": "Hello world! **markdown** supported",
  "media_assets": [],
  "visibility": "public",
  "topics": ["dev", "weave"]
}
→ 201 Created { "post": {...} }

POST   /api/v1/posts (with media)
Authorization: Bearer {token}
{
  "type": "media",
  "content": "Check this out!",
  "media_assets": [
    { "type": "image", "cdn_url": "https://..." }
  ]
}
→ 201 Created { "post": {...} }

POST   /api/v1/posts (with code reference)
{
  "type": "code",
  "content": "Just shipped this function!",
  "code_ref": {
    "repo_id": "uuid",
    "commit": "abc123",
    "file": "src/utils.ts",
    "lines": [10, 25]
  }
}

GET    /api/v1/posts/{id}
→ 200 OK { "post": {...} }

DELETE /api/v1/posts/{id}
Authorization: Bearer {token}
→ 204 No Content

PATCH  /api/v1/posts/{id}
{ "content": "Updated content" }
→ 200 OK { "post": {...} }
```

### Ответы / треды
```http
POST   /api/v1/posts/{id}/reply
{ "content": "Great post!" }
→ 201 Created { "post": {...} }

GET    /api/v1/posts/{id}/replies?cursor=xxx&limit=20
→ 200 OK { "items": [...], "next_cursor": "xxx" }
```

### Реакции
```http
POST   /api/v1/posts/{id}/react
{ "type": "like" }  // like, boost, bookmark
→ 200 OK { "reacted": true }

DELETE /api/v1/posts/{id}/react
{ "type": "like" }
→ 200 OK { "reacted": false }
```

### Репосты
```http
POST   /api/v1/posts/{id}/repost
{ "content": "My commentary" }  // optional
→ 201 Created { "post": {...} }

POST   /api/v1/posts/{id}/quote
{ "content": "Interesting perspective" }
→ 201 Created { "post": {...} }
```

### Топики
```http
GET    /api/v1/topics/{name}?cursor=xxx&limit=20
→ 200 OK { "topic": {...}, "items": [...posts] }

GET    /api/v1/topics/trending
→ 200 OK { "items": [...topics] }
```

### Загрузка медиа
```http
POST   /api/v1/media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
file: <binary>
→ 201 Created { "id": "uuid", "cdn_url": "https://...", "thumbnail_url": "..." }
```

## Messaging Module

### Список бесед
```http
GET    /api/v1/conversations?cursor=xxx&limit=20&type=all
Authorization: Bearer {token}
→ 200 OK { "items": [...], "next_cursor": "xxx" }

GET    /api/v1/conversations?type=dm
GET    /api/v1/conversations?type=channel
```

### Создание беседы
```http
POST   /api/v1/conversations
{
  "type": "dm",
  "participant_id": "uuid"
}
→ 201 Created { "conversation": {...} }

POST   /api/v1/conversations
{
  "type": "group",
  "title": "Team Chat",
  "participant_ids": ["uuid1", "uuid2"]
}

POST   /api/v1/conversations
{
  "type": "channel",
  "title": "My Channel",
  "description": "Dev updates"
}
```

### Сообщения
```http
GET    /api/v1/conversations/{id}/messages?cursor=xxx&limit=50
Authorization: Bearer {token}
→ 200 OK { "items": [...messages], "next_cursor": "xxx" }

POST   /api/v1/conversations/{id}/messages
{
  "content": "Hello!",
  "media_assets": [],
  "reply_to_id": "uuid"
}
→ 201 Created { "message": {...} }

PATCH  /api/v1/messages/{id}
{ "content": "Edited message" }

DELETE /api/v1/messages/{id}
→ 204 No Content
```

### Каналы — посты
```http
POST   /api/v1/conversations/{id}/posts
{
  "content": "Big announcement!",
  "media_assets": [...],
  "is_paywall": false
}
→ 201 Created { "post": {...} }

GET    /api/v1/conversations/{id}/posts?cursor=xxx&limit=20
→ 200 OK { "items": [...], "next_cursor": "xxx" }
```

### Каналы — подписка
```http
POST   /api/v1/conversations/{id}/subscribe
Authorization: Bearer {token}
→ 200 OK { "checkout_url": "https://stripe.com/..." }

POST   /api/v1/conversations/{id}/unsubscribe
→ 200 OK { "success": true }

GET    /api/v1/conversations/{id}/members?cursor=xxx&limit=50
→ 200 OK { "items": [...], "next_cursor": "xxx" }
```

### Управление участниками
```http
POST   /api/v1/conversations/{id}/members
{ "user_id": "uuid", "role": "admin" }

DELETE /api/v1/conversations/{id}/members/{user_id}

PATCH  /api/v1/conversations/{id}/members/{user_id}
{ "role": "admin" }
```

## Git Module

### Репозитории
```http
GET    /api/v1/repos?cursor=xxx&limit=20
Authorization: Bearer {token}
→ 200 OK { "items": [...repos] }

GET    /api/v1/repos/{owner}/{name}
→ 200 OK { "repo": {...} }

POST   /api/v1/repos
{
  "name": "my-project",
  "description": "Awesome project",
  "visibility": "public",
  "import_from": "github:octocat/hello-world"  // optional
}
→ 201 Created { "repo": {...} }

PATCH  /api/v1/repos/{owner}/{name}
{ "description": "Updated", "visibility": "private" }

DELETE /api/v1/repos/{owner}/{name}
```

### Git-операции (через Gitea proxy)
```http
GET    /api/v1/repos/{owner}/{name}/tree/{branch}
→ 200 OK { "tree": [...files] }

GET    /api/v1/repos/{owner}/{name}/blob/{branch}/{path}
→ 200 OK { "content": "...", "language": "typescript" }

GET    /api/v1/repos/{owner}/{name}/commits?branch=main&cursor=xxx
→ 200 OK { "items": [...commits] }

GET    /api/v1/repos/{owner}/{name}/branches
→ 200 OK { "items": [...branches] }
```

### Pull Requests
```http
GET    /api/v1/repos/{owner}/{name}/pulls?state=open
→ 200 OK { "items": [...] }

POST   /api/v1/repos/{owner}/{name}/pulls
{
  "title": "Add feature X",
  "body": "Description",
  "head": "feature-branch",
  "base": "main"
}
→ 201 Created { "pull": {...} }

GET    /api/v1/repos/{owner}/{name}/pulls/{number}
PATCH  /api/v1/repos/{owner}/{name}/pulls/{number}
POST   /api/v1/repos/{owner}/{name}/pulls/{number}/merge
```

### Issues
```http
GET    /api/v1/repos/{owner}/{name}/issues?state=open
POST   /api/v1/repos/{owner}/{name}/issues
{ "title": "Bug report", "body": "..." }
PATCH  /api/v1/repos/{owner}/{name}/issues/{number}
POST   /api/v1/repos/{owner}/{name}/issues/{number}/comments
```

### Stars
```http
POST   /api/v1/repos/{owner}/{name}/star
DELETE /api/v1/repos/{owner}/{name}/star
```

### Подписка на платный репозиторий
```http
POST   /api/v1/repos/{owner}/{name}/subscribe
→ 200 OK { "checkout_url": "https://stripe.com/..." }
```

### Импорт
```http
POST   /api/v1/repos/import
{
  "source": "github",
  "repo_url": "https://github.com/octocat/hello-world",
  "visibility": "public"
}
→ 202 Accepted { "job_id": "uuid" }

GET    /api/v1/import-jobs/{id}
→ 200 OK { "status": "in_progress", "progress": 45 }
```

## Market Module

### Листинги
```http
GET    /api/v1/market/listings?cursor=xxx&limit=20&type=code&sort=popular
→ 200 OK { "items": [...], "next_cursor": "xxx" }

GET    /api/v1/market/listings/{id}
→ 200 OK { "listing": {...} }

POST   /api/v1/market/listings
Authorization: Bearer {token}
{
  "type": "code",
  "title": "React UI Kit",
  "description": "Complete component library",
  "price_cents": 4900,
  "currency": "USD",
  "linked_repo_id": "uuid",
  "tags": ["react", "ui", "components"]
}
→ 201 Created { "listing": {...} }

PATCH  /api/v1/market/listings/{id}
DELETE /api/v1/market/listings/{id}
```

### Покупка
```http
POST   /api/v1/market/listings/{id}/purchase
Authorization: Bearer {token}
→ 200 OK { "checkout_url": "https://stripe.com/..." }

GET    /api/v1/market/purchases?cursor=xxx
Authorization: Bearer {token}
→ 200 OK { "items": [...purchases] }
```

### Подписочные планы
```http
GET    /api/v1/subscriptions/plans?creator_id={uuid}
→ 200 OK { "items": [...plans] }

POST   /api/v1/subscriptions/plans
Authorization: Bearer {token}
{
  "name": "Pro Access",
  "price_cents": 1000,
  "currency": "USD",
  "interval": "monthly",
  "linked_channel_id": "uuid",
  "features": ["exclusive_posts", "source_code", "priority_support"]
}
→ 201 Created { "plan": {...} }
```

### Подписка
```http
POST   /api/v1/subscriptions/subscribe
{ "plan_id": "uuid" }
→ 200 OK { "checkout_url": "..." }

DELETE /api/v1/subscriptions/{id}
→ 200 OK { "cancelled": true, "cancel_at_period_end": true }

GET    /api/v1/subscriptions/mine
→ 200 OK { "items": [...active_subscriptions] }
```

### Чаевые
```http
POST   /api/v1/tips
{ "recipient_id": "uuid", "amount_cents": 500, "message": "Great work!" }
→ 200 OK { "checkout_url": "..." }
```

### Отзывы
```http
POST   /api/v1/market/listings/{id}/reviews
{ "rating": 5, "content": "Excellent!" }
→ 201 Created { "review": {...} }

GET    /api/v1/market/listings/{id}/reviews
→ 200 OK { "items": [...reviews] }
```

## Payments Module

### Баланс и выплаты
```http
GET    /api/v1/payments/balance
Authorization: Bearer {token}
→ 200 OK { "available_cents": 50000, "pending_cents": 10000, "lifetime_cents": 150000 }

POST   /api/v1/payments/payouts
{ "amount_cents": 50000 }
→ 202 Accepted { "payout_id": "uuid", "status": "pending" }

GET    /api/v1/payments/payouts
→ 200 OK { "items": [...payouts] }
```

### Транзакции
```http
GET    /api/v1/payments/transactions?cursor=xxx&limit=50
→ 200 OK { "items": [...transactions] }
```

### Stripe Webhook
```http
POST   /api/v1/payments/webhook
Stripe-Signature: t=...,v1=...
{ ... stripe event ... }
→ 200 OK { "received": true }
```

### Stripe Customer Portal
```http
GET    /api/v1/payments/portal
Authorization: Bearer {token}
→ 200 OK { "url": "https://billing.stripe.com/..." }
```

## Notifications

```http
GET    /api/v1/notifications?cursor=xxx&limit=20&unread=true
Authorization: Bearer {token}
→ 200 OK { "items": [...], "next_cursor": "xxx" }

POST   /api/v1/notifications/read
{ "ids": ["uuid1", "uuid2"] }
→ 200 OK { "success": true }

POST   /api/v1/notifications/read-all
→ 200 OK { "success": true }
```

## Search

```http
GET    /api/v1/search?q=react+components&type=all&cursor=xxx&limit=20
→ 200 OK {
  "users": [...],
  "posts": [...],
  "repos": [...],
  "listings": [...],
  "topics": [...]
}

GET    /api/v1/search?q=xxx&type=users
GET    /api/v1/search?q=xxx&type=repos
GET    /api/v1/search?q=xxx&type=listings
```

## Realtime (WebSocket)

```
Connection: wss://api.weave.app/api/v1/realtime
Auth: ?token=eyJhbGc... (query param for initial auth)

### Server → Client events:

// Новое сообщение
{ "event": "message.new", "data": { "conversation_id": "uuid", "message": {...} } }

// Новый пост в канале
{ "event": "channel.post.new", "data": { "channel_id": "uuid", "post": {...} } }

// Новый пост в ленте
{ "event": "feed.post.new", "data": { "post": {...} } }

// Уведомление
{ "event": "notification.new", "data": { "notification": {...} } }

// Присутствие
{ "event": "presence.update", "data": { "user_id": "uuid", "online": true } }

// Push в репо
{ "event": "repo.push", "data": { "repo_id": "uuid", "branch": "main", "commits": [...] } }

// Подтверждение платежа
{ "event": "payment.confirmed", "data": { "type": "subscription", "reference_id": "uuid" } }

// Индикатор набора
{ "event": "typing.start", "data": { "conversation_id": "uuid", "user_id": "uuid" } }
{ "event": "typing.stop", "data": { "conversation_id": "uuid", "user_id": "uuid" } }

### Client → Server events:

// Heartbeat
{ "event": "presence.heartbeat" }

// Отметить прочитанным
{ "event": "conversation.read", "data": { "conversation_id": "uuid" } }

// Typing indicator
{ "event": "typing.start", "data": { "conversation_id": "uuid" } }
{ "event": "typing.stop", "data": { "conversation_id": "uuid" } }

// Подписка на канал realtime
{ "event": "subscribe", "data": { "channel": "feed" } }
{ "event": "subscribe", "data": { "channel": "conversation:uuid" } }
{ "event": "subscribe", "data": { "channel": "repo:uuid" } }
```

## Rate Limits

| Endpoint group | Limit | Window |
|---|---|---|
| Auth (login/register) | 5 | 1 мин |
| Post creation | 20 | 1 мин |
| Message sending | 60 | 1 мин |
| API (general, auth) | 100 | 1 мин |
| API (general, anon) | 20 | 1 мин |
| Media upload | 10 | 1 мин |
| Git operations (proxy) | 60 | 1 мин |
| Search | 30 | 1 мин |

### Rate limit headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696123456
```

## Error format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found",
    "details": { "post_id": "uuid" }
  }
}
```

### Коды ошибок

| HTTP | Code | Описание |
|---|---|---|
| 400 | BAD_REQUEST | Некорректный запрос |
| 401 | UNAUTHORIZED | Не аутентифицирован |
| 403 | FORBIDDEN | Нет прав доступа |
| 404 | NOT_FOUND | Не найдено |
| 409 | CONFLICT | Конфликт (дубликат и т.д.) |
| 422 | VALIDATION_ERROR | Ошибка валидации |
| 429 | RATE_LIMITED | Превышен rate limit |
| 500 | INTERNAL_ERROR | Внутренняя ошибка |
| 502 | UPSTREAM_ERROR | Ошибка Gitea/Stripe |
