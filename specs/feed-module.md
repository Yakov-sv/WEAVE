# Спецификация модуля: Feed

## Обзор

Feed — лента контента (как X / Instagram). Посты с текстом, медиа, кодом. Реакции, треды, репосты, хештеги.

## Сущности

### Post
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| author_id | UUID | FK → users |
| type | ENUM | text, media, story, code, link |
| content | TEXT | Markdown (до 5000 символов) |
| content_html | TEXT | Pre-rendered HTML |
| media_assets | JSONB | [{asset_id, type, url, meta}] |
| code_ref | JSONB | {repo_id, commit, file, lines} |
| link_url | VARCHAR(500) | URL для link-постов |
| link_preview | JSONB | {title, description, image} |
| parent_post_id | UUID | FK → posts (для reply) |
| repost_of_id | UUID | FK → posts (для репоста) |
| quote_of_id | UUID | FK → posts (для цитаты) |
| visibility | ENUM | public, followers, paid |
| paywall_config | JSONB | {price_cents, currency, preview_text} |
| reply_count | INT | Счётчик ответов |
| reaction_count | INT | Счётчик лайков |
| repost_count | INT | Счётчик репостов |
| view_count | INT | Счётчик просмотлов |
| created_at | TIMESTAMP | Дата создания |
| deleted_at | TIMESTAMP | Soft delete |

### MediaAsset
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| uploader_id | UUID | FK → users |
| post_id | UUID | FK → posts (nullable) |
| type | ENUM | image, video, stream, audio |
| cdn_url | VARCHAR(500) | URL в CDN |
| thumbnail_url | VARCHAR(500) | Превью |
| metadata | JSONB | {width, height, duration, format, size} |
| alt_text | TEXT | Alt-описание для a11y |

### Reaction
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| post_id | UUID | FK → posts |
| type | ENUM | like, boost, bookmark |

### Topic
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(50) | Уникальный, #hashtag |
| post_count | INT | Счётчик |

### FeedItem (денормормализованная лента)
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | Владелец ленты |
| post_id | UUID | FK → posts |
| reason | ENUM | following, algorithmic, subscribed_channel, reposted_by |
| score | FLOAT | Алгоритмический score |

## API

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /feed | Лента (algorithmic/chronological) | Yes |
| GET | /feed/discover | Discovery (популярные) | No/Yes |
| GET | /feed/chronological | Хронологическая (только подписки) | Yes |
| POST | /posts | Создать пост | Yes |
| GET | /posts/{id} | Получить пост | No/Yes |
| PATCH | /posts/{id} | Редактировать пост | Yes (owner) |
| DELETE | /posts/{id} | Удалить пост | Yes (owner) |
| POST | /posts/{id}/reply | Ответить на пост | Yes |
| GET | /posts/{id}/replies | Ответы на пост | No/Yes |
| POST | /posts/{id}/react | Реакция (like/boost/bookmark) | Yes |
| DELETE | /posts/{id}/react | Убрать реакцию | Yes |
| POST | /posts/{id}/repost | Репост (с/без комментария) | Yes |
| POST | /posts/{id}/quote | Цитата с комментарием | Yes |
| GET | /topics/{name} | Посты по хештегу | No/Yes |
| GET | /topics/trending | Трендовые темы | No |
| POST | /media/upload | Загрузить медиа | Yes |

## События

| Событие | Payload | Consumers |
|---|---|---|
| post.created | {post_id, author_id, type} | Search (index), Notification (followers), Realtime (feed push) |
| post.updated | {post_id, fields_changed} | Search (re-index) |
| post.deleted | {post_id} | Search (remove), cascade |
| post.replied | {post_id, reply_id, author_id} | Notification (original author) |
| post.reacted | {post_id, user_id, reaction_type} | Notification (author, if like) |
| post.reposted | {post_id, repost_id, user_id} | Notification (author), Feed (followers of reposter) |

## Алгоритм ленты

### Chronological (MVP)
```
SELECT * FROM feed_items
WHERE user_id = {current_user}
ORDER BY created_at DESC
LIMIT 20
CURSOR {last_id}
```

### Algorithmic (фаза 2)
Score = f(recency, author affinity, reactions, reposts, comments, media type)
```
score = 0.4 * recency_decay + 
        0.2 * author_affinity + 
        0.2 * engagement_score + 
        0.1 * network_effect + 
        0.1 * diversity_penalty
```

## Edge cases

1. **Markdown sanitization** — DOMPurify, запрет inline scripts
2. **Media limits** — max 4 images, max 10MB each, max 60s video (фаза 2)
3. **Code ref validation** — проверка существования repo + commit + file
4. **Rate limit** — max 20 posts/hour, max 100 reactions/hour
5. **Deleted parent** — reply остаётся, но parent показывает "[deleted]"
6. **Repost chain** — max 1 уровень (нельзя репостить репост)
7. **Private author** — посты видимы только подписчикам
8. **Paywall post** — preview_text виден всем, остальное — по оплате
9. **Edit history** — сохранять предыдущую версию при edit (фаза 2)
10. **Spam detection** — повторяющиеся посты, массовые реакции → rate limit + flag

## UI-требования

### Страницы
1. **Feed page** — бесконечная лента (infinite scroll), tabs (For You / Following / Discover)
2. **Post detail page** — пост + тред ответов (SSR для SEO)
3. **Profile posts tab** — посты пользователя
4. **Topic page** — посты по хештегу

### Компоненты
- `PostComposer` — редактор markdown, загрузка медиа, code ref picker, visibility selector
- `PostCard` — аватар, имя, контент, медиа, реакции, reply/repost
- `PostThread` — дерево ответов
- `MediaGallery` — grid (1-4 images), lightbox
- `CodeBlock` — syntax highlight (shiki), ссылка на репо
- `ReactionBar` — like, boost, bookmark, reply, repost
- `HashtagLink` — кликабельный хештег
- `FeedList` — virtualized infinite scroll
- `PaywallGate` — превью + кнопка оплаты
