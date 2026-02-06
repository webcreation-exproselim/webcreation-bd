

# WCBD Fraud Guard v8.0.0 - Complete Clean Rebuild

## Why a Full Rebuild?

The current plugin has been patched multiple times (v6.x to v7.1.0), and despite a "7-level detection system," the JavaScript STILL never loads on your CartFlows homepage. Database evidence confirms this:
- All fraud_logs entries have device_fingerprint = NULL (JS not running)
- incomplete_orders table is completely empty (JS tracking not firing)
- Phone numbers arrive with +88 prefix (PHP sends raw format)

The root cause: PHP-based page detection simply cannot reliably detect CartFlows checkout pages when they are set as the homepage. No matter how many levels we add, WordPress's global $post and template system behaves unpredictably in this configuration.

## New Architecture: "Load Everywhere, Activate Smartly"

Instead of trying to detect checkout pages in PHP (which keeps failing), the new approach is:

```text
OLD (BROKEN):
  PHP detects checkout page --> If detected, load JS --> JS runs
  Problem: PHP detection fails on CartFlows homepage = JS never loads

NEW (BULLETPROOF):
  PHP loads tiny script on ALL pages --> JS checks DOM for checkout elements
  --> If checkout found: Load FingerprintJS + activate full Fraud Guard
  --> If not found: Do nothing (zero overhead)
```

This completely eliminates the PHP detection problem. The JavaScript is the one that checks for checkout elements like #billing_phone, form.checkout, etc.

## Changes Overview

### File 1: `src/utils/pluginGenerator.ts` (Complete Rewrite)

The entire plugin PHP file will be rebuilt from scratch with these principles:

**1. Remove ALL PHP page detection functions:**
- Remove `is_any_checkout_page()` (7-level detection)
- Remove `is_cartflows_checkout()` 
- Remove `is_block_checkout()`
- Remove `maybe_inject_fallback_scripts()` (wp_footer fallback)
- Remove `WCBD_SCRIPTS_LOADED` constant logic

**2. New simple script loading:**
- `enqueue_frontend_scripts()` will load on ALL frontend pages (no detection check)
- Enqueue a tiny inline "loader" script (under 500 bytes)
- The loader checks for checkout DOM elements before doing anything
- If checkout elements found: dynamically load FingerprintJS and initialize

**3. Fix API Key management:**
- Remove the constructor auto-sync that forces hardcoded key into wp_options
- On activation only: set the initial key (using `add_option`, not `update_option`)
- Settings page still shows the key for informational purposes
- All API calls use the hardcoded key directly (`$this->api_key`)

**4. Keep what works:**
- Server-side PHP validation (`woocommerce_checkout_process` hook) - this always works
- Block checkout validation hook
- Popup CSS injection (but on all pages, it's just CSS)
- Admin settings page (Settings, Cooldown, Incomplete Orders tabs)
- All AJAX handlers (test connection, incomplete orders, cooldown, convert order)
- Popup JavaScript (beautiful dark modal)
- Incomplete order tracking (phone_blur, validation_error, page_exit)

**5. JavaScript initialization flow:**

```text
Page Load (ANY page)
  |
  +-- Tiny loader script runs (inline, < 500 bytes)
  |     |-- Check DOM: form.checkout? .wc-block-checkout? #billing_phone?
  |     |-- If NO checkout elements found --> STOP (zero overhead)
  |     |-- If checkout found --> Load FingerprintJS dynamically
  |
  +-- FingerprintJS loaded
  |     |-- Initialize full WCBD_FG object
  |     |-- License validation (check_type: 'license')
  |     |-- If invalid --> log to console, stop
  |     |-- If valid --> activate all features
  |
  +-- Features active:
        |-- Classic checkout: form.checkout submit intercept
        |-- Block checkout: MutationObserver + button intercept
        |-- Universal fallback interceptor
        |-- Incomplete tracking (phone_blur, page_exit, validation_error)
        |-- Device fingerprinting active
```

**6. Server-side validation (unchanged, always works):**

```text
Customer submits order
  |
  +-- woocommerce_checkout_process fires
  |     |-- PHP sends check_type: 'order' to API
  |     |-- If blocked --> WooCommerce error notice
  |     |-- If allowed --> order proceeds
```

### File 2: `src/config/pluginConfig.ts` (Version Update)

- Version: "7.1.0" --> "8.0.0"
- Version highlight: "Complete Rebuild - Universal Compatibility"
- Badge: "STABLE"
- Updated whatsNew list with v8.0.0 features
- Same features list (all features retained)

### No Edge Function Changes

All 4 edge functions are confirmed working correctly:
- `check-order-eligibility` - fraud validation works
- `log-checkout-attempt` - incomplete order logging works
- `get-incomplete-orders` - data retrieval works
- `update-merchant-settings` - cooldown/settings management works

### No Database Changes

All tables and data remain the same. The merchant record already has:
- is_active: true
- enable_incomplete_tracking: true
- website_url: adhunikbeautycare.shop

## What This Fixes

| Problem | Before (v7.1.0) | After (v8.0.0) |
|---------|-----------------|-----------------|
| JS not loading on CartFlows homepage | 7-level PHP detection still fails | JS loads on ALL pages, self-detects checkout |
| device_fingerprint always NULL | FingerprintJS never loads | FingerprintJS loads when checkout detected |
| Incomplete orders empty | Tracking JS never runs | Tracking activates on checkout pages |
| API key auto-override | Constructor forces old key | Only sets key once on activation |
| Domain mismatch on key regeneration | Old key forced back by constructor | New downloaded plugin uses new key cleanly |
| Code complexity | 1958 lines with patches on patches | Clean rewrite, same features, simpler logic |

## After Approval - What You Need To Do

1. Download v8.0.0 plugin from your dashboard
2. WordPress Admin -> Plugins -> Delete old WCBD Fraud Guard
3. Upload and activate v8.0.0
4. Go to Fraud Guard settings -> Click "Test Connection"
5. Place a test order to verify popup appears
6. Check dashboard for incomplete orders (enter phone on checkout, then leave page)

