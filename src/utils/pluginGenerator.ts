import JSZip from 'jszip';

const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';

export const generateMainPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: Fraud Protection BD
 * Plugin URI: https://webcreation-bd.lovable.app
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - আপনার WooCommerce সাইটে ফেক অর্ডার ও প্রতারণা থেকে সুরক্ষা
 * Version: 1.0.0
 * Author: WebCreation BD
 * Author URI: https://webcreation-bd.lovable.app
 * Text Domain: fraud-protection-bd
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * WC requires at least: 4.0
 * WC tested up to: 8.5
 */

if (!defined('ABSPATH')) exit;

define('FRAUD_PROTECTION_VERSION', '1.0.0');
define('FRAUD_PROTECTION_PATH', plugin_dir_path(__FILE__));
define('FRAUD_PROTECTION_URL', plugin_dir_url(__FILE__));

class Fraud_Protection_BD {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    
    public function __construct() {
        // Check WooCommerce
        add_action('admin_init', array($this, 'check_woocommerce'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Enqueue scripts
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Save settings
        add_action('admin_post_fraud_protection_save_settings', array($this, 'save_settings'));
        
        // AJAX handler for API test
        add_action('wp_ajax_fraud_protection_test_api', array($this, 'test_api_connection'));
    }
    
    public function check_woocommerce() {
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', function() {
                echo '<div class="error"><p><strong>Fraud Protection BD</strong> প্লাগইনের জন্য WooCommerce ইন্সটল ও একটিভ থাকতে হবে।</p></div>';
            });
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Fraud Protection',
            'Fraud Protection',
            'manage_options',
            'fraud-protection-bd',
            array($this, 'render_settings_page'),
            'dashicons-shield',
            56
        );
    }
    
    public function enqueue_frontend_scripts() {
        if (!is_checkout()) return;
        
        $enabled = get_option('fraud_protection_enabled', '1');
        if ($enabled !== '1') return;
        
        // FingerprintJS
        wp_enqueue_script(
            'fingerprintjs',
            'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js',
            array(),
            '3.0.0',
            true
        );
        
        // Popup CSS
        wp_enqueue_style(
            'fraud-protection-popup',
            FRAUD_PROTECTION_URL . 'assets/css/popup-style.css',
            array(),
            FRAUD_PROTECTION_VERSION
        );
        
        // Checkout handler
        wp_enqueue_script(
            'fraud-protection-checkout',
            FRAUD_PROTECTION_URL . 'assets/js/checkout-handler.js',
            array('jquery', 'fingerprintjs'),
            FRAUD_PROTECTION_VERSION,
            true
        );
        
        // Pass settings to JS
        wp_localize_script('fraud-protection-checkout', 'fraudProtectionSettings', array(
            'endpoint' => $this->endpoint,
            'apiKey' => get_option('fraud_protection_api_key', $this->api_key),
            'language' => get_option('fraud_protection_language', 'bn'),
            'enabled' => $enabled
        ));
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_fraud-protection-bd') return;
        
        wp_enqueue_style(
            'fraud-protection-admin',
            FRAUD_PROTECTION_URL . 'assets/css/admin-style.css',
            array(),
            FRAUD_PROTECTION_VERSION
        );
        
        wp_enqueue_script(
            'fraud-protection-admin',
            FRAUD_PROTECTION_URL . 'assets/js/admin.js',
            array('jquery'),
            FRAUD_PROTECTION_VERSION,
            true
        );
        
        wp_localize_script('fraud-protection-admin', 'fraudProtectionAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fraud_protection_nonce')
        ));
    }
    
    public function render_settings_page() {
        $api_key = get_option('fraud_protection_api_key', $this->api_key);
        $enabled = get_option('fraud_protection_enabled', '1');
        $language = get_option('fraud_protection_language', 'bn');
        
        include FRAUD_PROTECTION_PATH . 'templates/admin-settings.php';
    }
    
    public function save_settings() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        check_admin_referer('fraud_protection_settings');
        
        update_option('fraud_protection_api_key', sanitize_text_field($_POST['api_key']));
        update_option('fraud_protection_enabled', isset($_POST['enabled']) ? '1' : '0');
        update_option('fraud_protection_language', sanitize_text_field($_POST['language']));
        
        wp_redirect(admin_url('admin.php?page=fraud-protection-bd&saved=1'));
        exit;
    }
    
    public function test_api_connection() {
        check_ajax_referer('fraud_protection_nonce', 'nonce');
        
        $api_key = get_option('fraud_protection_api_key', $this->api_key);
        
        $response = wp_remote_post($this->endpoint, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'phone' => '01700000000',
                'device_id' => 'test-connection'
            )),
            'timeout' => 15
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => 'সংযোগ ব্যর্থ: ' . $response->get_error_message()));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error']) && strpos($body['error'], 'Invalid API key') !== false) {
            wp_send_json_error(array('message' => 'API Key সঠিক নয়'));
        }
        
        wp_send_json_success(array('message' => 'সংযোগ সফল! ✅'));
    }
}

// Initialize
new Fraud_Protection_BD();
`;
};

export const generateAdminSettingsTemplate = (): string => {
  return `<?php if (!defined('ABSPATH')) exit; ?>

<div class="wrap fraud-protection-wrap">
    <div class="fraud-protection-header">
        <h1>
            <span class="dashicons dashicons-shield"></span>
            Fraud Protection BD
        </h1>
        <p class="description">আপনার WooCommerce সাইটকে ফেক অর্ডার থেকে রক্ষা করুন</p>
    </div>
    
    <?php if (isset($_GET['saved'])): ?>
        <div class="notice notice-success is-dismissible">
            <p>সেটিংস সফলভাবে সেভ হয়েছে! ✅</p>
        </div>
    <?php endif; ?>
    
    <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
        <input type="hidden" name="action" value="fraud_protection_save_settings">
        <?php wp_nonce_field('fraud_protection_settings'); ?>
        
        <div class="fraud-protection-card">
            <h2>🔑 API Settings</h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="api_key">API Key</label>
                    </th>
                    <td>
                        <input 
                            type="text" 
                            id="api_key" 
                            name="api_key" 
                            value="<?php echo esc_attr($api_key); ?>" 
                            class="regular-text code"
                            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        >
                        <button type="button" id="test-api-btn" class="button button-secondary">
                            টেস্ট করুন
                        </button>
                        <span id="api-test-result" class="api-test-result"></span>
                        <p class="description">
                            আপনার Fraud Protection Dashboard থেকে API Key কপি করে এখানে পেস্ট করুন
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        
        <div class="fraud-protection-card">
            <h2>⚙️ General Settings</h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Status</th>
                    <td>
                        <label class="fraud-toggle">
                            <input 
                                type="checkbox" 
                                name="enabled" 
                                value="1" 
                                <?php checked($enabled, '1'); ?>
                            >
                            <span class="fraud-toggle-slider"></span>
                            <span class="fraud-toggle-label">Enable Fraud Protection</span>
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Popup Language</th>
                    <td>
                        <fieldset>
                            <label>
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="bn" 
                                    <?php checked($language, 'bn'); ?>
                                > বাংলা
                            </label>
                            <br>
                            <label>
                                <input 
                                    type="radio" 
                                    name="language" 
                                    value="en" 
                                    <?php checked($language, 'en'); ?>
                                > English
                            </label>
                        </fieldset>
                    </td>
                </tr>
            </table>
        </div>
        
        <p class="submit">
            <button type="submit" class="button button-primary button-hero">
                💾 Save Settings
            </button>
        </p>
    </form>
    
    <div class="fraud-protection-card fraud-protection-info">
        <h2>📚 সাহায্য</h2>
        <ul>
            <li>✅ প্লাগইন ইন্সটল করার পর আপনার API Key দিন</li>
            <li>✅ WooCommerce Checkout page-এ অটোমেটিক কাজ করবে</li>
            <li>✅ ফেক অর্ডার ব্লক হলে সুন্দর popup দেখাবে</li>
        </ul>
        <p>
            <a href="https://webcreation-bd.lovable.app" target="_blank" class="button">
                🌐 ড্যাশবোর্ডে যান
            </a>
        </p>
    </div>
</div>
`;
};

export const generateAdminCSS = (): string => {
  return `/* Fraud Protection BD - Admin Styles */

.fraud-protection-wrap {
    max-width: 800px;
    margin: 20px 0;
}

.fraud-protection-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
    padding: 30px;
    border-radius: 12px;
    margin-bottom: 20px;
}

.fraud-protection-header h1 {
    color: #fff;
    font-size: 28px;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.fraud-protection-header h1 .dashicons {
    font-size: 32px;
    width: 32px;
    height: 32px;
    color: #00d4ff;
}

.fraud-protection-header .description {
    color: #a0a0a0;
    font-size: 14px;
    margin: 0;
}

.fraud-protection-card {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.fraud-protection-card h2 {
    margin: 0 0 20px;
    padding: 0 0 15px;
    border-bottom: 1px solid #eee;
    font-size: 18px;
}

.fraud-protection-card .form-table th {
    padding-left: 0;
    font-weight: 600;
}

.fraud-protection-card .form-table td {
    padding-left: 0;
}

/* Toggle Switch */
.fraud-toggle {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
}

.fraud-toggle input {
    display: none;
}

.fraud-toggle-slider {
    width: 50px;
    height: 26px;
    background: #ccc;
    border-radius: 26px;
    position: relative;
    transition: 0.3s;
}

.fraud-toggle-slider::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    top: 3px;
    left: 3px;
    transition: 0.3s;
}

.fraud-toggle input:checked + .fraud-toggle-slider {
    background: #00d4ff;
}

.fraud-toggle input:checked + .fraud-toggle-slider::before {
    transform: translateX(24px);
}

.fraud-toggle-label {
    font-weight: 500;
}

/* API Test Button */
#test-api-btn {
    margin-left: 10px;
}

.api-test-result {
    margin-left: 10px;
    font-weight: 500;
}

.api-test-result.success {
    color: #00a32a;
}

.api-test-result.error {
    color: #d63638;
}

/* Info Card */
.fraud-protection-info {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-color: #bae6fd;
}

.fraud-protection-info ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.fraud-protection-info li {
    padding: 8px 0;
    font-size: 14px;
}

/* Submit Button */
.submit .button-hero {
    padding: 12px 30px !important;
    font-size: 16px !important;
}
`;
};

export const generatePopupCSS = (): string => {
  return `/* Fraud Protection BD - Popup Styles */

.fraud-popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fraudFadeIn 0.3s ease;
}

.fraud-popup-modal {
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 40px 35px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.5),
        0 0 100px rgba(0, 212, 255, 0.1);
    animation: fraudScaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fraud-popup-icon {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    font-size: 45px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.fraud-popup-icon.blacklist {
    background: linear-gradient(135deg, #ff4757, #c0392b);
}

.fraud-popup-icon.cooldown {
    background: linear-gradient(135deg, #ffa502, #e67e22);
}

.fraud-popup-icon.error {
    background: linear-gradient(135deg, #636e72, #2d3436);
}

.fraud-popup-title {
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 15px;
    line-height: 1.3;
}

.fraud-popup-message {
    font-size: 16px;
    color: #a0aec0;
    line-height: 1.7;
    margin: 0 0 10px;
}

.fraud-popup-days {
    font-size: 18px;
    font-weight: 600;
    color: #ffa502;
    margin: 0 0 25px;
    padding: 10px 20px;
    background: rgba(255, 165, 2, 0.1);
    border-radius: 10px;
    display: inline-block;
}

.fraud-popup-button {
    padding: 16px 60px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #00d4ff, #0099cc);
    color: #fff;
    box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}

.fraud-popup-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 212, 255, 0.4);
}

.fraud-popup-button:active {
    transform: translateY(0);
}

/* Animations */
@keyframes fraudFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes fraudScaleIn {
    from {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Mobile Responsive */
@media (max-width: 480px) {
    .fraud-popup-modal {
        padding: 30px 25px;
        border-radius: 20px;
    }
    
    .fraud-popup-icon {
        width: 70px;
        height: 70px;
        font-size: 35px;
    }
    
    .fraud-popup-title {
        font-size: 22px;
    }
    
    .fraud-popup-message {
        font-size: 15px;
    }
    
    .fraud-popup-button {
        padding: 14px 50px;
        font-size: 15px;
    }
}
`;
};

export const generateCheckoutHandlerJS = (): string => {
  return `/**
 * Fraud Protection BD - Checkout Handler
 * Version: 1.0.0
 */

(function($) {
    'use strict';
    
    var FraudProtection = {
        deviceId: null,
        settings: window.fraudProtectionSettings || {},
        isValidating: false,
        
        init: function() {
            if (this.settings.enabled !== '1') {
                console.log('Fraud Protection: Disabled');
                return;
            }
            
            this.initFingerprint();
            this.bindEvents();
            console.log('Fraud Protection: Initialized');
        },
        
        initFingerprint: function() {
            var self = this;
            
            if (typeof FingerprintJS !== 'undefined') {
                FingerprintJS.load().then(function(fp) {
                    fp.get().then(function(result) {
                        self.deviceId = result.visitorId;
                        console.log('Fraud Protection: Device ID ready');
                    });
                }).catch(function(err) {
                    console.error('Fraud Protection: Fingerprint error', err);
                });
            }
        },
        
        bindEvents: function() {
            var self = this;
            
            // Hook into WooCommerce checkout
            $('form.checkout').on('checkout_place_order', function(e) {
                if (self.isValidating) {
                    return false;
                }
                return self.validateOrder($(this));
            });
        },
        
        validateOrder: function($form) {
            var self = this;
            var phone = $('#billing_phone').val();
            var $button = $form.find('button[type="submit"]');
            
            // Validate phone
            if (!phone || phone.length < 10) {
                return true; // Let WooCommerce handle validation
            }
            
            // Set validating flag
            this.isValidating = true;
            
            // Store original button state
            var originalText = $button.text();
            var originalHTML = $button.html();
            
            // Show loading
            $button.prop('disabled', true);
            $button.html(this.getLoadingText());
            
            // Make API call
            $.ajax({
                url: this.settings.endpoint,
                method: 'POST',
                contentType: 'application/json',
                timeout: 15000,
                data: JSON.stringify({
                    api_key: this.settings.apiKey,
                    phone: phone,
                    device_id: this.deviceId || 'unknown'
                }),
                success: function(response) {
                    self.isValidating = false;
                    
                    if (response.allowed) {
                        // Allow order - resubmit form
                        $button.prop('disabled', false);
                        $button.html(originalHTML);
                        $form.off('checkout_place_order').submit();
                    } else {
                        // Block order - show popup
                        self.showPopup(
                            response.reason || 'blocked',
                            response.message,
                            response.days_remaining
                        );
                        self.resetButton($button, originalHTML);
                    }
                },
                error: function(xhr, status, error) {
                    self.isValidating = false;
                    console.error('Fraud Protection: API Error', error);
                    
                    // Fail-open: allow order on error
                    $button.prop('disabled', false);
                    $button.html(originalHTML);
                    $form.off('checkout_place_order').submit();
                }
            });
            
            return false; // Prevent default submission
        },
        
        getLoadingText: function() {
            if (this.settings.language === 'en') {
                return '<span class="fraud-spinner"></span> Checking...';
            }
            return '<span class="fraud-spinner"></span> চেক করা হচ্ছে...';
        },
        
        showPopup: function(type, message, daysRemaining) {
            var self = this;
            var lang = this.settings.language || 'bn';
            
            var iconMap = {
                'blacklist': '🚫',
                'cooldown': '⏱️',
                'error': '⚠️'
            };
            
            var titleMap = {
                bn: {
                    'blacklist': 'অর্ডার ব্লক করা হয়েছে',
                    'cooldown': 'অপেক্ষা করুন',
                    'error': 'সমস্যা হয়েছে'
                },
                en: {
                    'blacklist': 'Order Blocked',
                    'cooldown': 'Please Wait',
                    'error': 'Error Occurred'
                }
            };
            
            var buttonText = lang === 'en' ? 'OK' : 'ঠিক আছে';
            var daysText = lang === 'en' ? ' days remaining' : ' দিন বাকি';
            
            var html = 
                '<div class="fraud-popup-overlay" id="fraudPopup">' +
                    '<div class="fraud-popup-modal">' +
                        '<div class="fraud-popup-icon ' + type + '">' +
                            (iconMap[type] || '⚠️') +
                        '</div>' +
                        '<h3 class="fraud-popup-title">' + (titleMap[lang][type] || titleMap[lang]['error']) + '</h3>' +
                        '<p class="fraud-popup-message">' + (message || '') + '</p>' +
                        (daysRemaining ? '<p class="fraud-popup-days">' + daysRemaining + daysText + '</p>' : '') +
                        '<button class="fraud-popup-button" id="fraudPopupClose">' +
                            buttonText +
                        '</button>' +
                    '</div>' +
                '</div>';
            
            // Remove existing popup
            $('#fraudPopup').remove();
            
            // Add new popup
            $('body').append(html);
            
            // Bind close event
            $('#fraudPopupClose').on('click', function() {
                $('#fraudPopup').remove();
            });
            
            // Close on overlay click
            $('#fraudPopup').on('click', function(e) {
                if (e.target === this) {
                    $(this).remove();
                }
            });
            
            // Close on ESC key
            $(document).on('keydown.fraudPopup', function(e) {
                if (e.keyCode === 27) {
                    $('#fraudPopup').remove();
                    $(document).off('keydown.fraudPopup');
                }
            });
        },
        
        resetButton: function($button, originalHTML) {
            $button.prop('disabled', false);
            $button.html(originalHTML);
        }
    };
    
    // Initialize when document ready
    $(document).ready(function() {
        FraudProtection.init();
    });
    
})(jQuery);
`;
};

export const generateAdminJS = (): string => {
  return `/**
 * Fraud Protection BD - Admin Scripts
 * Version: 1.0.0
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Test API Connection
        $('#test-api-btn').on('click', function() {
            var $btn = $(this);
            var $result = $('#api-test-result');
            
            $btn.prop('disabled', true).text('Testing...');
            $result.removeClass('success error').text('');
            
            $.ajax({
                url: fraudProtectionAdmin.ajaxUrl,
                method: 'POST',
                data: {
                    action: 'fraud_protection_test_api',
                    nonce: fraudProtectionAdmin.nonce
                },
                success: function(response) {
                    if (response.success) {
                        $result.addClass('success').text(response.data.message);
                    } else {
                        $result.addClass('error').text(response.data.message || 'Connection failed');
                    }
                },
                error: function() {
                    $result.addClass('error').text('Network error');
                },
                complete: function() {
                    $btn.prop('disabled', false).text('টেস্ট করুন');
                }
            });
        });
        
        // Copy API Key
        $('#api_key').on('click', function() {
            $(this).select();
        });
    });
    
})(jQuery);
`;
};

export const generateReadme = (): string => {
  return `=== Fraud Protection BD ===
Contributors: webcreationbd
Tags: woocommerce, fraud, protection, order limiter, anti-fraud, bangladesh
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Order Limiter & Anti-Fraud System for WooCommerce - ফেক অর্ডার ও প্রতারণা থেকে আপনার WooCommerce সাইটকে সুরক্ষা দিন।

== Description ==

Fraud Protection BD হলো একটি শক্তিশালী WooCommerce প্লাগইন যা আপনার অনলাইন স্টোরকে ফেক অর্ডার, স্প্যাম এবং প্রতারণা থেকে রক্ষা করে।

= মূল বৈশিষ্ট্য =

* **স্মার্ট অর্ডার লিমিটার** - একই ফোন নম্বর থেকে বারবার অর্ডার ব্লক করুন
* **ডিভাইস ফিঙ্গারপ্রিন্টিং** - ব্রাউজার পরিবর্তন করলেও ডিটেক্ট করে
* **ব্ল্যাকলিস্ট সিস্টেম** - নির্দিষ্ট ফোন নম্বর স্থায়ীভাবে ব্লক করুন
* **কুলডাউন পিরিয়ড** - কাস্টম অপেক্ষা সময় সেট করুন
* **সুন্দর পপআপ** - ব্লক হলে আধুনিক ডিজাইনের পপআপ দেখায়
* **বাংলা/ইংরেজি** - দুই ভাষায় মেসেজ সাপোর্ট

= কিভাবে কাজ করে? =

1. কাস্টমার চেকআউটে যায়
2. "Place Order" বাটনে ক্লিক করে
3. প্লাগইন API-তে চেক করে
4. অনুমতি থাকলে অর্ডার হয়
5. না থাকলে সুন্দর পপআপ দেখায়

= প্রয়োজনীয়তা =

* WordPress 5.0 বা তার বেশি
* WooCommerce 4.0 বা তার বেশি
* PHP 7.4 বা তার বেশি
* একটি বৈধ API Key (Dashboard থেকে পাবেন)

== Installation ==

= অটোমেটিক ইন্সটলেশন =

1. WordPress Dashboard-এ যান
2. Plugins → Add New → Upload Plugin
3. ZIP ফাইল আপলোড করুন
4. "Install Now" ক্লিক করুন
5. "Activate" ক্লিক করুন

= ম্যানুয়াল ইন্সটলেশন =

1. ZIP ফাইল আনজিপ করুন
2. \`fraud-protection-bd\` ফোল্ডারটি \`/wp-content/plugins/\` এ আপলোড করুন
3. Plugins মেনু থেকে প্লাগইনটি একটিভ করুন

= কনফিগারেশন =

1. WordPress Dashboard → Fraud Protection এ যান
2. আপনার API Key পেস্ট করুন
3. "Test Connection" দিয়ে চেক করুন
4. Settings সেভ করুন

== Frequently Asked Questions ==

= API Key কোথায় পাবো? =

Fraud Protection Dashboard (webcreation-bd.lovable.app) এ লগইন করে Settings থেকে API Key কপি করুন।

= WooCommerce ছাড়া কি কাজ করবে? =

না, এই প্লাগইনটি শুধুমাত্র WooCommerce এর সাথে কাজ করে।

= API Error হলে কি হবে? =

প্লাগইনটি "fail-open" মোডে কাজ করে - অর্থাৎ API error হলে অর্ডার এলাউ হবে, যাতে বিক্রি মিস না হয়।

== Screenshots ==

1. Admin Settings Page
2. Block Popup (Bengali)
3. Cooldown Popup
4. Dashboard Integration

== Changelog ==

= 1.0.0 =
* Initial release
* Order limiting by phone number
* Device fingerprinting
* Blacklist system
* Beautiful popup notifications
* Bengali/English language support

== Upgrade Notice ==

= 1.0.0 =
Initial release - Install and configure your API key to get started.
`;
};

export const generatePluginZip = async (apiKey: string): Promise<Blob> => {
  const zip = new JSZip();
  
  // Create folder structure
  const plugin = zip.folder('fraud-protection-bd');
  if (!plugin) throw new Error('Failed to create plugin folder');
  
  const includes = plugin.folder('includes');
  const assets = plugin.folder('assets');
  const css = assets?.folder('css');
  const js = assets?.folder('js');
  const templates = plugin.folder('templates');
  
  // Add main plugin file
  plugin.file('fraud-protection-bd.php', generateMainPluginFile(apiKey));
  
  // Add CSS files
  css?.file('admin-style.css', generateAdminCSS());
  css?.file('popup-style.css', generatePopupCSS());
  
  // Add JS files
  js?.file('checkout-handler.js', generateCheckoutHandlerJS());
  js?.file('admin.js', generateAdminJS());
  
  // Add templates
  templates?.file('admin-settings.php', generateAdminSettingsTemplate());
  
  // Add readme
  plugin.file('readme.txt', generateReadme());
  
  // Generate ZIP blob
  const blob = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  
  return blob;
};

export const downloadPluginZip = async (apiKey: string): Promise<void> => {
  const blob = await generatePluginZip(apiKey);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fraud-protection-bd.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
