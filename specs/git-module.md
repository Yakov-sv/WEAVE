# Спецификация модуля: Git

## Обзор

Git — репозитории кода (как GitHub). Хостинг через Gitea (backend), WEAVE обеспечивает API-слой с auth-bridge и paywall.

## Сущности (WEAVE-level)

### Repository
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users (owner) |
| gitea_repo_id | INT | ID в Gitea |
| gitea_full_name | VARCHAR(200) | owner/name в Gitea |
| name | VARCHAR(100) | Имя репозитория |
| description | TEXT | Описание |
| visibility | ENUM | public, private, paid |
| subscription_plan_id | UUID | FK → subscription_plans (для paid) |
| default_branch | VARCHAR(100) | main/master |
| language | VARCHAR(50) | Основной язык |
| stars_count | INT | Звёзды |
| forks_count | INT | Форки |
| watchers_count | INT | Наблюдатели |
| is_template | BOOLEAN | Шаблон |
| topics | JSONB | Теги |

### RepoAccess
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| repo_id | UUID | FK → repositories |
| user_id | UUID | FK → users |
| access_type | ENUM | owner, collaborator, subscriber |
| permissions | JSONB | {read, write, admin} |
| expires_at | TIMESTAMP | Для subscribers |

### RepoStar
| Поле | Тип | Описание |
|---|---|---|
| user_id | UUID | FK → users |
| repo_id | UUID | FK → repositories |
| created_at | TIMESTAMP | Когда поставил звезду |

### ImportJob
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| source | ENUM | github, gitlab |
| source_url | VARCHAR(500) | URL исходного репо |
| target_repo_id | UUID | FK → repositories |
| status | ENUM | pending, in_progress, completed, failed |
| progress | INT | 0–100 |
| error_message | TEXT | При ошибке |

## Gitea-интеграция

### Auth Bridge

```
WEAVE session → Gitea token mapping:

1. При регистрации WEAVE-пользователя:
   → Создать Gitea-пользователя (через admin API)
   → Сгенерировать Gitea API token
   → Сохранить mapping: weave_user_id → gitea_user_id + gitea_token (в Redis)

2. При запросе к Git-модулю:
   → Получить Gitea token из Redis по weave_user_id
   → Использовать token для Gitea API calls

3. Git push/pull (SSH/HTTPS):
   → Пользователь использует Gitea-credentials напрямую
   → SSH key регистрируется в Gitea (через WEAVE settings)
   → HTTPS: Gitea basic auth (username + access token)
```

### Paywall Layer

```typescript
async function checkRepoAccess(repoId: UUID, userId: UUID): Promise<boolean> {
  const repo = await prisma.repository.findUnique({ where: { id: repoId } });
  
  if (repo.visibility === 'public') return true;
  
  if (repo.visibility === 'private') {
    const access = await prisma.repoAccess.findFirst({
      where: { repo_id: repoId, user_id: userId, access_type: { in: ['owner', 'collaborator'] } }
    });
    return !!access;
  }
  
  if (repo.visibility === 'paid') {
    const access = await prisma.repoAccess.findFirst({
      where: { 
        repo_id: repoId, 
        user_id: userId, 
        access_type: 'subscriber',
        expires_at: { gt: new Date() }
      }
    });
    return !!access;
  }
  
  return false;
}
```

### Webhook handler

```
Gitea webhook (push) → WEAVE Git Gateway:
  1. Verify webhook signature
  2. Parse push event (repo, branch, commits)
  3. Publish event: repo.pushed {repo_id, user_id, branch, commits}
  4. Event Bus → Feed (optional post), Notification (watchers), Realtime
```

## API

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /repos | Список репозиториев пользователя | Yes |
| POST | /repos | Создать репозиторий | Yes |
| GET | /repos/{owner}/{name} | Информация о репо | No/Yes |
| PATCH | /repos/{owner}/{name} | Обновить репо | Yes (owner) |
| DELETE | /repos/{owner}/{name} | Удалить репо | Yes (owner) |
| GET | /repos/{owner}/{name}/tree/{branch} | Файловое дерево | No/Yes |
| GET | /repos/{owner}/{name}/blob/{branch}/{path} | Содержимое файла | No/Yes |
| GET | /repos/{owner}/{name}/commits | История коммитов | No/Yes |
| GET | /repos/{owner}/{name}/branches | Ветки | No/Yes |
| GET | /repos/{owner}/{name}/pulls | Pull Requests | No/Yes |
| POST | /repos/{owner}/{name}/pulls | Создать PR | Yes (collaborator) |
| GET | /repos/{owner}/{name}/pulls/{number} | Просмотр PR | No/Yes |
| PATCH | /repos/{owner}/{name}/pulls/{number} | Обновить PR | Yes |
| POST | /repos/{owner}/{name}/pulls/{number}/merge | Слить PR | Yes |
| GET | /repos/{owner}/{name}/issues | Issues | No/Yes |
| POST | /repos/{owner}/{name}/issues | Создать issue | Yes |
| PATCH | /repos/{owner}/{name}/issues/{number} | Обновить issue | Yes |
| POST | /repos/{owner}/{name}/star | Поставить звезду | Yes |
| DELETE | /repos/{owner}/{name}/star | Убрать звезду | Yes |
| POST | /repos/{owner}/{name}/subscribe | Подписка на платный репо | Yes |
| POST | /repos/import | Импорт из GitHub | Yes |
| GET | /import-jobs/{id} | Статус импорта | Yes |

## События

| Событие | Payload | Consumers |
|---|---|---|
| repo.created | {repo_id, owner_id, name, visibility} | Search (index), Notification |
| repo.pushed | {repo_id, user_id, branch, commits} | Feed (optional post), Notification (watchers), Realtime |
| repo.starred | {repo_id, user_id} | Notification (owner) |
| repo.forked | {repo_id, fork_id, user_id} | Notification (owner) |
| repo.pr.created | {repo_id, pr_number, author_id} | Notification (collaborators) |
| repo.pr.merged | {repo_id, pr_number, merged_by} | Notification (author), Feed (optional) |
| repo.issue.created | {repo_id, issue_number, author_id} | Notification (collaborators) |
| repo.access.granted | {repo_id, user_id, access_type} | Notification (user), Realtime |
| repo.access.revoked | {repo_id, user_id} | Notification (user) |
| repo.import.completed | {repo_id, source} | Notification (user) |

## Импорт из GitHub

### Flow

```
1. User → WEAVE: POST /repos/import { source: "github", repo_url: "..." }
2. WEAVE → GitHub API: clone repo (git clone --mirror)
3. WEAVE → Gitea: create repo + push mirror
4. WEAVE → Gitea: migrate issues/PRs (если возможно через GitHub API)
5. WEAVE → update import_jobs: progress
6. WEAVE → Event Bus: repo.import.completed
7. WEAVE → Notification: уведомить пользователя
```

### Двусторонняя синхронизация (опционально)

```
WEAVE repo → GitHub mirror (push):
  При push в WEAVE (Gitea) → webhook → GitHub remote push
  (настраивается пользователем: "sync to GitHub")

GitHub → WEAVE (pull):
  Периодический poll или webhook от GitHub → fetch в Gitea
```

## Edge cases

1. **Repo name collision** — уникальность в рамках пользователя (owner/name)
2. **Private repo access** — проверка на каждый запрос
3. **Paid repo — payment failure** — grace period 3 дня, затем revoke access
4. **Large repos** — Gitea handles, но browsing может быть медленным → paginate tree
5. **Binary files** — не показывать в blob viewer, только download
6. **LFS** — поддерживается Gitea (LFS server), но нужен отдельный storage
7. **Import large repo** — async job, progress tracking, timeout 30 мин
8. **Import private GitHub repo** — нужен GitHub token (OAuth scope: repo)
9. **Delete repo** — cascade: Gitea delete + WEAVE metadata delete + CDN cleanup
10. **Rate limit on Git operations** — 60 Gitea API calls/min per user
11. **SSH key management** — пользователь добавляет SSH key в settings → регистрируется в Gitea
12. **Fork visibility** — fork public repo → public only; fork private → private

## UI-требования

### Страницы
1. **Repo overview** — README, description, stars, topics, clone URL
2. **File browser** — дерево файлов, breadcrumbs, branch selector
3. **File viewer** — syntax highlight (shiki), line numbers, blame (фаза 2)
4. **Commits** — список коммитов, diff per commit
5. **Pull requests** — список (open/closed), PR detail (diff, comments, merge button)
6. **Issues** — список (open/closed), issue detail (comments, labels)
7. **User's repos** — список репозиториев на профиле
8. **Explore repos** — discovery (popular, trending)
9. **Import page** — выбор GitHub-репо для импорта, progress

### Компоненты
- `RepoCard` — name, description, language, stars, visibility badge
- `FileTree` — recursive tree view with icons (file/folder)
- `CodeViewer` — Monaco/shiki, syntax highlight, copy button
- `BranchSelector` — dropdown с ветками
- `CloneButton` — SSH/HTTPS URL copy
- `CommitList` — avatar, message, hash, date, files changed
- `DiffViewer` — side-by-side or inline diff (фаза 2)
- `PullRequestCard` — title, author, status, review status
- `IssueCard` — title, labels, assignee, status
- `StarButton` — toggle, optimistic
- `PaywallGate` — для платных репо (checkout)
- `ImportProgress` — progress bar, status, error
- `LanguageBar` — цвета языков в репо
