

# Payment System ও Reviews Management আপডেট

## সমস্যা সমূহ

### ১. Payment System সমস্যা
বর্তমানে `CheckoutPage.tsx` এ payment methods **hardcoded** আছে (lines 17-57)। Admin Dashboard থেকে `payment_settings` টেবিলে আপডেট করলেও Checkout page এ reflect হচ্ছে না কারণ Checkout page database থেকে data আনছে না।

### ২. Reviews সমস্যা
বর্তমানে `CustomerReviewSection.tsx` এ reviews **hardcoded** আছে (lines 15-113)। কোনো database টেবিল নেই reviews এর জন্য।

## সমাধান

### Part 1: Dynamic Payment Methods (Checkout)

**CheckoutPage.tsx আপডেট:**
- Database থেকে active payment methods fetch করা
- Hardcoded `paymentMethods` array সরিয়ে dynamic data ব্যবহার
- useEffect hook দিয়ে payment_settings টেবিল থেকে data আনা

```text
Current Flow:
+------------------+     X      +------------------+
|  Admin Dashboard |  -----X--> |  Checkout Page   |
|  (Updates DB)    |    No      |  (Hardcoded)     |
+------------------+   Link     +------------------+

New Flow:
+------------------+            +------------------+            +------------------+
|  Admin Dashboard | -------->  | payment_settings | -------->  |  Checkout Page   |
|  (Updates DB)    |            |     (Database)   |            |  (Dynamic Fetch) |
+------------------+            +------------------+            +------------------+
```

### Part 2: Reviews Management System

**ধাপ ১: Database Table তৈরি**
```sql
CREATE TABLE customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo TEXT,
  rating INTEGER DEFAULT 5,
  service TEXT NOT NULL,
  review TEXT NOT NULL,
  service_gradient TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
-- Anyone can view active reviews
-- Admins can manage all reviews
```

**ধাপ ২: Admin Dashboard এ Reviews Tab যোগ**
- নতুন "Reviews" ট্যাব যোগ করা
- Add, Edit, Delete functionality
- Photo URL input
- Service dropdown (ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন, ভিডিও এডিটিং, মোশন গ্রাফিক্স, ল্যান্ডিং পেজ, ফেসবুক অ্যাডস)
- Star rating selector
- Active/Inactive toggle

**ধাপ ৩: CustomerReviewSection.tsx আপডেট**
- Database থেকে reviews fetch করা
- Fallback হিসেবে বর্তমান hardcoded reviews রাখা (যদি DB খালি থাকে)
- Realtime subscription যোগ করা (Admin থেকে আপডেট করলে সাথে সাথে দেখাবে)

```text
Admin Dashboard               Database                    Home Page
+------------------+          +------------------+          +------------------+
| Reviews Tab      | -------> | customer_reviews | -------> | CustomerReview   |
| - Add            |          |     (Table)      |          |    Section       |
| - Edit           |          +------------------+          | (Dynamic +       |
| - Delete         |                                        |  Fallback)       |
+------------------+                                        +------------------+
```

## ফাইল পরিবর্তন

### নতুন ফাইল
1. `src/components/admin/ReviewsManagement.tsx` - Reviews CRUD component

### আপডেট করা ফাইল
1. `src/pages/CheckoutPage.tsx` - Dynamic payment methods
2. `src/pages/AdminDashboard.tsx` - Reviews tab যোগ
3. `src/components/CustomerReviewSection.tsx` - Dynamic reviews

### Database Migration
1. `customer_reviews` টেবিল তৈরি
2. RLS policies
3. Realtime সক্রিয়

## প্রযুক্তিগত বিবরণ

### Payment Settings Integration
- `useEffect` দিয়ে component mount এ `payment_settings` থেকে active methods fetch
- Method icons mapping রাখা (bkash, nagad, rocket, bank)
- Dynamic rendering

### Reviews Management Features
| Feature | Description |
|---------|-------------|
| Add Review | নতুন review যোগ করা |
| Edit Review | বিদ্যমান review এডিট |
| Delete Review | Review ডিলিট |
| Toggle Active | Active/Inactive করা |
| Photo Upload | Image URL input |
| Service Selection | Dropdown দিয়ে সার্ভিস বাছাই |
| Star Rating | 1-5 star rating |

### Data Flow
1. Admin Dashboard → Database → Checkout/Home Page
2. Realtime subscription এ changes সাথে সাথে UI তে reflect হবে

## প্রত্যাশিত ফলাফল
- Admin Dashboard থেকে payment settings আপডেট করলে Checkout page এ সাথে সাথে দেখাবে
- Admin Dashboard থেকে reviews add/edit/delete করা যাবে
- Home page এ database থেকে reviews dynamically show হবে
- Empty database হলে fallback reviews দেখাবে

