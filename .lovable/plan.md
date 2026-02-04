

# API Key + Domain Binding Security Feature

## সমস্যা বিশ্লেষণ

### বর্তমান অবস্থা
- একটা API key দিয়ে **যেকোনো domain** থেকে request করা যায়
- Edge function শুধু `api_key` validate করে
- Domain (`website_url`) merchants table-এ আছে কিন্তু enforce হয় না

### Security Risk
যদি কেউ API key জানতে পারে (screenshot, shared, etc.), তারা নিজের domain-এ use করতে পারবে

---

## প্রস্তাবিত সমাধান

### মূল Concept
```text
API Request → Edge Function
    │
    ├── Check: api_key valid?
    │
    ├── [NEW] Check: Request Origin/Domain matches website_url?
    │    ├── Match → Continue
    │    └── No Match → Block (401)
    │
    └── Continue with fraud checks...
```

---

## Technical Implementation

### 1. Edge Function Update (`check-order-eligibility`)

**নতুন Parameter:**
- `domain` - Request থেকে domain pass হবে

**নতুন Validation Logic:**
```text
1. api_key দিয়ে merchant fetch করো
2. merchant.website_url extract করো
3. Request-এর domain/origin match করো
4. Match না হলে → Block with "Domain mismatch" error
```

**Code Changes:**
```typescript
interface CheckRequest {
  api_key: string
  phone?: string
  ip?: string
  device_id?: string
  domain?: string  // NEW - from plugin
}

// After getting merchant:
const allowedDomain = merchant.website_url;
const requestDomain = domain;

// Normalize and compare domains
if (allowedDomain && requestDomain) {
  const normalizedAllowed = normalizeDomain(allowedDomain);
  const normalizedRequest = normalizeDomain(requestDomain);
  
  if (normalizedAllowed !== normalizedRequest) {
    return { error: 'Domain mismatch', allowed: false };
  }
}
```

### 2. WordPress Plugin Update (`pluginGenerator.ts`)

**নতুন Feature:**
- Plugin automatically current site domain send করবে

**JavaScript পরিবর্তন:**
```javascript
// validate function-এ:
jQ.ajax({
  url: this.endpoint,
  method: 'POST',
  contentType: 'application/json',
  data: JSON.stringify({
    api_key: this.apiKey, 
    phone: phone, 
    device_id: this.deviceId,
    domain: window.location.hostname  // NEW
  }),
  // ...
});
```

### 3. Subscription Purchase Modal Update

**পরিবর্তন:**
- Plan কেনার সময় **domain বাধ্যতামূলক**
- Domain ছাড়া submit করা যাবে না

**নতুন Field:**
```text
Step 1: পেমেন্ট পাঠান (current)
Step 2: তথ্য দিন
   - Transaction ID (current)
   - Sender Number (current)
   - Website Domain (NEW - required)
   - Screenshot (current - optional)
```

### 4. AssignPlanModal Update (Admin)

**পরিবর্তন:**
- Already আছে `websiteUrl` field ✓
- Validation ensure করা যে empty না হয়

---

## Domain Normalization Logic

```typescript
function normalizeDomain(url: string): string {
  try {
    // Remove protocol, www, trailing slashes
    let domain = url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
    return domain;
  } catch {
    return url.toLowerCase().trim();
  }
}

// Examples:
// "https://www.example.com/page" → "example.com"
// "http://example.com" → "example.com"
// "example.com" → "example.com"
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/check-order-eligibility/index.ts` | MODIFY | Add domain validation + select website_url |
| `src/utils/pluginGenerator.ts` | MODIFY | Send domain in API request |
| `src/components/fraud-protection/SubscriptionPurchaseModal.tsx` | MODIFY | Add required domain field |
| `src/hooks/useMerchantData.ts` | No change | Already handles website_url |
| `src/components/admin/AssignPlanModal.tsx` | No change | Already has website_url field |

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| Merchant has no website_url set | Skip domain check (backward compatible) |
| Domain with/without www | Normalize both before comparing |
| HTTP vs HTTPS | Strip protocol before comparing |
| Subdomain mismatch | Strict match required (admin can update) |
| localhost/development | Match will fail unless website_url = localhost |

---

## User Flow After Implementation

### Client Plan Purchase:
```text
1. Client selects plan (Monthly/Yearly)
2. Opens payment modal
3. Enters: Transaction ID, Sender Number, Website Domain
4. Submits → Creates subscription order
5. Admin approves → website_url saved to merchant
6. Plugin only works on that domain
```

### Admin Manual Assignment:
```text
1. Admin opens "Plan Assign" modal
2. Selects user
3. Enters website domain (already implemented)
4. Assigns plan → website_url saved
5. API key only works for that domain
```

---

## Error Messages

| Scenario | Response |
|----------|----------|
| Domain mismatch | `{ allowed: false, reason: 'domain_mismatch', message: 'এই ডোমেইনে ব্যবহারের অনুমতি নেই।' }` |
| No domain in request | Continue normally (backward compatible) |
| No website_url in merchant | Continue normally (backward compatible) |

