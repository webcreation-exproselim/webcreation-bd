

# Multi-Domain Support — Admin-Only Assignment

## সারমর্ম
Admin একটি user-কে একাধিক domain assign করতে পারবে। প্রতিটি domain-এর আলাদা API key ও আলাদা plugin download থাকবে। User তার dashboard থেকে সব domain দেখবে ও প্রতিটির plugin আলাদাভাবে download করতে পারবে। Existing subscription purchase flow অপরিবর্তিত থাকবে।

---

## Step 1: Database Migration

- **Remove** `merchants_user_id_key` UNIQUE constraint — একই `user_id` দিয়ে multiple merchant rows allow করবে
- **Add** `store_name` column (text, nullable) to `merchants` — domain চেনার জন্য label
- **Add** `store_name` column (text, nullable) to `courier_check_subscriptions`

```sql
ALTER TABLE merchants DROP CONSTRAINT merchants_user_id_key;
ALTER TABLE merchants ADD COLUMN store_name text;
ALTER TABLE courier_check_subscriptions ADD COLUMN store_name text;
```

---

## Step 2: Admin AssignPlanModal Update (`AssignPlanModal.tsx`)

**Current**: Checks for existing merchant via `.maybeSingle()`, updates if found, inserts if not.
**Change**: Always **INSERT** a new merchant row (new domain = new record). Add a `store_name` input field. Same for courier_check_subscriptions — always insert new.

---

## Step 3: Client Dashboard — Store Switcher

**Files**: `useMerchantData.ts`, `ClientDashboard.tsx`, `FraudGuardSection.tsx`, `CourierCheckSection.tsx`

**Current**: `useMerchantData` fetches `.single()` merchant. `FraudGuardSection` fetches `.maybeSingle()`.
**Change**:
- `useMerchantData.ts`: Fetch ALL merchants for user (`.select()` without `.single()`). Add `selectedMerchantId` state and a setter. Return `merchants[]` + `selectedMerchant`.
- `ClientDashboard.tsx`: Add a **Store Selector dropdown** at the top showing all domains. Pass selected merchant context down.
- `FraudGuardSection.tsx`: Accept optional `merchantId` prop. If provided, use that instead of fetching. Otherwise fetch all and let user pick.
- `CourierCheckSection.tsx`: Same — accept store context, show data for selected store.
- `useCourierCheckData.ts`: Change to accept optional subscription ID or fetch all for user, with selection.

---

## Step 4: Plugin Download Per-Store

No plugin generator changes needed — they already take `apiKey` as parameter. The dashboard will pass the selected store's API key to `downloadPluginFile()` and `downloadCourierCheckPlugin()`.

---

## Step 5: Admin MerchantManagement Update

**Current**: Shows one merchant per user.
**Change**: Will naturally show multiple rows since it fetches all merchants. Add `store_name` / `website_url` display. AssignCourierCheckPlanModal — same pattern, always insert new.

---

## Step 6: Edge Functions

No changes needed — they identify merchants by `api_key`, not `user_id`.

---

## Affected Files (~12 files)

| File | Change |
|------|--------|
| DB Migration | Drop unique, add store_name |
| `useMerchantData.ts` | Multi-merchant fetch + selector |
| `useCourierCheckData.ts` | Multi-subscription support |
| `ClientDashboard.tsx` | Store switcher UI |
| `FraudGuardSection.tsx` | Use selected merchant context |
| `CourierCheckSection.tsx` | Use selected store context |
| `AssignPlanModal.tsx` | Always insert new, add store_name |
| `AssignCourierCheckPlanModal.tsx` | Always insert new |
| `MerchantManagement.tsx` | Show store_name column |
| `FraudSubscriptionManagement.tsx` | Minor — works already |
| `CourierCheckSubscriptionManagement.tsx` | Minor — works already |
| `FraudGuardQuickStatus.tsx` | Accept selected merchant |

---

## Important Notes
- Existing single-domain users will continue working — তাদের ১টি merchant row আছে, সেটাই দেখাবে
- Admin ছাড়া কেউ নতুন domain add করতে পারবে না
- User-এর self-purchase flow (SubscriptionPurchaseModal) অপরিবর্তিত থাকবে — existing merchant-এ apply হবে

