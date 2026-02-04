

# WCBD Fraud Guard - Complete Implementation Plan

## Overview

এই plan-এ নিম্নলিখিত features implement করা হবে:

1. **Client Dashboard-এ Fraud Protection অপশন** - Customer subscription ও access point
2. **নতুন Info Page** - `/fraud-guard` route-এ details ও pricing সহ public page
3. **Plugin rename to "WCBD Fraud Guard"**
4. **Minutes-based cooldown** - Plugin থেকে minute-level control
5. **Pricing: Monthly ৳100, Yearly ৳699**

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC PAGES                              │
├─────────────────────────────────────────────────────────────────┤
│   /fraud-guard          →  Landing page with details & pricing  │
│                              ↓ "কিনুন" button                   │
│                              ↓                                   │
│   /auth                 →  Login/Signup                          │
│                              ↓                                   │
│   /dashboard            →  Client Dashboard (Fraud Guard card)  │
│                              ↓ "সেটিংস" button                  │
│                              ↓                                   │
│   /fraud-protection     →  Full dashboard (only for active)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Database Changes

### Update `merchants` Table - Add new columns

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| cooldown_period_minutes | integer | 1440 | Cooldown in MINUTES (1440 = 1 day) |
| is_active | boolean | false | Account activated after payment? |
| current_plan | text | NULL | 'monthly' or 'yearly' |
| plan_expires_at | timestamptz | NULL | When subscription expires |
| requests_used | integer | 0 | API calls used |
| max_requests | integer | 0 | Max allowed requests |

### New Table: `subscription_orders`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| merchant_id | uuid (FK) | Which merchant |
| plan_type | text | 'monthly' or 'yearly' |
| amount | numeric | 100 or 699 |
| payment_method | text | bkash/nagad/rocket |
| transaction_id | text | Payment reference |
| sender_number | text | Phone number |
| payment_screenshot_url | text | Proof image |
| status | text | pending/approved/rejected |
| created_at | timestamptz | Order time |
| approved_at | timestamptz | When approved |

---

## 2. New Page: `/fraud-guard` - Landing Page with Details & Pricing

### Page Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (with navigation)                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🛡️ WCBD Fraud Guard                                            │
│  আপনার WooCommerce স্টোর রক্ষা করুন                              │
│                                                                  │
│  [Hero section with features illustration]                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Features Section                                             │
│  - Fake Order Protection                                         │
│  - Device Fingerprinting                                         │
│  - Minute-level Cooldown Control                                │
│  - Blacklist Management                                          │
│  - Real-time Logs                                                │
│  - Beautiful Popup System                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💰 PRICING PLANS                                                │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │ 📅 MONTHLY       │  │ 📆 YEARLY        │                      │
│  │                 │  │                 │                       │
│  │   ৳১০০/মাস      │  │   ৳৬৯৯/বছর      │                       │
│  │   1,000 req     │  │   15,000 req    │                       │
│  │                 │  │   (42% সেভ!)    │                       │
│  │   [শুরু করুন]   │  │   [শুরু করুন]   │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔧 HOW IT WORKS                                                 │
│  Step 1: Account তৈরি করুন                                       │
│  Step 2: Plan কিনুন                                              │
│  Step 3: Plugin ডাউনলোড করুন                                     │
│  Step 4: WooCommerce-এ ইন্সটল করুন                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Client Dashboard - Fraud Guard Card

### Add Section to existing `/dashboard` page

**If NOT Subscribed:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard                                            │
│                                                                  │
│  আপনার WooCommerce স্টোর Fake Order থেকে রক্ষা করুন!             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │ 📅 Monthly    │  │ 📆 Yearly     │                            │
│  │ ৳১০০/মাস     │  │ ৳৬৯৯/বছর     │                            │
│  │ [কিনুন]      │  │ [কিনুন]       │                            │
│  └──────────────┘  └──────────────┘                             │
│                                                                  │
│  [বিস্তারিত দেখুন →] (links to /fraud-guard)                    │
└─────────────────────────────────────────────────────────────────┘
```

**If Payment Pending:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ⏳ পেমেন্ট যাচাই করা হচ্ছে...                                   │
│                                                                  │
│  আপনার পেমেন্ট ২-৪ ঘন্টার মধ্যে যাচাই হবে                       │
│  Plan: Monthly | Amount: ৳100                                   │
└─────────────────────────────────────────────────────────────────┘
```

**If Active:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ✅ WCBD Fraud Guard - Active                                    │
│                                                                  │
│  Plan: Yearly | Expires: March 15, 2027                         │
│  API Usage: [=====-----] 245 / 15,000                           │
│                                                                  │
│  [সেটিংস দেখুন →] (links to /fraud-protection)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Cooldown - Minutes System

### Settings Page Update (`FraudSettings.tsx`)

**Replace days slider with minutes input:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ⏱️ COOLDOWN PERIOD                                              │
│                                                                  │
│  Quick Select:                                                   │
│  [5m] [30m] [1h] [6h] [1d] [7d] [30d]                          │
│                                                                  │
│  Custom:                                                         │
│  [ 1440 ] minutes  =  ১ দিন                                     │
│                                                                  │
│  [আপডেট করুন]                                                    │
└─────────────────────────────────────────────────────────────────┘
```

**Preset Buttons:**
- 5 minutes (5)
- 30 minutes (30)
- 1 hour (60)
- 6 hours (360)
- 1 day (1440)
- 7 days (10080)
- 30 days (43200)

---

## 5. Plugin Rename & Update

### Changes to `pluginGenerator.ts`:

1. **Rename plugin**: "Fraud Protection BD" → "WCBD Fraud Guard"
2. **File name**: `fraud-protection-bd.php` → `wcbd-fraud-guard.php`
3. **Update cooldown from days to minutes**
4. **Popup messages for minutes/hours/days**

### Plugin Admin Panel Settings Update:

WordPress Dashboard → WCBD Fraud Guard → Settings
- Add cooldown time field (minutes input)
- Quick preset buttons
- Real-time conversion display (minutes to days/hours)

---

## 6. Edge Function Update

### `check-order-eligibility/index.ts` Changes:

```javascript
// BEFORE: days-based
const cooldownDate = new Date()
cooldownDate.setDate(cooldownDate.getDate() - merchant.cooldown_period_days)

// AFTER: minutes-based
const cooldownMs = merchant.cooldown_period_minutes * 60 * 1000
const cooldownDate = new Date(Date.now() - cooldownMs)

// Add activation check
if (!merchant.is_active) {
  return { error: 'Account not activated' }
}

// Add plan expiry check  
if (merchant.plan_expires_at && new Date(merchant.plan_expires_at) < new Date()) {
  return { error: 'Subscription expired' }
}

// Add request limit check
if (merchant.max_requests > 0 && merchant.requests_used >= merchant.max_requests) {
  return { error: 'Request limit exceeded' }
}

// Return remaining time in minutes (for popup display)
const minutesRemaining = Math.ceil((cooldownMs - elapsed) / 60000)
```

---

## 7. Admin Dashboard - Subscription Management

### New Tab: "Fraud Guard Subscriptions" 

**Features:**
- Pending orders list
- Approve/Reject buttons
- View payment screenshot
- All subscriptions history

---

## 8. File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/pages/FraudGuardPage.tsx` | Public landing page with details & pricing |
| `src/components/fraud-protection/SubscriptionPlans.tsx` | Plan selection cards |
| `src/components/fraud-protection/SubscriptionPurchaseModal.tsx` | Payment form modal |
| `src/components/fraud-protection/SubscriptionStatus.tsx` | Active plan status |
| `src/components/fraud-protection/CooldownMinutesSettings.tsx` | Minutes-based cooldown UI |
| `src/components/admin/FraudSubscriptionManagement.tsx` | Admin approval panel |
| `src/hooks/useSubscriptionData.ts` | Subscription operations |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/fraud-guard` route |
| `src/pages/ClientDashboard.tsx` | Add Fraud Guard section card |
| `src/pages/FraudProtectionPage.tsx` | Add subscription check + minutes UI |
| `src/pages/AdminDashboard.tsx` | Add Fraud Guard Subscriptions tab |
| `src/components/fraud-protection/FraudSettings.tsx` | Change days → minutes |
| `src/components/fraud-protection/PluginDownload.tsx` | Update plugin name |
| `src/hooks/useMerchantData.ts` | Add subscription fields, change days → minutes |
| `src/utils/pluginGenerator.ts` | Rename to WCBD Fraud Guard, minutes support |
| `supabase/functions/check-order-eligibility/index.ts` | Minutes + activation checks |

---

## 9. Implementation Phases

### Phase 1: Database Migration
- Add new columns to `merchants` table
- Create `subscription_orders` table
- Add RLS policies

### Phase 2: Public Landing Page
- Create `/fraud-guard` page with full details
- Pricing section with Monthly ৳100, Yearly ৳699
- Features, How it works, etc.

### Phase 3: Client Dashboard Integration
- Add Fraud Guard card section
- Subscription purchase modal
- Payment screenshot upload
- Pending/Active status display

### Phase 4: Settings Update
- Change cooldown from days to minutes
- Add preset buttons
- Update useMerchantData hook

### Phase 5: Plugin Update
- Rename to "WCBD Fraud Guard"
- Update pluginGenerator.ts
- Minutes-based cooldown in generated PHP

### Phase 6: Edge Function
- Add activation/expiry/limit checks
- Change cooldown from days to minutes
- Return remaining time in appropriate unit

### Phase 7: Admin Panel
- Add subscription management tab
- Approve/reject functionality

---

## Pricing Summary

| Plan | Price | Duration | Requests | Per Day Cost |
|------|-------|----------|----------|--------------|
| Monthly | ৳100 | 30 days | 1,000 | ৳3.33/day |
| Yearly | ৳699 | 365 days | 15,000 | ৳1.91/day (42% সেভ!) |

