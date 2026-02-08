

# Incomplete Order System - CheckoutGuard Style Fresh Build

## কি করা হবে
স্ক্রিনশটে দেখানো CheckoutGuard ডিজাইন হুবহু follow করে Incomplete Order system নতুন করে build হবে। পুরনো system (Hot/Warm/Cold badges, WhatsApp pre-filled messages ইত্যাদি) সম্পূর্ণ remove।

## ডিজাইন (Screenshot অনুযায়ী)

### Stats Cards (4টা)
- **Incomplete Carts (Last 24h)** - সংখ্যা
- **Value of Carts (Last 24h)** - টাকার পরিমাণ (৳)
- **Total Incomplete Carts** - মোট সংখ্যা
- **Need More Features?** - "Upgrade to Pro" বাটন (Dashboard link)

### Table Design
| CUSTOMER | CONTACT | CART | LAST ACTIVE | ACTIONS |
|----------|---------|------|-------------|---------|
| Avatar icon + Name | Phone icon + Number | Price + Items list | "1 day ago" | Details + Cancel |

### Details Modal (Details বাটনে ক্লিক করলে)
Screenshot অনুযায়ী popup/modal দেখাবে:
- **Customer Information** section: Name, Email, Phone
- **Cart Details** section: Cart Value, Product items list
- **Checkout Information** section: Address, Cart Value, Captured on date

### Cancel Button
Cancel ক্লিক করলে record delete হবে

## Technical Changes

### File 1: `src/utils/pluginGenerator.ts`

**WordPress Admin CSS (get_admin_css) - Incomplete Order Section:**
- পুরনো Hot/Warm/Cold badge CSS remove
- CheckoutGuard স্টাইলের CSS add:
  - Stats cards: White background, thin border, simple text
  - Table: Clean white table, gray header, simple borders
  - Avatar circle placeholder (gray circle with user icon)
  - Details modal: White background popup with sections
  - Cancel button: bordered red/outline style
  - Details button: bordered blue/outline style
  - "Search checkouts..." input with magnifier icon
  - "Search functionality is coming soon" notice text

**WordPress Admin JS (renderIncompleteOrders) - Complete Rewrite:**
- Stats cards: Last 24h count, Last 24h value, Total count, Upgrade card
- Table: Avatar + Name | Phone icon + Number | Cart value + items | Time ago | Details + Cancel buttons
- Details button: Opens inline popup/modal showing full checkout info (Name, Email, Phone, Cart Value, Items, Address, Captured date)
- Cancel button: Deletes the record
- Remove all Hot/Warm/Cold logic
- Remove WhatsApp pre-filled message buttons from table
- Remove Call buttons from table
- Keep Convert, Cleanup, Clean All functionality

**Frontend Tracker (setupIncompleteTracking) - No changes:**
- 800ms debounce stays
- Email tracking stays
- Phone, Name, Email, Address capture stays

### File 2: `src/components/fraud-protection/IncompleteOrders.tsx`

**React Dashboard - Complete Rewrite matching CheckoutGuard:**
- Stats cards: "Incomplete Carts (Last 24h)", "Value of Carts (Last 24h)", "Total Incomplete Carts", "Need More Features?"
- Table: CUSTOMER (avatar + name) | CONTACT (phone icon + number) | CART (value + items) | LAST ACTIVE | ACTIONS (Details + Cancel)
- Details modal: Popup showing Customer Information, Cart Details, Checkout Information
- Remove Hot/Warm/Cold badges
- Remove WhatsApp/Call buttons from table
- Remove row dimming/opacity logic
- Keep Convert modal functionality
- Keep search, filter, refresh, cleanup functionality
- Clean white/gray design

### File 3: `src/config/pluginConfig.ts`
- Version bump if needed
- Update whatsNew to reflect new CheckoutGuard style

## যা পরিবর্তন হবে না (Touch করব না)
- Settings tab (API Connection, Popup Settings, Contact Settings)
- Cooldown tab (preset buttons, custom input)
- Fraud Blocker (popup, server-side validation, block checkout)
- Frontend tracker logic (800ms debounce, email tracking)
- Edge Functions (log-checkout-attempt, get-incomplete-orders, check-order-eligibility)
- Database schema
- ConvertToOrderModal.tsx
- Server-side PHP validation
- Courier Check plugin

## Files Summary

| File | Action |
|------|--------|
| `src/utils/pluginGenerator.ts` | Incomplete Orders CSS + JS rewrite (CheckoutGuard style) |
| `src/components/fraud-protection/IncompleteOrders.tsx` | Complete rewrite (CheckoutGuard style) |
| `src/config/pluginConfig.ts` | Minor update |

