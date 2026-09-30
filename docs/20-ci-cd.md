# WEAVE — CI/CD

## 1. Обзор

```
Developer → Git push → GitHub Actions → Build → Test → Deploy
                          ↓
                    Lint + Typecheck + Test + Build Docker → Push to GHCR → Deploy
```

## 2. Branch Strategy

### Git Flow (упрощённый)

| Ветка | Назначение | Деплой |
|---|---|---|
| `main` | Production-ready | Production (manual approval) |
| `develop` | Integration | Staging (auto) |
| `feature/*` | Feature branches | — (PR to develop) |
| `hotfix/*` | Urgent fixes | — (PR to main + develop) |

### Правила

- **PR required** — никто не пушит напрямую в main/develop
- **2 approvals** — для merge в main (1 для develop)
- **Squash merge** — чистая история коммитов
- **Conventional commits** — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`

## 3. GitHub Actions Workflows

### ci.yml — Continuous Integration (на каждый PR/push)

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  # --- Lint + Typecheck ---
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  # --- Unit Tests ---
  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: weave_test
          POSTGRES_USER: weave
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api prisma migrate deploy
        env:
          DATABASE_URL: postgresql://weave:test@localhost:5432/weave_test
      - run: pnpm test
        env:
          DATABASE_URL: postgresql://weave:test@localhost:5432/weave_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test_secret
      - uses: codecov/codecov-action@v4

  # --- E2E Tests ---
  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # --- Build ---
  build:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    strategy:
      matrix:
        target: [api, web, realtime]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter ${{ matrix.target }} build
```

### build-images.yml — Build Docker images

```yaml
name: Build Docker Images

on:
  push:
    branches: [main, develop]
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api, web, realtime]
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/weave/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=raw,value=latest,enable={{is_default_branch}}

      - uses: docker/build-push-action@v5
        with:
          context: .
          file: infra/docker/${{ matrix.service }}.Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### deploy-staging.yml — Deploy to Staging

```yaml
name: Deploy Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/weave
            git pull origin develop
            export TAG=develop
            docker compose -f infra/docker-compose.prod.yml pull
            docker compose -f infra/docker-compose.prod.yml up -d --no-deps --build api web realtime
            docker image prune -f

      - name: Run migrations
        run: |
          ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} \
          "cd /opt/weave && docker compose exec api pnpm prisma migrate deploy"

      - name: Health check
        run: |
          sleep 10
          curl -f https://staging.weave.app/api/v1/health || exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          message: "Staging deploy: ${{ job.status }}"
```

### deploy-production.yml — Deploy to Production

```yaml
name: Deploy Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # requires manual approval
    steps:
      - uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/weave
            git fetch --tags
            git checkout ${{ github.event.release.tag_name }}
            export TAG=${{ github.event.release.tag_name }}
            docker compose -f infra/docker-compose.prod.yml pull
            docker compose -f infra/docker-compose.prod.yml up -d --no-deps --build api web realtime
            docker image prune -f

      - name: Run migrations
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} \
          "cd /opt/weave && docker compose exec api pnpm prisma migrate deploy"

      - name: Health check
        run: |
          sleep 15
          curl -f https://api.weave.app/health || exit 1
          curl -f https://weave.app || exit 1

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          message: "🚀 Production deploy ${{ github.event.release.tag_name }}: ${{ job.status }}"
```

### security.yml — Security checks

```yaml
name: Security

on:
  push:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * 1'  # weekly Monday 6AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --audit-level=moderate
        continue-on-error: true
      - run: pnpm exec dependency-check
        continue-on-error: true

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript
      - uses: github/codeql-action/analyze@v3

  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gitleaks/gitleaks-action@v2
```

## 4. Turborepo Remote Cache

```yaml
# turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "build/**"],
      "env": ["DATABASE_URL", "STRIPE_SECRET_KEY"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "test": {
      "outputs": ["coverage/**"],
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Remote cache (Vercel)

```bash
# .github/workflows/ci.yml addition
- name: Setup Turbo Remote Cache
  run: pnpm turbo login --token=${{ secrets.TURBO_TOKEN }}
- name: Link Turbo Remote Cache
  run: pnpm turbo link --token=${{ secrets.TURBO_TOKEN }}
```

## 5. Миграции БД

### Стратегия

- **Forward-only** — никаких rollback-миграций (опасно для данных)
- **Zero-downtime** — миграции не блокируют таблицы
- **Staged rollout** — staging → production
- **Backup перед миграцией** — всегда

### Правила zero-downtime миграций

| Правило | Пример |
|---|---|
| Добавление колонки — nullable | `ADD COLUMN email VARCHAR` (не NOT NULL) |
| Удаление колонки — в 2 шага | 1) Stop using in code, 2) Drop column in next deploy |
| Переименование — в 3 шага | 1) Add new, 2) Dual-write, 3) Remove old |
| Индексы — concurrently | `CREATE INDEX CONCURRENTLY` |
| Big tables — batch updates | `UPDATE ... WHERE id BETWEEN ...` |

### Prisma migrate flow

```bash
# Разработка: создать миграцию
pnpm --filter api prisma migrate dev --name add_user_field

# Staging/Production: применить миграции
pnpm --filter api prisma migrate deploy

# Проверить статус
pnpm --filter api prisma migrate status
```

## 6. Environment Variables

### .env.example (публичный, в git)

```bash
# Database
DATABASE_URL=postgresql://weave:password@localhost:5432/weave

# Redis
REDIS_URL=redis://localhost:6379

# Gitea
GITEA_URL=http://localhost:3000
GITEA_ADMIN_TOKEN=your_gitea_admin_token

# MinIO (S3)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=weave
MINIO_SECRET_KEY=your_secret
MINIO_BUCKET=weave-media

# Auth
JWT_SECRET=your_jwt_secret
JWT_PUBLIC_KEY_PATH=./keys/public.pem
JWT_PRIVATE_KEY_PATH=./keys/private.pem

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

# OAuth
GITHUB_OAUTH_CLIENT_ID=xxx
GITHUB_OAUTH_CLIENT_SECRET=xxx
GOOGLE_OAUTH_CLIENT_ID=xxx
GOOGLE_OAUTH_CLIENT_SECRET=xxx

# App
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
REALTIME_URL=ws://localhost:4001

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Secrets management

| Среда | Метод |
|---|---|
| Local | .env (gitignored) |
| Staging | GitHub Secrets → SSH env injection |
| Production | SOPS-encrypted .env.production на сервере |

## 7. Health Checks

### Endpoints

```
GET /health          → { status: "ok", timestamp: "..." }
GET /health/ready    → { status: "ok", db: "ok", redis: "ok", gitea: "ok" }
GET /health/live     → { status: "ok" }  # lightweight, no deps
```

### Docker healthcheck

```dockerfile
# api.Dockerfile
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:4000/health/live || exit 1
```

## 8. Rollback

### Стратегия

```bash
# Rollback application (previous image)
docker compose -f docker-compose.prod.yml up -d --no-deps api:previous_tag

# Rollback database (IF NEEDED — last resort)
# 1. Stop application
# 2. Restore from backup (pg_restore)
# 3. Start application with previous image
```

### Rollback правила

- Application rollback: безопасен (stateless)
- DB rollback: ОПАСЕН — только если миграция сломала данные
- Всегда: backup перед deploy → при failure → restore + previous image

## 9. Release Process

### Pre-release checklist

- [ ] Все тесты проходят (CI green)
- [ ] Staging протестирован (manual QA)
- [ ] Миграции проверены на staging
- [ ] Backup production DB
- [ ] Release notes подготовлены
- [ ] Notify team (Slack)

### Release flow

```
1. Create release branch: release/v1.2.0
2. Bump versions (package.json)
3. Create GitHub Release (tag: v1.2.0)
4. CI: build images with tag v1.2.0
5. CI: deploy to production (manual approval)
6. CI: run migrations
7. CI: health check
8. Notify: Slack, status page, release notes
9. Monitor: Sentry, Grafana (1 час watch)
```

### Hotfix flow

```
1. Create hotfix branch: hotfix/critical-bug
2. Fix bug
3. PR to main AND develop
4. Tag: v1.2.1
5. Deploy to production (same flow)
```

## 10. Code Quality

### Tools

| Tool | Назначение | Config |
|---|---|---|
| ESLint | Linting | eslint-config (shared in packages/config) |
| Prettier | Formatting | .prettierrc (shared) |
| TypeScript | Type checking | tsconfig (shared) |
| Husky | Pre-commit hooks | .husky/pre-commit |
| lint-staged | Lint only changed files | .lintstagedrc |
| commitlint | Conventional commits | commitlint.config.js |
| Renovate | Dependency updates | renovate.json |

### Pre-commit hook

```bash
#!/bin/sh
# .husky/pre-commit
pnpm lint-staged
```

```json
// .lintstagedrc
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

### commitlint

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'ci', 'perf', 'build'
    ]]
  }
};
```
