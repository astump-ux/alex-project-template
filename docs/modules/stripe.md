# Module: Stripe (Payments)

> Optional module. Enable when your project takes money.

---

## Setup

### 1. Get keys from Stripe Dashboard
- Account: SMART work labs GmbH (`acct_1TOZMr5IQwN04rZy`)
- Go to https://dashboard.stripe.com/apikeys
- For **development**: use test mode (`sk_test_...`, `pk_test_...`)
- For **production**: use live mode (`sk_live_...`)

### 2. Create products in Stripe Dashboard
Decide on your pricing model first. The canonical pattern is **credit packs + annual subscription** (see TOOLSTACK Section 4). Adapt as needed:

| Product | Type | Pricing | Stripe env var |
|---|---|---|---|
| Starter Pack | One-time | e.g. 3 credits, 7.99 € | `STRIPE_PRICE_STARTER` |
| Standard Pack | One-time | e.g. 10 credits, 19.99 € | `STRIPE_PRICE_STANDARD` |
| Profi Pack | One-time | e.g. 25 credits, 39.99 € | `STRIPE_PRICE_PROFI` |
| PRO Annual | Recurring (year) | e.g. 59 €/year | `STRIPE_PRICE_PRO_ANNUAL` |

Currency: EUR. After creating each product, copy the `price_...` ID into a Vercel env var.

### 3. Set up webhook
- Dashboard → Developers → Webhooks → "Add endpoint"
- Endpoint URL: `https://<your-app>.vercel.app/api/stripe/webhook`
- Events to send: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_succeeded`
- Copy the **Signing secret** → Vercel env var `STRIPE_WEBHOOK_SECRET`

### 4. Add env vars to Vercel
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER       # or whatever product IDs you defined
STRIPE_PRICE_STANDARD
STRIPE_PRICE_PROFI
STRIPE_PRICE_PRO_ANNUAL
```

### 5. Wire up the code
- `src/lib/stripe.ts` — Stripe client + checkout session + webhook signature verification
- `src/app/api/stripe/checkout/route.ts` — Create checkout session, redirect user
- `src/app/api/stripe/webhook/route.ts` — Verify signature, dispatch event

### 6. Add credits table to Supabase
Create a migration `supabase/migrations/NNN_credits.sql`:

```sql
-- user_credits: current balance per user
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro')),
  subscription_expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- credit_transactions: audit trail
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,   -- positive = gift, negative = spend
  reason TEXT NOT NULL,      -- 'stripe_purchase', 'analysis', 'manual_adjustment'
  stripe_event_id TEXT UNIQUE,  -- prevents double-credit on webhook retries
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users see only their own
CREATE POLICY "users read own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users read own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
-- Writes only via service role (webhook + admin operations)
```

---

## Critical patterns

### Idempotent webhooks
Stripe retries webhooks. Use `event.id` as a dedup key:

```typescript
const { data: existing } = await admin
  .from('credit_transactions')
  .select('id')
  .eq('stripe_event_id', event.id)
  .maybeSingle();

if (existing) {
  return new Response('Already processed', { status: 200 });
}
// ... process event, write credit_transactions with stripe_event_id
```

### Never trust the client
After Stripe Checkout redirects users back to your success page, **don't** credit them based on the redirect. Credit them when the **webhook** fires `checkout.session.completed`. Webhooks are signed; redirects are forgeable.

### Test mode vs. live mode
- Local dev → test mode keys
- Vercel Production scope → live mode keys
- Vercel Preview / Development scopes → test mode keys (so preview deploys can be tested with fake cards)

---

## When NOT to use this module

- Free product with no payments — obviously
- B2B with manual invoicing — Stripe Invoicing or another tool may fit better
- Crypto / web3 — Stripe isn't the right fit
- Marketplace with seller payouts — Stripe Connect, which is a different setup (use the official `@stripe/stripe-js` docs)
