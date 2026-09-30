# WEAVE — Команда и роли

## Принципы команды

- **Remote-first** — распределённая команда, async-культура
- **Documentation-first** — каждое решение задокументировано
- **Ownership** — каждый модуль имеет owner'а
- **Open source mindset** — публичные devlogs, RFC, transparency

## Структура по фазам

### Фаза 0–1 (месяцы 1–9) — 5 человек

| Роль | Когда | Загрузка | Зарплата/мес | Equity | Ответственность |
|---|---|---|---|---|---|
| **Founder / Product / CEO** | День 1 | 100% | — (bootstrapped) | 40% | Продукт, стратегия, GTM, fundraise, найм |
| **Full-stack инженер** | День 1 | 100% | $6–8K | 2–5% | Web (Next.js) + API (NestJS): Identity, Feed |
| **Backend инженер** | Месяц 1 | 100% | $7–9K | 2–5% | API: Messaging, Git (Gitea), Payments + Realtime |
| **Designer (UI/UX)** | Месяц 2 | 50%→100% | $5–7K | 1–3% | Дизайн-система, UI, UX-research, брендинг |
| **DevOps** | Месяц 3 | 50%→100% | $6–8K | 1–3% | Docker, CI/CD, мониторинг, бэкапы, security |

**Payroll/мес:** ~$24–32K (с года 2 — full-time для всех)

### Фаза 2 (месяцы 10–18) — 12 человек

| Новая роль | Когда | Зарплата/мес | Equity | Ответственность |
|---|---|---|---|---|
| **Frontend инженер #2** | М10 | $6–8K | 0.5–1% | Web: Market, Media, Stories |
| **Backend инженер #2** | М11 | $7–9K | 0.5–1% | API: Market, Search, Algorithmic feed |
| **Mobile инженер** | М12 | $7–9K | 0.5–1% | PWA optimization → нативный mobile (фаза 3) |
| **DevRel / Community Manager** | М12 | $5–7K | 0.5–1% | OSS-программа, контент, комьюнити, documentation |
| **Marketing / Growth** | М13 | $5–7K | 0.5–1% | Paid ads, SEO, partnerships, инфлюенсеры |
| **Customer Support** | М14 | $3–5K | 0.25–0.5% | Поддержка пользователей, bug triage |
| **Payments / Business Ops** | М15 | $6–8K | 0.5–1% | Stripe, payouts, compliance, финансы |

**Payroll/мес (12 чел):** ~$60–80K

### Фаза 3 (месяцы 19–30) — 30 человек

| Новая роль | Кол-во | Зарплата/мес | Ответственность |
|---|---|---|---|
| **Backend инженеры** | +3 | $7–9K | Plugin API, Federation, Voice/Video |
| **Frontend инженеры** | +2 | $6–8K | Desktop (Tauri), B2B UI, Mobile |
| **SRE / Platform engineer** | +1 | $8–10K | Масштабирование, K8s, monitoring |
| **Security engineer** | +1 | $8–10K | Security audit, E2EE, compliance |
| **Product Manager (B2B)** | +1 | $7–9K | Team spaces, SSO, enterprise |
| **Sales (B2B)** | +2 | $5–7K + commission | Direct sales, enterprise deals |
| **Designer #2** | +1 | $5–7K | B2B UI, design system scaling |
| **Data engineer** | +1 | $7–9K | Алгоритмы, аналитика, ML |
| **QA engineer** | +1 | $4–6K | Автоматизация, e2e-тесты |
| **International Growth** | +2 | $5–7K | Локализация, региональные партнёрства |

**Payroll/мес (30 чел):** ~$150–200K

### Фаза 4 (месяцы 31+) — 60+ человек

Добавляются: Platform team, Enterprise team, Legal, HR, Finance, Regional managers.

## Роли и зоны ответственности (детально)

### Founder / CEO

- Продуктовое видение и стратегия
- Fundraising (Pre-Seed, Seed, Series A)
- Hire/fire (до C-level)
- GTM-стратегия и партнёрства
- Публичное лицо компании (devlogs, конференции)
- Final say on product decisions

### Full-stack инженер

- Web-приложение (Next.js): pages, components, state
- API (NestJS): Identity Module, Feed Module
- tRPC-контракты между фронтендом и бэкендом
- PWA optimization
- Code review

### Backend инженер

- API (NestJS): Messaging, Git, Payments modules
- Gitea интеграция (auth-bridge, paywall, proxy)
- Stripe Connect интеграция
- Realtime (WebSocket gateway)
- Event bus, Redis, PostgreSQL optimization
- Code review

### Designer

- Дизайн-система (shadcn/ui-based)
- UI-дизайн для всех модулей
- UX-research (интервью с alpha-пользователями)
- Брендинг (логотип, цвета, типографика)
- Prototyping (Figma)
- A11y-аудит

### DevOps / SRE

- Docker-инфраструктура (dev + prod)
- CI/CD (GitHub Actions)
- Мониторинг (Grafana, Sentry)
- Бэкапы и восстановление
- Security (TLS, secrets, audit)
- Масштабирование (год 2+)

### DevRel / Community

- OSS-программа (onboarding open-source projects)
- Публикации (Habr, Dev.to, Medium, X)
- Документация (API docs, guides, tutorials)
- Discord/Telegram-комьюнити
- Product Hunt launch
- Hackathons и митапы

### Marketing / Growth

- SEO-стратегия и контент-план
- Paid ads (Google, соцсети)
- Партнёрства с инфлюенсерами
- Email-маркетинг
- Аналитика (GA4, Mixpanel)
- A/B-тестирование

### Payments / Business Ops

- Stripe Connect setup и maintenance
- Payout-процессы
- Финансовая отчётность
- Compliance (PCI DSS, tax)
- Кастомер-поддержка по платёжным вопросам

## Культура и процессы

### Async-first

- Вся коммуникация — в WEAVE (собственная платформа, eat your own dogfood)
- Документы — в GitHub/wiki
- Решения — через RFC (Architecture Decision Records)
- Синхронные встречи — минимально (1 standup/неделя, 1 retro/спринт)

### Спринты

- 2-недельные спринты
- Planning → 2 недели → Review + Retro
- Roadmap обновляется ежемесячно

### On-call

- Фаза 1: Founder + DevOps (rotation)
- Фаза 2: DevOps + 1 backend engineer (weekly rotation)
- Фаза 3: Dedicated SRE team

## Зарплатная политика

| Принцип | Описание |
|---|---|
| Market-rate | Зарплаты на уровне рынка (не ниже, не сильно выше) |
| Equity для всех | Каждый сотрудник получает equity (0.25–5% в зависимости от роли и стадии) |
| Vesting | 4 года, 1 год cliff (standard) |
| Remote | Зарплата не зависит от локации (adjusted для cost of living) |
| Прозрачность | Зарплатные вилки публичны внутри компании |

## Найм

### Каналы найма

| Канал | Для роли | Стоимость |
|---|---|---|
| Личная сеть founder'а | Первые 5 | $0 |
| WEAVE-профиль (eat your own dogfood) | Все | $0 |
| Hacker News "Who is hiring" | Инженеры | $0 |
| LinkedIn | Все | $500–2000/найм |
| AngelList / Wellfound | Стартап-роли | $0–500 |
| Реферальная программа | Все | $2K–5K bonus |
| Tech-конференции | Инженеры, DevRel | Travel + booth |

### Процесс найма

1. **Screening** — CV + cover letter (async)
2. **Take-home task** — реальная задача (оплачивается $200–500)
3. **Technical interview** — код-ревью take-home + system design (90 мин)
4. **Culture interview** — с founder'ом (60 мин)
5. **Decision** — в течение 2 дней после интервью

## Equity-распределение (ориентировочно)

| Стадия | Founder | Команда | Инвесторы | Option pool |
|---|---|---|---|---|
| Bootstrapped | 100% | — | — | — |
| Pre-Seed | 70% | 15% | 10% | 5% |
| Seed | 55% | 20% | 25% | 5% |
| Series A | 40% | 25% | 35% | 10% |
