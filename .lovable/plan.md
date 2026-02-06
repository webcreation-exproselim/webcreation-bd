

# WCBD Fraud Guard v7.1.0 - Bulletproof CartFlows Homepage Fix

## Problem Summary

The website `adhunikbeautycare.shop` uses its **homepage (/)** as a CartFlows checkout page (page-id-66, template: cartflows-canvas). The current plugin's JavaScript never loads because all detection methods fail for this specific setup:

- `is_checkout()` returns FALSE on CartFlows pages
- `is_singular('cartflows_step')` can return FALSE when the CartFlows step is set as the homepage
- Result: Only PHP server-side validation works (plain WooCommerce error notices), while the popup, FingerprintJS, and Incomplete Order Tracking are completely non-functional

Database evidence confirms:
- All `fraud_logs` entries have `device_fingerprint = NULL`
- `incomplete_orders` table is completely empty
- Phone numbers arrive with `+88` prefix (PHP sends raw, JS would normalize)

## Solution: Multi-Layer Detection + Fallback Injection

### Changes to `src/utils/pluginGenerator.ts`

#### 1. Rewrite `is_any_checkout_page()` with 7-level detection

Replace the current function with a more aggressive detection system:

```text
Level 1: is_checkout()                    -- Standard WooCommerce
Level 2: is_block_checkout()              -- WooCommerce Block Checkout
Level 3: get_post_type === cartflows_step -- CartFlows by post type
Level 4: wcf-step-type meta === checkout  -- CartFlows by post meta (works even if post type reports as 'page')
Level 5: _wcf_step_type meta exists       -- CartFlows by any step meta
Level 6: is_singular('cartflows_step')    -- CartFlows by singular query
Level 7: has_shortcode check              -- Shortcode-based checkout
```

This ensures detection works even when:
- CartFlows step is set as the homepage/front page
- WordPress reports the post type as 'page' instead of 'cartflows_step'
- The CartFlows canvas template is used

#### 2. Add `wp_footer` Fallback Script Injection (NEW)

Add a new method `maybe_inject_fallback_scripts()` hooked to `wp_footer` at priority 100. This acts as a safety net:

- If the primary `wp_enqueue_scripts` detection missed the page, this fallback will inject the scripts directly into the footer
- Uses the same 7-level detection plus additional CartFlows class checks
- Injects FingerprintJS via a raw `<script>` tag and the checkout JS inline
- Sets a PHP constant `WCBD_SCRIPTS_LOADED` to prevent double-loading

Constructor will add:
```text
add_action('wp_footer', array($this, 'maybe_inject_fallback_scripts'), 100);
```

#### 3. Add JavaScript Self-Detection

Add a DOM check at the start of `WCBD_FG.init()` function:

```text
Before initializing, check if checkout elements exist:
- form.checkout
- .wc-block-checkout
- #billing_phone
- input[name="billing_phone"]

If none found -> skip initialization (no unnecessary API calls on non-checkout pages)
```

This makes the JS safe to load on any page while only activating on checkout pages.

#### 4. Fix PHP Server-Side `check_type`

Update `validate_order_server_side()` to pass `check_type: 'order'` in the API request body. Currently it sends no `check_type`, which causes the edge function to treat it as a full order check and create duplicate `fraud_logs` entries alongside the JS precheck.

#### 5. Add Primary `enqueue_frontend_scripts` Flag

In `enqueue_frontend_scripts()`, define `WCBD_SCRIPTS_LOADED` constant when scripts are successfully enqueued, so the `wp_footer` fallback knows not to double-inject.

### Changes to `src/config/pluginConfig.ts`

- Version bump: `7.0.0` to `7.1.0`
- Update `versionHighlight` to "Homepage Checkout + Bulletproof CartFlows Fix"
- Update `whatsNew` array with the new fixes
- Update `badgeLabel` to "STABLE"

### No Edge Function Changes Needed

All 4 edge functions (`check-order-eligibility`, `log-checkout-attempt`, `get-incomplete-orders`, `update-merchant-settings`) are confirmed working correctly via direct testing.

## Technical Flow After Fix

```text
Page Load (Homepage = CartFlows Checkout)
  |
  +-- wp_enqueue_scripts fires
  |     |-- is_any_checkout_page() runs 7-level detection
  |     |-- Level 4 matches: wcf-step-type meta = 'checkout'
  |     |-- FingerprintJS + Checkout JS enqueued
  |     +-- WCBD_SCRIPTS_LOADED = true
  |
  +-- wp_footer fires (priority 99)
  |     +-- inject_popup_styles() outputs popup CSS
  |
  +-- wp_footer fires (priority 100)
  |     +-- maybe_inject_fallback_scripts() checks WCBD_SCRIPTS_LOADED
  |     +-- Already loaded -> skip (no double injection)
  |
  +-- JS executes
        |-- DOM self-check: finds form.checkout + #billing_phone -> proceed
        |-- License validation -> success
        |-- FingerprintJS -> device ID captured
        |-- Classic checkout hook -> form.checkout intercept
        |-- Universal fallback interceptor -> active
        |-- Incomplete tracking -> phone_blur, page_exit active
        |
        +-- Customer places order:
              |-- JS precheck (check_type: precheck) -> popup if blocked
              |-- If allowed -> form submits
              +-- PHP server-side (check_type: order) -> final validation
```

## What the User Needs to Do After Approval

1. Download v7.1.0 plugin from the dashboard
2. Delete old plugin from WordPress
3. Upload and activate new plugin
4. Click "Test Connection" in plugin settings
5. Place a test order to verify the popup appears

