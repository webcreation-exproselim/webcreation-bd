
# WCBD Fraud Guard - Enhanced System with Charts & Admin Controls

## Overview

এই plan-এ নিম্নলিখিত features implement করা হবে:

1. **Client Dashboard ও Admin Dashboard-এ সুন্দর Charts ও Graphs** যোগ করা
2. **Admin-এর জন্য Manual Control System** - যেকোনো client-কে plan assign/activate/deactivate করা
3. **Admin-এর জন্য API Logs Edit System** - যেকোনো log entry edit/delete করা
4. **Frontend Menu-তে "Fraud Protection" অপশন** যোগ করা
5. **Client Dashboard-এ Fraud Protection অপশন** যা click করলে সকল system ও pricing দেখাবে

---

## 1. Frontend Navigation Updates

### Header Menu-তে নতুন Item যোগ করা

**Current Menu:**
- হোম
- সার্ভিস (dropdown)
- পোর্টফোলিও
- আমাদের সম্পর্কে
- যোগাযোগ

**Updated Menu:**
- হোম
- সার্ভিস (dropdown)
- **Fraud Protection** (নতুন - `/fraud-guard` page-এ link)
- পোর্টফোলিও
- আমাদের সম্পর্কে
- যোগাযোগ

### Files to Update:
- `src/components/Header.tsx` - Desktop navigation
- `src/components/MobileDrawer.tsx` - Mobile navigation

---

## 2. Client Dashboard - Enhanced Fraud Guard Section

### Current Situation:
- `FraudGuardSection` component exists but is minimal
- Shows subscription status only

### Enhanced Features:

**Analytics Cards:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 1,245    │ │ 892      │ │ 245      │ │ 108      │           │
│  │ মোট চেক  │ │ অনুমোদিত │ │ ব্লক     │ │ ব্ল্যাকলিস্ট│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  📊 সাপ্তাহিক চার্ট                                              │
│  [Line chart showing daily checks - allowed vs blocked]          │
│                                                                  │
│  [সেটিংস দেখুন →] [Plugin ডাউনলোড →]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### New Component: `FraudGuardAnalytics.tsx`
- Stats cards: Total checks, Allowed, Blocked (Cooldown), Blocked (Blacklist)
- Line/Area chart: Daily order checks trend (7-day)
- Pie chart: Block reasons distribution
- Quick action buttons

---

## 3. Admin Dashboard - Fraud Guard Tab

### Add New Tab: "Fraud Guard" (Icon: Shield)

**Tab Features:**

#### 3.1 Subscription Management (Enhanced)
```
┌─────────────────────────────────────────────────────────────────┐
│  👥 ALL MERCHANTS                                                │
├─────────────────────────────────────────────────────────────────┤
│  🔍 [Search merchants...]                                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ user@example.com          │ Monthly │ Active    │ [Edit]    ││
│  │ Website: store.com        │ 245/1000│ Exp: Mar 5│ [Deact]   ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ other@email.com           │ None    │ Inactive  │ [Activate]││
│  │ Website: -                │ 0/0     │ -         │ [Assign]  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Admin Actions:**
- **Manual Activate**: Turn on any merchant without payment
- **Manual Assign Plan**: Assign Monthly/Yearly plan to any merchant
- **Deactivate**: Turn off any merchant's access
- **Edit Merchant**: Change cooldown, website URL, API key

#### 3.2 API Logs Management
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 API LOGS (Admin View)                                        │
├─────────────────────────────────────────────────────────────────┤
│  [All Merchants ▼] [Filter by Status ▼] [Date Range]            │
│                                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┬────────────────┐│
│  │ Date     │ Phone    │ IP       │ Status   │ Actions        ││
│  ├──────────┼──────────┼──────────┼──────────┼────────────────┤│
│  │ Feb 4    │ 0171...  │ 103.x.x  │ Allowed  │ [Edit] [Del]   ││
│  │ Feb 4    │ 0181...  │ 192.x.x  │ Blocked  │ [Edit] [Del]   ││
│  └──────────┴──────────┴──────────┴──────────┴────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Log Edit Modal:**
- Edit phone number, IP, device ID
- Change status (allowed/blocked_cooldown/blocked_blacklist)
- Delete log entry

#### 3.3 Charts & Analytics
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 FRAUD GUARD ANALYTICS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐ ┌─────────────────────────┐        │
│  │ 📈 Daily API Requests   │ │ 🥧 Block Reasons        │        │
│  │ [Area Chart]            │ │ [Pie Chart]             │        │
│  │ Allowed vs Blocked      │ │ Cooldown vs Blacklist   │        │
│  └─────────────────────────┘ └─────────────────────────┘        │
│                                                                  │
│  ┌─────────────────────────┐ ┌─────────────────────────┐        │
│  │ 👥 Active Subscribers   │ │ 💰 Subscription Revenue │        │
│  │ [Bar Chart]             │ │ [Line Chart]            │        │
│  │ Monthly vs Yearly       │ │ Monthly trend           │        │
│  └─────────────────────────┘ └─────────────────────────┘        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Changes

### Update RLS Policies for `fraud_logs`

Currently admins can only view logs. Need to add UPDATE and DELETE permissions:

```sql
-- Allow admins to update fraud logs
CREATE POLICY "Admins can update fraud logs"
  ON fraud_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete fraud logs  
CREATE POLICY "Admins can delete fraud logs"
  ON fraud_logs FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## 5. File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/fraud-protection/FraudGuardAnalytics.tsx` | Client-side charts & stats |
| `src/components/admin/FraudGuardManagement.tsx` | Complete admin panel for Fraud Guard |
| `src/components/admin/MerchantManagement.tsx` | Merchant list with manual controls |
| `src/components/admin/FraudLogsAdmin.tsx` | Admin log viewer with edit/delete |
| `src/components/admin/FraudGuardCharts.tsx` | Admin analytics charts |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Add "Fraud Protection" menu item |
| `src/components/MobileDrawer.tsx` | Add "Fraud Protection" to mobile menu |
| `src/pages/AdminDashboard.tsx` | Add "Fraud Guard" tab with full management |
| `src/pages/ClientDashboard.tsx` | Enhance FraudGuardSection with charts |
| `src/components/fraud-protection/FraudGuardSection.tsx` | Add analytics & charts |
| `src/components/admin/FraudSubscriptionManagement.tsx` | Add manual activation controls |

---

## 6. Technical Implementation Details

### 6.1 Charts Library
Using existing **Recharts** library (already installed):
- `AreaChart` - Daily API requests trend
- `PieChart` - Block reasons distribution
- `BarChart` - Subscriber distribution
- `LineChart` - Revenue trend

### 6.2 Admin Manual Controls

**Activate Merchant:**
```typescript
const activateMerchant = async (merchantId: string, planType: 'monthly' | 'yearly') => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (planType === 'yearly' ? 365 : 30));
  
  await supabase.from('merchants').update({
    is_active: true,
    current_plan: planType,
    plan_expires_at: expiresAt.toISOString(),
    max_requests: planType === 'yearly' ? 15000 : 1000,
    requests_used: 0,
  }).eq('id', merchantId);
};
```

**Deactivate Merchant:**
```typescript
const deactivateMerchant = async (merchantId: string) => {
  await supabase.from('merchants').update({
    is_active: false,
    current_plan: null,
    plan_expires_at: null,
  }).eq('id', merchantId);
};
```

### 6.3 Log Edit/Delete

**Edit Log:**
```typescript
const updateLog = async (logId: string, updates: Partial<FraudLog>) => {
  await supabase.from('fraud_logs').update(updates).eq('id', logId);
};
```

**Delete Log:**
```typescript
const deleteLog = async (logId: string) => {
  await supabase.from('fraud_logs').delete().eq('id', logId);
};
```

---

## 7. Implementation Phases

### Phase 1: Database & Policies
- Add RLS policies for fraud_logs UPDATE/DELETE

### Phase 2: Navigation Updates
- Add "Fraud Protection" to Header.tsx
- Add "Fraud Protection" to MobileDrawer.tsx

### Phase 3: Client Dashboard Enhancement
- Create FraudGuardAnalytics component with charts
- Integrate into FraudGuardSection

### Phase 4: Admin Dashboard - Fraud Guard Tab
- Add new "Fraud Guard" tab
- Create MerchantManagement component
- Add manual activate/deactivate/assign functionality
- Create FraudLogsAdmin component with edit/delete
- Create FraudGuardCharts for admin analytics

### Phase 5: Testing & Polish
- Test all admin controls
- Verify charts render correctly
- Ensure mobile responsiveness

---

## Visual Preview

### Client Dashboard - Fraud Guard Section

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ WCBD Fraud Guard - Active                                   │
│  Plan: Yearly | Expires: March 15, 2027                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ 🔍 1,245 │ │ ✅ 892   │ │ ⏱️ 245  │ │ 🚫 108   │           │
│  │ Total    │ │ Allowed  │ │ Cooldown │ │ Blacklist│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
│  📈 সাপ্তাহিক অর্ডার চেক                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │     /\      /\                                              ││
│  │    /  \    /  \    ───── Allowed                            ││
│  │   /    \  /    \   ----- Blocked                            ││
│  │  /      \/      \                                           ││
│  │ Mon Tue Wed Thu Fri Sat Sun                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [⚙️ সেটিংস] [📥 Plugin ডাউনলোড] [📊 বিস্তারিত দেখুন]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Dashboard - Fraud Guard Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  🛡️ FRAUD GUARD MANAGEMENT                                      │
├─────────────────────────────────────────────────────────────────┤
│  [📊 Overview] [👥 Merchants] [📋 Logs] [💳 Subscriptions]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stats Cards:                                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │ 45     │ │ 28     │ │ 12,450 │ │ ৳15,200│                   │
│  │ Total  │ │ Active │ │ API    │ │ Revenue│                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                  │
│  Charts: (2x2 grid)                                              │
│  ┌─────────────────────┐ ┌─────────────────────┐                │
│  │ Daily Requests      │ │ Block Distribution  │                │
│  │ [Area Chart]        │ │ [Pie Chart]         │                │
│  └─────────────────────┘ └─────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
