
# Admin Dashboard: Manual Plan Assignment Feature

## সমস্যা বিশ্লেষণ

বর্তমানে Admin শুধু তাদের plan assign করতে পারেন যাদের **merchant record** আছে। কিন্তু merchant record তৈরি হয় যখন user:
1. Client Dashboard-এ Fraud Guard section visit করে
2. অথবা `useMerchantData` hook call হয়

যদি কোনো customer account করে কিন্তু Fraud Guard section visit না করে, তাহলে তার জন্য merchant record নেই এবং Admin plan assign করতে পারেন না।

---

## প্রস্তাবিত সমাধান

### Feature Overview
Admin Dashboard-এ একটা নতুন ফিচার যোগ করা যেখানে:
1. সব registered users দেখা যাবে (merchant থাকুক বা না থাকুক)
2. Admin যেকোনো user-কে domain/website দিয়ে খুঁজতে পারবে
3. যদি merchant record না থাকে, সেটা auto-create হবে
4. Admin সরাসরি Monthly/Yearly plan assign করতে পারবে

### UI/UX Flow

```text
Admin Dashboard → Fraud Guard Tab → Merchants Sub-Tab
     │
     ├── [বর্তমান] Existing Merchants Table
     │
     └── [নতুন] "Assign Plan to User" Button
            │
            ├── Modal Opens
            │    ├── User Search (by Email, Name, Phone)
            │    ├── User List (from profiles table)
            │    ├── Select User
            │    ├── Enter Website/Domain URL
            │    ├── Select Plan (Monthly/Yearly)
            │    └── Confirm Button
            │
            └── On Confirm:
                 ├── Check if merchant exists for user
                 ├── If not → Create merchant record
                 ├── Update merchant with plan details
                 └── Show success message
```

---

## Technical Implementation

### 1. নতুন Component: `AssignPlanModal.tsx`

**Path:** `src/components/admin/AssignPlanModal.tsx`

**Features:**
- User search functionality (profiles table থেকে)
- All registered users list দেখানো
- Selected user-এর জন্য website URL input
- Plan type selection (Monthly / Yearly)
- Auto-create merchant if not exists
- Plan activation logic

**State Management:**
```text
- users: UserProfile[]        - All registered users
- selectedUser: UserProfile   - Currently selected user
- websiteUrl: string          - Domain/website URL
- planType: 'monthly' | 'yearly'
- loading: boolean
- search: string              - Search filter
```

### 2. MerchantManagement.tsx Update

**Changes:**
- Add "New Plan Assign" button in header
- Import and render AssignPlanModal
- Pass refetch function to modal

**UI Position:**
```text
┌──────────────────────────────────────────────────┐
│  Merchant খুঁজুন...  [🔄 Refresh] [➕ Plan Assign] │
├──────────────────────────────────────────────────┤
│  Existing Merchants Table...                      │
└──────────────────────────────────────────────────┘
```

### 3. Database Flow

```text
1. Admin clicks "Plan Assign"
2. Modal loads all users from 'profiles' table
3. Admin searches by name/email/phone
4. Admin selects user
5. Admin enters website URL & selects plan
6. System checks: Does merchant exist for this user_id?
   │
   ├── YES → Update existing merchant
   │         - website_url = entered URL
   │         - is_active = true
   │         - current_plan = selected plan
   │         - plan_expires_at = calculated date
   │         - max_requests = plan-based limit
   │         - requests_used = 0
   │
   └── NO → Create new merchant
            - INSERT into merchants
            - Same fields as above
```

### 4. Plan Details Reference

| Plan | Duration | Max Requests | Price |
|------|----------|--------------|-------|
| Monthly | 30 days | 1,000 | ৳100 |
| Yearly | 365 days | 15,000 | ৳699 |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/admin/AssignPlanModal.tsx` | CREATE | New modal component for assigning plans |
| `src/components/admin/MerchantManagement.tsx` | MODIFY | Add button and modal integration |

---

## Key Points

1. **No Database Schema Change Needed**
   - Using existing `merchants` and `profiles` tables
   - RLS policies already allow admin full access

2. **Security**
   - Admin-only access (already protected by parent component)
   - Uses existing admin role check

3. **User Experience**
   - Clean modal interface
   - Search functionality for easy user finding
   - Visual feedback on success/error

4. **Edge Cases Handled**
   - User already has merchant record → Update only
   - User doesn't have merchant → Create + Activate
   - Duplicate plan assignment → Overwrites previous plan
