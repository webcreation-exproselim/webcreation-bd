

# 🎯 Client Dashboard উন্নতি ও Real-time Notification System Plan

## সমস্যা বিশ্লেষণ

### ১. Logged-in User Redirection সমস্যা
- বর্তমানে: যারা logged in, তারা homepage (`/`) ভিজিট করলে login/signup button দেখায়
- সমাধান: Header এ auth state চেক করে logged-in users এর জন্য "Dashboard" button দেখানো

### ২. Real-time Notification System
- নতুন Order, Invoice বা Message আসলে sound সহ notification
- Browser notification + In-app notification bell
- Notification badge count

### ৩. Dashboard UI/UX সমস্যা
- কিছু জায়গায় text color low contrast
- Button colors সমস্যা
- Mobile এ কিছু element ঠিকমতো দেখায় না

---

## বাস্তবায়ন পরিকল্পনা

### ধাপ ১: Header Auth State Integration
**ফাইল:** `src/components/Header.tsx`

- Supabase auth state listener যোগ করা
- Logged-in users এর জন্য UI পরিবর্তন:
  - "লগইন" + "সাইন আপ" buttons → "ড্যাশবোর্ড" button
  - User avatar দেখানো

```text
┌─────────────────────────────────────────────────────────────┐
│ LOGO    হোম  সার্ভিস  Portfolio        [Avatar] [Dashboard] │
│                                        (logged in user)     │
└─────────────────────────────────────────────────────────────┘
```

### ধাপ ২: Real-time Notification System তৈরি

**নতুন ফাইল:** `src/hooks/useNotifications.ts`
- Supabase realtime subscription
- Browser Notification API integration
- Sound playback functionality
- Notification state management

**নতুন ফাইল:** `src/components/client/NotificationBell.tsx`
- Animated notification icon
- Dropdown notification list
- Unread count badge
- Mark as read functionality

**নতুন ফাইল:** `public/sounds/notification.mp3`
- Notification sound file

### ধাপ ৩: Dashboard UI/UX উন্নতি

**ফাইল পরিবর্তন:**

| ফাইল | সমস্যা | সমাধান |
|------|--------|--------|
| `DashboardSidebar.tsx` | Collapsed state এ tooltip দেখা কঠিন | Tooltip styling improve |
| `DashboardTopBar.tsx` | Search input placeholder color | Contrast বাড়ানো |
| `DashboardStatsCards.tsx` | "+12%" static text | Dynamic data বা remove |
| `OrdersTab.tsx` | Mobile এ card spacing | Responsive padding |
| `InvoicesTab.tsx` | Status badge contrast | Better color scheme |
| `MobileBottomNav.tsx` | Active tab highlight | Clearer active state |

### ধাপ ৪: Notification Database Table

নতুন `notifications` table তৈরি:
- `id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`
- RLS policy: শুধু নিজের notification দেখতে পারবে

---

## Technical Details

### Notification Sound System
```text
User Dashboard → Supabase Realtime Listener
                         ↓
                 New Order/Invoice/Message
                         ↓
         ┌───────────────┴───────────────┐
         ↓                               ↓
  Browser Notification              In-app Toast
  (with sound)                     (with badge update)
```

### Auth State Flow
```text
User visits / → Check Auth State
                    ↓
         ┌─────────┴─────────┐
         ↓                   ↓
    Logged Out           Logged In
         ↓                   ↓
    Show Login/         Show Dashboard
    Signup buttons      button + Avatar
```

---

## UI Color Fixes

### Text Contrast Improvements
- `text-gray-400` → `text-gray-600` (important labels)
- Search placeholder: `placeholder:text-gray-500`
- Badge texts: Higher contrast colors

### Button Styling
- Consistent gradient usage
- Better hover states
- Clearer disabled states

---

## ফাইল তালিকা

| ফাইল | পরিবর্তন |
|------|---------|
| `src/components/Header.tsx` | Auth state integration |
| `src/hooks/useNotifications.ts` | নতুন - Notification hook |
| `src/components/client/NotificationBell.tsx` | নতুন - Notification UI |
| `src/pages/ClientDashboard.tsx` | Notification integration |
| `src/components/client/DashboardTopBar.tsx` | NotificationBell যোগ + UI fix |
| `src/components/client/DashboardSidebar.tsx` | Tooltip + color fix |
| `src/components/client/DashboardStatsCards.tsx` | Static data remove |
| `src/components/client/OrdersTab.tsx` | Mobile padding fix |
| `src/components/client/InvoicesTab.tsx` | Status badge contrast |
| `src/components/client/MobileBottomNav.tsx` | Active state clarity |
| `src/components/client/DashboardHeader.tsx` | Mobile notification bell |

---

## Database Migration

```sql
-- notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'order', 'invoice', 'message'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Realtime enabled
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

