

# SaaS Order Limiter & Anti-Fraud System - Implementation Plan

## Overview

This plan outlines how to build a complete anti-fraud system for WordPress WooCommerce stores. The system will allow WooCommerce merchants to limit repeat orders based on phone number, IP address, and device fingerprint within a configurable cooldown period, plus manually blacklist fraudulent entities.

---

## 1. Database Schema

### New Tables to Create

#### `merchants` Table
Stores merchant account details linked to authenticated users.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid (PK) | gen_random_uuid() | Primary key |
| user_id | uuid (FK -> profiles.user_id) | NOT NULL | Link to auth user |
| website_url | text | NULL | Merchant's WooCommerce store URL |
| api_key | uuid | gen_random_uuid() | API key for authentication |
| cooldown_period_days | integer | 30 | Days before same entity can order again |
| created_at | timestamptz | now() | Record creation time |
| updated_at | timestamptz | now() | Last update time |

#### `fraud_logs` Table
Records every order check for tracking and cooldown enforcement.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid (PK) | gen_random_uuid() | Primary key |
| merchant_id | uuid (FK -> merchants.id) | NOT NULL | Associated merchant |
| phone_number | text | NULL | Customer phone |
| ip_address | text | NULL | Customer IP |
| device_fingerprint | text | NULL | Device fingerprint ID |
| status | text | 'allowed' | Result: allowed/blocked_cooldown/blocked_blacklist |
| created_at | timestamptz | now() | Check timestamp |

#### `blacklist` Table
Stores manually banned entities (phones, IPs, device IDs).

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid (PK) | gen_random_uuid() | Primary key |
| merchant_id | uuid (FK -> merchants.id) | NOT NULL | Associated merchant |
| blocked_value | text | NOT NULL | Phone/IP/Device ID to block |
| block_type | text | 'phone' | Type: phone/ip/device |
| reason | text | NULL | Optional reason for blocking |
| created_at | timestamptz | now() | When blocked |

### RLS Policies

- Merchants can only access their own data
- API key validation done server-side in edge function
- Admin users can view all data

---

## 2. Edge Function: `check-order-eligibility`

### Endpoint
`POST /functions/v1/check-order-eligibility`

### Input JSON
```json
{
  "api_key": "uuid-string",
  "phone": "01XXXXXXXXX",
  "ip": "192.168.1.1",
  "device_id": "fingerprint-hash"
}
```

### Logic Flow

```text
+-------------------+
|  Receive Request  |
+--------+----------+
         |
         v
+-------------------+
| Validate API Key  |
| (merchants table) |
+--------+----------+
         |
    +----+----+
    |  Valid? |
    +----+----+
         |
    No --+-- Yes
    |         |
    v         v
+-------+  +------------------+
|  401  |  | Check Blacklist  |
+-------+  +--------+---------+
                    |
              +-----+-----+
              | Blocked?  |
              +-----+-----+
                    |
              Yes --+-- No
               |         |
               v         v
          +---------+  +-------------------+
          | allowed:|  | Check fraud_logs  |
          | false   |  | within cooldown   |
          +---------+  +--------+----------+
                               |
                        +------+------+
                        | Found logs? |
                        +------+------+
                               |
                         Yes --+-- No
                          |         |
                          v         v
                    +---------+  +---------+
                    | allowed:|  | allowed:|
                    | false   |  | true    |
                    +---------+  +---------+
                                      |
                                      v
                              +---------------+
                              | Log to        |
                              | fraud_logs    |
                              +---------------+
```

### Response Examples

**Success:**
```json
{ "allowed": true }
```

**Blocked by Blacklist:**
```json
{ "allowed": false, "reason": "blacklist", "message": "You are banned from ordering." }
```

**Blocked by Cooldown:**
```json
{ "allowed": false, "reason": "cooldown", "message": "You have already placed an order recently. Please wait X days." }
```

**Invalid API Key:**
```json
{ "error": "Invalid API key" }
```

---

## 3. Dashboard Features

### New Route: `/fraud-protection`

A new page accessible to authenticated merchants (non-admin users) with the following tabs:

### Tab 1: Settings
- View current API key (with copy button)
- Regenerate API key button
- Update cooldown period (slider: 1-90 days)
- Display website URL with edit option
- Show integration code snippet

### Tab 2: Blacklist Manager
- Add new entry form:
  - Value input (phone/IP/device ID)
  - Type selector (phone/ip/device)
  - Reason input (optional)
- Table showing all blacklisted entries:
  - Blocked value
  - Type (with icon)
  - Reason
  - Created date
  - Delete button

### Tab 3: Logs View
- Searchable table showing recent checks:
  - Date/Time
  - Phone (masked: 01XX***XXX)
  - IP Address
  - Device ID (truncated)
  - Status badge (Allowed/Blocked)
  - Reason (if blocked)
- Pagination (50 per page)
- Date filter

---

## 4. WordPress Integration Snippet

### Features
- Uses FingerprintJS for device fingerprinting
- Intercepts WooCommerce checkout
- AJAX call to edge function before order submission
- Shows user-friendly error messages in Bengali/English

### Code Structure
```javascript
// 1. Load FingerprintJS
// 2. Get device fingerprint on page load
// 3. Hook into WooCommerce checkout form submit
// 4. Make API call to check eligibility
// 5. Block or allow order based on response
```

### Integration Instructions
Merchants will:
1. Copy the snippet from their dashboard
2. Paste into WordPress Customizer > Additional JavaScript
   OR add to theme's footer.php

---

## 5. File Changes Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `src/pages/FraudProtectionPage.tsx` | Main dashboard page for merchants |
| `src/components/fraud-protection/FraudSettings.tsx` | API key & cooldown settings |
| `src/components/fraud-protection/BlacklistManager.tsx` | Add/remove blacklist entries |
| `src/components/fraud-protection/FraudLogs.tsx` | View order check logs |
| `src/components/fraud-protection/IntegrationCode.tsx` | WordPress snippet display |
| `src/hooks/useMerchantData.ts` | Hook for merchant data fetching |
| `supabase/functions/check-order-eligibility/index.ts` | Main edge function |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add new route `/fraud-protection` |
| `supabase/config.toml` | Add new edge function config |

---

## 6. Security Considerations

1. **API Key Security**: UUID-based, stored hashed if needed, regeneratable
2. **RLS Policies**: Each merchant only sees their own data
3. **Rate Limiting**: Edge function can be rate-limited per API key
4. **Input Validation**: Sanitize all inputs (phone, IP, device ID)
5. **No Admin Access via Client**: All sensitive operations server-side

---

## Technical Details

### Database Migration SQL (Preview)

```sql
-- Create merchants table
CREATE TABLE public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url text,
  api_key uuid DEFAULT gen_random_uuid() NOT NULL,
  cooldown_period_days integer DEFAULT 30 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id),
  UNIQUE (api_key)
);

-- Create fraud_logs table
CREATE TABLE public.fraud_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  phone_number text,
  ip_address text,
  device_fingerprint text,
  status text DEFAULT 'allowed' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create blacklist table
CREATE TABLE public.blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  blocked_value text NOT NULL,
  block_type text DEFAULT 'phone' NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants
CREATE POLICY "Users can view own merchant data"
ON public.merchants FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own merchant data"
ON public.merchants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own merchant data"
ON public.merchants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for fraud_logs
CREATE POLICY "Merchants can view own logs"
ON public.fraud_logs FOR SELECT
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- RLS Policies for blacklist
CREATE POLICY "Merchants can manage own blacklist"
ON public.blacklist FOR ALL
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- Admin policies
CREATE POLICY "Admins can manage all merchants"
ON public.merchants FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all logs"
ON public.fraud_logs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all blacklists"
ON public.blacklist FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
```

---

## Implementation Order

1. **Phase 1: Database** - Create tables and RLS policies
2. **Phase 2: Edge Function** - Build `check-order-eligibility` with full logic
3. **Phase 3: Dashboard** - Create merchant dashboard page with all tabs
4. **Phase 4: Integration** - Add WordPress snippet generator

