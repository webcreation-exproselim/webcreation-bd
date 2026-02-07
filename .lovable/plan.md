
# WCBD Courier Check Plugin - Complete Implementation Plan

## Overview
একটি আলাদা "WCBD Courier Check" প্লাগইন তৈরি হবে যা elitemart.com.bd/fraud-check সাইট থেকে কাস্টমারের ফোন নম্বর দিয়ে delivery history স্ক্র্যাপ করে দেখায়। এটি Fraud Guard থেকে সম্পূর্ণ আলাদা একটি প্রোডাক্ট হবে নিজস্ব subscription system সহ।

## যা তৈরি হবে

### 1. Database Changes (New Tables)

**`courier_check_subscriptions` টেবিল** - Courier Check এর জন্য আলাদা subscription tracking:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `api_key` (uuid, auto-generated)
- `is_active` (boolean, default false)
- `plan_expires_at` (timestamp)
- `website_url` (text)
- `requests_used` (integer, default 0)
- `max_requests` (integer, default 5000)
- `created_at`, `updated_at`

**`courier_check_orders` টেবিল** - Payment/subscription orders:
- `id` (uuid, primary key)
- `subscription_id` (uuid, FK to courier_check_subscriptions)
- `amount` (numeric) - 899
- `payment_method` (text)
- `sender_number` (text)
- `payment_screenshot_url` (text)
- `status` (text: pending/approved/rejected)
- `created_at`, `approved_at`

RLS policies: Users own data access + Admin full management

### 2. Backend Edge Function

**`supabase/functions/scrape-courier-check/index.ts`**
- Accepts POST with `{ phone, api_key }`
- Validates API key against `courier_check_subscriptions`
- Makes POST request to `https://elitemart.com.bd/fraud-check` with the phone number
- Parses HTML response to extract:
  - Success Rate (%) from `#deliveryProgress` data-percentage attribute
  - Total Orders, Deliveries, Returns from `.grid` stats section
  - Courier breakdown table from `.courier_table tbody tr`
  - Risk label from `#risk-container`
- Returns structured JSON response
- Increments `requests_used` counter
- `verify_jwt = false` (API key authentication)

### 3. Client Dashboard - New "Courier Check" Tab

**Tab Addition:**
- `TabType` union type updated: `"couriercheck"` added
- New tab in `DashboardSidebar` with `Search` icon and "Courier Check" label
- New tab in `MobileBottomNav`

**New Component: `src/components/courier-check/CourierCheckSection.tsx`**
- Similar structure to `FraudGuardSection` but for Courier Check
- Shows subscription status (active/inactive/pending)
- Purchase flow: 1 Year plan at 899 tk
- After activation: shows dashboard with phone search
- Plugin download button (generates separate WCBD Courier Check plugin)

**New Component: `src/components/courier-check/CourierCheckerDashboard.tsx`**
- Phone number search input
- Results visualization:
  - Circular Progress Bar (RadialBarChart from recharts) - Success Rate
  - Bar Chart - Courier-wise breakdown
  - Trust Label badge (Green/Yellow/Red)
  - Stats cards: Total Orders, Deliveries, Returns
  - Courier breakdown table
- Clean, modern SaaS-style UI with light theme

**New Component: `src/components/courier-check/CourierCheckPlans.tsx`**
- Single plan card: Yearly - 899 tk
- Features list: Unlimited checks, WooCommerce plugin, Real-time data, etc.

**New Component: `src/components/courier-check/CourierCheckPurchaseModal.tsx`**
- Same payment flow pattern as existing `SubscriptionPurchaseModal`
- Website domain + sender number + screenshot upload
- Creates entry in `courier_check_orders`

### 4. Admin Dashboard Integration

**`FraudGuardManagement.tsx` - New sub-tab:**
- Add "Courier Check" tab alongside existing Overview/Merchants/Logs/Subscriptions
- Shows pending Courier Check subscription orders
- Approve/Reject functionality
- When approved: activates `courier_check_subscriptions` record

### 5. WordPress Plugin Generator

**New function: `src/utils/courierCheckPluginGenerator.ts`**
- Generates "WCBD Courier Check" plugin ZIP
- Plugin name: `wcbd-courier-check`
- Adds "Check Courier Ratio" button in WooCommerce order list
- AJAX popup that calls the `scrape-courier-check` edge function
- Shows results in a modal with:
  - Circular progress bar
  - Courier breakdown chart
  - Trust label
- Single order view: meta box with courier analytics
- License validation against `scrape-courier-check` endpoint

### 6. Routing

**`App.tsx`** - No new route needed since Courier Check lives inside Client Dashboard tabs

## Technical Details

### Scraping Logic (Edge Function)

```text
POST https://elitemart.com.bd/fraud-check
Content-Type: application/x-www-form-urlencoded
Body: phone=01XXXXXXXXX

Parse HTML response:
- Success Rate: #deliveryProgress[data-percentage]
- Stats: .grid .font-bold elements (3 values: orders, deliveries, returns)
- Courier Table: .courier_table tbody tr (each row: courier name, orders, delivered, returned, rate)
- Risk Container: #risk-container text content
```

### API Response Format

```text
{
  success: true,
  data: {
    phone: "01XXXXXXXXX",
    success_rate: 75,
    total_orders: 10,
    total_delivered: 7,
    total_returned: 3,
    risk_label: "trusted" | "moderate" | "risky" | "new_customer",
    risk_message: "...",
    couriers: [
      { name: "Steadfast", orders: 5, delivered: 4, returned: 1, rate: 80 },
      { name: "Pathao", orders: 3, delivered: 2, returned: 1, rate: 67 }
    ]
  }
}
```

### Subscription Model

| Feature | Details |
|---------|---------|
| Plan | 1 Year Only |
| Price | 899 tk |
| Max Requests | 5,000/year |
| Plugin Access | Upon purchase |
| License | Domain-locked |
| Activation | Manual admin approval |

### Files to Create

| File | Description |
|------|-------------|
| `supabase/functions/scrape-courier-check/index.ts` | Scraping Edge Function |
| `src/components/courier-check/CourierCheckSection.tsx` | Main section component |
| `src/components/courier-check/CourierCheckerDashboard.tsx` | Results dashboard |
| `src/components/courier-check/CourierCheckPlans.tsx` | Plan card |
| `src/components/courier-check/CourierCheckPurchaseModal.tsx` | Payment modal |
| `src/components/admin/CourierCheckSubscriptionManagement.tsx` | Admin approval UI |
| `src/utils/courierCheckPluginGenerator.ts` | WP plugin generator |
| `src/hooks/useCourierCheckData.ts` | Subscription data hook |
| `src/config/courierCheckPluginConfig.ts` | Plugin config |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ClientDashboard.tsx` | Add "couriercheck" tab, import section |
| `src/components/client/DashboardSidebar.tsx` | Add Courier Check menu item |
| `src/components/client/MobileBottomNav.tsx` | Add Courier Check tab (may need to reorganize for 6 tabs) |
| `src/components/admin/FraudGuardManagement.tsx` | Add Courier Check sub-tab |
| `supabase/config.toml` | Register new edge function |

### Mobile Navigation Consideration

Currently 5 tabs in mobile bottom nav. Adding a 6th tab will require either:
- Grouping Fraud Guard and Courier Check under a "Tools" tab with sub-navigation
- Or using a "More" overflow menu

The plan is to add Courier Check as a separate sidebar item on desktop, and on mobile replace the bottom nav to use a scrollable tab bar or group Guard + Courier Check under a single "Tools" icon.

### Important Notes

- elitemart.com.bd is a third-party site - scraper may break if they change their HTML structure
- Edge function includes robust error handling for scrape failures
- Rate limiting in the edge function to avoid overloading elitemart servers
- Plugin is domain-locked similar to Fraud Guard plugin
- Subscription is separate from Fraud Guard - user can have both independently
