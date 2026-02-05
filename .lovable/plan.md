
# WCBD Fraud Guard v4.0 - New Features Implementation Plan

## 📋 সারসংক্ষেপ

এই plan-এ তিনটি নতুন feature যোগ করা হবে:

1. **Incomplete Order Recovery System** - যারা checkout থেকে order confirm না করে চলে যায় তাদের track করা
2. **Countdown Timer Control** - Plugin থেকে countdown timer control করার ব্যবস্থা  
3. **Courier Status Integration** - Pathao এবং Steadfast courier-এর order status দেখার ব্যবস্থা

---

## 🎯 Feature 1: Incomplete Order Recovery System

### ধারণা
Customer checkout page-এ গিয়ে form fill করা শুরু করলে সেটা track হবে। যদি 5 মিনিটের মধ্যে order complete না হয়, সেটা "Abandoned Cart" হিসেবে save হবে।

### Database পরিবর্তন

| নতুন Table | `abandoned_checkouts` |
|------------|----------------------|
| id | uuid, primary key |
| merchant_id | uuid, references merchants |
| customer_phone | text |
| customer_name | text (nullable) |
| customer_email | text (nullable) |
| device_fingerprint | text (nullable) |
| ip_address | text (nullable) |
| cart_data | jsonb (nullable) - products info |
| checkout_url | text (nullable) |
| is_recovered | boolean, default false |
| created_at | timestamp |
| recovered_at | timestamp (nullable) |

### Plugin পরিবর্তন (v4.0)

```text
নতুন JavaScript Logic:
1. Checkout page load হলেই visitor track শুরু
2. Form-এ phone/name input করলে API call - "checkout_started"
3. Order complete হলে API call - "checkout_completed"  
4. 5 মিনিট পর server-side check করে abandoned mark করবে

নতুন Admin Settings:
- Enable/Disable Abandoned Cart Tracking (toggle)
- Recovery notification WhatsApp template
- Auto-recovery time (5/10/15 minutes)
```

### নতুন Edge Function: `track-checkout`

```text
Endpoints:
POST /track-checkout
  - action: "started" | "completed"
  - api_key, phone, device_id, cart_data

Logic:
- "started" → abandoned_checkouts table-এ insert
- "completed" → is_recovered = true, recovered_at = now()
```

### Dashboard UI পরিবর্তন

```text
নতুন Tab: "Abandoned Carts"
- List: Phone, Name, Time ago, Status
- Actions: 
  - WhatsApp Send বাটন (recovery message পাঠানো)
  - Mark as Recovered
  - Delete
- Stats: Today/This Week/This Month
```

---

## 🎯 Feature 2: Countdown Timer Dashboard Control

### বর্তমান অবস্থা
Countdown timer শুধু plugin-এর settings page থেকে change করা যায় (popup_timer option)।

### নতুন Feature
Dashboard থেকে remote-এ timer settings পরিবর্তন করা যাবে।

### Database পরিবর্তন

| `merchants` table-এ নতুন columns |
|----------------------------------|
| popup_timer_seconds | integer, default 30 |
| popup_language | text, default 'bn' |
| msg_cooldown | text |
| msg_blacklist | text |
| whatsapp_number | text |
| phone_number | text |
| show_contact_buttons | boolean, default true |

### Edge Function পরিবর্তন: `check-order-eligibility`

```text
Response-এ নতুন fields:
{
  "allowed": true/false,
  "popup_settings": {
    "timer": 30,
    "language": "bn", 
    "msg_cooldown": "...",
    "msg_blacklist": "...",
    "whatsapp": "...",
    "phone": "...",
    "show_contact": true
  }
}
```

### Plugin পরিবর্তন (v4.0)

```text
JavaScript Logic:
- API response থেকে popup_settings পড়বে
- Local settings-এর উপরে server settings priority পাবে
- Fallback: যদি API থেকে না আসে, local settings ব্যবহার করবে

Settings Priority:
1. Server (Dashboard) settings
2. Local WordPress settings
3. Default values
```

### Dashboard UI পরিবর্তন

```text
নতুন "Plugin Settings" Section:
- Popup Timer (seconds): 0-300
- Language: Bengali/English dropdown
- Cooldown Message: textarea
- Blacklist Message: textarea  
- WhatsApp Number: input
- Phone Number: input
- Show Contact Buttons: toggle

"Apply to All Sites" button (সব connected domains-এ apply)
```

---

## 🎯 Feature 3: Courier Status Integration (Pathao & Steadfast)

### API Requirements

**Steadfast API:**
```text
Base URL: https://portal.steadfast.com.bd/api/v1
Headers: 
  - Api-Key: {api_key}
  - Secret-Key: {secret_key}

Endpoints:
- GET /status_by_invoice/{invoice}
- GET /status_by_cid/{consignment_id}
- GET /status_by_trackingcode/{tracking_code}

Status Values:
pending, in_review, hold, delivered, cancelled, partial_delivered
```

**Pathao API:**
```text
Base URL: https://api-hermes.pathao.com (production)
Auth: OAuth2 (client_id, client_secret, username, password)

Endpoints:
- GET /aladdin/api/v1/orders/{consignment_id}

Status Values:
Pending, Picked, In Transit, Delivered, Return
```

### Database পরিবর্তন

| `merchants` table-এ নতুন columns |
|----------------------------------|
| steadfast_api_key | text (nullable) |
| steadfast_secret_key | text (nullable) |
| pathao_client_id | text (nullable) |
| pathao_client_secret | text (nullable) |
| pathao_username | text (nullable) |
| pathao_password | text (encrypted, nullable) |

| নতুন Table | `courier_orders` |
|------------|------------------|
| id | uuid, primary key |
| merchant_id | uuid, references merchants |
| courier_type | text ('steadfast' or 'pathao') |
| invoice_number | text |
| consignment_id | text |
| tracking_code | text (nullable) |
| recipient_name | text |
| recipient_phone | text |
| recipient_address | text |
| cod_amount | numeric |
| status | text |
| last_synced_at | timestamp |
| created_at | timestamp |

### নতুন Edge Function: `courier-status`

```text
Endpoints:

POST /courier-status
  action: "check_status"
  api_key: merchant api key
  courier: "steadfast" | "pathao"
  invoice: invoice number OR
  consignment_id: consignment id OR
  tracking_code: tracking code

POST /courier-status  
  action: "sync_all"
  api_key: merchant api key
  courier: "steadfast" | "pathao"
  
Response:
{
  "success": true,
  "order": {
    "invoice": "123456",
    "status": "delivered",
    "recipient_name": "...",
    "last_update": "2025-02-05T10:00:00Z"
  }
}
```

### Plugin পরিবর্তন (v4.0)

```text
নতুন Admin Tab: "Courier Status"

Sections:
1. Steadfast Settings
   - API Key input
   - Secret Key input  
   - Test Connection button

2. Pathao Settings
   - Client ID input
   - Client Secret input
   - Username input
   - Password input
   - Test Connection button

3. Order Tracking
   - Invoice/Tracking Code search box
   - Courier dropdown (Steadfast/Pathao)
   - "Check Status" button
   - Results table

4. Bulk Status Check
   - "Sync All Orders" button
   - Last synced timestamp
   - Status summary (Pending: X, Delivered: Y, etc.)
```

### Dashboard UI পরিবর্তন

```text
নতুন Tab: "Courier Orders"

Features:
- Courier credentials save করার form
- Order list with status
- Search by invoice/phone
- Filter by courier (All/Steadfast/Pathao)
- Filter by status
- Auto-sync every 30 minutes (optional)
- Manual "Refresh Status" button

Stats Cards:
- Total Orders
- Pending
- In Transit  
- Delivered
- Returned/Cancelled
```

---

## 📂 ফাইল পরিবর্তন তালিকা

| ফাইল | পরিবর্তন |
|------|---------|
| `src/utils/pluginGenerator.ts` | Plugin v4.0 code - 3টি নতুন feature |
| `supabase/functions/check-order-eligibility/index.ts` | popup_settings return করা |
| `supabase/functions/track-checkout/index.ts` | নতুন - abandoned cart tracking |
| `supabase/functions/courier-status/index.ts` | নতুন - courier API integration |
| `src/components/fraud-protection/AbandonedCarts.tsx` | নতুন - abandoned carts UI |
| `src/components/fraud-protection/CourierOrders.tsx` | নতুন - courier tracking UI |
| `src/components/fraud-protection/PluginRemoteSettings.tsx` | নতুন - remote settings UI |
| `src/pages/FraudProtectionPage.tsx` | নতুন tabs যোগ |
| Database Migration | 2টি নতুন table + merchants columns |

---

## 🔄 Implementation Priority

| Phase | Features | আনুমানিক সময় |
|-------|----------|-------------|
| Phase 1 | Countdown Timer Remote Control | ১ম - সবচেয়ে সহজ |
| Phase 2 | Incomplete Order Recovery | ২য় - moderate complexity |
| Phase 3 | Courier Integration | ৩য় - complex (external APIs) |

---

## ⚠️ বিবেচনা

### Courier API Keys
- Steadfast এবং Pathao-র API credentials user-কে নিজে সংগ্রহ করতে হবে
- Dashboard-এ credentials save করার encrypted storage দরকার

### Plugin Version
- Plugin version 3.3.0 → 4.0.0 করতে হবে
- Backward compatibility রাখতে হবে (পুরাতন plugin-ও কাজ করবে)

### Rate Limiting
- Courier API calls rate limited করতে হবে
- Cache mechanism implement করতে হবে (same order 5 min এ একবার check)

