# WEAVE — Roadmap (3 года)

## Обзор

```
Год 1: MVP → Alpha → Beta → Public Launch (фаза 0–1)
Год 2: Creator Expansion → Marketplace (фаза 2)
Год 3: B2C Scale → B2B → Ecosystem (фаза 3–4)
```

## Фаза 0 — Seed (месяцы 1–3)

| Месяц | Деливерабл | Метрика |
|---|---|---|
| М1 | Монорепо, CI/CD, Docker, базовая инфраструктура | Dev-среда работает |
| М1 | Архитектурный документ, API-spec, схема БД | Документация утверждена |
| М2 | Identity Module (регистрация, логин, профиль, follow) | Базовый профиль работает |
| М2 | Feed Module (посты, лента, реакции) | Лента работает |
| М3 | Messaging Module (DM, каналы, realtime) | Чаты работают |
| М3 | Landing page + waitlist | 5000 waitlist |
| М3 | Закрытая alpha (50–100 пользователей) | 100 alpha-пользователей |

**Веха фазы 0:** Alpha запущена, 100 пользователей, NPS > 40

## Фаза 1 — Beachhead: Developers (месяцы 4–9)

| Месяц | Деливерабл | Метрика |
|---|---|---|
| М4 | Git Module (Gitea интеграция, браузер кода) | Репозитории работают |
| М4 | Импорт из GitHub | Импорт работает |
| М5 | Market/Payments (Stripe, платные каналы) | Подписки работают |
| М5 | Realtime (WebSocket, уведомления) | Realtime стабилен |
| М6 | Notifications (in-app, email) | Уведомления работают |
| М6 | PWA (install, push notifications) | PWA устанавливается |
| М6 | Pre-Seed раунд ($500K) | Финансирование закрыто |
| М7 | Нанять: backend, designer, devops | Команда 5 чел |
| М7 | UI-полировка, a11y, Lighthouse > 80 | Качество готово |
| М8 | Beta (500 пользователей) | 500 beta-пользователей |
| М8 | OSS-программа (бесплатный Pro для OSS) | 20 OSS-проектов |
| М9 | Product Hunt launch | 10K регистраций |

**Веха фазы 1:** Public launch, 50K регистраций, 5K MAU, 500 платящих

### Детализация по неделям (М4–М6)

| Неделя | Деливерабл |
|---|---|
| 13–14 | Gitea развёртывание, auth-bridge, базовый proxy |
| 15–16 | Браузер кода (tree, blob, syntax highlight) |
| 17 | Импорт из GitHub (через GitHub API) |
| 18 | Stars, fork, README-рендеринг |
| 19 | Stripe Connect настройка, checkout flow |
| 20 | Платные каналы (подписка → доступ) |
| 21 | Баланс автора, payouts |
| 22 | WebSocket-gateway, connection manager |
| 23 | Realtime events (message, notification, presence) |
| 24 | PWA manifest, service worker, push notifications |

## Фаза 2 — Expand: Creators (месяцы 10–18)

| Месяц | Деливерабл | Метрика |
|---|---|---|
| М10 | Stories / Reels (медиа-модуль) | Stories работают |
| М10 | Видео в постах (до 60 сек) | Видео загружается |
| М11 | Алгоритмическая лента (базовая) | Рекомендации работают |
| М11 | Seed раунд ($1.5M) | Финансирование закрыто |
| М12 | Маркетплейс (листинги, покупки) | 100 листингов |
| М12 | Creator-программа (0% комиссия 6 мес) | 50 авторов мигрировали |
| М13 | Эскроу-платежи | Эскроу работает |
| М13 | Отзывы и рейтинги | Reviews работают |
| М14 | Платные подписки на профили (tiered) | Tiered-планы работают |
| М14 | Импорт из Telegram (каналы) | Импорт работает |
| М15 | Партнёрство с 5 инфлюенсерами | 5 партнёрств |
| М15 | Revenue dashboard (расширенный) | Dashboard запущен |
| М16 | Web code editor (Monaco) | Editor работает |
| М16 | Pull Requests (полные: merge, review, comments) | PR-флоу работает |
| М17 | Issues (labels, milestones, assignees) | Issues работают |
| М17 | Локализация (ES, PT) | 2 языка добавлены |
| М18 | E2E-шифрование для DM | E2EE работает |

**Веха фазы 2:** 200K регистраций, 30K MAU, 3K платящих, 500 продавцов

## Фаза 3 — Scale: B2C + B2B (месяцы 19–30)

| Месяц | Деливерабл | Метрика |
|---|---|---|
| М19 | Командные пространства (Team-тариф) | Teams работают |
| М19 | SSO (Google Workspace, Okta) | SSO работает |
| М20 | Ролевая модель (admin, member, guest) | RBAC работает |
| М20 | Audit log (для команд) | Audit log работает |
| М21 | Series A раунд ($8M) | Финансирование закрыто |
| М21 | Алгоритмическая лента (ML-based) | Улучшенные рекомендации |
| М22 | Plugin API (SDK + документация) | 10 плагинов |
| М22 | Plugin marketplace | Marketplace работает |
| М23 | Voice rooms (LiveKit integration) | Voice работает |
| М23 | Видеозвонки (1:1, групповые) | Видео работает |
| М24 | Крипто-платежи (USDC) | Крипто-платежи работают |
| М24 | Локализация (ZH, JA, DE, FR) | 6 языков всего |
| М25 | Desktop app (Tauri) — Windows, macOS, Linux | Desktop запущен |
| М25 | Импорт из Discord (серверы → пространства) | Импорт работает |
| М26 | Webhooks (для репозиториев) | Webhooks работают |
| М26 | CI/CD интеграция (GitHub Actions, GitLab CI) | CI/CD работает |
| М27 | API public (REST + GraphQL) | Public API запущен |
| М27 | Developer program | 100 разработчиков |
| М28 | Break-even | $10M ARR |
| М29 | White-label (WEAVE-as-a-service) | 3 клиента |
| М30 | Mobile apps (iOS, Android — нативные) | Mobile запущен |

**Веха фазы 3:** 1.5M регистраций, 250K MAU, 30K платящих, 300 команд, $10M ARR

## Фаза 4 — Ecosystem (месяцы 31+)

| Квартал | Деливерабл | Метрика |
|---|---|---|
| Q9 | Self-hosted WEAVE Enterprise | 10 enterprise-клиентов |
| Q9 | ActivityPub federation (interop Mastodon) | Federation работает |
| Q10 | AT Protocol (interop Bluesky) | Cross-posting работает |
| Q10 | Nostr protocol support | Nostr-интеграция |
| Q11 | WEAVE Protocol (свой federated protocol) | Спецификация опубликована |
| Q11 | Open-source SDK (Apache 2.0) | SDK выпущен |
| Q12 | App marketplace (mini-apps) | 50 mini-apps |
| Q12 | Global expansion (10+ языков) | 10 языков |

**Веха фазы 4:** 5M+ пользователей, $30M+ ARR, экосистема плагинов и мини-апп

## Зависимости между фазами

```
Фаза 0 (MVP) ──→ Фаза 1 (Developers) ──→ Фаза 2 (Creators) ──→ Фаза 3 (Scale)
     │                    │                       │                    │
     │                    │                       │                    │
  Alpha              Public launch           Marketplace           B2B + API
  Waitlist           OSS program             Creator program       Plugin SDK
  100 users          50K users               200K users            1.5M users
                     ↓                       ↓                     ↓
                  Pre-Seed $500K         Seed $1.5M            Series A $8M
```

## Ключевые метрики по фазам

| Метрика | Фаза 0 | Фаза 1 | Фаза 2 | Фаза 3 | Фаза 4 |
|---|---|---|---|---|---|
| Регистрации | 5K (waitlist) | 50K | 200K | 1.5M | 5M+ |
| MAU | 100 | 5K | 30K | 250K | 500K+ |
| Платящие | 0 | 500 | 3K | 30K | 100K+ |
| Команды | 0 | 5 | 50 | 300 | 1000+ |
| ARR | $0 | $100K | $1.4M | $10M | $30M+ |
| Команда | 2 | 5 | 12 | 30 | 60+ |
| Языки UI | 1 (EN) | 1 | 3 | 6 | 10+ |
