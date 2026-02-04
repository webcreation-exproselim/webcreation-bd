const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';

export const generateMainPluginFile = (apiKey: string): string => {
  // Use PHP heredoc syntax (<<<'SCRIPT') to completely avoid PHP variable interpolation
  // This ensures JavaScript $ variables are NOT parsed by PHP
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders
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
        $endpoint = esc_js($this->endpoint);
        
        // Use PHP heredoc with NOWDOC syntax (<<<'JS') to prevent ANY PHP variable interpolation
        // This completely isolates JavaScript code from PHP parsing
        $js_template = <<<'JSTEMPLATE'
(function(jQ){
var WCBD_FG={
deviceId:null,
endpoint:"%%ENDPOINT%%",
apiKey:"%%APIKEY%%",
lang:"%%LANG%%",
popupTimer:%%TIMER%%,
msgCooldown:"%%MSG_COOLDOWN%%",
msgBlacklist:"%%MSG_BLACKLIST%%",
whatsapp:"%%WHATSAPP%%",
phone:"%%PHONE%%",
showContact:%%SHOW_CONTACT%%,

init:function(){
var self=this;
console.log("[WCBD Fraud Guard v3.3] Initializing...");
if(typeof FingerprintJS!=="undefined"){
FingerprintJS.load().then(function(fp){fp.get().then(function(r){self.deviceId=r.visitorId;console.log("[WCBD] Device ID ready");});});
}
jQ("form.checkout").on("checkout_place_order",function(){return self.validate(jQ(this));});
console.log("[WCBD Fraud Guard v3.3] Ready");
},

validate:function(f){
var self=this;
var phone=jQ("#billing_phone").val();
var btn=f.find("button[type=submit]");
btn.prop("disabled",true).data("txt",btn.text()).html(this.lang==="bn"?"চেক করা হচ্ছে...":"Checking...");
console.log("[WCBD] Validating order...");

jQ.ajax({
url:this.endpoint,
method:"POST",
contentType:"application/json",
data:JSON.stringify({api_key:this.apiKey,phone:phone,device_id:this.deviceId,domain:window.location.hostname}),
success:function(r){
console.log("[WCBD] API Response:",r);
if(r.allowed){
f.off("checkout_place_order").submit();
}else{
var customMsg=r.reason==="blacklist"?self.msgBlacklist:self.msgCooldown;
self.popup(r.reason,customMsg,r.minutes_remaining);
btn.prop("disabled",false).text(btn.data("txt"));
}
},
error:function(xhr,status,err){
console.error("[WCBD] API Error:",err);
f.off("checkout_place_order").submit();
}
});
return false;
},

formatTime:function(mins){
if(mins<60)return mins+(this.lang==="bn"?" মিনিট":" minute(s)");
var hours=Math.floor(mins/60);
var m=mins%60;
if(mins<1440){
var hourStr=hours+(this.lang==="bn"?" ঘন্টা":" hour(s)");
var minStr=m>0?" "+m+(this.lang==="bn"?" মিনিট":" min"):"";
return hourStr+minStr;
}
var days=Math.floor(mins/1440);
var remHrs=Math.floor((mins%1440)/60);
var dayStr=days+(this.lang==="bn"?" দিন":" day(s)");
var hrStr=remHrs>0?" "+remHrs+(this.lang==="bn"?" ঘন্টা":" hr"):"";
return dayStr+hrStr;
},

popup:function(type,msg,mins){
var self=this;
console.log("[WCBD] Showing popup:",type);

jQ("#wcbdFraudPopup").remove();

var icons={blacklist:"🚫",cooldown:"⏱️"};
var titles=this.lang==="bn"?{blacklist:"অর্ডার ব্লক করা হয়েছে",cooldown:"অপেক্ষা করুন"}:{blacklist:"Order Blocked",cooldown:"Please Wait"};

var timeDisplay=mins?'<p class="wcbd-fraud-popup-time">⏰ '+this.formatTime(mins)+' '+(this.lang==="bn"?"বাকি":"remaining")+'</p>':"";

var contactHtml="";
if(this.showContact&&(this.whatsapp||this.phone)){
contactHtml='<div class="wcbd-fraud-popup-contact-box">';
contactHtml+='<p class="wcbd-fraud-popup-contact-title">'+(this.lang==="bn"?"📞 সমস্যা হলে যোগাযোগ করুন":"📞 Contact Us")+'</p>';
contactHtml+='<div class="wcbd-fraud-popup-contact">';
if(this.whatsapp){
var waNum=this.whatsapp.replace(/\D/g,"");
contactHtml+='<a href="https://wa.me/'+waNum+'" target="_blank" class="wcbd-fraud-popup-whatsapp">💬 WhatsApp</a>';
}
if(this.phone){
contactHtml+='<a href="tel:'+this.phone+'" class="wcbd-fraud-popup-phone">📱 '+(this.lang==="bn"?"ফোন করুন":"Call")+'</a>';
}
contactHtml+="</div></div>";
}

var timerHtml=this.popupTimer>0?'<span class="wcbd-fraud-popup-countdown">('+this.popupTimer+'s)</span>':"";
var btnText=this.lang==="bn"?"ঠিক আছে":"OK";

var html='<div class="wcbd-fraud-popup-overlay" id="wcbdFraudPopup">';
html+='<div class="wcbd-fraud-popup-modal">';
html+='<div class="wcbd-fraud-popup-icon '+type+'">'+(icons[type]||"⚠️")+'</div>';
html+='<h3 class="wcbd-fraud-popup-title">'+(titles[type]||"Error")+'</h3>';
html+='<p class="wcbd-fraud-popup-message">'+msg+'</p>';
html+=timeDisplay;
html+=contactHtml;
html+='<button class="wcbd-fraud-popup-button" id="wcbdFraudBtn">'+btnText+' '+timerHtml+'</button>';
html+='</div></div>';

jQ(document.documentElement).append(html);

jQ("#wcbdFraudBtn").on("click",function(){jQ("#wcbdFraudPopup").remove();jQ(document).off("keydown.wcbdPopup");});

jQ(document).on("keydown.wcbdPopup",function(e){if(e.key==="Escape"){jQ("#wcbdFraudPopup").remove();jQ(document).off("keydown.wcbdPopup");}});

jQ("#wcbdFraudPopup").on("click",function(e){if(jQ(e.target).hasClass("wcbd-fraud-popup-overlay")){jQ("#wcbdFraudPopup").remove();jQ(document).off("keydown.wcbdPopup");}});

if(this.popupTimer>0){
var countdown=this.popupTimer;
var interval=setInterval(function(){
countdown--;
jQ("#wcbdFraudBtn .wcbd-fraud-popup-countdown").text("("+countdown+"s)");
if(countdown<=0){
clearInterval(interval);
jQ("#wcbdFraudPopup").remove();
jQ(document).off("keydown.wcbdPopup");
}
},1000);
}
}
};

jQ(function(){WCBD_FG.init();});
})(jQuery);
JSTEMPLATE;

        // Replace placeholders with actual PHP values
        $js = str_replace(
            array('%%ENDPOINT%%', '%%APIKEY%%', '%%LANG%%', '%%TIMER%%', '%%MSG_COOLDOWN%%', '%%MSG_BLACKLIST%%', '%%WHATSAPP%%', '%%PHONE%%', '%%SHOW_CONTACT%%'),
            array($endpoint, esc_js($api_key), $language, $popup_timer, $msg_cooldown, $msg_blacklist, $whatsapp, $phone, ($show_contact === '1' ? 'true' : 'false')),
            $js_template
        );
        
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
        .api-result.success{color:#10b981}
        .api-result.error{color:#ef4444}
        .fraud-input{width:100%;padding:12px 15px;border:1px solid #ddd;border-radius:10px;font-size:14px;transition:all 0.2s}
        .fraud-input:focus{outline:none;border-color:#0891b2;box-shadow:0 0 0 3px rgba(8,145,178,0.1)}
        .fraud-textarea{min-height:80px;resize:vertical}
        .fraud-btn{padding:12px 24px;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s}
        .fraud-btn-primary{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff}
        .fraud-btn-primary:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(8,145,178,0.3)}
        .fraud-btn-secondary{background:#f1f5f9;color:#475569}
        .fraud-btn-secondary:hover{background:#e2e8f0}
        .fraud-select{padding:12px 15px;border:1px solid #ddd;border-radius:10px;font-size:14px;background:#fff;cursor:pointer}
        .fraud-grid{display:grid;gap:20px}
        .fraud-grid-2{grid-template-columns:repeat(2,1fr)}
        @media(max-width:768px){.fraud-grid-2{grid-template-columns:1fr}}
        .fraud-form-group{margin-bottom:20px}
        .fraud-form-group label{display:block;font-weight:500;margin-bottom:8px;color:#374151}
        .fraud-form-group small{display:block;margin-top:5px;color:#9ca3af;font-size:12px}
        ';
    }
    
    private function get_admin_js() {
        $ajax_url = admin_url('admin-ajax.php');
        $nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        
        // Use heredoc NOWDOC for admin JS as well
        $js_template = <<<'ADMINJSTEMPLATE'
(function(jQ){
jQ(document).ready(function(){
jQ("#wcbd-test-api").on("click",function(){
var btn=jQ(this);
var result=jQ("#wcbd-api-result");
btn.prop("disabled",true).text("Testing...");
result.removeClass("success error").text("");

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_test_api",nonce:"%%NONCE%%"},
success:function(r){
if(r.success){
result.addClass("success").text("✓ Connected");
}else{
result.addClass("error").text("✗ "+r.data);
}
},
error:function(){
result.addClass("error").text("✗ Connection failed");
},
complete:function(){
btn.prop("disabled",false).text("Test Connection");
}
});
});
});
})(jQuery);
ADMINJSTEMPLATE;

        return str_replace(
            array('%%AJAX_URL%%', '%%NONCE%%'),
            array($ajax_url, $nonce),
            $js_template
        );
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
        <div class="wrap">
            <div class="fraud-wrap">
                <div class="fraud-header">
                    <div class="fraud-header-text">
                        <h1>🛡️ WCBD Fraud Guard <span class="version">v3.3.0</span></h1>
                        <p>Order Limiter & Anti-Fraud Protection for WooCommerce</p>
                    </div>
                </div>
                
                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                    <input type="hidden" name="action" value="wcbd_fraud_guard_save_settings">
                    <?php wp_nonce_field('wcbd_fraud_guard_settings', 'wcbd_fraud_guard_nonce'); ?>
                    
                    <!-- API Settings -->
                    <div class="fraud-card">
                        <h2>🔑 API Settings</h2>
                        <div class="fraud-form-group">
                            <label>API Key</label>
                            <div style="display:flex;gap:10px;align-items:center">
                                <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="fraud-input" style="flex:1">
                                <button type="button" id="wcbd-test-api" class="fraud-btn fraud-btn-secondary">Test Connection</button>
                                <span id="wcbd-api-result" class="api-result"></span>
                            </div>
                            <small>Get your API key from the dashboard</small>
                        </div>
                        
                        <div class="fraud-form-group">
                            <label class="fraud-toggle">
                                <input type="checkbox" name="enabled" value="1" <?php checked($enabled, '1'); ?>>
                                <span class="fraud-toggle-slider"></span>
                                Enable Fraud Protection
                            </label>
                        </div>
                    </div>
                    
                    <!-- Language & Timer -->
                    <div class="fraud-card">
                        <h2>🌐 Language & Display</h2>
                        <div class="fraud-grid fraud-grid-2">
                            <div class="fraud-form-group">
                                <label>Language</label>
                                <select name="language" class="fraud-select" style="width:100%">
                                    <option value="bn" <?php selected($language, 'bn'); ?>>বাংলা (Bengali)</option>
                                    <option value="en" <?php selected($language, 'en'); ?>>English</option>
                                </select>
                            </div>
                            <div class="fraud-form-group">
                                <label>Popup Auto-close Timer (seconds)</label>
                                <input type="number" name="popup_timer" value="<?php echo esc_attr($popup_timer); ?>" class="fraud-input" min="0" max="300">
                                <small>Set 0 to disable auto-close</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Custom Messages -->
                    <div class="fraud-card">
                        <h2>💬 Custom Messages</h2>
                        <div class="fraud-form-group">
                            <label>Cooldown Message</label>
                            <textarea name="msg_cooldown" class="fraud-input fraud-textarea"><?php echo esc_textarea($msg_cooldown); ?></textarea>
                            <small>Shown when customer orders too frequently</small>
                        </div>
                        <div class="fraud-form-group">
                            <label>Blacklist Message</label>
                            <textarea name="msg_blacklist" class="fraud-input fraud-textarea"><?php echo esc_textarea($msg_blacklist); ?></textarea>
                            <small>Shown when customer is blacklisted</small>
                        </div>
                    </div>
                    
                    <!-- Contact Options -->
                    <div class="fraud-card">
                        <h2>📞 Contact Options</h2>
                        <div class="fraud-form-group">
                            <label class="fraud-toggle">
                                <input type="checkbox" name="show_contact" value="1" <?php checked($show_contact, '1'); ?>>
                                <span class="fraud-toggle-slider"></span>
                                Show contact buttons in popup
                            </label>
                        </div>
                        <div class="fraud-grid fraud-grid-2">
                            <div class="fraud-form-group">
                                <label>WhatsApp Number</label>
                                <input type="text" name="whatsapp" value="<?php echo esc_attr($whatsapp); ?>" class="fraud-input" placeholder="+8801XXXXXXXXX">
                            </div>
                            <div class="fraud-form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" value="<?php echo esc_attr($phone); ?>" class="fraud-input" placeholder="+8801XXXXXXXXX">
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="fraud-btn fraud-btn-primary" style="width:100%;padding:15px;font-size:16px">
                        💾 Save Settings
                    </button>
                </form>
            </div>
        </div>
        <?php
    }
    
    public function save_settings() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        if (!isset($_POST['wcbd_fraud_guard_nonce']) || !wp_verify_nonce($_POST['wcbd_fraud_guard_nonce'], 'wcbd_fraud_guard_settings')) {
            wp_die('Security check failed');
        }
        
        update_option('wcbd_fraud_guard_api_key', sanitize_text_field($_POST['api_key'] ?? ''));
        update_option('wcbd_fraud_guard_enabled', isset($_POST['enabled']) ? '1' : '0');
        update_option('wcbd_fraud_guard_language', sanitize_text_field($_POST['language'] ?? 'bn'));
        update_option('wcbd_fraud_guard_popup_timer', sanitize_text_field($_POST['popup_timer'] ?? '30'));
        update_option('wcbd_fraud_guard_msg_cooldown', sanitize_textarea_field($_POST['msg_cooldown'] ?? ''));
        update_option('wcbd_fraud_guard_msg_blacklist', sanitize_textarea_field($_POST['msg_blacklist'] ?? ''));
        update_option('wcbd_fraud_guard_whatsapp', sanitize_text_field($_POST['whatsapp'] ?? ''));
        update_option('wcbd_fraud_guard_phone', sanitize_text_field($_POST['phone'] ?? ''));
        update_option('wcbd_fraud_guard_show_contact', isset($_POST['show_contact']) ? '1' : '0');
        
        wp_redirect(admin_url('admin.php?page=wcbd-fraud-guard&saved=1'));
        exit;
    }
    
    public function test_api_connection() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = get_option('wcbd_fraud_guard_api_key', '');
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
        }
        
        $response = wp_remote_post($this->endpoint, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'phone' => '01700000000',
                'device_id' => 'test-connection',
                'domain' => wp_parse_url(home_url(), PHP_URL_HOST)
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            wp_send_json_error($body['error']);
        }
        
        wp_send_json_success();
    }
}

new WCBD_Fraud_Guard();
`;
};

export const downloadPluginFile = async (apiKey: string): Promise<void> => {
  try {
    const pluginContent = generateMainPluginFile(apiKey);
    
    // Create blob with explicit PHP content type
    const blob = new Blob([pluginContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wcbd-fraud-guard.php';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('[WCBD Plugin] v3.3.0 downloaded successfully');
  } catch (error) {
    console.error('[WCBD Plugin] Download error:', error);
    throw error;
  }
};
