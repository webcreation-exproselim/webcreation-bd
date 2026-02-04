const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';

export const generateMainPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders
 * Version: 2.0.0
 * Author: WebCreation BD
 * Text Domain: wcbd-fraud-guard
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_FRAUD_GUARD_VERSION', '2.0.0');
define('WCBD_FRAUD_GUARD_PATH', plugin_dir_path(__FILE__));
define('WCBD_FRAUD_GUARD_URL', plugin_dir_url(__FILE__));

class WCBD_Fraud_Guard {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
    }
    
    public function check_woocommerce() {
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', function() {
                echo '<div class="error"><p><strong>WCBD Fraud Guard</strong> requires WooCommerce to be installed and activated.</p></div>';
            });
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'WCBD Fraud Guard',
            'Fraud Guard',
            'manage_options',
            'wcbd-fraud-guard',
            array($this, 'render_settings_page'),
            'dashicons-shield',
            56
        );
    }
    
    public function enqueue_frontend_scripts() {
        if (!is_checkout()) return;
        
        $enabled = get_option('wcbd_fraud_guard_enabled', '1');
        if ($enabled !== '1') return;
        
        wp_enqueue_script('fingerprintjs', 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js', array(), '3.0.0', true);
        
        wp_add_inline_style('woocommerce-general', $this->get_popup_css());
        
        wp_add_inline_script('fingerprintjs', $this->get_checkout_js(), 'after');
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_wcbd-fraud-guard') return;
        
        wp_add_inline_style('wp-admin', $this->get_admin_css());
        wp_add_inline_script('jquery', $this->get_admin_js(), 'after');
    }
    
    private function get_popup_css() {
        return '
        .fraud-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fraudFadeIn 0.3s ease}
        .fraud-popup-modal{background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 35px;max-width:420px;width:100%;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.5);animation:fraudScaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
        .fraud-popup-icon{width:90px;height:90px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:42px}
        .fraud-popup-icon.blocked{background:linear-gradient(135deg,#ff4757,#c0392b)}
        .fraud-popup-icon.cooldown{background:linear-gradient(135deg,#ffa502,#e67e22)}
        .fraud-popup-title{font-size:24px;font-weight:700;color:#fff;margin:0 0 12px}
        .fraud-popup-message{font-size:16px;color:#a0a0a0;line-height:1.6;margin:0 0 24px}
        .fraud-popup-time{font-size:28px;font-weight:700;color:#00d4ff;margin:0 0 24px}
        .fraud-popup-button{padding:14px 50px;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#fff;transition:transform 0.2s}
        .fraud-popup-button:hover{transform:scale(1.05)}
        @keyframes fraudFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fraudScaleIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        ';
    }
    
    private function get_checkout_js() {
        $api_key = get_option('wcbd_fraud_guard_api_key', $this->api_key);
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        
        return "
        (function($) {
            var FG = {
                deviceId: null,
                endpoint: '{$this->endpoint}',
                apiKey: '{$api_key}',
                lang: '{$language}',
                
                init: function() {
                    var self = this;
                    if (typeof FingerprintJS !== 'undefined') {
                        FingerprintJS.load().then(function(fp) {
                            fp.get().then(function(r) { self.deviceId = r.visitorId; });
                        });
                    }
                    $('form.checkout').on('checkout_place_order', function() { return self.validate($(this)); });
                },
                
                validate: function(f) {
                    var self = this;
                    var phone = $('#billing_phone').val();
                    var btn = f.find('button[type=submit]');
                    
                    btn.prop('disabled', true).data('txt', btn.text()).html(this.lang === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...');
                    
                    $.ajax({
                        url: this.endpoint,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({api_key: this.apiKey, phone: phone, device_id: this.deviceId}),
                        success: function(r) {
                            if (r.allowed) {
                                f.off('checkout_place_order').submit();
                            } else {
                                self.popup(r.reason, r.message, r.minutes_remaining);
                                btn.prop('disabled', false).text(btn.data('txt'));
                            }
                        },
                        error: function() { f.off('checkout_place_order').submit(); }
                    });
                    return false;
                },
                
                formatTime: function(minutes) {
                    if (minutes < 60) return minutes + (this.lang === 'bn' ? ' মিনিট' : ' minute(s)');
                    if (minutes < 1440) return Math.round(minutes / 60) + (this.lang === 'bn' ? ' ঘন্টা' : ' hour(s)');
                    return Math.round(minutes / 1440) + (this.lang === 'bn' ? ' দিন' : ' day(s)');
                },
                
                popup: function(type, msg, mins) {
                    var icons = {blacklist: '🚫', cooldown: '⏱️'};
                    var titles = this.lang === 'bn' 
                        ? {blacklist: 'অর্ডার ব্লক করা হয়েছে', cooldown: 'অপেক্ষা করুন'}
                        : {blacklist: 'Order Blocked', cooldown: 'Please Wait'};
                    
                    var timeDisplay = mins ? '<p class=\"fraud-popup-time\">' + this.formatTime(mins) + ' ' + (this.lang === 'bn' ? 'বাকি' : 'remaining') + '</p>' : '';
                    
                    var html = '<div class=\"fraud-popup-overlay\" id=\"fraudPopup\">' +
                        '<div class=\"fraud-popup-modal\">' +
                        '<div class=\"fraud-popup-icon ' + type + '\">' + (icons[type] || '⚠️') + '</div>' +
                        '<h3 class=\"fraud-popup-title\">' + (titles[type] || 'Error') + '</h3>' +
                        '<p class=\"fraud-popup-message\">' + msg + '</p>' +
                        timeDisplay +
                        '<button class=\"fraud-popup-button\" onclick=\"document.getElementById(\\'fraudPopup\\').remove()\">' + (this.lang === 'bn' ? 'ঠিক আছে' : 'OK') + '</button>' +
                        '</div></div>';
                    $('body').append(html);
                }
            };
            $(function() { FG.init(); });
        })(jQuery);
        ";
    }
    
    private function get_admin_css() {
        return '
        .fraud-wrap{max-width:800px;margin:20px 0}
        .fraud-header{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:30px;border-radius:12px;margin-bottom:20px}
        .fraud-header h1{color:#fff;font-size:28px;margin:0 0 10px;display:flex;align-items:center;gap:10px}
        .fraud-header .dashicons{font-size:32px;width:32px;height:32px;color:#fff}
        .fraud-card{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:25px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
        .fraud-card h2{margin:0 0 20px;padding:0 0 15px;border-bottom:1px solid #eee;font-size:18px}
        .fraud-toggle{display:flex;align-items:center;gap:12px;cursor:pointer}
        .fraud-toggle input{display:none}
        .fraud-toggle-slider{width:50px;height:26px;background:#ccc;border-radius:26px;position:relative;transition:0.3s}
        .fraud-toggle-slider::before{content:\\'\\';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:3px;left:3px;transition:0.3s}
        .fraud-toggle input:checked+.fraud-toggle-slider{background:#0891b2}
        .fraud-toggle input:checked+.fraud-toggle-slider::before{transform:translateX(24px)}
        .api-result{margin-left:10px;font-weight:500}
        .api-result.success{color:#00a32a}
        .api-result.error{color:#d63638}
        ';
    }
    
    private function get_admin_js() {
        return "
        jQuery(function($) {
            $('#test-api-btn').on('click', function() {
                var btn = $(this);
                var result = $('#api-result');
                btn.prop('disabled', true).text('Testing...');
                result.removeClass('success error').text('');
                
                $.post(ajaxurl, {
                    action: 'wcbd_fraud_guard_test_api',
                    nonce: '" . wp_create_nonce('wcbd_fraud_guard_nonce') . "'
                }, function(r) {
                    btn.prop('disabled', false).text('Test');
                    if (r.success) {
                        result.addClass('success').text(r.data.message);
                    } else {
                        result.addClass('error').text(r.data.message);
                    }
                });
            });
        });
        ";
    }
    
    public function render_settings_page() {
        $api_key = get_option('wcbd_fraud_guard_api_key', $this->api_key);
        $enabled = get_option('wcbd_fraud_guard_enabled', '1');
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        ?>
        <div class="wrap fraud-wrap">
            <div class="fraud-header">
                <h1><span class="dashicons dashicons-shield"></span> WCBD Fraud Guard</h1>
                <p>Protect your WooCommerce store from fake and repeat orders</p>
            </div>
            
            <?php if (isset($_GET['saved'])): ?>
                <div class="notice notice-success is-dismissible"><p>Settings saved successfully!</p></div>
            <?php endif; ?>
            
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                <input type="hidden" name="action" value="wcbd_fraud_guard_save_settings">
                <?php wp_nonce_field('wcbd_fraud_guard_settings'); ?>
                
                <div class="fraud-card">
                    <h2>🔑 API Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th><label for="api_key">API Key</label></th>
                            <td>
                                <input type="text" id="api_key" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text code">
                                <button type="button" id="test-api-btn" class="button">Test Connection</button>
                                <span id="api-result" class="api-result"></span>
                                <p class="description">Get your API key from your <a href="https://webcreation-bd.lovable.app/dashboard" target="_blank">dashboard</a></p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="fraud-card">
                    <h2>⚙️ General Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th>Protection Status</th>
                            <td>
                                <label class="fraud-toggle">
                                    <input type="checkbox" name="enabled" value="1" <?php checked($enabled, '1'); ?>>
                                    <span class="fraud-toggle-slider"></span>
                                    <span>Enable Fraud Protection</span>
                                </label>
                                <p class="description">When enabled, all checkout orders will be validated against your fraud rules</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Popup Language</th>
                            <td>
                                <label style="margin-right:20px"><input type="radio" name="language" value="bn" <?php checked($language, 'bn'); ?>> বাংলা (Bengali)</label>
                                <label><input type="radio" name="language" value="en" <?php checked($language, 'en'); ?>> English</label>
                                <p class="description">Language for customer-facing popup messages</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="fraud-card">
                    <h2>ℹ️ How It Works</h2>
                    <ol style="line-height:1.8">
                        <li>Customer attempts to checkout</li>
                        <li>Plugin sends phone, IP, and device fingerprint to our API</li>
                        <li>API checks against your blacklist and cooldown settings</li>
                        <li>If blocked, customer sees a professional popup message</li>
                        <li>If allowed, order proceeds normally</li>
                    </ol>
                    <p><strong>Note:</strong> Cooldown period and blacklist are managed from your <a href="https://webcreation-bd.lovable.app/fraud-protection" target="_blank">online dashboard</a></p>
                </div>
                
                <p class="submit"><button type="submit" class="button button-primary button-hero">💾 Save Settings</button></p>
            </form>
        </div>
        <?php
    }
    
    public function save_settings() {
        if (!current_user_can('manage_options')) wp_die('Unauthorized');
        check_admin_referer('wcbd_fraud_guard_settings');
        
        update_option('wcbd_fraud_guard_api_key', sanitize_text_field($_POST['api_key']));
        update_option('wcbd_fraud_guard_enabled', isset($_POST['enabled']) ? '1' : '0');
        update_option('wcbd_fraud_guard_language', sanitize_text_field($_POST['language']));
        
        wp_redirect(admin_url('admin.php?page=wcbd-fraud-guard&saved=1'));
        exit;
    }
    
    public function test_api_connection() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $response = wp_remote_post($this->endpoint, array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array('api_key' => get_option('wcbd_fraud_guard_api_key', $this->api_key), 'phone' => '01700000000', 'device_id' => 'test')),
            'timeout' => 15
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error(array('message' => 'Connection failed: ' . $response->get_error_message()));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if (isset($body['error'])) {
            if (strpos($body['error'], 'Invalid API key') !== false) {
                wp_send_json_error(array('message' => 'Invalid API Key'));
            } elseif (strpos($body['error'], 'Account not activated') !== false) {
                wp_send_json_error(array('message' => 'Account not activated. Please purchase a subscription.'));
            } elseif (strpos($body['error'], 'Subscription expired') !== false) {
                wp_send_json_error(array('message' => 'Subscription expired. Please renew.'));
            } else {
                wp_send_json_error(array('message' => $body['error']));
            }
        }
        
        wp_send_json_success(array('message' => '✅ Connected Successfully!'));
    }
}

new WCBD_Fraud_Guard();
`;
};

export const downloadPluginFile = (apiKey: string): void => {
  const content = generateMainPluginFile(apiKey);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wcbd-fraud-guard.php';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};