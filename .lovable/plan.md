
# Plugin Download Fix ও Client Dashboard Enhancement

## সমস্যা চিহ্নিত

### 1. Plugin Download Issue
বর্তমান code-এ `downloadPluginFile` function:
```javascript
const blob = new Blob([content], { type: 'application/x-php' });
```

এই MIME type কিছু browser-এ সঠিকভাবে কাজ করে না এবং ফাইল `.ook` অথবা অন্য অপ্রত্যাশিত extension-এ download হচ্ছে।

**সমাধান:** MIME type পরিবর্তন করে `text/plain` অথবা `application/octet-stream` ব্যবহার করতে হবে যাতে ফাইল সঠিক `.php` extension-এ download হয়।

### 2. Setup Guide এর Visibility
আপনি চাইছেন client login করলেই বুঝতে পারে যে Plugin আছে এবং Setup Guide সামনে দেখাবে।

**সমাধান:** 
- Client Dashboard-এ একটি প্রোমিনেন্ট "Plugin Banner" যোগ করা হবে
- Stats Cards-এর সাথে Fraud Guard Plugin card দেখাবে
- নতুন users-দের জন্য auto-সিলেক্ট হবে Fraud Guard tab

---

## পরিবর্তনসমূহ

### File 1: `src/utils/pluginGenerator.ts`

**Change:** `downloadPluginFile` function-এ MIME type fix

```typescript
// Before
const blob = new Blob([content], { type: 'application/x-php' });

// After
const blob = new Blob([content], { type: 'application/octet-stream' });
```

এতে browser সঠিকভাবে `.php` file download করবে।

---

### File 2: `src/pages/ClientDashboard.tsx`

**Changes:**

1. **Stats Cards-এ Fraud Guard Plugin Promo Card যোগ:**
   - "🛡️ Fraud Guard Plugin" নামের একটি special card
   - Click করলে সরাসরি Fraud Guard tab-এ নিয়ে যাবে
   - "Free Download" badge দেখাবে

2. **Welcome Section-এ Plugin Notification:**
   - "🆕 নতুন! WCBD Fraud Guard Plugin - এখনই ডাউনলোড করুন" banner
   - Click করলে Setup Guide tab-এ নিয়ে যাবে

---

### File 3: `src/components/fraud-protection/FraudGuardSection.tsx`

**Changes:**

1. **Header Card-এ Plugin Download Button যোগ:**
   - Header card-এ সরাসরি "Plugin Download" button
   - যেন প্রথমেই client দেখতে পায়

2. **Setup Guide tab সবার জন্য Default:**
   - নতুন users (inactive) -দের জন্য default tab হবে "setup" 
   - Active users-দের জন্য default tab হবে "overview"

---

## নতুন UI Design

### Client Dashboard - Fraud Guard Promo Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard Plugin এখন Available!                      │
│                                                                  │
│  আপনার WooCommerce স্টোরকে Fake Order থেকে সুরক্ষিত রাখুন       │
│                                                                  │
│  [🔽 Plugin ডাউনলোড করুন]    [📚 Setup Guide দেখুন]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Stats Cards - নতুন Fraud Guard Card

```
┌──────────────────────────────────────────────────────────────────┐
│ Stats Cards                                                       │
├──────────────┬──────────────┬──────────────┬──────────────────────┤
│ 📦 3         │ 📄 2         │ 💬 5         │ 🛡️ Fraud Guard       │
│ মোট অর্ডার   │ মোট ইনভয়েস   │ মেসেজ        │ Plugin Available!    │
│              │              │              │ [Download Now →]     │
└──────────────┴──────────────┴──────────────┴──────────────────────┘
```

---

## Technical Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `pluginGenerator.ts` | MIME type fix | `.php` ফাইল সঠিকভাবে download |
| `ClientDashboard.tsx` | Plugin promo banner ও card | Plugin visibility বাড়ানো |
| `FraudGuardSection.tsx` | Header-এ download button, Default tab change | Quick access to plugin |
| `SetupGuide.tsx` | Version update v2.0 → v3.0 | Consistency |

---

## Implementation Steps

1. `pluginGenerator.ts` - MIME type fix করা
2. `ClientDashboard.tsx` - Fraud Guard promo banner ও stats card যোগ
3. `FraudGuardSection.tsx` - Header-এ plugin button, default tab logic
4. `SetupGuide.tsx` - Version number update
