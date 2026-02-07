

# Rebuild Incomplete Order System - Complete Overhaul

## Summary
The current incomplete order tracking system has fundamental issues: it captures too many false positives (phone_blur, page_exit triggers), doesn't auto-cleanup when orders complete, and lacks proper analytics. This plan removes the existing system entirely and rebuilds it from scratch with proper AJAX field tracking, auto-cleanup on Thank You page, WooCommerce order conversion, Bangladeshi phone validation, auto-retention cleanup, and a visual analytics dashboard with Chart.js.

---

## What Gets Removed

### Plugin JS (in `pluginGenerator.ts`)
- `setupIncompleteTracking()` function (phone_blur, page_exit, beforeunload listeners)
- `logIncompleteAttempt()` function
- `getCartItems()` function
- `getCartTotal()` function
- References to `incompleteEndpoint` and `incompleteLogged`

### Plugin PHP (in `pluginGenerator.ts`)
- Current `ajax_get_incomplete_orders()` method
- Current `ajax_convert_order()` method
- Current incomplete orders tab in WordPress admin

### Dashboard Components
- `src/components/fraud-protection/IncompleteOrders.tsx` - rewritten
- `src/components/fraud-protection/ConvertToOrderModal.tsx` - rewritten

### Edge Functions
- `supabase/functions/log-checkout-attempt/index.ts` - rewritten
- `supabase/functions/get-incomplete-orders/index.ts` - rewritten

---

## What Gets Built (New)

### 1. Plugin Frontend JS - AJAX Field Tracking

Instead of capturing on phone_blur/page_exit, the new system uses AJAX to track Name, Phone, and Address as the user types on the checkout page:

- **Debounced AJAX Tracking**: On every field change (debounced 2 seconds), sends Name + Phone + Address + Cart Data to the backend
- **Bangladeshi Phone Validation**: Only captures if phone starts with `01` and is exactly 11 digits
- **Auto-Cleanup on Thank You**: When the customer reaches the WooCommerce Thank You page (`/order-received/`), the plugin sends a `completed` action to automatically remove/mark the record as completed
- **No more false triggers**: No phone_blur, page_exit, or validation_error triggers

### 2. Plugin WordPress Admin - Professional Dashboard

**Stats Cards (Top)**:
- Total Incomplete Orders
- Total Converted Orders
- Potential Revenue (sum of cart totals)
- Today's Incomplete Count

**Chart.js Bar Chart**:
- Daily count of incomplete orders for last 7/30 days (toggle)
- Loaded via CDN: `https://cdn.jsdelivr.net/npm/chart.js`

**Professional Admin Table**:
- Customer Name
- Phone (clickable - call + WhatsApp buttons)
- Product Info (Name + Image thumbnail from WooCommerce)
- Total Price
- Date/Time
- Status badge (New / Converted)
- Convert button (creates WooCommerce order with status `pending-payment`)

**Retention Settings**:
- Auto-delete records older than X days (7, 15, 30 - configurable)
- Uses WP-Cron for scheduled cleanup

### 3. Edge Function Rebuild

**`log-checkout-attempt`** - Rewritten to handle:
- `action: 'update'` - Upsert incomplete record (merge by phone + merchant_id)
- `action: 'completed'` - Delete/cleanup record when order completes
- BD phone validation on server-side too
- Address field storage (new `address` column in `incomplete_orders`)

**`get-incomplete-orders`** - Enhanced to return:
- Daily aggregation data for charts (last 30 days)
- Potential revenue calculation
- Converted count

### 4. Dashboard Component Rebuild

**`IncompleteOrders.tsx`** - Completely rewritten with:
- Stats cards showing Total, Converted, Potential Revenue, Today
- Recharts-based bar chart for daily trends (7/30 day toggle)
- Professional table with product images, clickable phones
- Retention period setting UI
- Real-time updates via Supabase channel

**`ConvertToOrderModal.tsx`** - Updated to:
- Pre-fill Name, Phone, Address from captured data
- Create order with status `pending` (matching WooCommerce `pending-payment`)
- Remove duplicate prevention logic

---

## Technical Details

### Database Changes

Add new column to `incomplete_orders` table:
```sql
ALTER TABLE incomplete_orders ADD COLUMN IF NOT EXISTS address text;
```

The existing columns (`phone_number`, `customer_name`, `cart_total`, `cart_items`, `is_converted`, `is_suspicious`, `created_at`) remain and are reused.

### Plugin JS Flow (New)

```text
Checkout Page Load
       |
       v
Detect checkout fields (billing_first_name, billing_phone, billing_address_1)
       |
       v
Attach 'input' listeners with 2s debounce
       |
       v
On field change:
  - Validate phone: /^01[0-9]{9}$/ (BD format)
  - If valid -> AJAX POST to log-checkout-attempt with action:'update'
  - Sends: name, phone, address, cart_items, cart_total
       |
       v
On Thank You page detected (/order-received/ in URL):
  - Read phone from order details
  - AJAX POST to log-checkout-attempt with action:'completed'
  - Backend deletes/marks the record as completed
```

### Plugin Admin Panel (WordPress)

```text
+---------------------------------------------+
|  Stats Cards                                |
| [Total: 24] [Converted: 5] [Revenue: 45K]  |
| [Today: 3]                                  |
+---------------------------------------------+
|  Chart (Bar) - Last 7 Days / 30 Days        |
|  ████ ██ ████████ ███ █ ████ ██████         |
+---------------------------------------------+
|  Settings: Auto-delete after [7] days       |
+---------------------------------------------+
|  Table                                      |
|  Name | Phone | Products | Price | Time | ⚡ |
|  ------------------------------------------ |
|  রহিম | 01712.. | Product A (img) | ৳500 |  |
|       | [WhatsApp] [Call]  |       |     |🔄 |
+---------------------------------------------+
```

### WP-Cron for Auto-Cleanup

The plugin will register a daily WP-Cron event to call the edge function with `action: 'cleanup'` and the configured retention days. The edge function will delete records older than the threshold.

### Plugin Version

Update from `8.0.0` to `9.0.0` in `pluginConfig.ts` to reflect this major rebuild.

---

## Files to Modify

1. **`src/utils/pluginGenerator.ts`** - Major rewrite of:
   - Frontend JS: Remove old tracking, add AJAX field tracking + Thank You cleanup
   - Admin JS: Add Chart.js integration, new table rendering, retention settings
   - Admin CSS: Styles for chart container, new table layout
   - PHP: New AJAX handlers, WP-Cron registration, auto-cleanup endpoint, convert logic update

2. **`src/config/pluginConfig.ts`** - Version bump to 9.0.0, update features list

3. **`supabase/functions/log-checkout-attempt/index.ts`** - Rewrite for upsert + completed + cleanup actions

4. **`supabase/functions/get-incomplete-orders/index.ts`** - Add daily aggregation data + potential revenue

5. **`src/components/fraud-protection/IncompleteOrders.tsx`** - Complete rewrite with charts + professional table

6. **`src/components/fraud-protection/ConvertToOrderModal.tsx`** - Update for address field + new flow

7. **`src/pages/FraudProtectionPage.tsx`** - Minor: update incomplete tab props

8. **Database migration** - Add `address` column to `incomplete_orders` table

