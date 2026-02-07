
# Admin Dashboard Redesign + Project Timer System

## Overview

This plan covers two major changes to the admin dashboard:

1. **Complete UI Redesign** - Transform the admin panel from a light/white theme to a dark, professional, high-tech dashboard (inspired by the reference screenshot)
2. **Project Timer System** - A live countdown timer connected to both orders and standalone projects, with automatic WhatsApp reminders via API integration

---

## Part 1: Admin Dashboard UI Redesign

### Design Direction (Based on Reference Screenshot)

The new design will feature:
- **Dark background** (slate-900/slate-800 tones) throughout
- **Colorful gradient stat cards** at the top (red, cyan, purple, pink gradients)
- **Left sidebar navigation** instead of horizontal tabs
- **Dark glassmorphic cards** for charts and data sections
- **Cyan, pink, yellow, and green accent colors** for data visualization
- **Professional top header** with search bar, notification icons, and admin profile

### Components to Redesign

| Component | Changes |
|-----------|---------|
| `AdminHeader.tsx` | Dark theme, search bar, notification badges, admin avatar |
| `AdminDashboard.tsx` (layout) | Sidebar + content layout instead of horizontal tabs |
| `StatsCards.tsx` | Colorful gradient cards with dark backgrounds |
| `AnalyticsCharts.tsx` | Dark-themed charts with vibrant neon colors (cyan, pink, yellow) |
| `InvoiceSystem.tsx` | Dark card styling, better table contrast |
| `PaymentSettings.tsx` | Dark theme consistency |
| `ReviewsManagement.tsx` | Dark theme consistency |
| `ContentManagement.tsx` | Dark theme consistency |
| `FraudGuardManagement.tsx` | Already partially dark - unify styling |

### New Layout Structure

```text
+----------------------------------------------------------+
|  HEADER: Logo | Search Bar | Notifications | Admin Name  |
+----------+-----------------------------------------------+
|          |                                               |
| SIDEBAR  |  MAIN CONTENT                                |
|          |                                               |
| Dashboard|  [Gradient Stat Cards Row]                    |
| Orders   |                                               |
| Projects |  [Charts Grid - Dark Cards]                   |
| Users    |  [Donut, Bar, Area, Line Charts]               |
| Invoices |                                               |
| Messages |  [Tab-specific Content]                       |
| Payments |                                               |
| Reviews  |                                               |
| CMS      |                                               |
| Fraud    |                                               |
|          |                                               |
+----------+-----------------------------------------------+
```

### New Component: `AdminSidebar.tsx`
- Collapsible sidebar with icons + labels
- Active tab indicator with gradient highlight
- Collapse to icon-only mode on smaller screens
- Dark background with subtle border

---

## Part 2: Project Timer System

### Database Changes

**New Table: `projects`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| title | text | Project name |
| description | text | Project details |
| client_name | text | Client name |
| client_phone | text | Client phone (for WhatsApp) |
| order_id | uuid (nullable) | Link to orders table |
| invoice_id | uuid (nullable) | Link to invoices table |
| duration_days | integer | Total project duration |
| start_date | timestamptz | When timer started |
| end_date | timestamptz | Calculated deadline |
| status | text | active / completed / paused / overdue |
| reminder_sent_1day | boolean | 1-day reminder sent? |
| reminder_sent_3day | boolean | 3-day reminder sent? |
| reminder_sent_same_day | boolean | Same-day reminder sent? |
| created_by | uuid | Admin user who created it |
| created_at | timestamptz | Record creation time |

RLS: Admin-only access (read/write/delete)

### Timer Features

- **Create Timer**: Set project name, client info, duration (days), link to order/invoice
- **Live Countdown**: Shows days, hours, minutes, seconds remaining (real-time)
- **Status Indicators**:
  - Green: More than 3 days remaining
  - Yellow: 1-3 days remaining
  - Red: Less than 24 hours or overdue
- **Pause/Resume**: Ability to pause and resume timers
- **Link to Invoice**: Each project timer can be connected to an invoice

### WhatsApp Reminder System (Automatic API)

Since you want automatic WhatsApp reminders, we'll need a WhatsApp Business API provider. Here's the approach:

**Edge Function: `whatsapp-reminder`**
- A scheduled (cron) function that runs every hour
- Checks all active projects for upcoming deadlines
- Sends automatic WhatsApp messages at 3 key points:
  - 3 days before deadline
  - 1 day before deadline
  - On the deadline day

**API Setup Required:**
- You'll need a WhatsApp Business API key (from WATI, Twilio, or similar provider)
- We'll securely store the API credentials
- The edge function will handle all automated sending

**Reminder Message Format (Bengali):**
```
[Web Creation BD]

প্রিয় [Client Name],

আপনার "[Project Name]" প্রজেক্টের ডেডলাইন [X দিন] পরে।
শেষ তারিখ: [Date]

ধন্যবাদ,
Web Creation BD
```

### New Admin Tab: "Projects"

A new "Projects" tab in the sidebar with:
- **Project List View**: All active/completed projects with timer cards
- **Create Project Modal**: Form with title, client info, duration, order/invoice linking
- **Timer Cards**: Each project shows a live countdown with color-coded status
- **Quick Actions**: Pause, complete, extend deadline, send manual reminder

### Components to Create

| Component | Purpose |
|-----------|---------|
| `AdminSidebar.tsx` | New sidebar navigation |
| `ProjectTimerManagement.tsx` | Main projects tab content |
| `ProjectTimerCard.tsx` | Individual project timer with live countdown |
| `CreateProjectModal.tsx` | Form to create/edit projects |

### Edge Functions to Create

| Function | Purpose |
|----------|---------|
| `whatsapp-reminder` | Cron job to check and send automatic reminders |

---

## Part 3: Implementation Sequence

1. **Database**: Create `projects` table with RLS policies
2. **UI Redesign**: Restructure layout with sidebar, apply dark theme to all admin components
3. **Project Timer**: Build timer management UI with live countdown
4. **WhatsApp API**: Set up API credentials, create reminder edge function
5. **Cron Job**: Schedule automatic reminder checks
6. **Invoice Link**: Connect project timers to existing invoice system

---

## Technical Details

### WhatsApp API Integration

Before implementing the automatic WhatsApp reminders, you'll need to provide an API key from your WhatsApp Business API provider (WATI, Twilio, or similar). The system will:
- Store the API key securely as an environment variable
- Use a backend function that runs on a schedule (every hour)
- Automatically check which projects need reminders
- Send formatted Bengali messages to client phone numbers

### Live Timer Implementation

The countdown timer will use `setInterval` in React to update every second, calculating the remaining time from `end_date - now()`. The timer cards will display:

```text
+------------------------------------------+
| Project Name              [Active]       |
| Client: Ahmed             2d 14h 32m 15s |
| ████████████████░░░░░░░░  65% complete   |
| Order: #abc123  |  Invoice: INV-2026-001 |
| [Pause] [Complete] [Remind] [Edit]       |
+------------------------------------------+
```

### Color Scheme for Redesigned Dashboard

- Background: `#0f172a` to `#1e293b` (slate-900 to slate-800)
- Cards: `rgba(30, 41, 59, 0.8)` with subtle borders
- Stat card gradients: Red, Cyan-Blue, Purple, Pink (matching reference)
- Chart colors: `#22d3ee` (cyan), `#f472b6` (pink), `#facc15` (yellow), `#34d399` (green)
- Text: White primary, `#94a3b8` secondary
