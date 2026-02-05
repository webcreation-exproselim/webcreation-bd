
# Cooldown Period Timer - Dashboard Banner Integration Plan

## সমস্যা বিশ্লেষণ

বর্তমানে **Cooldown Period Timer** (যেটা দিয়ে সেট করা যায় একজন customer কতক্ষণ পর আবার order করতে পারবে) শুধুমাত্র **Settings tab-এর ভেতরে** আছে। আপনি চাচ্ছেন এটা **Dashboard-এর main page-এ** সরাসরি দেখাক এবং সেখান থেকেই সহজে control করা যাক।

```text
বর্তমান অবস্থা:
┌─────────────────────────────────────────────────────────┐
│  Dashboard Main Page                                     │
│  ├── FraudGuardQuickStatus Banner                        │
│  │   ├── Plan Status (Active/Inactive)                   │
│  │   ├── API Usage                                       │
│  │   ├── Plugin Download                                 │
│  │   └── ❌ Cooldown Timer নেই                           │
│  │                                                       │
│  └── Fraud Guard Tab → Settings → Cooldown Timer ✓      │
│      (অনেক ভেতরে!)                                       │
└─────────────────────────────────────────────────────────┘

নতুন অবস্থা:
┌─────────────────────────────────────────────────────────┐
│  Dashboard Main Page                                     │
│  ├── FraudGuardQuickStatus Banner                        │
│  │   ├── Plan Status (Active/Inactive)                   │
│  │   ├── API Usage                                       │
│  │   ├── ⏱️ Cooldown: 5m [Quick Edit] ← নতুন!           │
│  │   ├── Plugin Download                                 │
│  │   └── Settings                                        │
└─────────────────────────────────────────────────────────┘
```

---

## সমাধান

Dashboard-এর `FraudGuardQuickStatus` banner-এ একটি **compact Cooldown Timer widget** যোগ করা হবে যেখানে:

1. **বর্তমান Cooldown সময় দেখাবে** (যেমন: "⏱️ 5 মিনিট")
2. **Quick Edit বাটন** থাকবে যেটা একটি popup/dropdown খুলবে
3. **Popup-এ Quick Select Presets** থাকবে (5m, 30m, 1h, 6h, 1d, 7d, 30d)
4. **Custom minutes input** option থাকবে
5. **One-click update** করা যাবে

---

## নতুন UI ডিজাইন

Active Subscription Banner-এ নতুন Cooldown Section:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  🛡️ Fraud Guard সক্রিয়    [Yearly]     [15 দিন বাকি]                       │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ API Usage: 150/5,000                                  মেয়াদ: ১৫/০৩/২৬│  │
│  │ ████████████████░░░░░░░░░░░░░  3%                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌────────────────────────────────────────┐                                │
│  │ ⏱️ Cooldown: 5 মিনিট      [পরিবর্তন]  │  ← নতুন সেকশন!                  │
│  └────────────────────────────────────────┘                                │
│                                                                             │
│  [📥 Plugin v3.3]  [⚙️ Settings]                                           │
└────────────────────────────────────────────────────────────────────────────┘
```

**"পরিবর্তন" বাটনে ক্লিক করলে Popup:**

```text
┌─────────────────────────────────────────────┐
│  ⏱️ Cooldown পরিবর্তন করুন                  │
│                                             │
│  Quick Select:                              │
│  [5m] [30m] [1h] [6h] [1d] [7d] [30d]       │
│                                             │
│  অথবা কাস্টম:                               │
│  [ 5       ] minutes  = 5 মিনিট             │
│                                             │
│  [       সেভ করুন       ]                   │
└─────────────────────────────────────────────┘
```

---

## টেকনিক্যাল পরিবর্তন

### ফাইল ১: `src/components/client/FraudGuardQuickStatus.tsx`

**নতুন Props যোগ করা:**
```typescript
interface FraudGuardQuickStatusProps {
  merchant: {
    // ... existing fields
    cooldown_period_minutes: number;  // নতুন
  } | null;
  onUpdateCooldownMinutes?: (minutes: number) => void;  // নতুন
  // ... existing props
}
```

**নতুন State ও UI যোগ করা:**
- `showCooldownEditor` state for popup visibility
- `tempCooldownMinutes` state for editing
- Cooldown display badge in active subscription section
- Quick Edit popup with presets and custom input
- formatMinutes helper function

### ফাইল ২: `src/pages/ClientDashboard.tsx`

**Props আপডেট করা:**
```typescript
<FraudGuardQuickStatus
  merchant={merchant}
  pendingOrder={pendingOrder}
  onOpenFraudGuard={() => setActiveTab("fraudguard")}
  onPurchaseSuccess={() => { refetchMerchant(); refetchSubscription(); }}
  onUpdateCooldownMinutes={updateCooldownMinutes}  // নতুন
/>
```

---

## Feature Summary

| Feature | Description |
|---------|-------------|
| **Dashboard-এ দেখানো** | Active plan থাকলে main banner-এ Cooldown time দেখাবে |
| **Quick Edit Popup** | "পরিবর্তন" বাটনে ক্লিক করলে preset options দিয়ে popup আসবে |
| **Preset Buttons** | 5m, 30m, 1h, 6h, 1d, 7d, 30d - one click selection |
| **Custom Input** | নিজের ইচ্ছামতো minutes enter করা যাবে |
| **Instant Update** | Save করলেই database update হবে, toast notification দেখাবে |
| **Bengali Display** | "5 মিনিট", "1 ঘন্টা", "1 দিন" format-এ দেখাবে |
