# WEAVE — Юридическая структура и Compliance

## 1. Юридическое лицо

### Рекомендуемая структура

**US Delaware C-Corporation** (WEAVE, Inc.)

| Параметр | Значение | Обоснование |
|---|---|---|
| Тип | C-Corporation | Стандарт для VC-funded startups, Stripe-friendly |
| Штат | Delaware | Стандарт для tech-startups, сильное corporate law |
| Banking | Mercury / SVB / Brex | Tech-friendly banking |

**Почему не LLC:** C-Corp удобнее для VC-финансирования (preferred stock), stock options (ISO), и международного расширения.

**Почему Delaware:** Большинство tech-компаний инкорпорированы в Delaware, прецедентное право, Court of Chancery.

### Альтернативы (если США невозможно)

| Юрисдикция | Тип | Плюсы | Минусы |
|---|---|---|---|
| Эстония (e-Residency) | OÜ | EU-доступ, digital | Не C-Corp, сложности с VC |
| Великобритания | Ltd | Быстро, просто | Brexit-риски |
| ОАЭ (Dubai) | FZE | 0% налог, tech-friendly | Сложный banking |
| РФ (если фокус РФ) | ООО | Локальный рынок | Санкции, изоляция |

### Дочерние компании (будущее)

- **WEAVE EU GmbH (Германия)** — для GDPR-compliance, EU-клиентов
- **WEAVE UK Ltd** — для UK-клиентов
- **WEAVE Payments** — отдельная entity для платёжных операций (если нужно)

## 2. Товарные знаки

### Регистрация

| Юрисдикция | Классы | Стоимость | Срок |
|---|---|---|---|
| США (USPTO) | 9, 35, 38, 41, 42 | $350/class | 6–12 мес |
| ЕС (EUIPO) | 9, 35, 38, 41, 42 | €850/class | 4–8 мес |
| Великобритания (UKIPO) | 9, 35, 38, 41, 42 | £170/class | 4–6 мес |
| РФ (Роспатент) | 9, 35, 38, 41, 42 | ₽11 000/class | 4–6 мес |

### Классы Ниццкой классификации

| Класс | Описание | Покрытие WEAVE |
|---|---|---|
| 9 | Software, apps | WEAVE-приложение |
| 35 | Marketplace, advertising | Маркетплейс |
| 38 | Telecommunications, messaging | Мессенджер |
| 41 | Education, entertainment | Курсы, контент |
| 42 | Software development, SaaS | Git-хостинг, API |

### Поиск (preliminary)

Перед подачей — провести поиск на:
- USPTO TESS (США)
- EUIPO TMview (ЕС)
- WIPO Global Brand Database (мировой)

## 3. GDPR (ЕС)

### Применимость

WEAVE обрабатывает данные граждан ЕС → GDPR применяется независимо от локации компании.

### Требования

| Требование | Реализация |
|---|---|
| Lawful basis for processing | Consent + legitimate interest + contract |
| Right to access | API endpoint: GET /api/v1/users/me/data |
| Right to erasure (right to be forgotten) | DELETE /api/v1/users/me → каскадное удаление |
| Right to portability | API endpoint: GET /api/v1/users/me/export → JSON/CSV |
| Right to rectification | PATCH /api/v1/users/{username} |
| Data minimization | Собираем только необходимое |
| Purpose limitation | Каждая колонка БД — для конкретной цели |
| Data retention policy | Храним: сессии — 30д, логи — 90д, данные — пока активен |
| DPO (Data Protection Officer) | Назначить с фазы 2 (при > 250 сотрудников или EU-данных) |
| Breach notification | 72 часа с момента обнаружения |
| Privacy by design | Шифрование, access control, audit log |
| Cookie consent | Cookie banner (consent-based) |

### Документы

- **Privacy Policy** — публичная, на сайте
- **Data Processing Agreement (DPA)** — для B2B-клиентов
- **Records of Processing Activities (RoPA)** — внутренний документ

## 4. CCPA / CPRA (Калифорния)

| Требование | Реализация |
|---|---|
| Right to know | Privacy Policy + API endpoints |
| Right to delete | DELETE account |
| Right to opt-out of sale | WEAVE не продаёт данные |
| Non-discrimination | Не дискриминировать за exercise of rights |

## 5. PCI DSS (Платежи)

### Уровень

WEAVE использует **Stripe** — Stripe обрабатывает карты, WEAVE **не хранит** PAN (card numbers).

→ WEAVE — **SAQ-A** (самый низкий уровень compliance), так как карточные данные никогда не касаются серверов WEAVE.

### Требования

| Требование | Реализация |
|---|---|
| Не хранить PAN | Stripe обрабатывает всё |
| TLS для передачи | Cloudflare → origin TLS |
| Firewall | Cloudflare WAF + Caddy |
| Access control | RBAC, audit log |
| Security assessment | Ежегодный SAQ-A self-assessment |
| Stripe Connect | Для payouts авторам (KYC требуется) |

## 6. KYC / AML (Stripe Connect)

### Требования для авторов (Stripe Connect Express)

| Требование | Когда |
|---|---|
| Personal info (name, DOB, address) | При регистрации как Creator |
| Tax ID (SSN/EIN для США) | При первом payout |
| Bank account | Для payouts |
| Identity verification | Stripe Identity (passport/driver's license) |
| Business info (если entity) | При регистрации как Team |

### AML

- Stripe обрабатывает AML-checks для Connect-аккаунтов
- WEAVE мониторит suspicious activity (большие переводы, необычные паттерны)
- Отчётность: 1099-K для США (с $600 порога, с года 2)

## 7. DMCA (Авторское право)

### Политика

- **DMCA takedown process** — публичная страница /dmca
- **Counter-notice** — процесс восстановления контента
- **Repeat infringer policy** — 3 strikes → ban
- **Safe harbor** — WEAVE не несёт ответственность за пользовательский контент (DMCA Section 512)

### Реализация

```
1. Rights holder → WEAVE: DMCA takedown notice
2. WEAVE → проверка (is it valid?)
3. WEAVE → takedown content + notify uploader
4. Uploader → counter-notice (if false claim)
5. WEAVE → restore content after 10-14 business days (if no lawsuit)
6. Repeat infringers → ban after 3 valid takedowns
```

## 8. Terms of Service

### Ключевые разделы

1. **Acceptance** — использование = согласие с ToS
2. **Eligibility** — 13+ (COPPA), 16+ для ЕС (GDPR)
3. **Accounts** — ответственность за аккаунт, безопасность
4. **Content** — пользователь владеет контентом, лицензия WEAVE для отображения
5. **Acceptable use** — запрет: спам, незаконный контент, harassment, CSAM, malware
6. **Monetization** — комиссии, payout-условия, налоги — ответственность автора
7. **Intellectual property** — DMCA process
8. **Termination** — право WEAVE удалить аккаунт за нарушение
9. **Disclaimer** — "as is", без гарантий
10. **Limitation of liability** — cap на ответственность
11. **Governing law** — Delaware, USA
12. **Changes to ToS** — 30 дней notice

## 9. Политика конфиденциальности

### Структура

1. **What we collect** — email, username, IP, device, usage data, payment metadata
2. **Why we collect** — provide service, security, analytics, legal
3. **Who we share with** — Stripe (payments), Cloudflare (CDN), Sentry (errors)
4. **Data retention** — сессии 30д, логи 90д, данные — пока активен + 30д после удаления
5. **Your rights** — GDPR/CCPA rights
6. **Cookies** — essential + analytics (consent-based)
7. **International transfers** — данные могут передаваться в США (Standard Contractual Clauses)
8. **Children** — 13+ только, 16+ для ЕС
9. **Changes** — 30 дней notice
10. **Contact** — privacy@weave.app

## 10. Договоры с третьими сторонами

| Сторона | Договор | Назначение |
|---|---|---|
| Stripe | Stripe Connect Agreement | Платежи, payouts |
| Cloudflare | MSA | CDN, WAF, DNS |
| Sentry | MSA | Error monitoring |
| Google (OAuth) | API ToS | Вход через Google |
| GitHub (OAuth) | API ToS | Вход/импорт из GitHub |
| SendGrid/Resend | MSA | Email-рассылки |
| OpenAI (future) | API ToS | AI-функции (если будут) |

## 11. Лицензирование ПО

### WEAVE Core

| Компонент | Лицензия | Обоснование |
|---|---|---|
| WEAVE Core (backend + frontend) | BSL (Business Source License) | Source-available, переходит в Apache 2.0 через 4 года |
| WEAVE SDK | Apache 2.0 | Максимальная совместимость |
| WEAVE Protocol (future) | CC-BY-SA | Спецификация — открытая |
| Документация | CC-BY | Открытая документация |

### Зависимости (open-source)

Все зависимости проверяются на:
- Совместимость лицензии (MIT, Apache 2.0, BSD — OK; GPL — осторожно)
- Security vulnerabilities (npm audit, Dependabot)
- Maintenance status (last commit, open issues)

## 12. Налоги

| Тип | Ответственность |
|---|---|
| Sales tax (US) | Stripe Tax (автоматический расчёт) |
| VAT (EU) | Stripe Tax / ручная регистрация (MOSS) |
| Income tax | WEAVE, Inc. — US corporate tax |
| 1099-K (US creators) | Stripe генерирует для авторов > $600/год |
| W-8BEN (non-US creators) | Авторы предоставляют через Stripe Connect |

## 13. Страхование

| Тип | Когда | Стоимость/год |
|---|---|---|
| General Liability | Фаза 1 | $500–1000 |
| Professional Liability (E&O) | Фаза 2 | $1000–3000 |
| Cyber Liability | Фаза 2 | $2000–5000 |
| D&O (Directors & Officers) | Pre-Seed | $3000–5000 |
