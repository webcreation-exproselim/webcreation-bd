const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const TRACK_ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/track-checkout';
const COURIER_ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/courier-status';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';
import JSZip from 'jszip';
export const generateMainPluginFile = (apiKey: string): string => {
  // Use PHP heredoc syntax (<<<'SCRIPT') to completely avoid PHP variable interpolation
  // This ensures JavaScript $ variables are NOT parsed by PHP
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders with remote settings, abandoned cart tracking, and more.
 * Version: 4.0.0
 * Author: WebCreation BD
 * Author URI: https://webcreation-bd.lovable.app
 * Text Domain: wcbd-fraud-guard
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_FRAUD_GUARD_VERSION', '4.0.0');
define('WCBD_FRAUD_GUARD_PATH', plugin_dir_path(__FILE__));
define('WCBD_FRAUD_GUARD_URL', plugin_dir_url(__FILE__));

class WCBD_Fraud_Guard {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    private $track_endpoint = '${TRACK_ENDPOINT_URL}';
    private $courier_endpoint = '${COURIER_ENDPOINT_URL}';
    private $dashboard_url = '${DASHBOARD_URL}';
    private $whatsapp_default = '${WHATSAPP_DEFAULT}';
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
        add_action('wp_ajax_wcbd_fraud_guard_check_courier', array($this, 'ajax_check_courier'));
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
trackEndpoint:"%%TRACK_ENDPOINT%%",
apiKey:"%%APIKEY%%",
lang:"%%LANG%%",
popupTimer:%%TIMER%%,
msgCooldown:"%%MSG_COOLDOWN%%",
msgBlacklist:"%%MSG_BLACKLIST%%",
whatsapp:"%%WHATSAPP%%",
phone:"%%PHONE%%",
showContact:%%SHOW_CONTACT%%,
enableTracking:%%ENABLE_TRACKING%%,
remoteSettings:null,

init:function(){
var self=this;
console.log("[WCBD Fraud Guard v4.0] Initializing...");
if(typeof FingerprintJS!=="undefined"){
FingerprintJS.load().then(function(fp){fp.get().then(function(r){self.deviceId=r.visitorId;console.log("[WCBD] Device ID ready");});});
}
jQ("form.checkout").on("checkout_place_order",function(){return self.validate(jQ(this));});

// Track abandoned checkouts
if(this.enableTracking){
this.setupAbandonedTracking();
}

console.log("[WCBD Fraud Guard v4.0] Ready");
},

setupAbandonedTracking:function(){
var self=this;
var debounceTimer=null;
var tracked=false;

jQ("#billing_phone, #billing_first_name, #billing_last_name").on("blur",function(){
if(tracked)return;
clearTimeout(debounceTimer);
debounceTimer=setTimeout(function(){
var phone=jQ("#billing_phone").val();
var name=jQ("#billing_first_name").val()+" "+jQ("#billing_last_name").val();
if(phone&&phone.length>=10){
tracked=true;
self.trackCheckout("started",phone.trim(),name.trim());
}
},1000);
});

// Mark as completed when order is placed
jQ(document.body).on("checkout_place_order_success woocommerce_checkout_place_order_success",function(){
var phone=jQ("#billing_phone").val();
if(phone){
self.trackCheckout("completed",phone.trim());
}
});
},

trackCheckout:function(action,phone,name){
var self=this;
console.log("[WCBD] Tracking checkout:",action,phone);
jQ.ajax({
url:this.trackEndpoint,
method:"POST",
contentType:"application/json",
data:JSON.stringify({api_key:this.apiKey,action:action,phone:phone,name:name||"",device_id:this.deviceId,checkout_url:window.location.href}),
success:function(r){console.log("[WCBD] Tracking response:",r);},
error:function(xhr,status,err){console.error("[WCBD] Tracking error:",err);}
});
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

// Update settings from server if available
if(r.popup_settings){
self.remoteSettings=r.popup_settings;
self.applyRemoteSettings();
}

if(r.allowed){
// Track as completed before submitting
if(self.enableTracking){
self.trackCheckout("completed",phone);
}
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

applyRemoteSettings:function(){
if(!this.remoteSettings)return;
var s=this.remoteSettings;
if(s.timer!==undefined)this.popupTimer=s.timer;
if(s.language)this.lang=s.language;
if(s.msg_cooldown)this.msgCooldown=s.msg_cooldown;
if(s.msg_blacklist)this.msgBlacklist=s.msg_blacklist;
if(s.whatsapp)this.whatsapp=s.whatsapp;
if(s.phone)this.phone=s.phone;
if(s.show_contact!==undefined)this.showContact=s.show_contact;
console.log("[WCBD] Applied remote settings");
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

        $enable_tracking = get_option('wcbd_fraud_guard_enable_tracking', '0');
        
        // Replace placeholders with actual PHP values
        $js = str_replace(
            array('%%ENDPOINT%%', '%%TRACK_ENDPOINT%%', '%%APIKEY%%', '%%LANG%%', '%%TIMER%%', '%%MSG_COOLDOWN%%', '%%MSG_BLACKLIST%%', '%%WHATSAPP%%', '%%PHONE%%', '%%SHOW_CONTACT%%', '%%ENABLE_TRACKING%%'),
            array($endpoint, esc_js($this->track_endpoint), esc_js($api_key), $language, $popup_timer, $msg_cooldown, $msg_blacklist, $whatsapp, $phone, ($show_contact === '1' ? 'true' : 'false'), ($enable_tracking === '1' ? 'true' : 'false')),
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
        .wcbd-tabs{display:flex;gap:10px;margin-bottom:25px;border-bottom:2px solid #e5e7eb;padding-bottom:15px}
        .wcbd-tab-btn{padding:10px 20px;border:none;border-radius:10px 10px 0 0;cursor:pointer;font-size:14px;font-weight:600;background:#f1f5f9;color:#64748b;transition:all 0.2s}
        .wcbd-tab-btn.active{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff}
        .wcbd-tab-btn:hover:not(.active){background:#e2e8f0}
        .wcbd-tab-content{display:none}
        .wcbd-tab-content.active{display:block}
        .courier-card{background:linear-gradient(145deg,#1a1a2e,#16213e);border:1px solid #334155;border-radius:16px;padding:25px}
        .courier-card h2{color:#00d4ff;margin:0 0 20px;border-bottom:1px solid #334155}
        .courier-card label{color:#e2e8f0}
        .courier-card .fraud-input,.courier-card .fraud-select{background:#0f172a;border-color:#334155;color:#fff}
        .courier-card .fraud-input:focus{border-color:#00d4ff}
        ';
    }
    
    private function get_admin_js() {
        $ajax_url = admin_url('admin-ajax.php');
        $nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        
        // Use heredoc NOWDOC for admin JS as well
        $js_template = <<<'ADMINJSTEMPLATE'
(function(jQ){
jQ(document).ready(function(){
// Tab switching
jQ(".wcbd-tab-btn").on("click",function(){
var tab=jQ(this).data("tab");
jQ(".wcbd-tab-btn").removeClass("active");
jQ(this).addClass("active");
jQ(".wcbd-tab-content").removeClass("active");
jQ("#wcbd-tab-"+tab).addClass("active");
});

// Test API
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

// Courier Tracking
jQ("#wcbd-check-courier").on("click",function(){
var btn=jQ(this);
var courier=jQ("#wcbd-courier-type").val();
var tracking=jQ("#wcbd-tracking-id").val();
var resultBox=jQ("#wcbd-courier-result");

if(!tracking){
resultBox.html('<div style="color:#ef4444">Tracking ID দিন</div>');
return;
}

btn.prop("disabled",true).html("Checking...");
resultBox.html('<div style="color:#64748b">🔄 Loading...</div>');

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_check_courier",nonce:"%%NONCE%%",courier:courier,tracking:tracking},
success:function(r){
if(r.success&&r.data){
var d=r.data;
var html='<div style="background:#0f172a;border-radius:12px;padding:15px;border:1px solid #334155">';
html+='<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#94a3b8">Courier</span><strong style="color:#00d4ff">'+courier.toUpperCase()+'</strong></div>';
html+='<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#94a3b8">Status</span><strong style="color:#10b981">'+d.status+'</strong></div>';
if(d.recipient_name){html+='<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#94a3b8">Recipient</span><span style="color:#fff">'+d.recipient_name+'</span></div>';}
if(d.recipient_phone){html+='<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#94a3b8">Phone</span><span style="color:#fff">'+d.recipient_phone+'</span></div>';}
if(d.cod_amount){html+='<div style="display:flex;justify-content:space-between;margin-bottom:10px"><span style="color:#94a3b8">COD Amount</span><strong style="color:#fbbf24">৳'+d.cod_amount+'</strong></div>';}
html+='</div>';
resultBox.html(html);
}else{
resultBox.html('<div style="color:#ef4444">❌ '+(r.data||"Not found")+'</div>');
}
},
error:function(){
resultBox.html('<div style="color:#ef4444">❌ Connection failed</div>');
},
complete:function(){
btn.prop("disabled",false).html("🔍 Track Order");
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
        $enable_tracking = get_option('wcbd_fraud_guard_enable_tracking', '0');
        
        ?>
        <div class="wrap">
            <div class="fraud-wrap">
                <div class="fraud-header">
                    <div class="fraud-header-text">
                        <h1>🛡️ WCBD Fraud Guard <span class="version">v4.0.0</span></h1>
                        <p>Order Limiter & Anti-Fraud Protection for WooCommerce with Remote Settings & Courier Tracking</p>
                    </div>
                </div>
                
                <!-- Tabs -->
                <div class="wcbd-tabs">
                    <button type="button" class="wcbd-tab-btn active" data-tab="settings">⚙️ Settings</button>
                    <button type="button" class="wcbd-tab-btn" data-tab="courier">🚚 Courier Tracking</button>
                </div>
                
                <!-- Settings Tab -->
                <div id="wcbd-tab-settings" class="wcbd-tab-content active">
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
                    
                    <!-- Abandoned Cart Tracking -->
                    <div class="fraud-card">
                        <h2>🛒 Abandoned Cart Tracking</h2>
                        <div class="fraud-form-group">
                            <label class="fraud-toggle">
                                <input type="checkbox" name="enable_tracking" value="1" <?php checked($enable_tracking, '1'); ?>>
                                <span class="fraud-toggle-slider"></span>
                                Track customers who leave checkout without ordering
                            </label>
                            <small style="display:block;margin-top:10px">যারা checkout থেকে order না করে চলে যায় তাদের track করুন। Dashboard এ abandoned carts দেখতে পাবেন।</small>
                        </div>
                    </div>
                    
                    <!-- Remote Settings Info -->
                    <div class="fraud-card" style="background:linear-gradient(135deg,#0f172a,#1e293b);border:1px solid #334155">
                        <h2 style="color:#00d4ff">🌐 Remote Settings (v4.0 Feature)</h2>
                        <p style="color:#94a3b8;margin:0 0 15px">এই settings গুলো Dashboard থেকে centrally control করা যায়। Dashboard এ গিয়ে "Remote" tab এ settings পরিবর্তন করলে সব connected sites এ automatic apply হবে।</p>
                        <a href="<?php echo esc_url($this->dashboard_url); ?>" target="_blank" class="fraud-btn fraud-btn-primary" style="display:inline-flex;align-items:center;gap:8px">
                            📊 Go to Dashboard
                        </a>
                    </div>
                    
                    <button type="submit" class="fraud-btn fraud-btn-primary" style="width:100%;padding:15px;font-size:16px">
                        💾 Save Settings
                    </button>
                </form>
                </div><!-- End Settings Tab -->
                
                <!-- Courier Tracking Tab -->
                <div id="wcbd-tab-courier" class="wcbd-tab-content">
                    <div class="courier-card">
                        <h2>🚚 Courier Order Tracking</h2>
                        <p style="color:#94a3b8;margin:-10px 0 20px">Steadfast, Pathao, RedX - যেকোনো courier এর order track করুন</p>
                        
                        <div class="fraud-grid fraud-grid-2" style="margin-bottom:20px">
                            <div class="fraud-form-group">
                                <label style="color:#e2e8f0">Courier Service</label>
                                <select id="wcbd-courier-type" class="fraud-select" style="width:100%;background:#0f172a;border-color:#334155;color:#fff">
                                    <option value="steadfast">Steadfast Courier</option>
                                    <option value="pathao">Pathao</option>
                                    <option value="redx">RedX</option>
                                </select>
                            </div>
                            <div class="fraud-form-group">
                                <label style="color:#e2e8f0">Invoice / Tracking ID</label>
                                <input type="text" id="wcbd-tracking-id" class="fraud-input" style="background:#0f172a;border-color:#334155;color:#fff" placeholder="Enter Invoice or Tracking ID">
                            </div>
                        </div>
                        
                        <button type="button" id="wcbd-check-courier" class="fraud-btn fraud-btn-primary" style="width:100%;padding:15px;font-size:16px;margin-bottom:20px">
                            🔍 Track Order
                        </button>
                        
                        <div id="wcbd-courier-result"></div>
                        
                        <div style="margin-top:20px;padding:15px;background:#0f172a;border-radius:10px;border:1px solid #334155">
                            <p style="color:#64748b;font-size:13px;margin:0">
                                💡 <strong style="color:#e2e8f0">Tips:</strong> Courier credentials Dashboard এ সেট করুন। 
                                <a href="<?php echo esc_url($this->dashboard_url); ?>" target="_blank" style="color:#00d4ff">Dashboard → Fraud Guard → Courier</a> এ গিয়ে API keys দিন।
                            </p>
                        </div>
                    </div>
                </div><!-- End Courier Tab -->
                
                <!-- WebCreation BD Branding -->
                <div style="margin-top:30px;padding:25px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;text-align:center;border:1px solid #334155">
                    <div style="margin-bottom:15px">
                        <img src="https://webcreation-bd.lovable.app/logo.png" alt="WebCreation BD" style="width:60px;height:60px;border-radius:50%;border:3px solid #0891b2;object-fit:contain;background:#fff;padding:5px">
                    </div>
                    <h3 style="color:#fff;margin:0 0 5px;font-size:18px">WebCreation BD</h3>
                    <p style="color:#94a3b8;margin:0 0 15px;font-size:13px">Best Digital Marketing In Bangladesh</p>
                    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">
                        <a href="https://webcreation-bd.lovable.app" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:500">
                            🌐 Visit Website
                        </a>
                        <a href="https://webcreation-bd.lovable.app/dashboard" target="_blank" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#374151;color:#fff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:500">
                            📊 Dashboard
                        </a>
                    </div>
                    <p style="color:#64748b;font-size:11px;margin-top:15px">Powered by WebCreation BD © <?php echo date('Y'); ?></p>
                </div>
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
        update_option('wcbd_fraud_guard_enable_tracking', isset($_POST['enable_tracking']) ? '1' : '0');
        
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
    
    public function ajax_check_courier() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = get_option('wcbd_fraud_guard_api_key', '');
        $courier = sanitize_text_field($_POST['courier'] ?? 'steadfast');
        $tracking = sanitize_text_field($_POST['tracking'] ?? '');
        
        if (empty($api_key)) {
            wp_send_json_error('API key not configured');
        }
        
        if (empty($tracking)) {
            wp_send_json_error('Tracking ID required');
        }
        
        $body_data = array(
            'api_key' => $api_key,
            'action' => 'check_status',
            'courier' => $courier
        );
        
        // Set the right identifier based on courier
        if ($courier === 'steadfast') {
            $body_data['invoice'] = $tracking;
        } elseif ($courier === 'pathao') {
            $body_data['consignment_id'] = $tracking;
        } else {
            $body_data['tracking_code'] = $tracking;
        }
        
        $response = wp_remote_post($this->courier_endpoint, array(
            'timeout' => 30,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($body_data)
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['error'])) {
            wp_send_json_error($body['error']);
        }
        
        if (isset($body['success']) && $body['success'] && isset($body['data'])) {
            // Extract relevant data from different courier response formats
            $data = $body['data'];
            $result = array(
                'status' => 'Unknown',
                'recipient_name' => null,
                'recipient_phone' => null,
                'cod_amount' => null
            );
            
            if ($courier === 'steadfast' && isset($data['delivery'])) {
                $result['status'] = $data['delivery']['delivery_status'] ?? 'Unknown';
                $result['recipient_name'] = $data['delivery']['recipient_name'] ?? null;
                $result['recipient_phone'] = $data['delivery']['recipient_phone'] ?? null;
                $result['cod_amount'] = $data['delivery']['cod_amount'] ?? null;
            } elseif ($courier === 'pathao' && isset($data['data'])) {
                $result['status'] = $data['data']['order_status'] ?? 'Unknown';
                $result['recipient_name'] = $data['data']['recipient_name'] ?? null;
                $result['recipient_phone'] = $data['data']['recipient_phone'] ?? null;
                $result['cod_amount'] = $data['data']['amount_to_collect'] ?? null;
            } elseif ($courier === 'redx' && isset($data['tracking'])) {
                $result['status'] = $data['tracking']['status'] ?? 'Unknown';
                $result['recipient_name'] = $data['tracking']['customer_name'] ?? null;
                $result['recipient_phone'] = $data['tracking']['customer_phone'] ?? null;
                $result['cod_amount'] = $data['tracking']['cash_collection_amount'] ?? null;
            }
            
            wp_send_json_success($result);
        }
        
        wp_send_json_error('Could not fetch tracking data');
    }
}

new WCBD_Fraud_Guard();
`;
};

export const downloadPluginFile = async (apiKey: string): Promise<void> => {
  try {
    // Create ZIP file with proper folder structure
    const zip = new JSZip();
    const pluginFolder = zip.folder('wcbd-fraud-guard');
    
    if (!pluginFolder) {
      throw new Error('Failed to create plugin folder');
    }
    
    // Add main plugin file
    const pluginContent = generateMainPluginFile(apiKey);
    pluginFolder.file('wcbd-fraud-guard.php', pluginContent);
    
    // Add README
    const readmeContent = `=== WCBD Fraud Guard ===
Contributors: WebCreation BD
Tags: woocommerce, fraud, security, order-limiter, abandoned-cart, courier-tracking
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 4.0.0
License: GPLv2 or later

WooCommerce Anti-Fraud Protection System with Order Limiting, Device Fingerprinting, Remote Settings, Abandoned Cart Tracking & Courier Order Tracking

== Description ==

WCBD Fraud Guard protects your WooCommerce store from fake orders and fraud attempts using:

* Device Fingerprinting
* Phone Number Blacklist
* IP Address Blocking
* Cooldown Period Management
* Beautiful Popup Notifications
* Domain-Locked API Security
* Remote Settings Control (NEW in v4.0)
* Abandoned Cart Tracking (NEW in v4.0)
* Courier Status Integration (NEW in v4.0) - Steadfast, Pathao, RedX

== Features in v4.0 ==

🌐 **Remote Settings**
- Control popup settings from Dashboard
- Changes apply to all connected sites automatically
- No need to update plugin for settings changes

🛒 **Abandoned Cart Tracking**
- Track customers who leave checkout without ordering
- View abandoned carts in Dashboard
- Follow up with potential customers

🚚 **Courier Order Tracking**
- Track orders from Steadfast, Pathao, and RedX
- Check status directly from WordPress admin
- COD amount, recipient info, delivery status

== Installation ==

1. Upload the plugin folder to /wp-content/plugins/
2. Activate the plugin through WordPress admin
3. Configure your API key in Fraud Guard settings
4. Set up courier credentials in Dashboard (for courier tracking)
5. Done! Protection is now active on checkout

== Changelog ==

= 4.0.0 =
* NEW: Remote Settings - Control popup settings from Dashboard
* NEW: Abandoned Cart Tracking - Track customers who leave without ordering
* NEW: Courier Tracking Tab - Track Steadfast, Pathao, RedX orders from WordPress
* NEW: RedX Courier Support
* Improved: Server-side settings priority over local settings
* Improved: Real-time settings sync without plugin update
* Improved: Tab-based admin interface

= 3.3.0 =
* Fixed: PHP Heredoc syntax to prevent JavaScript variable escaping issues
* Fixed: Bulletproof popup with maximum z-index (2147483647)
* Added: ESC key support to close popup
* Added: Click outside to close popup
* Improved: Cross-theme compatibility

== Support ==

Visit: https://webcreation-bd.lovable.app/dashboard
`;
    pluginFolder.file('README.txt', readmeContent);
    
    // Generate ZIP blob
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wcbd-fraud-guard.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('[WCBD Plugin] v4.0.0 downloaded successfully');
  } catch (error) {
    console.error('[WCBD Plugin] Download error:', error);
    throw error;
  }
};
