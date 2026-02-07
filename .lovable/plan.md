

# Admin Dashboard - Light Theme + Animated Graphs

## Summary
Admin dashboard (`/admin`) কে client dashboard (`/dashboard`) এর মতো **light background color** দেওয়া হবে। বর্তমানে admin dashboard এ `bg-slate-950` (কালো) ব্যবহার হচ্ছে, এটা `bg-gray-50` (হালকা ধূসর) এ পরিবর্তন করা হবে - ঠিক client dashboard এর মতো। সব text readable থাকবে এবং graph গুলোতে animation যোগ করা হবে।

---

## যা পরিবর্তন হবে

### 1. Main Background Color (AdminDashboard.tsx)
- `bg-slate-950` থেকে `bg-gray-50` (client dashboard এর মতো)
- Loading screen ও `bg-gray-50` হবে
- সব card, filter button, empty state গুলো light theme এ convert হবে
- Text color: `text-white` থেকে `text-gray-900` / `text-gray-700`

### 2. Admin Header (AdminHeader.tsx)
- `bg-slate-900/95` থেকে `bg-white` with `border-gray-100`
- Search bar: light input style (`bg-gray-50`, `border-gray-200`)
- Button colors: `text-gray-600` with `hover:bg-gray-100`
- Title text: `text-gray-900`

### 3. Admin Sidebar (AdminSidebar.tsx)
- `bg-slate-900/90` থেকে `bg-white` with `border-gray-100`
- Active tab: `bg-gradient-to-r from-blue-600 to-purple-600 text-white` (client dashboard এর মতো)
- Inactive items: `text-gray-600` with `hover:bg-gray-100`
- Icon backgrounds: light colored (`bg-blue-100`, `bg-amber-100` etc.)
- Collapse button: light themed

### 4. Stats Cards (StatsCards.tsx)
- Gradient cards রাখা হবে (এগুলো already colorful এবং premium দেখায়)
- Text contrast ঠিক আছে কারণ gradient background এ white text ব্যবহার হয়

### 5. Analytics Charts (AnalyticsCharts.tsx) - Animated + Real-time Feel
- Chart containers: `bg-slate-800/60` থেকে `bg-white` with `border-gray-100` and `shadow-sm`
- Title text: `text-gray-900`, subtitle: `text-gray-500`
- Tooltip: Light themed (white background, gray border)
- Axis text: `text-gray-500`
- Grid lines: light gray
- **Animated entry**: staggered `framer-motion` animations দিয়ে charts appear হবে
- **Counter animation**: Revenue numbers count-up animation দিয়ে দেখাবে
- **Smooth transitions**: Chart data change হলে smooth animation হবে
- Chart colors: Vibrant রাখা হবে (cyan, pink, green, purple) যাতে light background এ pop করে

### 6. Orders Tab (AdminDashboard.tsx inline)
- Order cards: `bg-white rounded-2xl border-gray-100 shadow-sm`
- Filter buttons: `bg-blue-50 text-blue-600` (active), `bg-gray-50 text-gray-600` (inactive)
- Progress bar: light background with colored fill
- Text: `text-gray-900` (names), `text-gray-500` (secondary)

### 7. Portfolio Section (AdminDashboard.tsx inline)
- Portfolio cards: `bg-white` with `border-gray-100`
- Category badges: `bg-blue-50 text-blue-600`
- Filter/Add buttons: light themed

### 8. Messages Section (AdminDashboard.tsx inline)
- Chat containers: `bg-white` with `border-gray-100`
- Message bubbles: admin = `bg-blue-600 text-white`, user = `bg-gray-100 text-gray-900`
- Input: light styled

### 9. Order Detail Modal (AdminDashboard.tsx inline)
- `bg-white` with `border-gray-200`
- Text: dark colors for readability

### 10. Portfolio Modal (AdminDashboard.tsx inline)
- Light themed form inputs and labels

---

## Technical Details

### Files to Modify:
1. **`src/pages/AdminDashboard.tsx`** - Main container + all inline sections (orders, portfolio, messages, modals)
2. **`src/components/admin/AdminHeader.tsx`** - Header bar
3. **`src/components/admin/AdminSidebar.tsx`** - Sidebar navigation
4. **`src/components/admin/AnalyticsCharts.tsx`** - Charts with animations
5. **`src/components/admin/StatsCards.tsx`** - Minor text adjustments for label readability

### Color Mapping (Dark to Light):
```text
bg-slate-950      -->  bg-gray-50
bg-slate-900      -->  bg-white
bg-slate-800/60   -->  bg-white + border-gray-100 + shadow-sm
text-white         -->  text-gray-900
text-slate-400     -->  text-gray-500
text-slate-500     -->  text-gray-400
text-cyan-400      -->  text-blue-600
border-slate-700   -->  border-gray-100/200
bg-cyan-500/20     -->  bg-blue-50
```

### Chart Animations:
- `framer-motion` `initial={{ opacity: 0, y: 30 }}` with staggered delays
- `animationBegin` and `animationDuration` props on recharts components
- `isAnimationActive={true}` on all chart elements
- Smooth `animationEasing="ease-in-out"` for premium feel

