
## FraudShield API Integration Plan

### লক্ষ্য
বর্তমান courier check system কে FraudShield API দিয়ে রিপ্লেস করা যেখানে Steadfast, Pathao, RedX, CarryBee — সব ৪টি courier সাপোর্ট থাকবে এবং ডেটা refresh দ্রুত হবে।

### যা পরিবর্তন হবে

#### 1. FraudShield API Credentials Setup
- FraudShield.bd এর কাছ থেকে API key নেওয়া দরকার
- Edge function এ secrets হিসেবে সেভ করা হবে
- Dashboard → Settings → Secrets এ `FRAUDSHIELD_API_KEY` যোগ করা হবে

#### 2. Edge Function আপডেট (`scrape-courier-check`)
বর্তমান `supabase/functions/scrape-courier-check/index.ts` এ যা আছে:
- **Old Logic**: elitemart.com.bd এ POST করে HTML parse করা
- **New Logic**: FraudShield API এ POST করে JSON response নেওয়া

```typescript
// FraudShield API request format (estimated)
POST https://fraudshield.bd/api/check
{
  "phone": "01XXXXXXXXX",
  "api_key": "..."
}

// Response structure (estimated)
{
  "success": true,
  "data": {
    "phone": "01XXXXXXXXX",
    "success_rate": 85,
    "total_orders": 120,
    "total_delivered": 102,
    "total_returned": 18,
    "risk_label": "trusted|moderate|risky|new_customer",
    "risk_message": "...",
    "couriers": [
      {
        "name": "Steadfast",
        "orders": 40,
        "delivered": 35,
        "returned": 5,
        "rate": 87.5
      },
      // ... more couriers
    ]
  }
}
```

#### 3. Courier Check Components আপডেট
- `CourierCheckerDashboard.tsx` - কোনো পরিবর্তন লাগবে না (API response format same রাখব)
- `CourierCheckPlans.tsx` - Pricing আপনার unified plan অনুযায়ী দেখাবে

#### 4. Supported Couriers Update
`ALLOWED_COURIERS` array update করা হবে:
```typescript
const ALLOWED_COURIERS = ["pathao", "steadfast", "carrybee", "redx"];
```

#### 5. Default Couriers Display
```typescript
const DEFAULT_COURIERS = [
  { name: "Steadfast", logoKey: "steadfast" },
  { name: "Pathao", logoKey: "pathao" },
  { name: "RedX", logoKey: "redx" },
  { name: "CarryBee", logoKey: "carrybee" },
];
```

### Technical Details

#### Files to Update:
| ফাইল | পরিবর্তন |
|------|---------|
| `supabase/functions/scrape-courier-check/index.ts` | elitemart → FraudShield API integration |
| `src/config/courierCheckPluginConfig.ts` | Courier list update: CarryBee যোগ করা |
| `src/components/courier-check/CourierCheckerDashboard.tsx` | Supported couriers UI update (CarryBee যোগ) |

#### Steps:
1. **FraudShield API Key পাওয়া** - আপনাকে fraudshield.bd এর সাথে যোগাযোগ করে API key চেয়ে নিতে হবে
2. **Secret Configure করা** - API key `FRAUDSHIELD_API_KEY` হিসেবে secrets এ যোগ করা হবে
3. **Edge Function আপডেট** - `scrape-courier-check` function কে FraudShield API call করতে modify করা হবে
4. **Response Format Standardize** - FraudShield এর response কে আমাদের current response format এ convert করা হবে যেন frontend কোনো change ছাড়াই কাজ করে
5. **Testing** - Phone number search test করে দেখা হবে সব ৪টি courier ঠিকমতো data দেখাচ্ছে কিনা

### এক্সট্রা সুবিধা
- ✅ CarryBee সাপোর্ট হবে (আগে elitemart এ ছিল না)
- ✅ Bulk search support (আগে single search ছিল)
- ✅ Real-time updated data (FraudShield নিয়মিত update করে)
- ✅ No CSRF issues (simple API call, no session management needed)

