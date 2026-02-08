

# Incomplete Order System - CheckoutGuard Style Rebuild

## সমস্যা
বর্তমান Incomplete Order system এ Hot/Warm/Cold badges, WhatsApp/Call buttons, row dimming ইত্যাদি আছে যা কাজ করে না ঠিকমতো। স্ক্রিনশটে দেখানো CheckoutGuard ডিজাইনে পুরোটা নতুন করে build হবে।

## কি পরিবর্তন হবে

### 1. React Dashboard (IncompleteOrders.tsx) - Complete Rewrite

**Remove হবে:**
- `getOrderStatus()` function (Hot/Warm/Cold logic)
- `getWhatsAppUrl()` function
- `getStatusBadge()` function
- WhatsApp buttons, Call buttons from table and mobile cards
- Row dimming/opacity logic
- Old stats cards (Incomplete, Converted, Potential Revenue, Today)

**নতুন Stats Cards (স্ক্রিনশট অনুযায়ী):**
- "Incomplete Carts (Last 24h)" - গত 24 ঘন্টার count
- "Value of Carts (Last 24h)" - গত 24 ঘন্টার cart value (৳)
- "Total Incomplete Carts" - মোট সংখ্যা
- "Need More Features?" - "Upgrade" card with dashboard link

**নতুন Table:**
| CUSTOMER | CONTACT | CART | LAST ACTIVE | ACTIONS |
|----------|---------|------|-------------|---------|
| Gray avatar circle + Name | Phone icon + Number | ৳Price + item count | "1 day ago" | Details + Cancel |

**নতুন Details Modal:**
- "Details" button click করলে Dialog open হবে
- 3 sections: Customer Information (Name, Email, Phone), Cart Details (Value + Items), Checkout Information (Address, Captured date)

**Cancel button:** Record delete করবে

**যা থাকবে:**
- Convert modal (ConvertToOrderModal)
- Search, Filter, Refresh, Cleanup functionality
- Realtime subscription
- fetchOrders logic

### 2. WordPress Admin Plugin (pluginGenerator.ts) - Only Incomplete Section

**CSS (get_admin_css) পরিবর্তন:**
- Remove: `.status-badge.hot`, `.warm`, `.cold`, `.cold-row`, `.hot-row`, `.phone-actions` CSS
- Add: Avatar circle CSS, Details modal/popup CSS, Details button + Cancel button styles

**JS (renderIncompleteOrders) - Complete Rewrite:**
- Stats cards: Last 24h count, Last 24h value, Total count, Upgrade card
- Table: Avatar + Name | Phone icon + Number | Cart value + items | Time ago | Details + Cancel
- Details button: Inline overlay popup with Customer Info, Cart Details, Checkout Info sections
- Cancel button: Delete record via AJAX
- Remove: Hot/Warm/Cold logic, WhatsApp buttons, Call buttons, row classes

**Touch হবে না:**
- `setupIncompleteTracking` function (800ms debounce, email tracking)
- `loadIncompleteOrders` function
- Convert order AJAX handler
- Cleanup/Clean All handlers
- Settings tab, Cooldown tab, Fraud Blocker, Popup CSS
- PHP server-side validation code

### 3. Config Update (pluginConfig.ts)
- Version: 9.2.0
- whatsNew list update - CheckoutGuard style UI
- Features list থেকে Hot/Warm/Cold, WhatsApp Cart Recovery remove

## Files Summary

| File | Action |
|------|--------|
| `src/components/fraud-protection/IncompleteOrders.tsx` | Complete rewrite - CheckoutGuard style UI with Details modal |
| `src/utils/pluginGenerator.ts` | Only `get_admin_css` incomplete section + `renderIncompleteOrders` JS rewrite |
| `src/config/pluginConfig.ts` | Version 9.2.0, feature list update |

## যা পরিবর্তন হবে না
- Settings tab (API Connection, Popup Settings, Contact Settings)
- Cooldown tab
- Fraud Blocker (popup, server-side validation)
- Frontend tracker logic (setupIncompleteTracking - 800ms debounce, email)
- Edge Functions
- Database schema
- ConvertToOrderModal.tsx
- Courier Check plugin

