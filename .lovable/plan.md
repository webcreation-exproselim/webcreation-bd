

# FraudShield থেকে Data Scraping

## লক্ষ্য
বর্তমান `elitemart.com.bd` থেকে scraping সরিয়ে `fraudshield.bd` (বা `fraudshieldbd.site`) থেকে courier data scrape করা। API key ছাড়া, সরাসরি ওয়েবসাইটের public search form থেকে data নেওয়া হবে।

## কিভাবে কাজ করবে

FraudShield একটি Laravel অ্যাপ। বর্তমান elitemart scraping এর মতোই পদ্ধতি:

1. **GET** `https://fraudshield.bd/` — CSRF token ও session cookies নেওয়া
2. **POST** search form এ phone number পাঠানো (CSRF token সহ)
3. **HTML parse** করে courier data বের করা
4. আমাদের standard format এ convert করে frontend এ পাঠানো

## সুবিধা
- কোনো API key লাগবে না
- সব ৪টি courier সাপোর্ট: **Steadfast, Pathao, RedX, CarryBee**
- FraudShield এর data সবসময় আপডেট থাকে
- বর্তমান frontend কোনো পরিবর্তন ছাড়াই কাজ করবে

## যা পরিবর্তন হবে

### 1. Edge Function সম্পূর্ণ refactor
`supabase/functions/scrape-courier-check/index.ts` ফাইলে:
- elitemart.com.bd এর সব reference সরিয়ে দেওয়া হবে
- fraudshield.bd তে GET/POST করে data নেওয়া হবে
- নতুন HTML parser লেখা হবে FraudShield এর HTML structure অনুযায়ী
- Response format একই রাখা হবে যেন frontend এ কিছু change না লাগে

### 2. Dashboard Component (ঐচ্ছিক)
`CourierCheckerDashboard.tsx` — কোনো major change লাগবে না কারণ response format same থাকবে। শুধু 4 courier (Steadfast, Pathao, RedX, CarryBee) ঠিকমতো match হচ্ছে কিনা verify করা হবে।

## Technical Details

### Files to Update

| ফাইল | পরিবর্তন |
|------|---------|
| `supabase/functions/scrape-courier-check/index.ts` | elitemart scraping logic সরিয়ে fraudshield.bd scraping logic বসানো |

### Edge Function Logic

```text
Step 1: GET https://fraudshield.bd/
        -> Extract CSRF token from <meta name="csrf-token"> or <input name="_token">
        -> Extract session cookies from Set-Cookie headers

Step 2: POST search form with:
        -> _token = CSRF token
        -> phone = 01XXXXXXXXX
        -> Cookies from Step 1

Step 3: Parse HTML response:
        -> Extract courier table data (Steadfast, Pathao, RedX, CarryBee)
        -> Extract total orders, delivered, returned
        -> Calculate success rate
        -> Determine risk label

Step 4: Return standardized JSON (same format as before)
```

### Response Format (unchanged)

```text
{
  success: true,
  data: {
    phone: "01XXXXXXXXX",
    success_rate: 85,
    total_orders: 120,
    total_delivered: 102,
    total_returned: 18,
    risk_label: "trusted|moderate|risky|new_customer",
    risk_message: "...",
    couriers: [
      { name: "Steadfast", orders: 40, delivered: 35, returned: 5, rate: 87.5 },
      { name: "Pathao", orders: 30, delivered: 28, returned: 2, rate: 93.3 },
      { name: "RedX", orders: 25, delivered: 20, returned: 5, rate: 80 },
      { name: "CarryBee", orders: 25, delivered: 19, returned: 6, rate: 76 }
    ]
  }
}
```

### সম্ভাব্য চ্যালেঞ্জ
- FraudShield যদি Livewire/AJAX-based search ব্যবহার করে তাহলে standard POST কাজ নাও করতে পারে — সেক্ষেত্রে Livewire wire:snapshot mechanism ব্যবহার করা হবে
- CSRF token বা cookie mechanism পরিবর্তন হলে edge function আপডেট লাগতে পারে
- Rate limiting হতে পারে — retry logic যোগ করা হবে

### দ্রষ্টব্য
- `fraudshieldbd.site` ১৯ ফেব্রুয়ারি ২০২৬ এর পর বন্ধ হয়ে যাবে, তাই আমরা `fraudshield.bd` ডোমেইন ব্যবহার করব
- Implementation এর সময় actual HTML structure দেখে parser fine-tune করা হবে

