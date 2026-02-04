const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';

export const generateMainPluginFile = (apiKey: string): string => {
  // Use single quotes and proper escaping to avoid PHP variable interpolation issues
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders with Domain Binding Security
 * Version: 3.3.0
 * Author: WebCreation BD
 * Author URI: https://webcreation-bd.lovable.app
 * Text Domain: wcbd-fraud-guard
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_FRAUD_GUARD_VERSION', '3.3.0');
define('WCBD_FRAUD_GUARD_PATH', plugin_dir_path(__FILE__));
define('WCBD_FRAUD_GUARD_URL', plugin_dir_url(__FILE__));

class WCBD_Fraud_Guard {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    private $dashboard_url = '${DASHBOARD_URL}';
    private $whatsapp_default = '${WHATSAPP_DEFAULT}';
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
        
        // Inject popup CSS directly in footer for maximum compatibility
        add_action('wp_footer', array($this, 'inject_popup_styles'), 99);
        
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
    
    public function inject_popup_styles() {
        if (!is_checkout()) return;
        $enabled = get_option('wcbd_fraud_guard_enabled', '1');
        if ($enabled !== '1') return;
        
        // Inject CSS directly in footer with maximum z-index and !important rules
        echo '<style id="wcbd-fraud-guard-popup-css">
.wcbd-fraud-popup-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.92)!important;backdrop-filter:blur(12px)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;box-sizing:border-box!important;margin:0!important;animation:wcbdFadeIn 0.3s ease!important}
.wcbd-fraud-popup-modal{background:linear-gradient(145deg,#1a1a2e,#16213e)!important;border:1px solid rgba(255,255,255,0.12)!important;border-radius:24px!important;padding:40px 30px!important;max-width:420px!important;width:100%!important;text-align:center!important;box-shadow:0 25px 60px rgba(0,0,0,0.6)!important;animation:wcbdScaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)!important;position:relative!important;box-sizing:border-box!important}
.wcbd-fraud-popup-icon{width:80px!important;height:80px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;margin:0 auto 20px!important;font-size:40px!important}
.wcbd-fraud-popup-icon.blocked{background:linear-gradient(135deg,#ff4757,#c0392b)!important}
.wcbd-fraud-popup-icon.cooldown{background:linear-gradient(135deg,#ffa502,#e67e22)!important}
.wcbd-fraud-popup-title{font-size:22px!important;font-weight:700!important;color:#fff!important;margin:0 0 12px!important;line-height:1.3!important}
.wcbd-fraud-popup-message{font-size:15px!important;color:#a0a0a0!important;line-height:1.7!important;margin:0 0 20px!important}
.wcbd-fraud-popup-time{font-size:28px!important;font-weight:700!important;color:#00d4ff!important;margin:0 0 20px!important}
.wcbd-fraud-popup-contact-box{background:rgba(255,255,255,0.06)!important;border:1px solid rgba(255,255,255,0.12)!important;border-radius:16px!important;padding:20px!important;margin:0 0 20px!important}
.wcbd-fraud-popup-contact-title{font-size:14px!important;color:#fff!important;margin:0 0 12px!important;font-weight:600!important}
.wcbd-fraud-popup-contact{display:flex!important;gap:10px!important;justify-content:center!important;flex-wrap:wrap!important}
.wcbd-fraud-popup-whatsapp{background:linear-gradient(135deg,#25D366,#128C7E)!important;padding:12px 24px!important;border-radius:12px!important;color:#fff!important;text-decoration:none!important;font-weight:600!important;font-size:14px!important;display:inline-flex!important;align-items:center!important;gap:8px!important;transition:transform 0.2s!important}
.wcbd-fraud-popup-whatsapp:hover{transform:scale(1.05)!important;color:#fff!important}
.wcbd-fraud-popup-phone{background:linear-gradient(135deg,#00d4ff,#0099cc)!important;padding:12px 24px!important;border-radius:12px!important;color:#fff!important;text-decoration:none!important;font-weight:600!important;font-size:14px!important;display:inline-flex!important;align-items:center!important;gap:8px!important;transition:transform 0.2s!important}
.wcbd-fraud-popup-phone:hover{transform:scale(1.05)!important;color:#fff!important}
.wcbd-fraud-popup-button{padding:14px 50px!important;border:none!important;border-radius:12px!important;font-size:16px!important;font-weight:600!important;cursor:pointer!important;background:linear-gradient(135deg,#00d4ff,#0099cc)!important;color:#fff!important;transition:transform 0.2s,box-shadow 0.2s!important;box-shadow:0 4px 15px rgba(0,212,255,0.3)!important}
.wcbd-fraud-popup-button:hover{transform:scale(1.05)!important;box-shadow:0 6px 20px rgba(0,212,255,0.4)!important}
.wcbd-fraud-popup-countdown{font-size:13px!important;color:#888!important;margin-left:5px!important}
@keyframes wcbdFadeIn{from{opacity:0}to{opacity:1}}
@keyframes wcbdScaleIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
</style>';
    }
    
    public function enqueue_frontend_scripts() {
        if (!is_checkout()) return;
        
        $enabled = get_option('wcbd_fraud_guard_enabled', '1');
        if ($enabled !== '1') return;
        
        wp_enqueue_script('fingerprintjs', 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js', array(), '3.0.0', true);
        
        wp_add_inline_script('fingerprintjs', $this->get_checkout_js(), 'after');
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_wcbd-fraud-guard') return;
        
        wp_add_inline_style('wp-admin', $this->get_admin_css());
        wp_add_inline_script('jquery', $this->get_admin_js(), 'after');
    }
    
    private function get_checkout_js() {
        $api_key = get_option('wcbd_fraud_guard_api_key', $this->api_key);
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        $popup_timer = intval(get_option('wcbd_fraud_guard_popup_timer', 30));
        $msg_cooldown = esc_js(get_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'));
        $msg_blacklist = esc_js(get_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।'));
        $whatsapp = esc_js(get_option('wcbd_fraud_guard_whatsapp', ''));
        $phone = esc_js(get_option('wcbd_fraud_guard_phone', ''));
        $show_contact = get_option('wcbd_fraud_guard_show_contact', '1');
        
        // Use single-quoted PHP string with proper variable injection
        // Avoid $ in JavaScript by using 'jQ' alias and careful string construction
        $js = '(function(jQ){';
        $js .= 'var WCBD_FG={';
        $js .= 'deviceId:null,';
        $js .= 'endpoint:"' . esc_js($this->endpoint) . '",';
        $js .= 'apiKey:"' . esc_js($api_key) . '",';
        $js .= 'lang:"' . esc_js($language) . '",';
        $js .= 'popupTimer:' . $popup_timer . ',';
        $js .= 'msgCooldown:"' . $msg_cooldown . '",';
        $js .= 'msgBlacklist:"' . $msg_blacklist . '",';
        $js .= 'whatsapp:"' . $whatsapp . '",';
        $js .= 'phone:"' . $phone . '",';
        $js .= 'showContact:' . ($show_contact === '1' ? 'true' : 'false') . ',';
        
        $js .= 'init:function(){';
        $js .= 'var self=this;';
        $js .= 'console.log("[WCBD Fraud Guard v3.3] Initializing...");';
        $js .= 'if(typeof FingerprintJS!=="undefined"){';
        $js .= 'FingerprintJS.load().then(function(fp){fp.get().then(function(r){self.deviceId=r.visitorId;console.log("[WCBD] Device ID ready");});});';
        $js .= '}';
        $js .= 'jQ("form.checkout").on("checkout_place_order",function(){return self.validate(jQ(this));});';
        $js .= 'console.log("[WCBD Fraud Guard v3.3] Ready");';
        $js .= '},';
        
        $js .= 'validate:function(f){';
        $js .= 'var self=this;';
        $js .= 'var phone=jQ("#billing_phone").val();';
        $js .= 'var btn=f.find("button[type=submit]");';
        $js .= 'btn.prop("disabled",true).data("txt",btn.text()).html(this.lang==="bn"?"চেক করা হচ্ছে...":"Checking...");';
        $js .= 'console.log("[WCBD] Validating order...");';
        
        $js .= 'jQ.ajax({';
        $js .= 'url:this.endpoint,';
        $js .= 'method:"POST",';
        $js .= 'contentType:"application/json",';
        $js .= 'data:JSON.stringify({api_key:this.apiKey,phone:phone,device_id:this.deviceId,domain:window.location.hostname}),';
        $js .= 'success:function(r){';
        $js .= 'console.log("[WCBD] API Response:",r);';
        $js .= 'if(r.allowed){';
        $js .= 'f.off("checkout_place_order").submit();';
        $js .= '}else{';
        $js .= 'var customMsg=r.reason==="blacklist"?self.msgBlacklist:self.msgCooldown;';
        $js .= 'self.popup(r.reason,customMsg,r.minutes_remaining);';
        $js .= 'btn.prop("disabled",false).text(btn.data("txt"));';
        $js .= '}';
        $js .= '},';
        $js .= 'error:function(xhr,status,err){';
        $js .= 'console.error("[WCBD] API Error:",err);';
        $js .= 'f.off("checkout_place_order").submit();';
        $js .= '}';
        $js .= '});';
        $js .= 'return false;';
        $js .= '},';
        
        $js .= 'formatTime:function(mins){';
        $js .= 'if(mins<60)return mins+(this.lang==="bn"?" মিনিট":" minute(s)");';
        $js .= 'var hours=Math.floor(mins/60);';
        $js .= 'var m=mins%60;';
        $js .= 'if(mins<1440){';
        $js .= 'var hourStr=hours+(this.lang==="bn"?" ঘন্টা":" hour(s)");';
        $js .= 'var minStr=m>0?" "+m+(this.lang==="bn"?" মিনিট":" min"):"";';
        $js .= 'return hourStr+minStr;';
        $js .= '}';
        $js .= 'var days=Math.floor(mins/1440);';
        $js .= 'var remHrs=Math.floor((mins%1440)/60);';
        $js .= 'var dayStr=days+(this.lang==="bn"?" দিন":" day(s)");';
        $js .= 'var hrStr=remHrs>0?" "+remHrs+(this.lang==="bn"?" ঘন্টা":" hr"):"";';
        $js .= 'return dayStr+hrStr;';
        $js .= '},';
        
        $js .= 'popup:function(type,msg,mins){';
        $js .= 'var self=this;';
        $js .= 'console.log("[WCBD] Showing popup:",type);';
        
        // Remove existing popup first
        $js .= 'jQ("#wcbdFraudPopup").remove();';
        
        $js .= 'var icons={blacklist:"🚫",cooldown:"⏱️"};';
        $js .= 'var titles=this.lang==="bn"?{blacklist:"অর্ডার ব্লক করা হয়েছে",cooldown:"অপেক্ষা করুন"}:{blacklist:"Order Blocked",cooldown:"Please Wait"};';
        
        $js .= 'var timeDisplay=mins?\'<p class="wcbd-fraud-popup-time">⏰ \'+this.formatTime(mins)+\' \'+(this.lang==="bn"?"বাকি":"remaining")+\'</p>\':"";';
        
        // Contact section
        $js .= 'var contactHtml="";';
        $js .= 'if(this.showContact&&(this.whatsapp||this.phone)){';
        $js .= 'contactHtml=\'<div class="wcbd-fraud-popup-contact-box">\';';
        $js .= 'contactHtml+=\'<p class="wcbd-fraud-popup-contact-title">\'+(this.lang==="bn"?"📞 সমস্যা হলে যোগাযোগ করুন":"📞 Contact Us")+\'</p>\';';
        $js .= 'contactHtml+=\'<div class="wcbd-fraud-popup-contact">\';';
        $js .= 'if(this.whatsapp){';
        $js .= 'var waNum=this.whatsapp.replace(/\\D/g,"");';
        $js .= 'contactHtml+=\'<a href="https://wa.me/\'+waNum+\'" target="_blank" class="wcbd-fraud-popup-whatsapp">💬 WhatsApp</a>\';';
        $js .= '}';
        $js .= 'if(this.phone){';
        $js .= 'contactHtml+=\'<a href="tel:\'+this.phone+\'" class="wcbd-fraud-popup-phone">📱 \'+(this.lang==="bn"?"ফোন করুন":"Call")+\'</a>\';';
        $js .= '}';
        $js .= 'contactHtml+="</div></div>";';
        $js .= '}';
        
        // Timer countdown
        $js .= 'var timerHtml=this.popupTimer>0?\'<span class="wcbd-fraud-popup-countdown">(\'+this.popupTimer+\'s)</span>\':"";';
        $js .= 'var btnText=this.lang==="bn"?"ঠিক আছে":"OK";';
        
        // Build popup HTML - append to documentElement for maximum z-index compatibility
        $js .= 'var html=\'<div class="wcbd-fraud-popup-overlay" id="wcbdFraudPopup">\';';
        $js .= 'html+=\'<div class="wcbd-fraud-popup-modal">\';';
        $js .= 'html+=\'<div class="wcbd-fraud-popup-icon \'+type+\'">\'+(icons[type]||"⚠️")+\'</div>\';';
        $js .= 'html+=\'<h3 class="wcbd-fraud-popup-title">\'+(titles[type]||"Error")+\'</h3>\';';
        $js .= 'html+=\'<p class="wcbd-fraud-popup-message">\'+msg+\'</p>\';';
        $js .= 'html+=timeDisplay;';
        $js .= 'html+=contactHtml;';
        $js .= 'html+=\'<button class="wcbd-fraud-popup-button" id="wcbdFraudBtn">\'+btnText+\' \'+timerHtml+\'</button>\';';
        $js .= 'html+=\'</div></div>\';';
        
        // Append to document.documentElement for maximum z-index priority
        $js .= 'jQ(document.documentElement).append(html);';
        
        // Button click handler
        $js .= 'jQ("#wcbdFraudBtn").on("click",function(){jQ("#wcbdFraudPopup").remove();});';
        
        // ESC key handler
        $js .= 'jQ(document).on("keydown.wcbdPopup",function(e){if(e.key==="Escape"){jQ("#wcbdFraudPopup").remove();jQ(document).off("keydown.wcbdPopup");}});';
        
        // Click outside handler
        $js .= 'jQ("#wcbdFraudPopup").on("click",function(e){if(jQ(e.target).hasClass("wcbd-fraud-popup-overlay")){jQ("#wcbdFraudPopup").remove();}});';
        
        // Timer countdown
        $js .= 'if(this.popupTimer>0){';
        $js .= 'var countdown=this.popupTimer;';
        $js .= 'var interval=setInterval(function(){';
        $js .= 'countdown--;';
        $js .= 'jQ("#wcbdFraudBtn .wcbd-fraud-popup-countdown").text("("+countdown+"s)");';
        $js .= 'if(countdown<=0){';
        $js .= 'clearInterval(interval);';
        $js .= 'jQ("#wcbdFraudPopup").remove();';
        $js .= 'jQ(document).off("keydown.wcbdPopup");';
        $js .= '}';
        $js .= '},1000);';
        $js .= '}';
        
        $js .= '}';
        $js .= '};';
        
        $js .= 'jQ(function(){WCBD_FG.init();});';
        $js .= '})(jQuery);';
        
        return $js;
    }
    
    private function get_admin_css() {
        return '
        .fraud-wrap{max-width:900px;margin:20px 0}
        .fraud-header{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:30px;border-radius:16px;margin-bottom:25px}
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
        ';
    }
    
    private function get_admin_js() {
        $nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        $js = 'jQuery(function(jQ){';
        $js .= 'jQ("#test-api-btn").on("click",function(){';
        $js .= 'var btn=jQ(this);';
        $js .= 'var result=jQ("#api-result");';
        $js .= 'btn.prop("disabled",true).text("Testing...");';
        $js .= 'result.removeClass("success error").text("");';
        $js .= 'jQ.post(ajaxurl,{action:"wcbd_fraud_guard_test_api",nonce:"' . $nonce . '"},function(r){';
        $js .= 'btn.prop("disabled",false).text("Test");';
        $js .= 'if(r.success){result.addClass("success").text(r.data.message);}';
        $js .= 'else{result.addClass("error").text(r.data.message);}';
        $js .= '});';
        $js .= '});';
        $js .= '});';
        return $js;
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
                <div class="fraud-header-text">
                    <h1>
                        <span class="dashicons dashicons-shield"></span> 
                        WCBD Fraud Guard 
                        <span class="version">v3.3</span>
                    </h1>
                    <p>Protect your WooCommerce store from fake orders</p>
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
