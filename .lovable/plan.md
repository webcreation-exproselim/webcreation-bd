

# WordPress Plugin Development Plan - Fraud Protection Integration

## Overview

এই plan-এ একটি professional WordPress plugin তৈরি করা হবে যেটা users তাদের WooCommerce site-এ easily install করতে পারবে। Plugin-এ থাকবে admin settings page, beautiful popup system, এবং automatic checkout integration।

---

## Plugin Structure

```text
fraud-protection-bd/
├── fraud-protection-bd.php          # Main plugin file
├── includes/
│   ├── class-fraud-protection.php   # Main class
│   ├── class-admin-settings.php     # Admin settings page
│   └── class-checkout-handler.php   # WooCommerce checkout hook
├── assets/
│   ├── css/
│   │   ├── admin-style.css          # Admin panel styling
│   │   └── popup-style.css          # Frontend popup styling
│   └── js/
│       ├── fingerprint.min.js       # FingerprintJS library
│       └── checkout-handler.js      # Checkout validation script
├── templates/
│   └── admin-settings.php           # Admin settings template
└── readme.txt                        # WordPress plugin readme
```

---

## 1. Main Plugin File: `fraud-protection-bd.php`

```php
<?php
/**
 * Plugin Name: Fraud Protection BD
 * Plugin URI: https://yoursite.com
 * Description: Order Limiter & Anti-Fraud System for WooCommerce
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: fraud-protection-bd
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) exit;

define('FRAUD_PROTECTION_VERSION', '1.0.0');
define('FRAUD_PROTECTION_PATH', plugin_dir_path(__FILE__));
define('FRAUD_PROTECTION_URL', plugin_dir_url(__FILE__));

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', get_option('active_plugins'))) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>Fraud Protection BD requires WooCommerce to be installed and active.</p></div>';
    });
    return;
}

// Initialize plugin
require_once FRAUD_PROTECTION_PATH . 'includes/class-fraud-protection.php';
new Fraud_Protection_BD();
```

---

## 2. Admin Settings Page

### Features
- API Key input field (সহজে paste করার জন্য)
- Enable/Disable toggle
- Test API connection button
- Custom popup colors
- Bengali/English message selection

### Settings UI Design

```text
+--------------------------------------------------+
|  FRAUD PROTECTION BD - SETTINGS                  |
+--------------------------------------------------+
|                                                  |
|  API Key:                                        |
|  [ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx ]       |
|  [Test Connection]  ✅ Connected                 |
|                                                  |
|  Status:                                         |
|  [✓] Enable Fraud Protection                    |
|                                                  |
|  Popup Language:                                 |
|  ( ) English  (•) বাংলা                         |
|                                                  |
|  Popup Style:                                    |
|  [Modern Dark ▼]                                |
|                                                  |
|  [ Save Settings ]                              |
+--------------------------------------------------+
```

---

## 3. Beautiful Popup System

### Popup Types

| Type | Color | Icon | Message |
|------|-------|------|---------|
| Blocked (Blacklist) | Red | 🚫 | আপনাকে অর্ডার করা থেকে বাদ দেওয়া হয়েছে |
| Blocked (Cooldown) | Orange | ⏱️ | আপনি ইতিমধ্যে অর্ডার করেছেন, X দিন অপেক্ষা করুন |
| Error | Gray | ⚠️ | কিছু সমস্যা হয়েছে |

### Popup CSS (Modern Glassmorphism)

```css
.fraud-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.fraud-popup-modal {
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 40px;
    max-width: 420px;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fraud-popup-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 40px;
}

.fraud-popup-icon.blocked { background: linear-gradient(135deg, #ff4757, #c0392b); }
.fraud-popup-icon.cooldown { background: linear-gradient(135deg, #ffa502, #e67e22); }
.fraud-popup-icon.error { background: linear-gradient(135deg, #636e72, #2d3436); }

.fraud-popup-title {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
}

.fraud-popup-message {
    font-size: 16px;
    color: #a0a0a0;
    line-height: 1.6;
    margin-bottom: 24px;
}

.fraud-popup-button {
    padding: 14px 50px;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

.fraud-popup-button:hover {
    transform: scale(1.05);
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
}
```

---

## 4. Checkout Handler JavaScript

```javascript
(function($) {
    'use strict';
    
    var FraudProtection = {
        deviceId: null,
        settings: window.fraudProtectionSettings || {},
        
        init: function() {
            this.initFingerprint();
            this.bindEvents();
        },
        
        initFingerprint: function() {
            var self = this;
            if (typeof FingerprintJS !== 'undefined') {
                FingerprintJS.load().then(function(fp) {
                    fp.get().then(function(result) {
                        self.deviceId = result.visitorId;
                    });
                });
            }
        },
        
        bindEvents: function() {
            var self = this;
            $('form.checkout').on('checkout_place_order', function(e) {
                return self.validateOrder($(this));
            });
        },
        
        validateOrder: function($form) {
            var self = this;
            var phone = $('#billing_phone').val();
            var $button = $form.find('button[type="submit"]');
            
            // Show loading
            $button.prop('disabled', true);
            $button.data('original-text', $button.text());
            $button.html('<span class="spinner"></span> চেক করা হচ্ছে...');
            
            $.ajax({
                url: this.settings.endpoint,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    api_key: this.settings.apiKey,
                    phone: phone,
                    device_id: this.deviceId
                }),
                success: function(response) {
                    if (response.allowed) {
                        $form.off('checkout_place_order').submit();
                    } else {
                        self.showPopup(response.reason, response.message, response.days_remaining);
                        self.resetButton($button);
                    }
                },
                error: function() {
                    // Fail-open: allow order on error
                    $form.off('checkout_place_order').submit();
                }
            });
            
            return false;
        },
        
        showPopup: function(type, message, daysRemaining) {
            var iconMap = {
                'blacklist': '🚫',
                'cooldown': '⏱️',
                'error': '⚠️'
            };
            
            var titleMap = {
                'blacklist': 'অর্ডার ব্লক করা হয়েছে',
                'cooldown': 'অপেক্ষা করুন',
                'error': 'সমস্যা হয়েছে'
            };
            
            var html = `
                <div class="fraud-popup-overlay" id="fraudPopup">
                    <div class="fraud-popup-modal">
                        <div class="fraud-popup-icon ${type}">
                            ${iconMap[type] || '⚠️'}
                        </div>
                        <h3 class="fraud-popup-title">${titleMap[type] || 'Error'}</h3>
                        <p class="fraud-popup-message">${message}</p>
                        ${daysRemaining ? `<p class="fraud-popup-days">${daysRemaining} দিন বাকি</p>` : ''}
                        <button class="fraud-popup-button" onclick="document.getElementById('fraudPopup').remove()">
                            ঠিক আছে
                        </button>
                    </div>
                </div>
            `;
            
            $('body').append(html);
        },
        
        resetButton: function($button) {
            $button.prop('disabled', false);
            $button.text($button.data('original-text'));
        }
    };
    
    $(document).ready(function() {
        FraudProtection.init();
    });
    
})(jQuery);
```

---

## 5. Dashboard-এ Plugin Download Feature

### IntegrationCode.tsx-এ নতুন Features

1. **Download as ZIP Button**: Plugin as ZIP file download করার option
2. **Step-by-step Installation Guide**: বাংলায় installation instructions
3. **Video Tutorial Link**: YouTube tutorial link

### Download Flow

```text
User clicks "Download Plugin"
        ↓
System generates ZIP file with:
  - Main plugin file (API key injected)
  - CSS files
  - JS files
  - Readme
        ↓
Browser downloads: fraud-protection-bd.zip
```

---

## 6. File Changes Summary

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/fraud-protection/PluginDownload.tsx` | Plugin ZIP generation & download |
| `src/utils/pluginGenerator.ts` | Generate plugin files with API key |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/fraud-protection/IntegrationCode.tsx` | Add beautiful popup code & plugin download |
| `src/pages/FraudProtectionPage.tsx` | Add Plugin tab |

---

## 7. Implementation Phases

1. **Phase 1**: Update IntegrationCode.tsx with beautiful popup system
2. **Phase 2**: Create plugin generator utility
3. **Phase 3**: Add plugin download feature to dashboard
4. **Phase 4**: Add installation instructions in Bengali

---

## Technical Notes

### Plugin Requirements
- WordPress 5.0+
- WooCommerce 4.0+
- PHP 7.4+

### Browser Support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

### Security
- API key stored in WordPress options (encrypted)
- Nonce verification for admin actions
- Sanitization of all inputs

