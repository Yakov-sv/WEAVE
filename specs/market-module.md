# Спецификация модуля: Market

## Обзор

Market — маркетплейс цифровых товаров и подписок. Продажа кода, шаблонов, курсов, медиа. Платные подписки на каналы/репо/профили. Чаевые. Эскроу (фаза 2).

## Сущности

### Listing
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| seller_id | UUID | FK → users |
| type | ENUM | code, template, course, media, service |
| title | VARCHAR(200) | Название |
| description | TEXT | Описание (markdown) |
| price_cents | INT | Цена в центах |
| currency | VARCHAR(3) | USD, EUR |
| compare_at_cents | INT | Старая цена (для скидок) |
| linked_repo_id | UUID | FK → repositories (для code) |
| linked_channel_id | UUID | FK → conversations (для course) |
| linked_post_id | UUID | FK → posts (для media) |
| cover_image_url | VARCHAR(500) | Обложка |
| preview_content | TEXT | Превью (для курса) |
| download_url | VARCHAR(500) | URL загрузки (для digital goods) |
| tags | JSONB | Теги |
| is_active | BOOLEAN | Активен |
| featured | BOOLEAN | Рекомендуемый |
| sales_count | INT | Продаж |
| rating_avg | FLOAT | Средний рейтинг |
| rating_count | INT | Кол-во отзывов |

### SubscriptionPlan
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| creator_id | UUID | FK → users |
| name | VARCHAR(100) | Basic / Pro / VIP |
| description | TEXT | Описание |
| price_cents | INT | Цена |
| currency | VARCHAR(3) | Валюта |
| interval | ENUM | monthly, yearly |
| trial_days | INT | Trial period |
| linked_channel_id | UUID | FK → conversations |
| linked_repo_id | UUID | FK → repositories |
| linked_user_id | UUID | FK → users (profile-level sub) |
| features | JSONB | Список features |
| is_active | BOOLEAN | Активен |
| subscriber_count | INT | Подписчиков |

### Purchase
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| listing_id | UUID | FK → listings |
| buyer_id | UUID | FK → users |
| amount_cents | INT | Сумма |
| platform_fee_cents | INT | Комиссия WEAVE |
| seller_revenue_cents | INT | Доход продавца |
| status | ENUM | pending, completed, refunded, disputed |
| escrow_release_at | TIMESTAMP | Дата release эскроу |
| stripe_payment_id | VARCHAR(200) | Stripe charge ID |

### ActiveSubscription
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | Подписчик |
| plan_id | UUID | FK → subscription_plans |
| status | ENUM | active, cancelled, expired, past_due |
| stripe_subscription_id | VARCHAR(200) | Stripe sub ID |
| current_period_end | TIMESTAMP | Конец периода |
| cancel_at_period_end | BOOLEAN | Отмена в конце периода |

### Review
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| reviewer_id | UUID | FK → users |
| listing_id | UUID | FK → listings |
| seller_id | UUID | FK → users |
| rating | INT | 1–5 |
| content | TEXT | Текст отзыва |

### CreatorBalance
| Поле | Тип | Описание |
|---|---|---|
| user_id | UUID | PK, FK → users |
| available_cents | INT | Доступно к выводу |
| pending_cents | INT | В обработке |
| lifetime_cents | INT | Всего заработано |

### Payout
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| amount_cents | INT | Сумма |
| status | ENUM | pending, in_transit, paid, failed |
| stripe_payout_id | VARCHAR(200) | Stripe payout ID |

## API

### Listings
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /market/listings | Каталог (filter: type, sort, price range) | No |
| GET | /market/listings/{id} | Карточка товара | No |
| POST | /market/listings | Создать листинг | Yes (creator) |
| PATCH | /market/listings/{id} | Редактировать | Yes (seller) |
| DELETE | /market/listings/{id} | Удалить | Yes (seller) |
| POST | /market/listings/{id}/purchase | Купить | Yes |
| POST | /market/listings/{id}/review | Оставить отзыв | Yes (buyer) |
| GET | /market/listings/{id}/reviews | Отзывы | No |

### Subscription plans
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /subscriptions/plans | Планы (filter: creator_id) | No |
| POST | /subscriptions/plans | Создать план | Yes (creator) |
| PATCH | /subscriptions/plans/{id} | Редактировать | Yes (creator) |
| DELETE | /subscriptions/plans/{id} | Удалить | Yes (creator) |
| POST | /subscriptions/subscribe | Подписаться | Yes |
| DELETE | /subscriptions/{id} | Отменить | Yes (subscriber) |
| GET | /subscriptions/mine | Мои подписки | Yes |

### Tipping
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| POST | /tips | Отправить чаевые | Yes |
| GET | /tips/received | Полученные чаевые | Yes |

### Revenue
| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| GET | /payments/balance | Баланс | Yes |
| GET | /payments/transactions | История транзакций | Yes |
| GET | /payments/payouts | История выплат | Yes |
| POST | /payments/payouts | Запросить выплату | Yes |
| GET | /payments/portal | Stripe Customer Portal URL | Yes |

## События

| Событие | Payload | Consumers |
|---|---|---|
| listing.created | {listing_id, seller_id, type} | Search (index) |
| listing.purchased | {listing_id, buyer_id, purchase_id} | Git (grant repo access), Notification, Messaging (grant channel access) |
| listing.reviewed | {listing_id, review_id, rating} | Search (update rating), Notification (seller) |
| subscription.plan.created | {plan_id, creator_id} | — |
| subscription.activated | {subscription_id, user_id, plan_id} | Messaging (grant channel access), Git (grant repo access), Notification |
| subscription.cancelled | {subscription_id, user_id} | Notification, schedule access revocation |
| subscription.expired | {subscription_id, user_id} | Messaging (revoke access), Git (revoke access) |
| tip.sent | {from_id, to_id, amount} | Notification (recipient), Transactions |
| payout.requested | {payout_id, user_id, amount} | Notification (admin), Stripe payout |
| payout.completed | {payout_id, user_id, amount} | Notification (user) |

## Платёжный flow

### Purchase (разовая покупка)

```
1. Buyer → POST /market/listings/{id}/purchase
2. Market → проверка: уже куплено? активен ли листинг?
3. Market → Stripe: create Checkout Session
   - amount = listing.price_cents
   - application_fee = price * 0.10 (WEAVE commission)
   - transfer_data.destination = seller's Stripe Connect account
4. Stripe → checkout_url → Buyer redirected
5. Buyer pays → Stripe → webhook: payment_succeeded
6. Payments → event: payment.succeeded
7. Event Bus → Market: create Purchase (status=completed)
8. Event Bus → Git: grant repo_access (if linked_repo)
9. Event Bus → Messaging: grant membership (if linked_channel)
10. Event Bus → Notification: notify buyer + seller
11. Market → update creator_balance (seller_revenue_cents)
```

### Subscription (рекуррентная)

```
1. Subscriber → POST /subscriptions/subscribe { plan_id }
2. Market → Stripe: create Checkout Session (mode=subscription)
   - application_fee_percent = 10
   - transfer_data.destination = creator's Stripe Connect account
3. Stripe → checkout_url → Subscriber pays
4. Stripe → webhook: customer.subscription.created
5. Payments → event: subscription.activated
6. Event Bus → Messaging: grant channel membership (role=subscriber)
7. Event Bus → Git: grant repo_access (access_type=subscriber)
8. Event Bus → Notification: notify subscriber + creator
9. (Ежемесячно) Stripe → webhook: invoice.paid → продление
10. (При отмене) Stripe → webhook: customer.subscription.deleted
    → event: subscription.expired → revoke access
```

### Tip (чаевые)

```
1. User → POST /tips { recipient_id, amount_cents }
2. Market → Stripe: create Checkout Session
   - application_fee = amount * 0.05 (5% for tips)
   - transfer_data.destination = recipient's Stripe Connect account
3. Stripe → checkout_url → User pays
4. Stripe → webhook: payment_succeeded
5. Event: tip.sent → Notification + Transactions
6. Market → update creator_balance
```

### Payout

```
1. Creator → POST /payments/payouts { amount_cents }
2. Payments → проверка: available_cents >= amount_cents?
3. Payments → Stripe Connect: create payout
4. Stripe → transfer to creator's bank account
5. Stripe → webhook: payout.paid
6. Event: payout.completed → Notification
7. Payments → update creator_balance (available -= amount, lifetime unchanged)
```

## Edge cases

1. **Refund** — через Stripe dashboard, webhook → update purchase status → revoke access
2. **Chargeback** — Stripe dispute → webhook → mark as disputed → review
3. **Subscription dunning** — Stripe handles retries, webhook: invoice.payment_failed → notify user
4. **Trial period** — Stripe handles, no charge during trial, webhook: trial_will_end → notify
5. **Currency** — MVP: USD only, multi-currency в фазе 2
6. **Tax** — Stripe Tax (фаза 2), MVP: цены без tax
7. **Seller not onboarded (Stripe Connect)** — показать "seller setup incomplete", prompt onboarding
8. **Self-purchase** — нельзя купить свой листинг
9. **Duplicate purchase** — если уже куплено → показать "you already own this"
10. **Download link expiry** — signed URL, 24h TTL
11. **Review after purchase only** — только покупатели могут оставить отзыв
12. **Escrow (фаза 2)** — hold funds 7 days, release on confirmation or auto-release
13. **Seller ban** — suspend listings, hold payouts, notify buyers

## UI-требования

### Страницы
1. **Marketplace** — каталог (grid of listing cards), filters (type, price, tags), search
2. **Listing detail** — cover, title, price, description, preview, buy button, reviews, seller info
3. **Checkout** — Stripe hosted checkout (redirect)
4. **Creator dashboard** — balance, transactions, payouts, listings management
5. **My purchases** — список покупок + доступы
6. **My subscriptions** — активные подписки, управление
7. **Subscription plans** — создание/редактирование plans (for creators)
8. **Seller profile** — листинги продавца, рейтинг

### Компоненты
- `ListingCard` — cover, title, price, rating, seller avatar
- `PriceTag` — цена, скидка, compare-at
- `BuyButton` — checkout redirect, "already owned" state
- `SubscribeButton` — для plans, checkout redirect, "subscribed" state
- `RatingStars` — 1–5 звёзд, interactive (for review) / display
- `ReviewList` — отзывы с рейтингом, текстом, автором
- `ReviewForm` — rating + text (только для покупателей)
- `BalanceCard` — available, pending, lifetime, payout button
- `TransactionList` — тип, сумма, статус, дата
- `PayoutForm` — сумма, метод, подтверждение
- `PlanCard` — name, price, features, subscribe button
- `TipButton` — quick tip (preset amounts + custom)
- `CreatorBadge` — верифицированный creator
