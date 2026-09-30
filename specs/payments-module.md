# Спецификация модуля: Payments

## Обзор

Payments — платёжная инфраструктура WEAVE. Stripe Connect для подписок, разовых покупок, чаевых, выплат авторам. Webhook-обработка, комиссия, payouts.

## Сущности

### Transaction
| Поле | Тип | Описание |
|---|---|---|
| id | UUID | PK |
| type | ENUM | purchase, subscription, tip, payout, refund, fee |
| payer_id | UUID | FK → users (nullable) |
| payee_id | UUID | FK → users (nullable) |
| amount_cents | INT | Сумма |
| fee_cents | INT | Комиссия WEAVE |
| currency | VARCHAR(3) | USD |
| reference_type | VARCHAR(20) | listing, plan, channel, repo, tip |
| reference_id | UUID | ID связанной сущности |
| stripe_id | VARCHAR(200) | Stripe charge/payment/payout ID |
| status | ENUM | pending, completed, failed, refunded |
| description | TEXT | Описание |
| created_at | TIMESTAMP | Дата |

*(См. также: Purchase, ActiveSubscription, CreatorBalance, Payout — в Market spec)*

## Stripe-интеграция

### Products & Prices

```
Stripe products для каждого SubscriptionPlan:
  - WEAVE создаёт Stripe Product + Price при создании plan
  - Price = recurring (monthly/yearly)
  - Metadata: { weave_plan_id, weave_creator_id }

Stripe Connect Express для каждого Creator:
  - Создаётся Connect account при first monetization action
  - Onboarding через Stripe hosted page
  - KYC: Stripe identity verification
  - Payouts: automatic to bank account
```

### Checkout Sessions

```typescript
// Purchase (one-time)
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price_data: { currency: 'usd', product_data: { name: listing.title }, unit_amount: listing.price_cents }, quantity: 1 }],
  payment_intent_data: {
    application_fee_amount: Math.round(listing.price_cents * 0.10),
    transfer_data: { destination: seller.stripe_account_id },
  },
  success_url: `${APP_URL}/market/${listing.id}?purchased=true`,
  cancel_url: `${APP_URL}/market/${listing.id}`,
  metadata: { listing_id: listing.id, buyer_id: userId },
});

// Subscription (recurring)
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
  subscription_data: {
    application_fee_percent: 10,
    transfer_data: { destination: creator.stripe_account_id },
  },
  success_url: `${APP_URL}/subscriptions/${plan.id}?subscribed=true`,
  cancel_url: `${APP_URL}/subscriptions/${plan.id}`,
  metadata: { plan_id: plan.id, subscriber_id: userId },
});

// Tip (one-time)
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [{ price_data: { currency: 'usd', product_data: { name: 'Tip' }, unit_amount: tipAmount }, quantity: 1 }],
  payment_intent_data: {
    application_fee_amount: Math.round(tipAmount * 0.05),
    transfer_data: { destination: recipient.stripe_account_id },
  },
  success_url: `${APP_URL}/profile/${recipient.username}?tipped=true`,
  cancel_url: `${APP_URL}/profile/${recipient.username}`,
  metadata: { tip_recipient_id: recipient.id, tipper_id: userId },
});
```

### Webhooks

| Stripe event | WEAVE action |
|---|---|
| `checkout.session.completed` | Create Purchase/Subscription, grant access |
| `payment_intent.succeeded` | Record transaction, update balance |
| `payment_intent.payment_failed` | Mark as failed, notify |
| `customer.subscription.created` | Activate subscription, grant access |
| `customer.subscription.deleted` | Expire subscription, revoke access |
| `customer.subscription.updated` | Update status (cancel_at_period_end) |
| `invoice.paid` | Renew subscription, update period_end |
| `invoice.payment_failed` | Mark past_due, notify user |
| `charge.refunded` | Mark refunded, revoke access |
| `charge.dispute.created` | Mark disputed, freeze, notify |
| `payout.paid` | Mark payout completed, notify |
| `payout.failed` | Mark payout failed, notify, return to balance |
| `account.updated` (Connect) | Update KYC status |

### Webhook handler

```typescript
@Post('webhook')
async handleWebhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {
  let event: Stripe.Event;
  
  try {
    event = this.stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    throw new BadRequestException('Invalid signature');
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      await this.handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await this.handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.paid':
      await this.handleInvoicePaid(event.data.object);
      break;
    case 'payout.paid':
      await this.handlePayoutPaid(event.data.object);
      break;
    // ... other cases
  }
  
  return { received: true };
}
```

## API

| Метод | Endpoint | Описание | Auth |
|---|---|---|---|
| POST | /payments/webhook | Stripe webhook | Stripe signature |
| GET | /payments/balance | Баланс creator'а | Yes (creator) |
| GET | /payments/transactions | История транзакций | Yes |
| GET | /payments/payouts | История выплат | Yes |
| POST | /payments/payouts | Запросить выплату | Yes (creator) |
| GET | /payments/portal | Stripe Customer Portal URL | Yes |
| POST | /payments/connect/onboard | Stripe Connect onboarding | Yes (creator) |
| GET | /payments/connect/status | Статус Connect account | Yes |

## Fee calculation

```
Transaction fee breakdown:

Purchase:
  Buyer pays:           $10.00
  Stripe fee:           $0.59 (2.9% + $0.30)
  WEAVE commission:     $1.00 (10%)
  Seller receives:      $8.41
  → application_fee_amount = $1.00 (charged by Stripe on transfer)

Subscription:
  Subscriber pays:      $10.00/month
  Stripe fee:           $0.59
  WEAVE commission:     $1.00 (10% via application_fee_percent)
  Creator receives:     $8.41/month
  → application_fee_percent = 10

Tip:
  Tipper pays:          $5.00
  Stripe fee:           $0.45 (2.9% + $0.30)
  WEAVE commission:     $0.25 (5%)
  Recipient receives:   $4.30
  → application_fee_amount = $0.25
```

## Connect onboarding flow

```
1. Creator → first monetization action (create paid channel / listing)
2. WEAVE → проверка: есть ли Stripe Connect account?
3. Если нет → POST /payments/connect/onboard
4. WEAVE → Stripe: create Connect Express account
5. Stripe → Account Link URL (hosted onboarding)
6. Creator → Stripe onboarding page (KYC: name, DOB, address, SSN/EIN, bank)
7. Stripe → webhook: account.updated (capabilities updated)
8. WEAVE → update user: stripe_account_id, stripe_onboarded = true
9. Creator → теперь может принимать платежи
```

## Payout flow

```
1. Creator → POST /payments/payouts { amount_cents: 50000 }
2. WEAVE → проверка: available_cents >= 50000?
3. WEAVE → update balance: available -= 50000, pending += 50000
4. WEAVE → Stripe: create payout (to creator's bank)
   stripe.payouts.create({
     amount: 50000,
     currency: 'usd',
     destination: creator.stripe_account_id (automatic)
   })
5. Stripe → transfer to bank (1–2 business days)
6. Stripe → webhook: payout.paid
7. WEAVE → update payout status: paid
8. WEAVE → update balance: pending -= 50000
9. WEAVE → event: payout.completed → Notification
```

## Edge cases

1. **Webhook idempotency** — Stripe может прислать duplicate webhook → проверка stripe_id в transactions
2. **Webhook ordering** — события могут прийти не по порядку → обработка по event type + idempotent
3. **Webhook timeout** — Stripe retries → вернуть 200 быстро, обрабатывать async (queue)
4. **Connect account rejected** — Stripe отклонил KYC → нельзя принимать платежи → notify creator
5. **Insufficient balance for payout** — проверка перед запросом
6. **Refund after payout** — если деньги уже выплачены → negative balance в Stripe → покрываем из будущих платежей
7. **Currency conversion** — MVP: USD only, Stripe handles conversion for international cards
8. **Failed payment retry** — Stripe Smart Retries (3 attempts over 7 days), затем cancel subscription
9. **Tax** — MVP: no tax, Stripe Tax в фазе 2
10. **3D Secure** — Stripe handles (SCA for EU cards)
11. **Apple Pay / Google Pay** — через Stripe Checkout (автоматически)
12. **Country support** — Stripe поддерживает 46+ стран; для неподдерживаемых → крипто (фаза 2)
13. **Minimum payout** — $50 minimum (Stripe fee makes smaller payouts uneconomical)
14. **PCI compliance** — SAQ-A (Stripe Checkout, no PAN on our servers)

## UI-требования

### Страницы
1. **Creator dashboard** — баланс, график дохода, последние транзакции
2. **Payouts page** — история выплат, запрос выплаты
3. **Transactions page** — полный список транзакций (filterable)
4. **Connect onboarding** — redirect to Stripe hosted onboarding
5. **Customer portal** — Stripe-hosted (manage cards, subscriptions, invoices)

### Компоненты
- `BalanceWidget` — available / pending / lifetime, payout button
- `TransactionTable` — date, type, description, amount, status
- `PayoutForm` — amount input, method, submit, confirmation
- `PayoutHistory` — date, amount, status, stripe link
- `ConnectStatus` — onboarding status, "complete setup" button
- `RevenueChart` — график дохода по дням/неделям/месяцам (фаза 2)
- `SubscriptionManagement` — список активных подписок пользователя, cancel button
