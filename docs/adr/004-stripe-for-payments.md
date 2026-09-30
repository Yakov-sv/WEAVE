# ADR-004: Stripe Connect для Payments

**Status:** Accepted
**Date:** 2026-09-30

## Context

WEAVE требует платёжную инфраструктуру для: платных подписок (на каналы/репо/профили), разовых покупок (маркетплейс), чаевых, выплат авторам (payouts).

## Options

### Option A: Stripe Connect
- Глобальный, зрелый, REST API
- Connect: payouts авторам на их банковские счета
- Subscriptions, Checkout, Customer Portal — из коробки
- Webhooks для payment events
- 2.9% + $0.30 per transaction

### Option B: PayPal
- Глобальный, но хуже API
- Нет аналога Connect для split payouts
- Больше manual работы для payouts

### Option C: Adyen
- Enterprise-фокус, дороже
- Сильный для global/local payment methods

### Option D: Крипто (USDC, Lightning)
- Глобальный, low fees
- Нет chargeback protection
- Сложность UX для non-crypto пользователей
- Регуляторные риски

### Option E: Custom (multi-provider aggregator)
- Stripe + PayPal + крипто
- Максимум покрытия
- Сложность, дублирование логики

## Decision

**Option A: Stripe Connect (primary)** + **Crypto (future, опционально)**

## Rationale

1. **Connect** — единственный зрелый solution для marketplace payouts (авторы → банковские счета)
2. **Subscriptions API** — мощный, надёжный, с dunning management
3. **Checkout** — hosted payment page (PCI-compliant, no PAN on our servers)
4. **Customer Portal** — пользователи управляют подписками сами (меньше support load)
5. **Webhooks** — надёжные, signed, retry logic
6. **Global** — 46+ стран, 135+ валют
7. **Developer experience** — отличный API, SDK для Node.js, документация

## Implementation

### Stripe Connect Express

```
Creator → Stripe Connect Express onboarding
    ↓
Stripe verifies identity (KYC)
    ↓
Creator gets Stripe account (managed by WEAVE)
    ↓
Subscriber pays → Stripe → splits:
    ├─ Platform fee (10%) → WEAVE's Stripe account
    └─ Remainder → Creator's Stripe account
    ↓
Stripe payout → Creator's bank account (automatic)
```

### Checkout flow

```
1. User → WEAVE: POST /api/v1/conversations/{id}/subscribe
2. WEAVE → Stripe: create Checkout Session (with Connect destination)
3. Stripe → URL → User redirected to Stripe Checkout
4. User → Stripe: pays by card / Apple Pay / Google Pay
5. Stripe → WEAVE: webhook (payment_succeeded)
6. WEAVE → Event Bus: payment.succeeded
7. Event Bus → Messaging: grant access to channel
8. Event Bus → Market: create active_subscription
9. Event Bus → Notification: notify user + creator
```

### Fee structure

```
Subscriber pays $10
    ↓
Stripe fee: $0.30 + 2.9% = $0.59
    ↓
WEAVE commission (10%): $1.00
    ↓
Creator receives: $10 - $0.59 - $1.00 = $8.41
```

## Consequences

### Positive
- Быстрая интеграция (недели, а не месяцы)
- PCI compliance — SAQ-A (минимальный, карты не у нас)
- Payouts автоматические (Stripe Connect)
- Dunning, retries, chargebacks — handled by Stripe
- Customer Portal — self-service

### Negative
- 2.9% + $0.30 — выше чем некоторые локальные провайдеры
- Vendor lock-in (но API качественный, миграция возможна)
- Не во всех странах (например, РФ под санкциями)
- Connect onboarding требует KYC (может отпугнуть некоторых авторов)

### Mitigations
- Для неподдерживаемых стран: крипто-платежи (фаза 2)
- Для РФ: Boosty/Юкаssa интеграция (если целевой рынок РФ, фаза 2)
- Stripe Tax для автоматического tax calculation (добавить в фазе 2)
