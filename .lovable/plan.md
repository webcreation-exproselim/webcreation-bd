

## Plan: Facebook Post Links — Story Style UI

### Summary
Admin Dashboard থেকে Facebook পোস্টের লিংক দিবেন, হোমপেজে সেগুলো Instagram/Facebook Story-র মতো সুন্দর circular cards হিসেবে সবসময় দেখাবে। ক্লিক করলে নতুন ট্যাবে Facebook পোস্ট ওপেন হবে।

### Database
- New table: **`stories`** — `id` (uuid), `title` (text), `facebook_url` (text), `thumbnail_url` (text, nullable), `caption` (text, nullable), `is_active` (boolean, default true), `sort_order` (int), `created_at` (timestamptz), `created_by` (uuid)
- RLS: Public SELECT for active stories, admin-only INSERT/UPDATE/DELETE

### New Components

**1. `src/components/StoriesSection.tsx`** (Homepage)
- Header এর নিচে সবসময় visible থাকবে
- Horizontal scrollable row of circular cards with gradient ring (Instagram style)
- প্রতিটি card এ thumbnail দেখাবে (admin যদি thumbnail দেয়), না দিলে Facebook icon + title দেখাবে
- Click করলে সরাসরি Facebook post link নতুন ট্যাবে ওপেন হবে
- Dark theme (`bg-black`) matching homepage
- Mobile-friendly touch scroll

**2. `src/components/admin/StoriesManagement.tsx`** (Admin Dashboard)
- Facebook post URL paste করার ইনপুট
- Title ও optional thumbnail URL দেওয়ার ফিল্ড
- Active/inactive toggle
- Edit, delete, reorder functionality
- List view with preview

### Integration Points
- **`Index.tsx`**: Add `<StoriesSection />` after `<Header />`, before `<HeroSection />`
- **`AdminSidebar.tsx`** + **`AdminMobileNav.tsx`**: Add "স্টোরি" tab (`id: "stories"`)
- **`AdminDashboard.tsx`**: Register stories tab with `<StoriesManagement />`
- **TabType**: Add `"stories"` to the type union

### Technical Details
- No Facebook API or embed needed — just stores URLs and opens them on click
- Thumbnail can be manually provided by admin (paste image URL) or show a default Facebook-style placeholder
- Framer Motion animations for smooth scroll and hover effects

