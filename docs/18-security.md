# WEAVE — Безопасность и Data Protection

## 1. Принципы безопасности

1. **Defense in depth** — несколько слоёв защиты
2. **Least privilege** — минимальные права для каждого компонента
3. **Encrypt everywhere** — TLS in transit, encryption at rest
4. **Audit everything** — все действия логируются
5. **Secure by default** — безопасные дефолты
6. **Zero trust** — не доверять никому, проверять всегда

## 2. Аутентификация и авторизация

### Auth-механизмы

| Механизм | Назначение | Реализация |
|---|---|---|
| Email + пароль | Базовая аутентификация | argon2id (memory=64MB, iterations=3) |
| Passkey (WebAuthn) | Безпарольная аутентификация | better-auth WebAuthn |
| OAuth2 (GitHub, Google) | Социальный вход | Authorization Code flow + PKCE |
| JWT (access token) | API-аутентификация | RS256, 15 мин TTL |
| Refresh token | Продление сессии | 30 дней, rotation при использовании |
| Session management | Управление сессиями | Redis-backed, device tracking |

### Token-стратегия

```
Access Token (JWT):
  - TTL: 15 минут
  - Payload: { user_id, role, session_id, iat, exp }
  - Signing: RS256 (asymmetric, public key для верификации)
  - Storage: httpOnly cookie (web) / memory (desktop)

Refresh Token:
  - TTL: 30 дней
  - Storage: httpOnly cookie (web) / secure storage (desktop)
  - Rotation: каждый usage → новый refresh token
  - Reuse detection: если старый токен используется → revoke all sessions
```

### RBAC (Role-Based Access Control)

| Роль | Права |
|---|---|
| `user` | Базовые: посты, DM, каналы (free), репо (public) |
| `creator` | + платные каналы, листинги, payouts |
| `team_member` | + доступ к team-пространствам (фаза 3) |
| `team_admin` | + управление командой, SSO (фаза 3) |
| `admin` | + модерация, ban, takedown |
| `superadmin` | + системные настройки, audit log |

### Password-политика

| Параметр | Значение |
|---|---|
| Минимум символов | 12 |
| Complexity | Не требуется (passphrase-friendly) |
| Breach check | Have I Been Pwned API (k-anonymity) |
| Rate limit | 5 попыток / 15 мин → lockout 30 мин |
| Reset | Email-ссылка, 1 час TTL |

## 3. Шифрование

### In Transit

| Соединение | Метод |
|---|---|
| Client ↔ Cloudflare | TLS 1.3 |
| Cloudflare ↔ Origin | TLS 1.3 |
| API ↔ PostgreSQL | TLS 1.3 |
| API ↔ Redis | TLS 1.2+ |
| API ↔ Gitea | TLS 1.3 |
| WebSocket (WSS) | TLS 1.3 |
| Git over SSH | Ed25519 |

### At Rest

| Данные | Метод |
|---|---|
| PostgreSQL | Transparent encryption (disk-level LUKS) |
| MinIO (S3) | Server-side encryption (AES-256) |
| Backups | Encrypted (GPG/AES-256) |
| Secrets (env) | SOPS + age/KMS |

### E2E-шифрование для DM (фаза 2)

| Этап | Реализация |
|---|---|
| Key exchange | X3DH (Signal protocol) |
| Message encryption | AES-256-CBC + HMAC-SHA256 |
| Key rotation | Double Ratchet |
| Key storage | Browser: IndexedDB; Desktop: OS keychain |
| Multi-device | Per-device keys + sync protocol |
| Metadata | Минимизация: не хранить subject/content-type |

## 4. Защита от атак

### OWASP Top 10 — митигация

| Уязвимость | Митигация |
|---|---|
| **Injection (SQL)** | Prisma ORM (parameterized queries), нет raw SQL |
| **Broken Auth** | argon2id, JWT rotation, rate limiting, MFA (passkey) |
| **Sensitive Data Exposure** | TLS everywhere, encryption at rest, no PAN storage |
| **XXE** | XML parser не используется (JSON only) |
| **Broken Access Control** | RBAC, per-resource ownership checks, middleware |
| **Security Misconfig** | Security headers, CSP, default-deny, audit |
| **XSS** | DOMPurify (sanitize HTML), CSP, React auto-escaping |
| **Insecure Deserialization** | JSON only, schema validation (class-validator) |
| **Known Vulnerabilities** | Dependabot, npm audit, Snyk |
| **SSRF** | URL allowlist for outbound requests, no arbitrary fetch |

### Rate Limiting

| Endpoint | Limit | Window | Action |
|---|---|---|---|
| POST /auth/login | 5 | 15 мин | 30 мин lockout |
| POST /auth/register | 3 | 1 час | 1 час block |
| POST /posts | 20 | 1 мин | 429 |
| POST /messages | 60 | 1 мин | 429 |
| POST /media/upload | 10 | 1 мин | 429 |
| GET /api/* (auth) | 100 | 1 мин | 429 |
| GET /api/* (anon) | 20 | 1 мин | 429 |

Implementation: Redis sliding window counter.

### CSRF Protection

| Метод | Реализация |
|---|---|
| SameSite cookies | `SameSite=Strict` для auth cookies |
| CSRF token | Double submit cookie pattern |
| Origin check | Проверка `Origin` / `Referer` header |

### Security Headers

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### DDoS Protection

| Слой | Метод |
|---|---|
| L3/L4 | Cloudflare (anycast, rate limiting) |
| L7 | Cloudflare WAF + API rate limiting |
| Application | Redis rate limiting, queue overflow |

## 5. Secrets Management

| Секрет | Хранение | Доступ |
|---|---|---|
| Database credentials | SOPS-encrypted .env | CI/CD + servers |
| Stripe API keys | SOPS + Stripe dashboard | API server only |
| Gitea admin token | SOPS-encrypted .env | API server only |
| JWT signing keys | SOPS-encrypted .env | API server + realtime |
| OAuth client secrets | SOPS-encrypted .env | API server |
| MinIO root creds | SOPS-encrypted .env | API server + MinIO |

### Принципы

- **Нет секретов в коде** — всё в env-переменных (SOPS-encrypted)
- **Нет секретов в git** — .gitignore + pre-commit hook (detect-secrets)
- **Rotation** — ключи ротируются каждые 90 дней
- **Least access** — каждый сервис имеет только нужные секреты

## 6. Audit Log

### Что логируется

| Действие | Поля |
|---|---|
| Login / Logout | user_id, ip, device, timestamp |
| Password change | user_id, timestamp |
| Profile edit | user_id, fields_changed, timestamp |
| Post create/delete | user_id, post_id, timestamp |
| Channel create / subscribe | user_id, channel_id, timestamp |
| Repo create / access | user_id, repo_id, timestamp |
| Payment | user_id, amount, type, timestamp |
| Payout | user_id, amount, status, timestamp |
| Admin action | admin_id, action, target, timestamp |
| DMCA takedown | reporter_id, content_id, timestamp |
| Account deletion | user_id, timestamp, reason |

### Хранение

- PostgreSQL `audit_log` таблица
- Retention: 1 год (online) → S3 cold storage (7 лет)
- Immutable: append-only, no UPDATE/DELETE

## 7. Data Retention

| Тип данных | Срок хранения | После истечения |
|---|---|---|
| Учётные данные | Пока аккаунт активен | Удаление через 30 дней после deletion request |
| Посты / медиа | Пока не удалено пользователем | Soft delete → hard delete через 30 дней |
| Сообщения (DM) | Пока не удалено | Soft delete → hard delete через 90 дней |
| Логи (audit) | 1 год online, 7 лет cold | Auto-purge |
| Сессии | 30 дней | Auto-purge |
| Платёжные записи | 7 лет (tax requirement) | Auto-purge после 7 лет |
| Бэкапы БД | 30 дней rolling | Auto-purge |
| Media CDN cache | 7 дней | Auto-purge |
| Web server logs | 90 дней | Auto-purge |

## 8. Privacy & User Rights

### Data Export

```
GET /api/v1/users/me/export
→ 202 Accepted { "job_id": "uuid" }
→ (async) generates JSON archive
→ 200 OK { "download_url": "https://..." }
```

Export includes: profile, posts, messages, repos metadata, transactions, settings.

### Data Deletion

```
DELETE /api/v1/users/me
{ "confirm": "DELETE", "password": "..." }
→ 202 Accepted { "scheduled_deletion_at": "2026-11-01" }
→ 30 day grace period (recoverable)
→ Hard delete: cascade all tables, purge media from CDN
```

### Data Minimization

- Не собираем: точная геолокация, контакты, биометрия
- IP-адрес: логируется для security, не показывается
- Device info: только user-agent + OS, без fingerprinting
- Payment data: только Stripe (no PAN on our servers)

## 9. Bug Bounty

| Параметр | Значение |
|---|---|
| Launch | Фаза 2 (месяц 12+) |
| Platform | HackerOne / own program |
| Scope | *.weave.app, api.weave.app |
| Rewards | $100 (low) → $5000 (critical) |
| Eligibility | First to report, responsible disclosure |

## 10. Security Audit

| Когда | Тип | Стоимость |
|---|---|---|
| Pre-launch (фаза 1) | Internal review | $0 |
| Фаза 2 | External penetration test | $5K–15K |
| Ежегодно | External audit | $10K–25K |
| Pre-Series A | SOC 2 Type I | $20K–50K |
| Фаза 3 | SOC 2 Type II | $30K–60K |

## 11. Incident Response

### Процесс

```
1. DETECTION
   - Sentry alert / user report / monitoring alert
   
2. TRIAGE (15 мин)
   - Severity assessment (P0: data breach, P1: service down, P2: bug)
   - Assign incident commander
   
3. CONTAINMENT (1 час)
   - Block attacker, revoke tokens, isolate systems
   
4. INVESTIGATION
   - Audit log analysis, timeline reconstruction
   
5. NOTIFICATION
   - P0: Users + GDPR authority (72 часа)
   - P1: Status page + users
   - P2: Internal only
   
6. REMEDIATION
   - Fix vulnerability, patch, deploy
   
7. POST-MORTEM (5 рабочих дней)
   - Root cause, timeline, actions, prevention
   - Public report (если затронуты пользователи)
```

### Severity Levels

| Level | Описание | Пример | Response time |
|---|---|---|---|
| **P0** | Data breach, security incident | Утечка данных, XSS exploitable | 15 мин |
| **P1** | Service down, major outage | API недоступен | 30 мин |
| **P2** | Significant bug | Не работает оплата | 4 часа |
| **P3** | Minor bug | Опечатка в UI | 1–3 дня |
