
# Client Dashboard ও Fraud Guard System Enhancement

## সমস্যা বিশ্লেষণ

আপনি যা চাইছেন:
1. **Plugin আগেই download করা যাবে** - plan কেনার আগেই client plugin টা download করতে পারবে
2. **Setup guide dashboard-এ** - ইন্সটলেশন গাইড client dashboard-এই দেখাবে
3. **API key শুধু plan কেনার পর** - API key locked থাকবে, plan activate হলে unlock হবে
4. **Client Dashboard আরো modern ও সুন্দর** করা

---

## যা পরিবর্তন হবে

### 1. FraudGuardSection.tsx - Complete Redesign

বর্তমান অবস্থা:
- Active merchant: Analytics + Quick buttons দেখায়
- Inactive merchant: Subscription status + Plan purchase modal

নতুন অবস্থা:
- **সবার জন্য**: Plugin download ও Setup guide সবসময় দেখাবে
- **API key**: Plan কেনার আগে blur/locked থাকবে, পরে দেখাবে
- **Tabs system**: Overview | Setup Guide | Settings

নতুন ফ্লো:
```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard                                            │
├─────────────────────────────────────────────────────────────────┤
│  [Overview] [Setup Guide] [Settings]                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📦 PLUGIN DOWNLOAD (সবার জন্য available)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ WCBD Fraud Guard Plugin v1.0                                ││
│  │ [Download Plugin ডাউনলোড করুন]                              ││
│  │                                                              ││
│  │ ⚠️ Note: Plugin কাজ করতে Plan কিনতে হবে                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🔑 API KEY                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ (Inactive User)                                             ││
│  │ [🔒 ••••••••-••••-••••-••••-••••••••••••]                   ││
│  │ "Plan কিনুন API Key পেতে"                                   ││
│  │                                                              ││
│  │ (Active User)                                                ││
│  │ [abc12345-xxxx-yyyy-zzzz-123456789abc] [Copy]               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  📚 SETUP GUIDE (Accordion)                                      │
│  - Step 1: Plugin ডাউনলোড করুন                                  │
│  - Step 2: WordPress-এ আপলোড করুন                               │
│  - Step 3: Plugin Activate করুন                                 │
│  - Step 4: API Key কপি করুন                                     │
│                                                                  │
│  📊 ANALYTICS (শুধু Active users)                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Charts, Stats, Logs                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Client Dashboard Light Theme Enhancement

সম্পূর্ণ modern ও clean design:
- Soft shadows ও rounded corners
- Better spacing ও typography
- Smooth animations
- Mobile-optimized cards
- Improved tab navigation

---

## নতুন Components

### Component 1: FraudGuardDashboard.tsx (Main Component)

```typescript
// Tabs: Overview | Setup Guide | Settings
// - Overview: Status card + Quick stats + Purchase CTA (if inactive)
// - Setup Guide: Plugin download + Installation steps + API key
// - Settings: Cooldown, Blacklist (only if active)
```

### Component 2: SetupGuide.tsx

```typescript
// Features:
// 1. Plugin download button (সবার জন্য)
// 2. Step-by-step accordion guide
// 3. API key section (locked/unlocked based on status)
// 4. Copy button for API key
// 5. Integration code preview
```

### Component 3: APIKeySection.tsx

```typescript
interface APIKeySectionProps {
  apiKey: string;
  isActive: boolean;
  onPurchase: () => void;
}

// If isActive:
//   Show API key with copy button
// Else:
//   Show blurred/locked key with "Plan কিনুন" button
```

---

## File Changes

### Modified Files

| File | Changes |
|------|---------|
| `src/components/fraud-protection/FraudGuardSection.tsx` | Complete rewrite with tabs, plugin download for all, locked API key |
| `src/pages/ClientDashboard.tsx` | Enhanced styling, better mobile layout |

### New Files

| File | Purpose |
|------|---------|
| `src/components/fraud-protection/SetupGuide.tsx` | Plugin download + installation guide + API key |
| `src/components/fraud-protection/APIKeySection.tsx` | Locked/unlocked API key display |

---

## Technical Implementation

### API Key Locking Logic

```typescript
// API key from merchant record
const { api_key, is_active } = merchant;

// If not active, show locked state
if (!is_active) {
  return (
    <div className="relative">
      <div className="blur-sm select-none">
        abc12345-xxxx-yyyy-zzzz-••••••••••••
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <Button onClick={onPurchase}>
          <Lock /> Plan কিনুন
        </Button>
      </div>
    </div>
  );
}

// If active, show real key
return (
  <div className="flex items-center gap-2">
    <code>{api_key}</code>
    <Button onClick={copyKey}>
      <Copy />
    </Button>
  </div>
);
```

### Plugin Download (No API Key Required)

```typescript
// Plugin download uses a placeholder API key that doesn't work
// Until user activates their plan

const handlePluginDownload = () => {
  // Download plugin with actual API key if active
  // Or with "YOUR_API_KEY" placeholder if inactive
  const keyToUse = isActive ? apiKey : "YOUR_API_KEY_HERE";
  downloadPluginFile(keyToUse);
  
  if (!isActive) {
    toast({
      title: "⚠️ Plugin ডাউনলোড হয়েছে",
      description: "Plugin কাজ করতে Plan কিনে API Key সেট করুন",
    });
  }
};
```

---

## UI/UX Improvements

### Client Dashboard Stats Cards (Enhanced)

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Dashboard Stats                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ 📦 3         │  │ 📄 2         │  │ 🛡️ Active    │          │
│  │ মোট অর্ডার   │  │ মোট ইনভয়েস   │  │ Fraud Guard  │          │
│  │              │  │              │  │ ৳699/বছর     │          │
│  │ ↗️ +1 এই মাসে│  │ ৳5,000 বাকি  │  │ 245 checks   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Fraud Guard Tab - New Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard                                            │
│  আপনার WooCommerce স্টোর সুরক্ষিত করুন                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📊 Status Card                                             │  │
│  │ ┌─────────────┬─────────────┬─────────────┐               │  │
│  │ │ Plan        │ API Usage   │ Expires     │               │  │
│  │ │ Yearly ✓    │ 245/15000   │ Mar 5, 2027 │               │  │
│  │ └─────────────┴─────────────┴─────────────┘               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📦 Plugin & Setup                                          │  │
│  │                                                            │  │
│  │ [Download Plugin]  [Copy API Key]  [View Guide]           │  │
│  │                                                            │  │
│  │ 🔑 API Key: abc12345-xxxx-yyyy-zzzz-123456789abc [Copy]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📚 ইন্সটলেশন গাইড                                          │  │
│  │ ▸ Step 1: Plugin ডাউনলোড করুন                             │  │
│  │ ▸ Step 2: WordPress-এ আপলোড করুন                          │  │
│  │ ▸ Step 3: Plugin Activate করুন                            │  │
│  │ ▸ Step 4: API Key সেট করুন (Plugin Settings-এ)            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📊 Analytics (7-day trend)                                      │
│  [Charts show here for active users]                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Plugin Download | শুধু Active users | সবাই |
| API Key | Always visible | Inactive: Locked, Active: Visible |
| Setup Guide | Separate page | Dashboard-এ integrated |
| Analytics | Separate | Dashboard-এ integrated |
| UI Design | Basic | Modern, light-themed |
