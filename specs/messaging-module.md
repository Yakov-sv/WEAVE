# Спецификация модуля: Messaging

## Обзор

Messaging — чаты и каналы (как Telegram). DM, групповые чаты, broadcast-каналы (бесплатные и платные). Realtime-доставка.

## Сущности

### Conversation
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| type | ENUM | dm, group, channel |
| title | VARCHAR(200) | Название (для group/channel) |
| description | TEXT | Описание канала |
| avatar_url | VARCHAR(500) | Аватар канала |
| owner_id | UUID | FK → users (создатель) |
| is_paid | BOOLEAN | Платный канал |
| subscription_plan_id | UUID | FK → subscription_plans |
| is_verified | BOOLEAN | Верифицированный канал |
| member_count | INT | Счётчик участников |
| subscriber_count | INT | Счётчик подписчиков канала |

### Membership
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| conversation_id | UUID | FK → conversations |
| user_id | UUID | FK → users |
| role | ENUM | owner, admin, member, subscriber |
| joined_at | TIMESTAMP | Когда присоединился |
| last_read_at | TIMESTAMP | Последнее прочитанное сообщение |
| muted | BOOLEAN | Беззвучный режим |

### Message
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| conversation_id | UUID | FK → conversations |
| sender_id | UUID | FK → users |
| content | TEXT | Markdown |
| content_html | TEXT | Pre-rendered HTML |
| media_assets | JSONB | Медиа-вложения |
| reply_to_id | UUID | FK → messages (ответ на сообщение) |
| edited_at | TIMESTAMP | Время редактирования |
| deleted_at | TIMESTAMP | Soft delete |

### ChannelPost
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| channel_id | UUID | FK → conversations (type=channel) |
| author_id | UUID | FK → users |
| content | TEXT | Markdown |
| media_assets | JSONB | Медиа |
| is_paywall | BOOLEAN | Платный пост |
| paywall_preview | TEXT | Превью перед paywall |
| paywall_config | JSONB | {price_cents, currency} |
| view_count | INT | Просмотров |
| reaction_count | INT | Реакций |

### MessageReaction
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| message_id | UUID | FK → messages |
| emoji | VARCHAR(10) | Emoji reaction |

## API

### Conversations
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /conversations | Список бесед (filter: dm/group/channel) | Yes |
| POST | /conversations | Создать беседу (dm/group/channel) | Yes |
| GET | /conversations/{id} | Информация о беседе | Yes (member) |
| PATCH | /conversations/{id} | Обновить (title, description, avatar) | Yes (owner/admin) |
| DELETE | /conversations/{id} | Удалить беседу | Yes (owner) |
| GET | /conversations/{id}/members | Список участников | Yes (member) |
| POST | /conversations/{id}/members | Добавить участника | Yes (admin) |
| DELETE | /conversations/{id}/members/{user_id} | Удалить участника | Yes (admin/owner) |

### Messages
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /conversations/{id}/messages | История сообщений (paginated) | Yes (member) |
| POST | /conversations/{id}/messages | Отправить сообщение | Yes (member) |
| PATCH | /messages/{id} | Редактировать сообщение | Yes (sender) |
| DELETE | /messages/{id} | Удалить сообщение | Yes (sender/admin) |
| POST | /messages/{id}/reactions | Реакция на сообщение | Yes (member) |

### Channel posts
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /conversations/{id}/posts | Посты канала (paginated) | Yes (subscriber) |
| POST | /conversations/{id}/posts | Создать пост в канале | Yes (owner/admin) |
| PATCH | /conversations/{id}/posts/{post_id} | Редактировать пост | Yes (author) |
| DELETE | /conversations/{id}/posts/{post_id} | Удалить пост | Yes (author/owner) |

### Channel subscription
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| POST | /conversations/{id}/subscribe | Подписаться на канал (free/paid) | Yes |
| POST | /conversations/{id}/unsubscribe | Отписаться | Yes |
| GET | /conversations/{id}/subscription-info | Информация о подписке | Yes |

## События

| Событие | Payload | Consumers |
|---|---|---|
| message.sent | {conversation_id, message_id, sender_id} | Realtime (push to members), Notification |
| message.edited | {message_id, conversation_id} | Realtime (update in UI) |
| message.deleted | {message_id, conversation_id} | Realtime (remove from UI) |
| conversation.created | {conversation_id, type, owner_id} | Notification (participants) |
| conversation.member_added | {conversation_id, user_id} | Notification, Realtime |
| conversation.member_removed | {conversation_id, user_id} | Realtime (disconnect) |
| channel.post.created | {channel_id, post_id, author_id} | Realtime (push to subscribers), Feed (broadcast), Notification |
| channel.subscribed | {channel_id, user_id} | Notification (channel owner) |
| channel.unsubscribed | {channel_id, user_id} | Analytics |
| message.reaction_added | {message_id, user_id, emoji} | Realtime (update reactions) |

## Realtime

### WebSocket events (Messaging-related)

| Event (server→client) | Payload | Назначение |
|---|---|---|
| message.new | {conversation_id, message} | Новое сообщение |
| message.updated | {conversation_id, message} | Редактирование |
| message.deleted | {conversation_id, message_id} | Удаление |
| channel.post.new | {channel_id, post} | Новый пост в канале |
| typing.start | {conversation_id, user_id} | Индикатор набора |
| typing.stop | {conversation_id, user_id} | Окончание набора |
| conversation.member_joined | {conversation_id, user_id} | Новый участник |
| conversation.member_left | {conversation_id, user_id} | Участник вышел |
| message.reaction | {message_id, emoji, user_id, action} | Реакция |
| presence.update | {user_id, online} | Online/offline |

## Edge cases

1. **DM between blocked users** — нельзя отправить DM заблокированному/от него
2. **Group limit** — max 50 участников (MVP), 200 (фаза 2)
3. **Channel subscriber count** — кэшировать, обновлять async
4. **Paid channel — payment failure** — grace period 3 дня, затем удалить membership
5. **Message edit window** — 24 часа (как Telegram)
6. **Message deletion** — soft delete, видно "message deleted", медиа удаляется из CDN
7. **Spam in DM** — rate limit: 60 msg/min, 500 msg/hour
8. **Spam in channel** — rate limit: 20 posts/hour per channel
9. **Media in messages** — max 5 attachments, max 25MB total
10. **Offline message delivery** — при подключении WebSocket → получить пропущенные сообщения (last_read_at → now)
11. **Large channels** — fan-out через Redis pub/sub, не через прямой перебор connections
12. **E2E encryption** — фаза 2, Signal protocol для DM

## UI-требования

### Страницы
1. **Messages page** — список бесед слева, активный чат справа
2. **Channel page** — посты канала (как Telegram-канал), инфо о канале
3. **Channel settings** — для owner: редактирование, управление подписчиками, платная подписка

### Компоненты
- `ConversationList` — список с превью последнего сообщения, unread badge
- `ChatView` — лента сообщений, infinite scroll вверх
- `MessageBubble` — своё/чужое, реакции, reply, edit, delete
- `MessageInput` — markdown, attachments, emoji picker, reply preview
- `ChannelFeed` — посты канала (как лента, но в контексте канала)
- `ChannelPostComposer` — для owner/admin
- `TypingIndicator` — "X is typing..."
- `SubscriptionGate` — для платных каналов (checkout button)
- `MemberList` — участники группы/канала
- `CallButton` — voice/video (фаза 3, disabled в MVP)
