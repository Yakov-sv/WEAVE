# WEAVE — Деплой и инфраструктура

## 1. Среды

| Среда | Назначение | URL |
|---|---|---|
| **Local** | Разработка | localhost:3000 (web), localhost:4000 (api) |
| **Staging** | Pre-production testing | staging.weave.app |
| **Production** | Live | weave.app |

## 2. Локальная разработка (Docker Compose)

### docker-compose.yml (dev)

```yaml
version: '3.8'

services:
  # --- Infrastructure ---
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: weave
      POSTGRES_USER: weave
      POSTGRES_PASSWORD: weave_dev_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  gitea:
    image: gitea/gitea:1.22
    environment:
      USER_UID: 1000
      USER_GID: 1000
      GITEA__database__DB_TYPE: postgres
      GITEA__database__HOST: postgres:5432
      GITEA__database__NAME: gitea
      GITEA__database__USER: weave
      GITEA__database__PASSWD: weave_dev_pass
    ports:
      - "3000:3000"   # Gitea web
      - "2222:22"     # Gitea SSH
    volumes:
      - gitea_data:/data
      - ./gitea/app.ini:/data/gitea/conf/app.ini
    depends_on:
      - postgres

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: weave
      MINIO_ROOT_PASSWORD: weave_dev_pass
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data

  # --- Application ---
  api:
    build:
      context: ../services/api
      dockerfile: ../../infra/docker/api.Dockerfile
    environment:
      DATABASE_URL: postgresql://weave:weave_dev_pass@postgres:5432/weave
      REDIS_URL: redis://redis:6379
      GITEA_URL: http://gitea:3000
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: weave
      MINIO_SECRET_KEY: weave_dev_pass
      JWT_SECRET: dev_jwt_secret_change_me
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
      - gitea
      - minio
    volumes:
      - ../services/api/src:/app/src

  web:
    build:
      context: ../apps/web
      dockerfile: ../../infra/docker/web.Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_REALTIME_URL: ws://localhost:4000/realtime
    ports:
      - "3001:3000"
    depends_on:
      - api
    volumes:
      - ../apps/web/src:/app/src

  realtime:
    build:
      context: ../services/realtime
      dockerfile: ../../infra/docker/realtime.Dockerfile
    environment:
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_jwt_secret_change_me
    ports:
      - "4001:4001"
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
  gitea_data:
  minio_data:
```

### Запуск

```bash
# Клонирование
git clone https://github.com/weave/weave.git
cd weave

# Установка зависимостей
pnpm install

# Копирование env
cp .env.example .env

# Запуск инфраструктуры
docker compose -f infra/docker-compose.yml up -d

# Миграции БД
pnpm --filter api prisma migrate dev

# Seed данные
pnpm --filter api prisma db seed

# Запуск dev-серверов
pnpm dev
```

## 3. Production-деплой

### Архитектура

```
                    ┌──────────────────┐
                    │   Cloudflare      │
                    │   (CDN + WAF)     │
                    │   DNS + DDoS      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Caddy           │
                    │   (Reverse Proxy) │
                    │   Auto-TLS (orig) │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                  ▼
    ┌────────────┐  ┌──────────────┐  ┌──────────────┐
    │  WEB SSR   │  │   API SERVER │  │   REALTIME   │
    │  (Next.js) │  │   (NestJS)   │  │   GATEWAY    │
    │            │  │              │  │              │
    │  2+ inst.  │  │  2+ inst.   │  │  2+ inst.    │
    │  PM2/Docker│  │  PM2/Docker │  │  Docker      │
    └────────────┘  └──────┬───────┘  └──────┬───────┘
                           │                  │
                    ┌──────▼──────────────────▼──┐
                    │        REDIS                │
                    │  (cache + sessions + pub/sub)│
                    └──────────┬──────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                    ▼
    ┌────────────┐    ┌──────────────┐    ┌──────────────┐
    │ POSTGRESQL │    │    GITEA     │    │    MINIO     │
    │  primary   │    │  (Git host)  │    │  (S3 media)  │
    │  + replica │    │              │    │              │
    └────────────┘    └──────────────┘    └──────────────┘
```

### Спецификации серверов (production)

| Сервер | vCPU | RAM | Disk | Стоимость/мес | Кол-во |
|---|---|---|---|---|---|
| API + Web + Realtime | 4 | 8GB | 50GB SSD | $80 | 2 |
| PostgreSQL | 4 | 16GB | 200GB SSD | $160 | 1 (+replica) |
| Redis | 2 | 4GB | 20GB | $40 | 1 |
| Gitea | 2 | 4GB | 100GB SSD | $50 | 1 |
| MinIO | 2 | 4GB | 500GB SSD | $80 | 1 |
| PostgreSQL replica | 4 | 16GB | 200GB | $160 | 1 |
| **Итого** | | | | **~$570/мес** | 7 |

### Caddyfile (production)

```
weave.app {
    reverse_proxy /api/* {
        to api-1:4000 api-2:4000
        lb_policy round_robin
    }
    
    reverse_proxy /realtime {
        to realtime-1:4001 realtime-2:4001
        lb_policy ip_hash  # sticky for WebSocket
    }
    
    reverse_proxy {
        to web-1:3000 web-2:3000
        lb_policy round_robin
    }
    
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    tls {
        protocols tls1.3
    }
}

staging.weave.app {
    reverse_proxy {
        to staging-api:4000
        to staging-web:3000
    }
    tls {
        protocols tls1.3
    }
}
```

### Docker Compose (production)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: ghcr.io/weave/api:${TAG:-latest}
    restart: always
    env_file: .env.production
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  web:
    image: ghcr.io/weave/web:${TAG:-latest}
    restart: always
    env_file: .env.production
    deploy:
      replicas: 2

  realtime:
    image: ghcr.io/weave/realtime:${TAG:-latest}
    restart: always
    env_file: .env.production
    deploy:
      replicas: 2
```

## 4. Масштабирование

### Вертикальное (фаза 1)

- Увеличение CPU/RAM на существующих серверах
- PostgreSQL: shared_buffers, work_mem tuning
- Redis: maxmemory, eviction policy

### Горизонтальное (фаза 2+)

| Компонент | Стратегия |
|---|---|
| API | Stateless → N replicas behind load balancer |
| Web | Stateless → N replicas (ISR caching) |
| Realtime | Sticky sessions → Centrifugo (horizontal) |
| PostgreSQL | Read replicas → sharding (год 3) |
| Redis | Cluster mode (hash slots) |
| Gitea | Multiple instances + shared NFS/S3 storage |
| MinIO | Distributed mode (4+ nodes, erasure coding) |

### Kubernetes (фаза 3)

Переход на Kubernetes при:
- > 10 серверов
- > 100K MAU
- Need autoscaling (HPA)

```
Production K8s cluster:
├── Namespace: weave-prod
│   ├── Deployment: api (3+ replicas, HPA)
│   ├── Deployment: web (3+ replicas, HPA)
│   ├── Deployment: realtime (3+ replicas)
│   ├── StatefulSet: postgres-primary
│   ├── StatefulSet: postgres-replica
│   ├── StatefulSet: redis
│   ├── StatefulSet: gitea
│   ├── StatefulSet: minio
│   ├── Ingress: caddy-ingress
│   ├── HPA: api (CPU > 70% → scale)
│   ├── HPA: web (CPU > 70% → scale)
│   └── ConfigMap + Secrets
```

## 5. Бэкапы

| Что | Частота | Метод | Retention | Хранение |
|---|---|---|---|---|
| PostgreSQL | Каждые 6 часов | pg_dump + WAL archiving | 30 дней | S3 (encrypted) |
| Redis | Каждые 12 часов | RDB snapshot | 7 дней | S3 |
| Gitea repos | Каждый час | Git bundle + LFS | 30 дней | S3 |
| MinIO (media) | Ежедневно | mc mirror (sync) | 90 дней | S3 (different region) |
| Configs/secrets | При изменении | SOPS-encrypted git | Бесконечно | Git (encrypted) |

### Recovery

| Сценарий | RTO | RPO | Процесс |
|---|---|---|---|
| Сбой API | < 5 мин | 0 | Restart container (health check) |
| Сбой БД (primary) | < 30 мин | 6 часов | Promote replica → restore from backup |
| Сбой Gitea | < 15 мин | 1 час | Restart → restore git bundles |
| Полная потеря дата-центра | < 4 часа | 6 часов | Deploy in new DC → restore all backups |

### Disaster Recovery план

```
1. DETECT: Monitoring alert (Grafana → PagerDuty)
2. ASSESS: Что упало? Масштаб?
3. COMMUNICATE: Status page (status.weave.app)
4. RESTORE:
   a. Deploy инфраструктуру в новом DC (Terraform)
   b. Restore PostgreSQL from backup
   c. Restore Gitea from git bundles
   d. Restore MinIO from S3 mirror
   e. Restore Redis from RDB
   f. Deploy application containers
   g. Update DNS
5. VERIFY: Health checks, smoke tests
6. POST-MORTEM: Root cause, prevention
```

## 6. Мониторинг

### Стек мониторинга

| Инструмент | Назначение | Cost |
|---|---|---|
| **Sentry** | Ошибки (frontend + backend) | $0 (free) → $26/mes (team) |
| **Grafana + Prometheus** | Метрики (CPU, RAM, latency, throughput) | $0 (self-hosted) |
| **Loki** | Логи (centralized) | $0 (self-hosted) |
| **Uptime Kuma** | Uptime-мониторинг | $0 (self-hosted) |
| **PagerDuty** | On-call alerting | $0 (free) → $21/user/mes |

### Ключевые метрики

| Метрика | Источник | Alert threshold |
|---|---|---|
| API latency P95 | Prometheus | > 500ms → P2 |
| API error rate | Sentry | > 1% → P1 |
| API uptime | Uptime Kuma | < 99.5% → P1 |
| DB connections | Prometheus | > 80% pool → P2 |
| Redis memory | Prometheus | > 80% → P2 |
| WebSocket connections | Prometheus | > 50K → scale |
| Disk space | Prometheus | > 80% → P2 |
| Stripe webhook failures | Sentry | > 0 → P1 |
| Gitea API latency | Prometheus | > 1s → P2 |

### Grafana Dashboards

1. **System overview** — CPU, RAM, disk, network для всех серверов
2. **API performance** — latency, throughput, error rate, endpoints
3. **Realtime** — connections, messages/sec, presence count
4. **Database** — queries/sec, slow queries, connections, replication lag
5. **Business metrics** — registrations, MAU, paying users, revenue
6. **Infrastructure** — Docker containers health, restarts, OOM

## 7. CI/CD

Подробно — в [CI/CD документе](20-ci-cd.md).

### Схема деплоя

```
Git push → GitHub Actions:
  1. Lint + Typecheck
  2. Unit tests
  3. E2E tests (staging)
  4. Build Docker images
  5. Push to GHCR (GitHub Container Registry)
  6. Deploy to staging (auto on develop branch)
  7. Deploy to production (manual approval on main branch)
  8. Run migrations (if needed)
  9. Health check
  10. Notify Slack/Discord
```

### Rolling update

```bash
# Pull new image
docker compose -f docker-compose.prod.yml pull

# Rolling update (one by one)
docker compose -f docker-compose.prod.yml up -d --no-deps --update-parallel 1 api

# Health check
curl https://api.weave.app/health

# Rollback if needed
docker compose -f docker-compose.prod.yml up -d --no-deps api:previous-tag
```

## 8. Домены и DNS

| Домен | Назначение | Запись |
|---|---|---|
| weave.app | Main site | A → load balancer |
| api.weave.app | API (альтернатива /api/) | A → load balancer |
| staging.weave.app | Staging | A → staging server |
| status.weave.app | Status page | CNAME → uptime-kuma |
| docs.weave.app | Documentation | CNAME → GitHub Pages |
| cdn.weave.app | Media CDN | CNAME → Cloudflare |

### DNS-провайдер

**Cloudflare** — DNS management + CDN + WAF в одном месте.

## 9. SSL/TLS

| Слой | Метод |
|---|---|
| Client ↔ Cloudflare | Cloudflare Universal SSL (TLS 1.3) |
| Cloudflare ↔ Origin | Caddy auto-TLS (Let's Encrypt) |
| Origin certificates | Cloudflare Origin CA (15 лет) |
| HSTS | max-age=2 года, preload |
| HSTS preload | Submit to hstspreload.org |

## 10. Логирование

### Структура логов

Все логи — JSON-формат (structured logging):

```json
{
  "timestamp": "2026-09-30T12:00:00Z",
  "level": "info",
  "service": "api",
  "module": "feed",
  "message": "Post created",
  "user_id": "uuid",
  "post_id": "uuid",
  "duration_ms": 45,
  "request_id": "uuid"
}
```

### Centralized logging

```
Application → Pino (JSON logger) → stdout
    ↓
Docker logs → Fluent Bit (log forwarder)
    ↓
Loki (log storage + indexing)
    ↓
Grafana (log querying + dashboards)
```

### Log retention

| Тип | Retention | Хранение |
|---|---|---|
| Application logs | 30 дней | Loki (local SSD) |
| Audit logs | 1 год online, 7 лет cold | PostgreSQL → S3 |
| Web server logs | 90 дней | Loki |
| System logs (syslog) | 30 дней | Loki |
