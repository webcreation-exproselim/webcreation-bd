
# Courier Check Plan Assign System - Admin Dashboard

## Overview
Admin Dashboard এর Courier Check ট্যাবে একটি "Plan Assign করুন" বাটন যোগ হবে। এই বাটনে ক্লিক করলে একটি Modal খুলবে যেখান থেকে আপনি যেকোনো registered user কে Courier Check এর Yearly plan (৳899) সরাসরি assign করতে পারবেন - কোনো payment approval process ছাড়াই।

## যা করা হবে

### 1. নতুন Component তৈরি: `AssignCourierCheckPlanModal`
**File:** `src/components/admin/AssignCourierCheckPlanModal.tsx`

Fraud Guard এর `AssignPlanModal` এর মতো একই UI pattern ব্যবহার করে Courier Check এর জন্য আলাদা modal তৈরি হবে:

- **Step 1:** User নির্বাচন - নাম বা ফোন দিয়ে search করে user select করা যাবে
- **Step 2:** Website URL দেওয়া - যে domain এ plugin চলবে
- **Step 3:** Plan automatically "Yearly - ৳899 (5,000 requests, 365 days)" সেট থাকবে (কারণ Courier Check এ শুধু একটি plan আছে)

Modal submit করলে:
- প্রথমে check করবে user এর `courier_check_subscriptions` record আছে কিনা
- থাকলে update করবে (is_active=true, plan_expires_at=365 days, max_requests=5000, requests_used=0)
- না থাকলে নতুন record তৈরি করবে user_id এবং website_url সহ
- তাৎক্ষণিকভাবে subscription active হয়ে যাবে

### 2. CourierCheckSubscriptionManagement আপডেট
**File:** `src/components/admin/CourierCheckSubscriptionManagement.tsx`

- Header এ "Plan Assign করুন" বাটন যোগ হবে (Refresh বাটনের পাশে)
- `AssignCourierCheckPlanModal` import এবং render করা হবে
- Assign সফল হলে order list refresh হবে

## Technical Details

### AssignCourierCheckPlanModal Logic
```text
1. Modal opens -> Fetch all users from profiles table
2. Admin selects user + enters website URL
3. On submit:
   a. Check courier_check_subscriptions where user_id = selected_user
   b. If exists -> UPDATE set is_active=true, plan_expires_at=now+365days, 
      max_requests=5000, requests_used=0, website_url=normalized_url
   c. If not exists -> INSERT new record with user_id, website_url, 
      is_active=true, plan_expires_at, max_requests=5000
4. Show success toast
5. Close modal + refresh parent list
```

### Files to Create
| File | Description |
|------|-------------|
| `src/components/admin/AssignCourierCheckPlanModal.tsx` | Plan assign modal for Courier Check |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/admin/CourierCheckSubscriptionManagement.tsx` | Add "Plan Assign" button + modal integration |

### Key Differences from Fraud Guard AssignPlanModal
| Feature | Fraud Guard | Courier Check |
|---------|------------|---------------|
| Table | `merchants` | `courier_check_subscriptions` |
| Plans | Monthly (৳100) / Yearly (৳699) | Yearly only (৳899) |
| Max Requests | 1,000 / 15,000 | 5,000 |
| Plan Select | Dropdown (2 options) | Fixed (no dropdown needed) |
| Duration | 30 / 365 days | 365 days only |
