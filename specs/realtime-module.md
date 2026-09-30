# Спецификация модуля: Realtime

## Обзор

Realtime — WebSocket-сервер для мгновенной доставки событий (сообщения, уведомления, presence, typing). MVP: Node.js ws, Scale: Centrifugo.

## Архитектура

```
┌──────────────────────────────────────────────────┐
│                  CLIENT (Web/Desktop)             │
│                                                   │
│  WebSocket: wss://api.weave.app/api/v1/realtime    │
│  Auth: ?token=eyJhbGc... (query param, first msg) │
│                                                   │
│  ┌──────────────────────────────────────────────┐ │
│  │           REALTIME CLIENT (browser)           │ │
│  │                                               │ │
│  │  • Auto-reconnect (exponential backoff)       │ │
│  │  • Heartbeat (30s)                            │ │
│  │  • Event handlers (per event type)            │ │
│  │  • State stores (Zustand)                     │ │
│  └──────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│              REALTIME GATEWAY                      │
│              (Node.js ws / Centrifugo)             │
│                                                    │
│  ┌────────────────┐  ┌────────────────────────┐  │
│  │  Connection     │  │  Event Router          │  │
│  │  Manager        │  │                        │  │
│  │                 │  │  Subscribes to Redis   │  │
│  │  • Auth verify  │  │  pub/sub channels      │  │
│  │  • Connections  │  │  → routes to connected │  │
│  │    registry     │  │    clients             │  │
│  │  • Channel subs │  │                        │  │
│  │  • Presence     │  │  Channels:             │  │
│  │                 │  │  • user:{id}           │  │
│  │                 │  │  • conversation:{id}   │  │
│  │                 │  │  • channel:{id}        │  │
│  │                 │  │  • repo:{id}           │  │
│  │                 │  │  • feed (broadcast)    │  │
│  └────────────────┘  └────────────────────────┘  │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│                 REDIS                              │
│                                                   │
│  Pub/Sub channels:                                │
│    user:{id}:events                               │
│    conversation:{id}:events                       │
│    channel:{id}:events                            │
│    feed:events                                    │
│                                                   │
│  Presence:                                        │
│    SET presence:user:{id} → TTL 60s (heartbeat)   │
│    SET presence:conversation:{id} → SET of users  │
└───────────────────────────────────────────────────┘
```

## Connection lifecycle

### 1. Connect

```
Client → WebSocket connect: wss://api.weave.app/api/v1/realtime?token=eyJhbGc...
  ↓
Gateway → verify JWT token
  ↓
Gateway → register connection: {user_id → connection}
  ↓
Gateway → set presence: online
  ↓
Gateway → subscribe to Redis: user:{id}:events
  ↓
Gateway → send: { event: "connected", data: { user_id } }
```

### 2. Subscribe to channels

```
Client → { event: "subscribe", data: { channel: "conversation:uuid" } }
  ↓
Gateway → verify access (is user member of conversation?)
  ↓
Gateway → add to connection's channel list
  ↓
Gateway → subscribe to Redis: conversation:uuid:events
  ↓
Gateway → send: { event: "subscribed", data: { channel: "conversation:uuid" } }
```

### 3. Receive events

```
Any Module → Event Bus → Redis PUBLISH conversation:uuid:events {message}
  ↓
Gateway (subscribed) → receive from Redis
  ↓
Gateway → find connections subscribed to this channel
  ↓
Gateway → send to each connection: { event: "message.new", data: {...} }
```

### 4. Heartbeat / Presence

```
Client → { event: "presence.heartbeat" } (every 30s)
  ↓
Gateway → refresh Redis: SET presence:user:{id} → EX 60
  ↓
Gateway → send: { event: "presence.ack" }

If no heartbeat for 60s:
  ↓
Gateway → connection dead → cleanup
  ↓
Gateway → set presence: offline
  ↓
Gateway → broadcast: { event: "presence.update", data: { user_id, online: false } }
```

### 5. Disconnect

```
Client → disconnect (page close, network loss)
  ↓
Gateway → detect (heartbeat timeout or close event)
  ↓
Gateway → remove connection from registry
  ↓
Gateway → set presence: offline
  ↓
Gateway → unsubscribe from Redis channels
  ↓
Gateway → broadcast: { event: "presence.update", data: { user_id, online: false } }
```

### 6. Reconnect

```
Client → connection lost → exponential backoff:
  Attempt 1: 1s
  Attempt 2: 2s
  Attempt 3: 4s
  Attempt 4: 8s
  Attempt 5+: 16s (max)
  ↓
Client → reconnect with same token
  ↓
Gateway → new connection, but same user
  ↓
Gateway → resend missed events (from last_read_at)
```

## Events

### Server → Client

| Event | Payload | Channel | Описание |
|---|---|---|---|
| `connected` | {user_id} | personal | Успешное подключение |
| `subscribed` | {channel} | personal | Подписка на канал активна |
| `message.new` | {conversation_id, message} | conversation:{id} | Новое сообщение |
| `message.updated` | {conversation_id, message} | conversation:{id} | Редактирование |
| `message.deleted` | {conversation_id, message_id} | conversation:{id} | Удаление |
| `channel.post.new` | {channel_id, post} | channel:{id} | Новый пост в канале |
| `feed.post.new` | {post} | feed | Новый пост в ленте |
| `notification.new` | {notification} | personal | Уведомление |
| `presence.update` | {user_id, online} | personal/conversation | Online/offline |
| `typing.start` | {conversation_id, user_id} | conversation:{id} | Набор текста |
| `typing.stop` | {conversation_id, user_id} | conversation:{id} | Конец набора |
| `repo.push` | {repo_id, branch, commits} | repo:{id} | Push в репо |
| `payment.confirmed` | {type, reference_id} | personal | Подтверждение платежа |
| `conversation.member_joined` | {conversation_id, user_id} | conversation:{id} | Новый участник |
| `conversation.member_left` | {conversation_id, user_id} | conversation:{id} | Участник вышел |

### Client → Server

| Event | Payload | Описание |
|---|---|---|
| `subscribe` | {channel} | Подписаться на канал |
| `unsubscribe` | {channel} | Отписаться |
| `presence.heartbeat` | — | Heartbeat (keepalive) |
| `conversation.read` | {conversation_id} | Отметить прочитанным |
| `typing.start` | {conversation_id} | Начал набирать |
| `typing.stop` | {conversation_id} | Закончил набирать |

## Message format

```json
{
  "event": "message.new",
  "data": {
    "conversation_id": "uuid",
    "message": {
      "id": "uuid",
      "sender_id": "uuid",
      "content": "Hello!",
      "created_at": "2026-09-30T12:00:00Z"
    }
  },
  "timestamp": "2026-09-30T12:00:00.123Z",
  "id": "evt_uuid"
}
```

## Scaling

### MVP (Node.js ws)

```typescript
// Single process, up to ~10K connections
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 4001 });

wss.on('connection', (ws, req) => {
  // Auth, register, subscribe to Redis
});
```

### Scale (Centrifugo)

```
Когда connections > 10K:
  → Centrifugo (Go-based, handles 100K+ connections)
  → API server publishes to Centrifugo (HTTP API)
  → Centrifugo manages WebSocket connections
  → Horizontal scaling (multiple Centrifugo nodes + Redis)
```

### Scale (Multiple ws instances + Redis)

```
Когда > 10K, но без Centrifugo:
  → Multiple ws instances behind load balancer (sticky sessions)
  → Redis pub/sub for cross-instance routing
  → Each instance subscribes to relevant channels
```

## Auth

### Initial auth (query param)

```
wss://api.weave.app/api/v1/realtime?token=eyJhbGc...
```

Gateway verifies JWT → extracts user_id → registers connection.

### Token refresh

```
Client → access token expires (15 min)
  ↓
Client → send new token: { event: "auth.refresh", data: { token: "new_eyJhbGc..." } }
  ↓
Gateway → verify new token → update connection auth
  ↓
If invalid → close connection with code 4001
```

### Disconnect codes

| Code | Описание |
|---|---|
| 1000 | Normal closure |
| 1001 | Going away (page close) |
| 1006 | Abnormal closure (network) |
| 4001 | Auth failed / token expired |
| 4002 | Rate limited |
| 4003 | Banned |

## Edge cases

1. **Multiple connections per user** — поддерживается (desktop + mobile + web), events fan-out to all
2. **Connection limit per user** — max 5 connections (security)
3. **Idle timeout** — 5 мин без heartbeat → disconnect
4. **Message ordering** — WebSocket preserves order per connection; Redis pub/sub preserves per channel
5. **Missed events during disconnect** — client fetches missed data on reconnect (REST API: GET /messages?after=last_id)
6. **Backpressure** — if client slow → buffer up to 100 messages, then disconnect
7. **Rate limit on client events** — typing.start: max 1/3s, subscribe: max 10/30s
8. **Presence accuracy** — 60s TTL + heartbeat → up to 60s delay in offline detection
9. **Large channels (100K+ subscribers)** — Redis pub/sub fan-out, each instance filters → efficient
10. **Graceful shutdown** — server sends 1001 to all clients, clients reconnect to another instance

## UI-требования

### RealtimeClient (browser)

```typescript
class RealtimeClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: NodeJS.Timeout;
  
  connect(token: string) { ... }
  disconnect() { ... }
  subscribe(channel: string) { ... }
  unsubscribe(channel: string) { ... }
  on(event: string, handler: (data) => void) { ... }
  send(event: string, data: any) { ... }
  
  // Auto-reconnect with exponential backoff
  private reconnect() { ... }
  
  // Heartbeat
  private startHeartbeat() { ... }
}
```

### Integration with Zustand

```typescript
// When message.new received → update messaging store
realtimeClient.on('message.new', (data) => {
  useMessagingStore.getState().addMessage(data.conversation_id, data.message);
});

// When notification.new received → update notification store
realtimeClient.on('notification.new', (data) => {
  useNotificationStore.getState().addNotification(data.notification);
});
```

### UI feedback

- **Connection indicator** — green (connected), yellow (reconnecting), red (disconnected)
- **Unread badge** — realtime update when message.new received
- **Toast notifications** — for payment.confirmed, subscription events
- **Typing indicator** — animated dots when typing.start received
- **Online status** — green dot on avatar when presence.update: online
