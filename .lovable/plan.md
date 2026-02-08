

# Incomplete Order System - Complete Fresh Rebuild

## Problem
Current system uses dark theme (slate-800, dark backgrounds), 2000ms debounce, no email tracking, and mixes old patterns. User provided working reference code that should be the foundation for a completely new build.

## What Gets Completely Rewritten

### 1. Plugin Tracker JS (`setupIncompleteTracking` in pluginGenerator.ts)

| Current (Remove) | New (Fresh) |
|---|---|
| 2000ms debounce | **800ms debounce** |
| Phone, Name, Address only | **Phone, Name, Email, Address** |
| No email field selectors | **Email selectors added** |
| Basic tracking | **IP + Phone session persistence** |

New email selectors:
`#billing_email, input[name="billing_email"], input[autocomplete="email"]`

### 2. WordPress Admin CSS (get_admin_css) - Theme Change

| Current (Remove) | New (Fresh) |
|---|---|
| `background: #1e293b` (dark) | **`background: #ffffff`** (white) |
| `color: #94a3b8` (muted gray) | **`color: #374151`** (dark text) |
| `.stat-card` dark gradients | **White cards with colored left border accent** |
| `.incomplete-table` dark borders | **White table with `#f9fafb` headers, `#e5e7eb` borders** |
| Dark card backgrounds | **Clean white/gray professional SaaS look** |

New CSS additions:
- `.status-badge.hot` - red background (less than 1 hour)
- `.status-badge.warm` - amber background (1-24 hours)
- `.status-badge.cold` - gray background + row opacity 0.6
- Mobile card layout under 768px
- Search input styling

### 3. WordPress Admin JS (renderIncompleteOrders) - Complete Rewrite

New table columns: **Customer | Contact | Cart Value | Last Seen | Status | Actions**

Time-based status logic:
- Less than 1 hour = **Hot** (red badge, subtle highlight)
- 1-24 hours = **Warm** (amber badge)
- More than 24 hours = **Cold** (gray badge, entire row dimmed to 0.6 opacity)

WhatsApp button with pre-filled message:
```text
"Hello [Name], apnar cart e kicu products royeche. 
Cart value: [Total] taka. 
Order complete korte chaile amader janaben."
```
URL format: `wa.me/[phone]?text=[encoded message]`

Direct call button: `tel:[phone]`

### 4. React Dashboard Component (IncompleteOrders.tsx) - Complete Rewrite

Remove ALL dark theme classes:
- `bg-slate-800/50`, `bg-slate-700/30`, `border-slate-700`, `text-slate-400` etc.

Replace with clean white/gray:
- Stats cards: **white background** with colored icon accent (not dark gradients)
- Table: **white background**, `hover:bg-gray-50`, `border-gray-200`
- Hot/Warm/Cold badges matching the WordPress admin
- Row dimming for Cold (24+ hours) entries
- WhatsApp button with same pre-filled cart recovery message
- Call button with `tel:` link
- Mobile cards also use white/gray theme

### 5. Config Update (pluginConfig.ts)

- Version: **9.1.0**
- Debounce description: "800ms debounce" (was "2s debounce")
- Add email tracking to whatsNew list
- Add "800ms Real-time Tracking" to features

## Technical Details

### Debounce Implementation (Plugin JS)
```text
// Change this line in setupIncompleteTracking:
trackTimer=setTimeout(trackFields, 800);  // was 2000
```

### Email Field Tracking (Plugin JS)
```text
// Add new selector variable:
var emailSelector = '#billing_email,input[name="billing_email"],input[autocomplete="email"]';

// Add to event listener:
jQ(document).on('input', phoneSelector+','+nameSelector+','+addressSelector+','+emailSelector, function(){
  clearTimeout(trackTimer);
  trackTimer=setTimeout(trackFields, 800);
});

// In trackFields(), capture email:
var email = getFieldValue(emailSelector);
// Send in AJAX payload
```

### Cold Checkout Row Dimming (WordPress Admin JS)
```text
// Calculate time difference for each order:
var createdDate = new Date(o.created_at);
var nowDate = new Date();
var diffHours = (nowDate - createdDate) / (1000 * 60 * 60);

var rowStyle = '';
var statusHtml = '';
if (diffHours > 24) {
  rowStyle = 'opacity:0.6;background:#f9fafb';
  statusHtml = '<span class="status-badge cold">Cold</span>';
} else if (diffHours > 1) {
  statusHtml = '<span class="status-badge warm">Warm</span>';
} else {
  statusHtml = '<span class="status-badge hot">Hot</span>';
}
```

### WhatsApp Pre-filled Message (Both WordPress + React)
```text
var message = 'Hello ' + (name || 'Customer') + 
  ', apnar cart e kicu products royeche. Cart value: ৳' + 
  (cartTotal || 0) + '. Order complete korte chaile amader janaben.';
var waUrl = 'https://wa.me/' + waNum + '?text=' + encodeURIComponent(message);
```

### React Stats Cards (New White Theme)
```text
// Instead of: bg-gradient-to-br from-cyan-900/40 to-cyan-800/20
// Use: bg-white border border-gray-200 shadow-sm

// Icon accent colors remain for visual distinction:
// Incomplete: blue icon
// Converted: green icon  
// Revenue: amber icon
// Today: purple icon
```

## Files Modified

| File | What Changes |
|---|---|
| `src/utils/pluginGenerator.ts` | setupIncompleteTracking (800ms, email), get_admin_css (white theme), renderIncompleteOrders (cold/warm/hot, WhatsApp message, call button) |
| `src/components/fraud-protection/IncompleteOrders.tsx` | Complete rewrite - white/gray SaaS theme, cold checkout dimming, WhatsApp pre-filled, call button |
| `src/config/pluginConfig.ts` | Version 9.1.0, updated features and whatsNew |

## Files NOT Changed
- Edge Functions (log-checkout-attempt, get-incomplete-orders) - backend is fine
- Database schema - no changes needed
- ConvertToOrderModal.tsx - convert system stays
- Courier Check plugin - not touched
- Fraud Guard core logic (cooldown, blacklist, popup) - not touched
- Server-side PHP validation - not touched

