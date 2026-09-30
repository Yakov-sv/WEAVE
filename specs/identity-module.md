# Спецификация модуля: Identity

## Обзор

Identity — ядро WEAVE. Управляет пользователями, аутентификацией, профилями, подписками (follow), настройками.

## Сущности

### User
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| username | VARCHAR(30) | Уникальный, `[a-zA-Z0-9_]{3,30}` |
| display_name | VARCHAR(100) | Отображаемое имя |
| bio | TEXT | Описание (markdown) |
| avatar_url | VARCHAR(500) | URL аватара |
| banner_url | VARCHAR(500) | URL баннера |
| verified | BOOLEAN | Верифицированный аккаунт |
| role | ENUM | user, creator, team, admin |
| reputation_score | INT | Репутация |
| location | VARCHAR(100) | Локация |
| website_url | VARCHAR(500) | Сайт |
| created_at | TIMESTAMP | Дата регистрации |
| updated_at | TIMESTAMP | Последнее обновление |

### Identity (linked accounts)
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| provider | VARCHAR(20) | github, telegram, google, email, passkey |
| external_id | VARCHAR(200) | ID во внешней системе |
| metadata | JSONB | Дополнительные данные |

### Session
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| token_hash | VARCHAR(64) | Хеш токена (SHA-256) |
| device_info | JSONB | User-agent, OS, browser |
| ip_address | INET | IP-адрес |
| expires_at | TIMESTAMP | Срок действия |
| revoked_at | TIMESTAMP | Когда отозван |

### Subscription (follow)
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| follower_id | UUID | Кто подписан |
| following_id | UUID | На кого подписан |
| created_at | TIMESTAMP | Когда |

### UserSettings
| Поле | Тип | Описание |
|---|---|---|
| user_id | UUID | PK, FK → users |
| is_private | BOOLEAN | Приватный профиль |
| show_online | BOOLEAN | Показывать online-статус |
| allow_dms | ENUM | everyone, followers, none |
| enabled_modules | JSONB | Активные модули |
| notification_prefs | JSONB | Настройки уведомлений |
| theme | VARCHAR(20) | system, light, dark |

## API

### Auth

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| POST | /auth/register | Регистрация (email + password) | No |
| POST | /auth/login | Логин (email + password) | No |
| POST | /auth/passkey/register/begin | Начало регистрации passkey | Yes |
| POST | /auth/passkey/register/finish | Завершение регистрации passkey | Yes |
| POST | /auth/passkey/login/begin | Начало входа по passkey | No |
| POST | /auth/passkey/login/finish | Завершение входа по passkey | No |
| POST | /auth/refresh | Обновление access token | Refresh token |
| POST | /auth/logout | Выход | Yes |
| GET | /auth/github | OAuth через GitHub | No |
| GET | /auth/github/callback | Callback GitHub OAuth | No |

### Profile

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /users/{username} | Получить профиль | No (public) / Yes (private) |
| PATCH | /users/{username} | Обновить профиль | Yes (owner) |
| DELETE | /users/{username} | Удалить аккаунт | Yes (owner) |

### Social

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| POST | /users/{username}/follow | Подписаться | Yes |
| DELETE | /users/{username}/follow | Отписаться | Yes |
| GET | /users/{username}/followers | Список подписчиков | No/Yes |
| GET | /users/{username}/following | Список подписок | No/Yes |
| POST | /users/{username}/block | Заблокировать | Yes |
| DELETE | /users/{username}/block | Разблокировать | Yes |

### Settings

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /settings | Получить настройки | Yes |
| PATCH | /settings | Обновить настройки | Yes |

### Linked accounts

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /identities | Список связанных аккаунтов | Yes |
| POST | /identities/link | Привязать аккаунт | Yes |
| DELETE | /identities/{id} | Отвязать аккаунт | Yes |

## События

| Событие | Payload | Consumers |
|---|---|---|
| user.registered | {user_id, username} | Feed (create feed), Search (index) |
| user.updated | {user_id, fields_changed} | Search (re-index) |
| user.followed | {follower_id, following_id} | Feed (update), Notification |
| user.unfollowed | {follower_id, following_id} | Feed (update) |
| user.blocked | {blocker_id, blocked_id} | Feed (filter), Messaging (block DM) |
| user.deleted | {user_id} | All modules (cascade cleanup) |
| session.created | {user_id, session_id, device} | Notification (new login) |
| session.revoked | {session_id} | Realtime (disconnect WS) |

## Edge cases

1. **Username collision** — уникальность, suggestions при занятом
2. **Self-follow** — CHECK constraint, API возвращает 400
3. **Private profile** — followers-only видят посты/репо
4. **Account deletion** — 30-day grace period, cascade delete all data
5. **OAuth merge** — если email существует → предложить связать аккаунты
6. **Passkey loss** — fallback на email+password, backup codes
7. **Session hijack** — reuse detection на refresh token → revoke all
8. **Rate limit on auth** — 5 login attempts / 15 min → 30 min lockout

## UI-требования

### Страницы

1. **Login page** — email+password, passkey button, GitHub OAuth
2. **Register page** — username, email, password, passkey option
3. **Profile page** — avatar, bio, stats, posts, repos, channels tabs
4. **Settings page** — profile edit, privacy, notifications, security, sessions
5. **Onboarding wizard** — "Что вы хотите делать?" → activate modules

### Компоненты

- `Avatar` — с fallback, sizes (xs/sm/md/lg/xl)
- `UserCard` — для списка подписчиков/подписок
- `FollowButton` — toggle, optimistic update
- `ProfileHeader` — avatar, name, bio, follow button
- `SessionList` — активные сессии, revoke
