
# Incomplete Order Tracking System - ✅ IMPLEMENTED

## Status: Complete

### What was implemented:
1. ✅ Database table `incomplete_orders` created with RLS policies
2. ✅ Edge function `log-checkout-attempt` deployed
3. ✅ Dashboard component `IncompleteOrders.tsx` created
4. ✅ New "Incomplete" tab added to FraudProtectionPage
5. ✅ WordPress Plugin v6.0 with 3 tracking triggers
6. ✅ Smart detection (5+ attempts = HIGH risk)

## Overview
├────────────────────────────────────────────────────────────────┤
│  📱 Phone Blur   → User enters phone & clicks away = Log       │
│  ❌ Error        → WooCommerce validation error = Log          │
│  🚪 Page Exit    → User closes tab with data = Log             │
├────────────────────────────────────────────────────────────────┤
│  🔍 SMART DETECTION                                             │
│  Same phone/IP: >5 attempts in 1 hour = SUSPICIOUS FLAG        │
│  Response: { risk_level: "low/medium/high" }                   │
└────────────────────────────────────────────────────────────────┘
```

## Risk Level System

| Condition | Risk Level | Dashboard Badge |
|-----------|------------|-----------------|
| < 3 attempts in 1 hour | LOW | Green |
| 3-5 attempts in 1 hour | MEDIUM | Yellow |
| > 5 attempts in 1 hour | HIGH | Red (Suspicious) |

## Implementation Steps

### Step 1: Database - New Table `incomplete_orders`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| merchant_id | UUID | FK to merchants |
| phone_number | TEXT | Customer phone |
| customer_name | TEXT | Optional name |
| ip_address | TEXT | Visitor IP |
| device_fingerprint | TEXT | FingerprintJS ID |
| cart_total | DECIMAL | Cart amount (if available) |
| failure_reason | TEXT | "phone_blur", "validation_error", "page_exit" |
| is_suspicious | BOOLEAN | Auto-flagged if >5 attempts |
| is_converted | BOOLEAN | Converted to real order |
| created_at | TIMESTAMP | When attempt happened |

RLS Policies:
- Merchants can view/update/delete own incomplete orders
- Admins can manage all records

### Step 2: New Merchants Table Column

Add `enable_incomplete_tracking` boolean column to control feature toggle.

### Step 3: Edge Function - `log-checkout-attempt`

**Input:**
```json
{
  "api_key": "merchant-api-key",
  "phone": "01700000000",
  "name": "Customer Name",
  "ip": "192.168.1.1",
  "device_id": "fingerprint-id",
  "cart_total": 1500,
  "reason": "phone_blur | validation_error | page_exit"
}
```

**Smart Detection Logic:**
1. Validate API Key → Get merchant_id
2. Check last 1 hour: Count attempts from same phone/IP/device
3. If any count > 5 → Mark as SUSPICIOUS
4. Insert record with is_suspicious flag
5. Return risk_level to plugin

**Output:**
```json
{
  "success": true,
  "risk_level": "low | medium | high",
  "attempts_count": 3,
  "is_suspicious": false
}
```

### Step 4: Dashboard Component - `IncompleteOrders.tsx`

**Stats Cards:**
- Total Attempts (সব attempts)
- Suspicious (flagged attempts)
- Converted (real orders এ convert হয়েছে)
- Today's Count

**Table Features:**
- Phone, Name, IP, Device columns
- Failure Reason with colored badges
- Risk Level badge (Low/Medium/High)
- Time (relative format)
- Actions: WhatsApp, Block, Convert to Order, Delete

**Filters:**
- By reason type
- By risk level
- Date range picker

### Step 5: Plugin Update (v6.0)

**New Triggers:**

```text
TRIGGER 1: Phone Blur Event
─────────────────────────────
When: #billing_phone loses focus
Action: Send to log-checkout-attempt with reason="phone_blur"

TRIGGER 2: WooCommerce Error
───────────────────────────────
When: checkout_error event fires
Action: Send with reason="validation_error"

TRIGGER 3: Page Unload
────────────────────────
When: beforeunload event (if phone is filled)
Action: navigator.sendBeacon() with reason="page_exit"
```

**Admin Settings:**
- Enable/Disable Incomplete Tracking toggle
- Auto-block threshold setting (default: 5)
- Time window setting (default: 60 minutes)

## Files to Create/Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/migrations/` | Create | New `incomplete_orders` table + merchants column |
| `supabase/functions/log-checkout-attempt/index.ts` | Create | New Edge Function |
| `src/components/fraud-protection/IncompleteOrders.tsx` | Create | Dashboard UI Component |
| `src/pages/FraudProtectionPage.tsx` | Modify | Add new "Incomplete" tab (keep Abandoned & Courier) |
| `src/utils/pluginGenerator.ts` | Modify | Add v6.0 tracking triggers |
| `supabase/config.toml` | Modify | Add new function registration |

## Tab Structure (After Implementation)

```text
Tabs:
├── Settings
├── Blacklist
├── Logs
├── Integration
├── Plugin
├── Remote
├── Abandoned (existing - kept)
├── Incomplete (NEW)
├── Courier (existing - kept)
└── Trust Score
```

## WordPress Plugin v6.0 JavaScript Flow

```text
Page Load
    ↓
Init FingerprintJS
    ↓
Attach Event Listeners:
    ├── #billing_phone blur → logIncomplete("phone_blur")
    ├── $(document.body).on('checkout_error') → logIncomplete("validation_error")
    └── window.beforeunload (if phone filled) → logIncomplete("page_exit")
    ↓
On Each Log:
    ├── Send to API (avoid duplicate logs with localStorage check)
    ├── Get risk_level response
    └── If HIGH → Optional: Show warning or silent log
```

## Security Measures

- Rate limiting: Max 10 logs per minute per IP
- Phone number normalization before storage
- Device fingerprint validation
- RLS policies for data isolation
- API key validation on each request

## Summary

এই implementation এ:
1. **Courier tab অক্ষত থাকবে** - কোন পরিবর্তন নেই
2. **নতুন Incomplete Orders tab** - Abandoned এর পাশে যোগ হবে
3. **Smart fraud detection** - Same phone/IP থেকে বারবার attempt ধরা পড়বে
4. **Plugin v6.0** - তিনটি নতুন trigger point
5. **Manual decision** - আপনি dashboard থেকে block/convert করতে পারবেন
