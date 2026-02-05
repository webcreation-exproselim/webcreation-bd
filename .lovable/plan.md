
# Customer Trust Score System - Implementation Plan

## Overview
একটি **Customer Trust Score** সিস্টেম তৈরি করা হবে যেখানে customer এর phone number দিয়ে courier delivery history চেক করে একটি trust percentage দেওয়া হবে। এটি merchant কে order accept/reject করতে সাহায্য করবে।

## Trust Score Calculation Logic

```text
┌─────────────────────────────────────────────────────────────┐
│                    TRUST SCORE FORMULA                       │
├─────────────────────────────────────────────────────────────┤
│  Score = (Delivered Orders / Total Orders) × 100            │
│                                                              │
│  ✓ Delivered = Positive (+1)                                 │
│  ✗ Returned/Cancelled = Negative (counts in total)          │
│  ⋯ Pending/In Transit = Neutral (excluded from calculation) │
├─────────────────────────────────────────────────────────────┤
│  Examples:                                                   │
│  • 5 Delivered, 0 Returned = 100% Trust                      │
│  • 3 Delivered, 2 Returned = 60% Trust                       │
│  • 0 History = "New Customer" (no score)                     │
└─────────────────────────────────────────────────────────────┘
```

## Score Display

```text
Score Range          Badge Color         Label
─────────────────────────────────────────────────
80-100%              🟢 Green            "Trusted Customer"
50-79%               🟡 Yellow           "Medium Risk"
0-49%                🔴 Red              "High Risk"
No History           ⚪ Gray             "New Customer"
```

## Implementation Steps

### Step 1: New Edge Function - `customer-trust-score`
একটি নতুন edge function তৈরি করা হবে যা:
- Phone number নিয়ে courier_orders টেবিলে search করবে
- সব courier (Steadfast/Pathao/RedX) এর combined history বের করবে
- Trust score calculate করবে
- Order history summary return করবে

### Step 2: Dashboard Component - Customer Lookup
Dashboard এ নতুন UI:
- Phone number search box
- Trust Score display (percentage + badge)
- Delivery history breakdown
- Accept/Reject buttons (manual decision)

### Step 3: WordPress Plugin Update
Plugin এ নতুন feature:
- Checkout page এ order place এর আগে score চেক
- Merchant কে popup দিয়ে score দেখানো
- Manual decision নেওয়ার option

### Step 4: API Response Structure

```text
{
  "phone": "01700000000",
  "trust_score": 75,
  "status": "medium_risk",
  "history": {
    "total_orders": 8,
    "delivered": 6,
    "returned": 2,
    "pending": 0
  },
  "last_order_date": "2026-01-15",
  "couriers": ["steadfast", "pathao"]
}
```

## Technical Details

### Database Query Logic
```sql
-- Phone number দিয়ে courier_orders থেকে history বের করা
SELECT 
  status,
  COUNT(*) as count,
  courier_type
FROM courier_orders
WHERE recipient_phone LIKE '%01700000000%'
  AND merchant_id = '<merchant_id>'
GROUP BY status, courier_type
```

### Files to Create/Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/functions/customer-trust-score/index.ts` | Create | নতুন edge function |
| `src/components/fraud-protection/CustomerTrustLookup.tsx` | Create | Dashboard UI component |
| `src/pages/FraudProtectionPage.tsx` | Modify | নতুন tab যোগ |
| `src/utils/pluginGenerator.ts` | Modify | Plugin এ trust score check যোগ |
| `supabase/functions/check-order-eligibility/index.ts` | Modify | Trust score response এ যোগ |

### Plugin Flow

```text
Customer Places Order
        ↓
Plugin checks phone number
        ↓
API returns trust score
        ↓
┌───────────────────────┐
│  Show Score to        │
│  Merchant in Popup    │
│                       │
│  Score: 45% (High Risk)│
│  History: 4 orders    │
│  Returned: 2          │
│                       │
│  [Accept] [Reject]    │
└───────────────────────┘
        ↓
Merchant decides manually
```

## Summary
এই সিস্টেমে:
1. **Edge Function** - Phone number দিয়ে courier history থেকে trust score calculate
2. **Dashboard UI** - Customer lookup এবং history view
3. **Plugin Integration** - Checkout এ real-time score দেখানো
4. **Manual Decision** - Merchant নিজে accept/reject করবে, auto-block নয়
