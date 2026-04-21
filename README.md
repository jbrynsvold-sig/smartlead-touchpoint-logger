# SmartLead Touchpoint Logger

Receives SmartLead webhook events and logs them as touchpoints on MongoDB contact records.

## Events Handled

| Event | Touchpoint | Record Updates |
|-------|-----------|----------------|
| `EMAIL_SENT` | `email_sent` | `last_emailed` |
| `EMAIL_OPENED` | `email_opened` | — |
| `EMAIL_REPLIED` | `reply` | `last_reply_date`, suppression → `activeConversation` (30d cooldown) |
| `EMAIL_BOUNCED` | `email_bounced` | `suppression_status: hardBounce`, `do_not_contact: true` |
| `LEAD_UNSUBSCRIBED` | `unsubscribed` | `unsubscribed: true`, `do_not_contact: true`, `channel_suppression.email: unsubscribed` |
| `LEAD_CATEGORY_UPDATED` | `category_updated` | suppression → `activeConversation` if positive category |

## Setup

### Local
```bash
cp .env.example .env
# Fill in your values
npm install
npm run dev
```

### Railway
1. Connect this repo to a Railway service
2. Add environment variables in Railway dashboard:
   - `MONGODB_URI`
   - `SMARTLEAD_SECRET_KEY`
3. Railway sets `PORT` automatically

## Webhook Endpoint

```
POST https://your-railway-url.railway.app/webhook
```

Configure this URL in SmartLead → Settings → Webhooks for each event type.

## Health Check

```
GET https://your-railway-url.railway.app/health
```
