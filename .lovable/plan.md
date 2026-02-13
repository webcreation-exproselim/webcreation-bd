

# Fraud Guard + Courier Check একত্রিত Plan

## লক্ষ্য
দুটি আলাদা সার্ভিস (Fraud Guard এবং Courier Check) এর আলাদা pricing plan থাকবে না। একটি unified "WCBD Bundle" plan হবে যেখানে দুটো সার্ভিস একসাথে পাওয়া যাবে।

## নতুন Pricing
- **Monthly**: ৳৩৯৯/মাস
- **Yearly**: ৳৯৯৯/বছর

## যা পরিবর্তন হবে

### 1. Unified Plan Component তৈরি
`SubscriptionPlans.tsx` আপডেট করা হবে যেখানে দুটো সার্ভিসের features একসাথে দেখাবে:

**Monthly (৳৩৯৯) features:**
- Fraud Guard: 1,000 API requests, Unlimited blacklist, Real-time logs, Incomplete Order Tracking, Cart Tracking, Order Conversion, Cooldown Control, Smart Risk Detection
- Courier Check: 500 API requests, Real-time Courier Data, Steadfast/Pathao/RedX Support
- WooCommerce Plugin Access (both plugins)
- Domain-locked License
- Standard support

**Yearly (৳৯৯৯) features:**
- Fraud Guard: 15,000 API requests
- Courier Check: 5,000 API requests
- সব Monthly features
- Priority support
- সেভিংস ব্যাজ

### 2. Purchase Modal আপডেট
`SubscriptionPurchaseModal.tsx` এ amount পরিবর্তন:
- Monthly: ৳৩৯৯
- Yearly: ৳৯৯৯

### 3. Courier Check Section পরিবর্তন
`CourierCheckSection.tsx` এ আলাদা `CourierCheckPlans` ও `CourierCheckPurchaseModal` সরিয়ে দেওয়া হবে। পরিবর্তে unified `SubscriptionPlans` ও `SubscriptionPurchaseModal` ব্যবহার হবে।

### 4. Admin Activation Logic
Plan approve হলে **দুটো table-ই** activate হবে:
- `merchants` table (Fraud Guard)
- `courier_check_subscriptions` table (Courier Check)

Admin এর `AssignPlanModal` এবং `AssignCourierCheckPlanModal` একত্রিত করে একটি unified assign modal বানানো হবে, অথবা একটি plan assign করলে দুটোই activate হবে।

`FraudSubscriptionManagement` (admin) এ order approve করলে দুটো subscription-ই activate হবে।

### 5. Landing Page (FraudGuardPage.tsx) আপডেট
- Fraud Guard pricing section এ নতুন দাম দেখাবে (৳৩৯৯/৳৯৯৯)
- Courier Check pricing section এ আলাদা দাম সরিয়ে "Bundle এ অন্তর্ভুক্ত" দেখাবে বা একই pricing card ব্যবহার হবে
- CTA section এ "মাত্র ৳৩৯৯/মাস থেকে শুরু" আপডেট

### 6. Config Files আপডেট
- `pluginConfig.ts` এ pricing update
- `courierCheckPluginConfig.ts` এ pricing update (bundle reference)

### 7. Upgrade Nudge আপডেট
`SubscriptionStatus.tsx` এ yearly upgrade nudge এর দাম ৳৯৯৯ এ পরিবর্তন

## Technical Details

### ফাইল পরিবর্তনের তালিকা:

| ফাইল | পরিবর্তন |
|------|---------|
| `src/components/fraud-protection/SubscriptionPlans.tsx` | Unified features list, ৳৩৯৯/৳৯৯৯ pricing |
| `src/components/fraud-protection/SubscriptionPurchaseModal.tsx` | Amount ৩৯৯/৯৯৯ |
| `src/components/courier-check/CourierCheckSection.tsx` | `CourierCheckPlans` ও `CourierCheckPurchaseModal` সরিয়ে unified plan ব্যবহার |
| `src/components/fraud-protection/SubscriptionStatus.tsx` | Upgrade nudge দাম আপডেট |
| `src/components/client/FraudGuardQuickStatus.tsx` | Pricing reference আপডেট |
| `src/pages/FraudGuardPage.tsx` | Landing page pricing আপডেট |
| `src/config/pluginConfig.ts` | Pricing config আপডেট |
| `src/config/courierCheckPluginConfig.ts` | Pricing config আপডেট |
| `src/components/admin/FraudSubscriptionManagement.tsx` | Approve করলে দুটো table activate |
| `src/components/admin/AssignPlanModal.tsx` | Assign করলে দুটো table activate |
| `src/components/admin/CourierCheckSubscriptionManagement.tsx` | Unified flow reference |

### Database পরিবর্তন:
- কোনো schema পরিবর্তন লাগবে না
- বিদ্যমান `merchants` ও `courier_check_subscriptions` table দুটোই থাকবে
- Admin approve করলে দুটোতেই data update হবে

