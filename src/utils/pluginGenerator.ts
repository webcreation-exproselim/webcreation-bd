const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const FRAUD_GUARD_URL = 'https://webcreation-bd.lovable.app/fraud-guard';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';

export const generateMainPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders with Domain Binding Security
 * Version: 3.2.0
 * Author: WebCreation BD
 * Author URI: https://webcreation-bd.lovable.app
 * Text Domain: wcbd-fraud-guard
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_FRAUD_GUARD_VERSION', '3.2.0');
define('WCBD_FRAUD_GUARD_PATH', plugin_dir_path(__FILE__));
define('WCBD_FRAUD_GUARD_URL', plugin_dir_url(__FILE__));

class WCBD_Fraud_Guard {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    private $fraud_guard_url = '${FRAUD_GUARD_URL}';
    private $dashboard_url = '${DASHBOARD_URL}';
    private $whatsapp_default = '${WHATSAPP_DEFAULT}';
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
        
        // Set default options on activation
        register_activation_hook(__FILE__, array($this, 'set_default_options'));
    }
    
    public function set_default_options() {
        add_option('wcbd_fraud_guard_popup_timer', '30');
        add_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
        add_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।');
        add_option('wcbd_fraud_guard_whatsapp', $this->whatsapp_default);
        add_option('wcbd_fraud_guard_phone', $this->whatsapp_default);
        add_option('wcbd_fraud_guard_show_contact', '1');
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
        .fraud-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.9);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fraudFadeIn 0.3s ease}
        .fraud-popup-modal{background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 30px;max-width:420px;width:100%;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.5);animation:fraudScaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
        .fraud-popup-icon{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:38px}
        .fraud-popup-icon.blocked{background:linear-gradient(135deg,#ff4757,#c0392b)}
        .fraud-popup-icon.cooldown{background:linear-gradient(135deg,#ffa502,#e67e22)}
        .fraud-popup-title{font-size:22px;font-weight:700;color:#fff;margin:0 0 12px}
        .fraud-popup-message{font-size:15px;color:#a0a0a0;line-height:1.6;margin:0 0 20px}
        .fraud-popup-time{font-size:26px;font-weight:700;color:#00d4ff;margin:0 0 20px}
        .fraud-popup-contact-box{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;margin:0 0 20px}
        .fraud-popup-contact-title{font-size:14px;color:#fff;margin:0 0 12px;font-weight:600}
        .fraud-popup-contact{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
        .fraud-popup-whatsapp{background:linear-gradient(135deg,#25D366,#128C7E);padding:12px 24px;border-radius:12px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;transition:transform 0.2s}
        .fraud-popup-whatsapp:hover{transform:scale(1.05);color:#fff}
        .fraud-popup-phone{background:linear-gradient(135deg,#00d4ff,#0099cc);padding:12px 24px;border-radius:12px;color:#fff;text-decoration:none;font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:8px;transition:transform 0.2s}
        .fraud-popup-phone:hover{transform:scale(1.05);color:#fff}
        .fraud-popup-button{padding:14px 50px;border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#fff;transition:transform 0.2s}
        .fraud-popup-button:hover{transform:scale(1.05)}
        .fraud-popup-countdown{font-size:13px;color:#888;margin-left:5px}
        @keyframes fraudFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes fraudScaleIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
        ';
    }
    
    private function get_checkout_js() {
        \$api_key = get_option('wcbd_fraud_guard_api_key', \$this->api_key);
        \$language = get_option('wcbd_fraud_guard_language', 'bn');
        \$popup_timer = intval(get_option('wcbd_fraud_guard_popup_timer', 30));
        \$msg_cooldown = esc_js(get_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'));
        \$msg_blacklist = esc_js(get_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।'));
        \$whatsapp = esc_js(get_option('wcbd_fraud_guard_whatsapp', ''));
        \$phone = esc_js(get_option('wcbd_fraud_guard_phone', ''));
        \$show_contact = get_option('wcbd_fraud_guard_show_contact', '1');
        
        return \"
        (function(jQ) {
            var FG = {
                deviceId: null,
                endpoint: '{\$this->endpoint}',
                apiKey: '{\$api_key}',
                lang: '{\$language}',
                popupTimer: {\$popup_timer},
                msgCooldown: '{\$msg_cooldown}',
                msgBlacklist: '{\$msg_blacklist}',
                whatsapp: '{\$whatsapp}',
                phone: '{\$phone}',
                showContact: '{\$show_contact}' === '1',
                
                init: function() {
                    var self = this;
                    if (typeof FingerprintJS !== 'undefined') {
                        FingerprintJS.load().then(function(fp) {
                            fp.get().then(function(r) { self.deviceId = r.visitorId; });
                        });
                    }
                    jQ('form.checkout').on('checkout_place_order', function() { return self.validate(jQ(this)); });
                },
                
                validate: function(f) {
                    var self = this;
                    var phone = jQ('#billing_phone').val();
                    var btn = f.find('button[type=submit]');
                    
                    btn.prop('disabled', true).data('txt', btn.text()).html(this.lang === 'bn' ? 'চেক করা হচ্ছে...' : 'Checking...');
                    
                    jQ.ajax({
                        url: this.endpoint,
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({api_key: this.apiKey, phone: phone, device_id: this.deviceId, domain: window.location.hostname}),
                        success: function(r) {
                            if (r.allowed) {
                                f.off('checkout_place_order').submit();
                            } else {
                                var customMsg = r.reason === 'blacklist' ? self.msgBlacklist : self.msgCooldown;
                                self.popup(r.reason, customMsg, r.minutes_remaining);
                                btn.prop('disabled', false).text(btn.data('txt'));
                            }
                        },
                        error: function() { f.off('checkout_place_order').submit(); }
                    });
                    return false;
                },
                
                formatTime: function(minutes) {
                    if (minutes < 60) return minutes + (this.lang === 'bn' ? ' মিনিট' : ' minute(s)');
                    var hours = Math.floor(minutes / 60);
                    var mins = minutes % 60;
                    if (minutes < 1440) {
                        var hourStr = hours + (this.lang === 'bn' ? ' ঘন্টা' : ' hour(s)');
                        var minStr = mins > 0 ? ' ' + mins + (this.lang === 'bn' ? ' মিনিট' : ' min') : '';
                        return hourStr + minStr;
                    }
                    var days = Math.floor(minutes / 1440);
                    var remainingHours = Math.floor((minutes % 1440) / 60);
                    var dayStr = days + (this.lang === 'bn' ? ' দিন' : ' day(s)');
                    var hourStr = remainingHours > 0 ? ' ' + remainingHours + (this.lang === 'bn' ? ' ঘন্টা' : ' hr') : '';
                    return dayStr + hourStr;
                },
                
                popup: function(type, msg, mins) {
                    var self = this;
                    var icons = {blacklist: '🚫', cooldown: '⏱️'};
                    var titles = this.lang === 'bn' 
                        ? {blacklist: 'অর্ডার ব্লক করা হয়েছে', cooldown: 'অপেক্ষা করুন'}
                        : {blacklist: 'Order Blocked', cooldown: 'Please Wait'};
                    
                    var timeDisplay = mins ? '<p class=\\\"fraud-popup-time\\\">⏰ ' + this.formatTime(mins) + ' ' + (this.lang === 'bn' ? 'বাকি' : 'remaining') + '</p>' : '';
                    
                    // Contact section
                    var contactHtml = '';
                    if (this.showContact && (this.whatsapp || this.phone)) {
                        contactHtml = '<div class=\\\"fraud-popup-contact-box\\\">' +
                            '<p class=\\\"fraud-popup-contact-title\\\">' + (this.lang === 'bn' ? '📞 সমস্যা হলে যোগাযোগ করুন' : '📞 Contact Us') + '</p>' +
                            '<div class=\\\"fraud-popup-contact\\\">';
                        
                        if (this.whatsapp) {
                            var waNum = this.whatsapp.replace(/\\\\D/g, '');
                            contactHtml += '<a href=\\\"https://wa.me/' + waNum + '\\\" target=\\\"_blank\\\" class=\\\"fraud-popup-whatsapp\\\">💬 WhatsApp</a>';
                        }
                        if (this.phone) {
                            contactHtml += '<a href=\\\"tel:' + this.phone + '\\\" class=\\\"fraud-popup-phone\\\">📱 ' + (this.lang === 'bn' ? 'ফোন করুন' : 'Call') + '</a>';
                        }
                        
                        contactHtml += '</div></div>';
                    }
                    
                    // Timer countdown
                    var timerHtml = this.popupTimer > 0 ? '<span class=\\\"fraud-popup-countdown\\\">(' + this.popupTimer + 's)</span>' : '';
                    var btnText = this.lang === 'bn' ? 'ঠিক আছে' : 'OK';
                    
                    var html = '<div class=\\\"fraud-popup-overlay\\\" id=\\\"fraudPopup\\\">' +
                        '<div class=\\\"fraud-popup-modal\\\">' +
                        '<div class=\\\"fraud-popup-icon ' + type + '\\\">' + (icons[type] || '⚠️') + '</div>' +
                        '<h3 class=\\\"fraud-popup-title\\\">' + (titles[type] || 'Error') + '</h3>' +
                        '<p class=\\\"fraud-popup-message\\\">' + msg + '</p>' +
                        timeDisplay +
                        contactHtml +
                        '<button class=\\\"fraud-popup-button\\\" id=\\\"fraudPopupBtn\\\">' + btnText + ' ' + timerHtml + '</button>' +
                        '</div></div>';
                    
                    jQ('body').append(html);
                    
                    // Button click handler
                    jQ('#fraudPopupBtn').on('click', function() {
                        jQ('#fraudPopup').remove();
                    });
                    
                    // Timer countdown
                    if (this.popupTimer > 0) {
                        var countdown = this.popupTimer;
                        var interval = setInterval(function() {
                            countdown--;
                            jQ('#fraudPopupBtn .fraud-popup-countdown').text('(' + countdown + 's)');
                            if (countdown <= 0) {
                                clearInterval(interval);
                                jQ('#fraudPopup').remove();
                            }
                        }, 1000);
                    }
                }
            };
            jQ(function() { FG.init(); });
        })(jQuery);
        \";
    }
    
    private function get_admin_css() {
        return '
        .fraud-wrap{max-width:900px;margin:20px 0}
        .fraud-header{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:30px;border-radius:16px;margin-bottom:25px;display:flex;align-items:center;gap:20px}
        .fraud-header-logo{width:60px;height:60px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);object-fit:cover}
        .fraud-header-text h1{color:#fff;font-size:26px;margin:0 0 5px;display:flex;align-items:center;gap:10px}
        .fraud-header-text p{margin:0;opacity:0.9;font-size:14px}
        .fraud-header-text .version{background:rgba(255,255,255,0.2);padding:2px 10px;border-radius:20px;font-size:12px;margin-left:10px}
        .fraud-card{background:#fff;border:1px solid #e0e0e0;border-radius:16px;padding:25px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
        .fraud-card h2{margin:0 0 20px;padding:0 0 15px;border-bottom:1px solid #eee;font-size:17px;display:flex;align-items:center;gap:8px}
        .fraud-toggle{display:flex;align-items:center;gap:12px;cursor:pointer}
        .fraud-toggle input{display:none}
        .fraud-toggle-slider{width:50px;height:26px;background:#ccc;border-radius:26px;position:relative;transition:0.3s}
        .fraud-toggle-slider::before{content:\\'\\';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:3px;left:3px;transition:0.3s}
        .fraud-toggle input:checked+.fraud-toggle-slider{background:#0891b2}
        .fraud-toggle input:checked+.fraud-toggle-slider::before{transform:translateX(24px)}
        .api-result{margin-left:10px;font-weight:500}
        .api-result.success{color:#00a32a}
        .api-result.error{color:#d63638}
        .fraud-about{background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:16px;padding:25px;margin-top:25px}
        .fraud-about-header{display:flex;align-items:center;gap:15px;margin-bottom:15px}
        .fraud-about-logo{width:50px;height:50px;border-radius:50%;border:2px solid #0891b2}
        .fraud-about-text h3{margin:0 0 3px;font-size:16px}
        .fraud-about-text p{margin:0;color:#666;font-size:13px}
        .fraud-about-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
        .fraud-about-links a{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;transition:transform 0.2s}
        .fraud-about-links a:hover{transform:translateY(-2px)}
        .fraud-about-links .link-info{background:#0891b2;color:#fff}
        .fraud-about-links .link-whatsapp{background:#25D366;color:#fff}
        ';
    }
    
    private function get_admin_js() {
        \$nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        return \"
        jQuery(function(jQ) {
            jQ('#test-api-btn').on('click', function() {
                var btn = jQ(this);
                var result = jQ('#api-result');
                btn.prop('disabled', true).text('Testing...');
                result.removeClass('success error').text('');
                
                jQ.post(ajaxurl, {
                    action: 'wcbd_fraud_guard_test_api',
                    nonce: '\" . \$nonce . \"'
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
        \";
    }
    
    public function render_settings_page() {
        $api_key = get_option('wcbd_fraud_guard_api_key', $this->api_key);
        $enabled = get_option('wcbd_fraud_guard_enabled', '1');
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        $popup_timer = get_option('wcbd_fraud_guard_popup_timer', '30');
        $msg_cooldown = get_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
        $msg_blacklist = get_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।');
        $whatsapp = get_option('wcbd_fraud_guard_whatsapp', '');
        $phone = get_option('wcbd_fraud_guard_phone', '');
        $show_contact = get_option('wcbd_fraud_guard_show_contact', '1');
        ?>
        <div class="wrap fraud-wrap">
            <div class="fraud-header">
                <img src="<?php echo esc_url($this->logo_url); ?>" class="fraud-header-logo" alt="Logo">
                <div class="fraud-header-text">
                    <h1>
                        <span class="dashicons dashicons-shield"></span> 
                        WCBD Fraud Guard 
                        <span class="version">v3.0</span>
                    </h1>
                    <p>Developed by WebCreation BD • Protect your WooCommerce store from fake orders</p>
                </div>
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
                                <p class="description">Get your API key from your <a href="<?php echo esc_url($this->dashboard_url); ?>" target="_blank">dashboard</a></p>
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
                    <h2>⏱️ Timer Settings</h2>
                    <table class="form-table">
                        <tr>
                            <th><label for="popup_timer">Popup Auto-close Timer</label></th>
                            <td>
                                <input type="number" id="popup_timer" name="popup_timer" value="<?php echo esc_attr($popup_timer); ?>" min="0" max="120" style="width:80px"> seconds
                                <p class="description">Set to 0 to disable auto-close (user must click OK manually). Default: 30 seconds</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="fraud-card">
                    <h2>💬 Custom Messages</h2>
                    <table class="form-table">
                        <tr>
                            <th><label for="msg_cooldown">Cooldown Message</label></th>
                            <td>
                                <textarea id="msg_cooldown" name="msg_cooldown" rows="2" class="large-text"><?php echo esc_textarea($msg_cooldown); ?></textarea>
                                <p class="description">Message shown when customer is in cooldown period (recently ordered)</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="msg_blacklist">Blacklist Message</label></th>
                            <td>
                                <textarea id="msg_blacklist" name="msg_blacklist" rows="2" class="large-text"><?php echo esc_textarea($msg_blacklist); ?></textarea>
                                <p class="description">Message shown when customer is blacklisted</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div class="fraud-card">
                    <h2>📞 Contact Information</h2>
                    <table class="form-table">
                        <tr>
                            <th><label for="whatsapp">WhatsApp Number</label></th>
                            <td>
                                <input type="text" id="whatsapp" name="whatsapp" value="<?php echo esc_attr($whatsapp); ?>" class="regular-text" placeholder="+8801XXXXXXXXX">
                                <p class="description">WhatsApp number for customers to contact (with country code)</p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="phone">Phone Number</label></th>
                            <td>
                                <input type="text" id="phone" name="phone" value="<?php echo esc_attr($phone); ?>" class="regular-text" placeholder="+8801XXXXXXXXX">
                                <p class="description">Phone number for customers to call</p>
                            </td>
                        </tr>
                        <tr>
                            <th>Show Contact in Popup</th>
                            <td>
                                <label class="fraud-toggle">
                                    <input type="checkbox" name="show_contact" value="1" <?php checked($show_contact, '1'); ?>>
                                    <span class="fraud-toggle-slider"></span>
                                    <span>Display contact buttons in block popup</span>
                                </label>
                                <p class="description">When enabled, WhatsApp and Phone buttons will appear in the blocked popup</p>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <p class="submit"><button type="submit" class="button button-primary button-hero">💾 Save Settings</button></p>
            </form>
            
            <div class="fraud-about">
                <div class="fraud-about-header">
                    <img src="<?php echo esc_url($this->logo_url); ?>" class="fraud-about-logo" alt="Logo">
                    <div class="fraud-about-text">
                        <h3>WebCreation BD</h3>
                        <p>Best Digital Marketing Agency in Bangladesh</p>
                    </div>
                </div>
                <div class="fraud-about-links">
                    <a href="<?php echo esc_url($this->fraud_guard_url); ?>" target="_blank" class="link-info">
                        ℹ️ বিস্তারিত জানুন
                    </a>
                    <a href="https://wa.me/8801332052874" target="_blank" class="link-whatsapp">
                        💬 WhatsApp-এ যোগাযোগ করুন
                    </a>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function save_settings() {
        if (!current_user_can('manage_options')) wp_die('Unauthorized');
        check_admin_referer('wcbd_fraud_guard_settings');
        
        update_option('wcbd_fraud_guard_api_key', sanitize_text_field($_POST['api_key']));
        update_option('wcbd_fraud_guard_enabled', isset($_POST['enabled']) ? '1' : '0');
        update_option('wcbd_fraud_guard_language', sanitize_text_field($_POST['language']));
        update_option('wcbd_fraud_guard_popup_timer', sanitize_text_field($_POST['popup_timer']));
        update_option('wcbd_fraud_guard_msg_cooldown', sanitize_textarea_field($_POST['msg_cooldown']));
        update_option('wcbd_fraud_guard_msg_blacklist', sanitize_textarea_field($_POST['msg_blacklist']));
        update_option('wcbd_fraud_guard_whatsapp', sanitize_text_field($_POST['whatsapp']));
        update_option('wcbd_fraud_guard_phone', sanitize_text_field($_POST['phone']));
        update_option('wcbd_fraud_guard_show_contact', isset($_POST['show_contact']) ? '1' : '0');
        
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

export const downloadPluginFile = async (apiKey: string): Promise<void> => {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  
  // Create plugin folder structure: wcbd-fraud-guard/wcbd-fraud-guard.php
  const pluginFolder = zip.folder('wcbd-fraud-guard');
  const content = generateMainPluginFile(apiKey);
  pluginFolder?.file('wcbd-fraud-guard.php', content);
  
  // Generate ZIP blob
  const blob = await zip.generateAsync({ type: 'blob' });
  
  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wcbd-fraud-guard-plugin.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
