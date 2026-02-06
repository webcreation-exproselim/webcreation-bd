

# Fix Popup Positioning - Force Full-Screen Overlay

## Problem
The fraud guard popup appears **below the checkout content** instead of as a centered full-screen overlay. This happens because CartFlows or WooCommerce applies CSS `transform` on parent elements, which breaks `position:fixed` behavior in all browsers.

## Solution
Two changes in `src/utils/pluginGenerator.ts`:

### 1. Change how popup is inserted into the DOM (Line 620)
Instead of `jQ(document.documentElement).append(html)`, use native DOM to:
- Create the overlay element directly
- Apply critical styles as **inline styles** (not just CSS classes) so nothing can override them
- Append directly to `document.body` as a direct child
- Force `document.body.style.overflow = 'hidden'` to prevent background scrolling
- Scroll to top of page when popup appears

### 2. Add inline style hardcoding in the popup HTML (Lines 610-618)
Add inline `style` attributes directly on the overlay and modal divs with all critical positioning properties. This serves as a "nuclear option" - even if class-based CSS gets overridden by theme transforms, the inline styles will ensure correct positioning.

### Technical Details

**Current code (broken):**
```javascript
var html='<div class="wcbd-fraud-popup-overlay" id="wcbdFraudPopup">';
html+='<div class="wcbd-fraud-popup-modal">';
// ...
jQ(document.documentElement).append(html);
```

**New code (bulletproof):**
```javascript
var html='<div class="wcbd-fraud-popup-overlay" id="wcbdFraudPopup" style="position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(0,0,0,0.92)!important;backdrop-filter:blur(12px)!important;margin:0!important;padding:20px!important;box-sizing:border-box!important;transform:none!important">';
html+='<div class="wcbd-fraud-popup-modal" style="position:relative!important;transform:none!important;max-width:420px!important;width:100%!important">';
// ...

// Remove any existing popup first
var existing = document.getElementById('wcbdFraudPopup');
if(existing) existing.remove();

// Create a fresh container and append to body
var container = document.createElement('div');
container.innerHTML = html;
var popup = container.firstChild;
document.body.appendChild(popup);

// Lock background scrolling
document.body.style.overflow = 'hidden';
window.scrollTo(0, 0);
```

Also update the close/remove handlers to restore `document.body.style.overflow = ''` when popup is dismissed.

### 3. Update popup CSS (Lines 98-119)
Add `transform:none!important` to both `.wcbd-fraud-popup-overlay` and `.wcbd-fraud-popup-modal` in the CSS block to further ensure no parent transforms affect positioning.

### Files Changed
- `src/utils/pluginGenerator.ts` - Popup insertion method, inline styles, and close handlers

### Why This Works
- **Inline styles** cannot be overridden by external CSS (except with their own inline `!important`)
- **`transform:none!important`** on the overlay prevents the CSS transform containment issue
- **`document.body.appendChild`** ensures the popup is a direct child of body, minimizing parent interference
- **`overflow:hidden` on body** prevents user from scrolling away from popup
- **`scrollTo(0,0)`** ensures popup is visible immediately

