# Module: Twilio (WhatsApp / SMS)

> Optional module. Enable when your project sends or receives WhatsApp / SMS messages.

---

## Setup

### 1. Twilio account
- Console: https://console.twilio.com
- For WhatsApp: you need a WhatsApp Business approved phone number (or the Twilio sandbox for development)
- For SMS: any Twilio phone number with SMS capability

### 2. Get credentials
- Account SID: `AC...` (console homepage)
- Auth Token: regenerate on the console homepage
- WhatsApp number: format `whatsapp:+49...` (with country code)

### 3. Add env vars to Vercel

```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER     # e.g. whatsapp:+4915123456789
```

### 4. Install SDK

```bash
npm install twilio
```

### 5. Set up webhook
For inbound messages:
- Twilio Console → Phone Numbers → Active Numbers → click your number
- Under **Messaging Configuration → A message comes in**, set:
  - Webhook: `https://<your-app>.vercel.app/api/whatsapp/webhook` (or `/api/sms/webhook`)
  - HTTP: POST
- Save

### 6. Verify signatures
Every Twilio webhook is signed. Always verify before processing — anyone can hit your URL:

```typescript
import twilio from "twilio";

export async function POST(req: Request) {
  const signature = req.headers.get("x-twilio-signature");
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/webhook`;
  const body = Object.fromEntries(new URLSearchParams(await req.text()));

  const valid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature ?? "",
    url,
    body
  );

  if (!valid) {
    return new Response("Invalid signature", { status: 403 });
  }

  // ... process the message
}
```

---

## Sending messages

```typescript
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  from: process.env.TWILIO_WHATSAPP_NUMBER,
  to: `whatsapp:+49${userPhoneE164}`,
  body: "Your analysis is ready. Result: ...",
});
```

---

## Critical patterns

### Keep replies short
WhatsApp / SMS readers skim. Max 3 sentences. If you need to send more, link out to the app.

### Don't ping users without consent
Inbound webhook means a user contacted you first — replying is fine. Initiating contact requires WhatsApp Business approval for the template message. Don't get clever.

### Rate limits
Twilio has rate limits. For sending bursts (e.g. notifying 100 users at once), use a queue or background job — don't fire-and-forget in a request handler.

### Media (PDFs, images)
Inbound WhatsApp messages with media give you a temp URL valid for ~24 hours. Download immediately and store in Supabase Storage if you need to keep it.

---

## When NOT to use Twilio

- Email notifications — use a transactional provider like Resend
- In-app notifications — use Supabase Realtime + a toast component
- Push notifications — use web push or a service like OneSignal
- High-volume marketing — Twilio is for transactional; marketing has different compliance & cost profiles
