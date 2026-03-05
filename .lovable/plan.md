

# Multi-Domain Support — Admin-Only Assignment ✅ IMPLEMENTED

## সারমর্ম
Admin একটি user-কে একাধিক domain assign করতে পারবে। প্রতিটি domain-এর আলাদা API key ও আলাদা plugin download থাকবে। User তার dashboard থেকে সব domain দেখবে ও প্রতিটির plugin আলাদাভাবে download করতে পারবে। Existing subscription purchase flow অপরিবর্তিত থাকবে।

## Completed Changes

1. ✅ **Database Migration** — Dropped `merchants_user_id_key` unique constraint, added `store_name` to `merchants` and `courier_check_subscriptions`
2. ✅ **AssignPlanModal** — Always INSERTs new merchant + courier_check_subscription, added store_name input
3. ✅ **AssignCourierCheckPlanModal** — Always INSERTs new subscription, added store_name input
4. ✅ **useMerchantData** — Returns `merchants[]`, `selectedMerchantId`, `setSelectedMerchantId`, derived `merchant`
5. ✅ **useCourierCheckData** — Returns `subscriptions[]`, `selectedSubscriptionId`, derived `subscription`
6. ✅ **ClientDashboard** — Store Switcher dropdown when multiple stores exist
7. ✅ **FraudGuardSection** — Accepts optional `merchantId` prop
8. ✅ **CourierCheckSection** — Accepts optional `subscriptionId` prop
