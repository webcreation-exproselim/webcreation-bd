const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const INCOMPLETE_ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/log-checkout-attempt';
const GET_INCOMPLETE_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/get-incomplete-orders';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';
import JSZip from 'jszip';
import { PLUGIN_CONFIG } from '@/config/pluginConfig';

export const generateMainPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://webcreation-bd.lovable.app/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders with Incomplete Order Tracking.
 * Version: ${PLUGIN_CONFIG.version}
 * Author: WebCreation BD
 * Author URI: https://webcreation-bd.lovable.app
 * Text Domain: wcbd-fraud-guard
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_FRAUD_GUARD_VERSION', '${PLUGIN_CONFIG.version}');
define('WCBD_FRAUD_GUARD_PATH', plugin_dir_path(__FILE__));
define('WCBD_FRAUD_GUARD_URL', plugin_dir_url(__FILE__));

class WCBD_Fraud_Guard {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${ENDPOINT_URL}';
    private $incomplete_endpoint = '${INCOMPLETE_ENDPOINT_URL}';
    private $get_incomplete_url = '${GET_INCOMPLETE_URL}';
    private $dashboard_url = '${DASHBOARD_URL}';
    private $whatsapp_default = '${WHATSAPP_DEFAULT}';
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
        add_action('wp_ajax_wcbd_fraud_guard_get_incomplete', array($this, 'ajax_get_incomplete_orders'));
        add_action('wp_footer', array($this, 'inject_popup_styles'), 99);
        
        register_activation_hook(__FILE__, array($this, 'set_default_options'));
    }
    
    public function set_default_options() {
        add_option('wcbd_fraud_guard_popup_timer', '30');
        add_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
        add_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।');
        add_option('wcbd_fraud_guard_whatsapp', $this->whatsapp_default);
        add_option('wcbd_fraud_guard_phone', $this->whatsapp_default);
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
        $endpoint = esc_js($this->endpoint);
        
        $js_template = <<<'JSTEMPLATE'
(function(jQ){
var WCBD_FG={
deviceId:null,
endpoint:"%%ENDPOINT%%",
incompleteEndpoint:"%%INCOMPLETE_ENDPOINT%%",
apiKey:"%%APIKEY%%",
lang:"%%LANG%%",
popupTimer:%%TIMER%%,
msgCooldown:"%%MSG_COOLDOWN%%",
msgBlacklist:"%%MSG_BLACKLIST%%",
whatsapp:"%%WHATSAPP%%",
phone:"%%PHONE%%",
incompleteLogged:{},
licenseValid:false,

init:function(){
var self=this;
console.log("[WCBD Fraud Guard v${PLUGIN_CONFIG.version}] Initializing...");

// IMPORTANT: First validate license before enabling any features
this.validateLicense(function(valid){
if(!valid){
console.warn("[WCBD] License invalid - All features DISABLED");
self.showLicenseError();
return;
}
self.licenseValid=true;
console.log("[WCBD] License valid - Enabling features...");

// Initialize FingerprintJS
if(typeof FingerprintJS!=="undefined"){
FingerprintJS.load().then(function(fp){fp.get().then(function(r){self.deviceId=r.visitorId;console.log("[WCBD] Device ID ready");});});
}

// Hook into checkout form
jQ("form.checkout").on("checkout_place_order",function(){return self.validate(jQ(this));});

// Always track incomplete orders when license is valid
self.setupIncompleteTracking();

console.log("[WCBD Fraud Guard v${PLUGIN_CONFIG.version}] Ready");
});
},

// Validate License with API
validateLicense:function(callback){
var self=this;
console.log("[WCBD] Validating license...");

jQ.ajax({
url:this.endpoint,
method:"POST",
contentType:"application/json",
timeout:10000,
data:JSON.stringify({
api_key:this.apiKey,
phone:"license_check",
device_id:"license_validation",
domain:window.location.hostname
}),
success:function(r){
console.log("[WCBD] License check response:",r);
// If we get inactive/expired/limit_exceeded, license is invalid
if(r.reason==="inactive"||r.reason==="expired"||r.reason==="limit_exceeded"||r.reason==="domain_mismatch"){
callback(false);
}else{
// allowed:true OR blocked by cooldown/blacklist means license is valid
callback(true);
}
},
error:function(xhr,status,err){
console.error("[WCBD] License validation error:",err);
// On network error, disable features for safety
callback(false);
}
});
},

showLicenseError:function(){
var msg=this.lang==="bn"?
"⚠️ Fraud Guard সক্রিয় নয়। সাবস্ক্রিপশন কিনুন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।":
"⚠️ Fraud Guard is not active. Please purchase a subscription or contact admin.";

var html='<div id="wcbd-license-warning" style="position:fixed;bottom:20px;right:20px;z-index:9999;background:#ff4757;color:#fff;padding:12px 20px;border-radius:8px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:300px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="this.remove()">'+msg+'</div>';
jQ("body").append(html);
setTimeout(function(){jQ("#wcbd-license-warning").fadeOut(function(){jQ(this).remove();});},8000);
},

// Incomplete Order Tracking
setupIncompleteTracking:function(){
var self=this;
if(!this.licenseValid)return; // BLOCK if license invalid
console.log("[WCBD] Setting up incomplete order tracking...");

// Trigger 1: Phone Blur - When user enters phone and clicks away
jQ("#billing_phone").on("blur",function(){
if(!self.licenseValid)return;
var phone=jQ(this).val();
if(phone&&phone.length>=10){
self.logIncompleteAttempt("phone_blur",phone);
}
});

// Trigger 2: WooCommerce Checkout Error
jQ(document.body).on("checkout_error",function(){
if(!self.licenseValid)return;
var phone=jQ("#billing_phone").val();
if(phone&&phone.length>=5){
self.logIncompleteAttempt("validation_error",phone);
}
});

// Trigger 3: Page Unload (beforeunload) - If phone is filled
jQ(window).on("beforeunload",function(){
if(!self.licenseValid)return;
var phone=jQ("#billing_phone").val();
if(phone&&phone.length>=10&&!self.incompleteLogged["page_exit_"+phone]){
self.incompleteLogged["page_exit_"+phone]=true;
var data=JSON.stringify({
api_key:self.apiKey,
phone:phone,
name:jQ("#billing_first_name").val()+" "+jQ("#billing_last_name").val(),
ip:"",
device_id:self.deviceId||"",
cart_total:self.getCartTotal(),
reason:"page_exit"
});
if(navigator.sendBeacon){
navigator.sendBeacon(self.incompleteEndpoint,data);
}
}
});

console.log("[WCBD] Incomplete order tracking ready");
},

logIncompleteAttempt:function(reason,phone){
var self=this;
if(!this.licenseValid)return; // BLOCK if license invalid
var key=reason+"_"+phone;

// Prevent duplicate logs within same session
if(this.incompleteLogged[key])return;
this.incompleteLogged[key]=true;

console.log("[WCBD] Logging incomplete attempt:",reason,phone);

var name=jQ("#billing_first_name").val()+" "+jQ("#billing_last_name").val();
var cartItems=this.getCartItems();

jQ.ajax({
url:this.incompleteEndpoint,
method:"POST",
contentType:"application/json",
data:JSON.stringify({
api_key:this.apiKey,
phone:phone.trim(),
name:name.trim()||"",
ip:"",
device_id:this.deviceId||"",
cart_total:this.getCartTotal(),
cart_items:cartItems,
reason:reason
}),
success:function(r){
console.log("[WCBD] Incomplete attempt logged:",r);
if(r.risk_level==="high"){
console.warn("[WCBD] High risk detected! Attempts:",r.attempts_count);
}
},
error:function(xhr,status,err){
console.error("[WCBD] Incomplete logging error:",err);
}
});
},

getCartItems:function(){
try{
var items=[];
jQ(".woocommerce-checkout-review-order-table .cart_item").each(function(){
var row=jQ(this);
var name=row.find(".product-name").text().trim().split("\\n")[0].trim();
var qty=parseInt(row.find(".product-quantity").text().replace(/[^0-9]/g,""))||1;
var priceText=row.find(".product-total .amount").text().replace(/[^0-9.]/g,"");
var price=parseFloat(priceText)||0;
if(name){
items.push({name:name,price:price,quantity:qty});
}
});
return items;
}catch(e){console.error("[WCBD] Cart items error:",e);return [];}
},

getCartTotal:function(){
try{
var total=jQ(".order-total .amount").text().replace(/[^0-9.]/g,"");
return parseFloat(total)||0;
}catch(e){return 0;}
},

validate:function(f){
var self=this;
if(!this.licenseValid){
// License invalid - allow order to proceed (fail-open for merchants)
console.warn("[WCBD] License invalid - skipping validation");
return true;
}

var phone=jQ("#billing_phone").val();
var btn=f.find("button[type=submit]");
btn.prop("disabled",true).data("txt",btn.text()).html(this.lang==="bn"?"চেক করা হচ্ছে...":"Checking...");
console.log("[WCBD] Validating order...");

this.checkEligibility(f,phone,btn);
return false;
},

checkEligibility:function(f,phone,btn){
var self=this;

jQ.ajax({
url:this.endpoint,
method:"POST",
contentType:"application/json",
data:JSON.stringify({api_key:this.apiKey,phone:phone,device_id:this.deviceId,domain:window.location.hostname}),
success:function(r){
console.log("[WCBD] API Response:",r);

// Update settings from server if available
if(r.popup_settings){
self.applyRemoteSettings(r.popup_settings);
}

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
},

applyRemoteSettings:function(s){
if(!s)return;
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
if(!this.licenseValid)return; // BLOCK if license invalid
console.log("[WCBD] Showing popup:",type);

jQ("#wcbdFraudPopup").remove();

var icons={blacklist:"🚫",cooldown:"⏱️"};
var titles=this.lang==="bn"?{blacklist:"অর্ডার ব্লক করা হয়েছে",cooldown:"অপেক্ষা করুন"}:{blacklist:"Order Blocked",cooldown:"Please Wait"};

var timeDisplay=mins?'<p class="wcbd-fraud-popup-time">⏰ '+this.formatTime(mins)+' '+(this.lang==="bn"?"বাকি":"remaining")+'</p>':"";

var contactHtml="";
if(this.whatsapp||this.phone){
contactHtml='<div class="wcbd-fraud-popup-contact-box">';
contactHtml+='<p class="wcbd-fraud-popup-contact-title">'+(this.lang==="bn"?"📞 সমস্যা হলে যোগাযোগ করুন":"📞 Contact Us")+'</p>';
contactHtml+='<div class="wcbd-fraud-popup-contact">';
if(this.whatsapp){
var waNum=this.whatsapp.replace(/\\D/g,"");
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

        $incomplete_endpoint = esc_js($this->incomplete_endpoint);
        
        $js = str_replace(
            array('%%ENDPOINT%%', '%%INCOMPLETE_ENDPOINT%%', '%%APIKEY%%', '%%LANG%%', '%%TIMER%%', '%%MSG_COOLDOWN%%', '%%MSG_BLACKLIST%%', '%%WHATSAPP%%', '%%PHONE%%'),
            array($endpoint, $incomplete_endpoint, esc_js($api_key), $language, $popup_timer, $msg_cooldown, $msg_blacklist, $whatsapp, $phone),
            $js_template
        );
        
        return $js;
    }
    
    private function get_admin_css() {
        return '
        :root{--wcbd-primary:#0891b2;--wcbd-primary-dark:#0e7490;--wcbd-dark:#0f172a;--wcbd-dark-2:#1e293b;--wcbd-border:#334155;--wcbd-text:#e2e8f0;--wcbd-text-muted:#94a3b8;--wcbd-success:#10b981;--wcbd-warning:#f59e0b;--wcbd-danger:#ef4444;--wcbd-orange:#f97316}
        .fraud-wrap{max-width:1000px;margin:20px auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
        .fraud-header{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;padding:30px;border-radius:20px;margin-bottom:25px;position:relative;overflow:hidden}
        .fraud-header::before{content:"";position:absolute;top:-50%;right:-50%;width:100%;height:200%;background:radial-gradient(circle,rgba(255,255,255,0.1) 0%,transparent 60%);animation:headerShine 5s linear infinite}
        @keyframes headerShine{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        .fraud-header-text h1{color:#fff;font-size:28px;margin:0 0 8px;display:flex;align-items:center;gap:12px}
        .fraud-header-text p{margin:0;opacity:0.9;font-size:15px}
        .fraud-header-text .version{background:rgba(255,255,255,0.2);padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600}
        
        /* Cards */
        .fraud-card{background:#fff;border:1px solid #e0e0e0;border-radius:16px;padding:25px;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.05);transition:transform 0.2s,box-shadow 0.2s}
        .fraud-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)}
        .fraud-card h2{margin:0 0 20px;padding:0 0 15px;border-bottom:2px solid #f1f5f9;font-size:18px;display:flex;align-items:center;gap:10px;color:#1e293b}
        .fraud-card.dark{background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid #334155}
        .fraud-card.dark h2{color:#00d4ff;border-bottom-color:#334155}
        .fraud-card.dark label{color:#e2e8f0}
        
        /* Feature Cards Grid */
        .fraud-feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px}
        @media(max-width:768px){.fraud-feature-grid{grid-template-columns:1fr}}
        .fraud-feature-card{background:linear-gradient(145deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:12px;padding:20px;transition:all 0.2s}
        .fraud-feature-card:hover{border-color:#0891b2;box-shadow:0 4px 12px rgba(8,145,178,0.15)}
        .fraud-feature-card .icon{width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px}
        .fraud-feature-card h4{margin:0 0 6px;font-size:15px;font-weight:600;color:#1e293b}
        .fraud-feature-card p{margin:0;font-size:13px;color:#64748b;line-height:1.5}
        
        /* Toggle */
        .fraud-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;padding:10px 0}
        .fraud-toggle input{display:none}
        .fraud-toggle-slider{width:52px;height:28px;background:#cbd5e1;border-radius:28px;position:relative;transition:0.3s}
        .fraud-toggle-slider::before{content:\\'\\';position:absolute;width:22px;height:22px;background:#fff;border-radius:50%;top:3px;left:3px;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
        .fraud-toggle input:checked+.fraud-toggle-slider{background:linear-gradient(135deg,#0891b2,#06b6d4)}
        .fraud-toggle input:checked+.fraud-toggle-slider::before{transform:translateX(24px)}
        .fraud-toggle span:last-child{font-weight:500;color:#374151}
        
        /* Inputs */
        .fraud-input{width:100%;padding:14px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;transition:all 0.2s;background:#fff}
        .fraud-input:focus{outline:none;border-color:#0891b2;box-shadow:0 0 0 4px rgba(8,145,178,0.1)}
        .fraud-input.dark{background:#0f172a;border-color:#334155;color:#fff}
        .fraud-input.dark:focus{border-color:#00d4ff}
        .fraud-textarea{min-height:100px;resize:vertical}
        .fraud-select{padding:14px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;background:#fff;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'%2364748b\\'%3E%3Cpath stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M19 9l-7 7-7-7\\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:20px}
        
        /* Buttons */
        .fraud-btn{padding:14px 28px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
        .fraud-btn-primary{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;box-shadow:0 4px 14px rgba(8,145,178,0.3)}
        .fraud-btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(8,145,178,0.4)}
        .fraud-btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
        .fraud-btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff}
        .fraud-btn-secondary{background:#f1f5f9;color:#475569;border:2px solid #e2e8f0}
        .fraud-btn-secondary:hover{background:#e2e8f0}
        
        /* Grid */
        .fraud-grid{display:grid;gap:20px}
        .fraud-grid-2{grid-template-columns:repeat(2,1fr)}
        @media(max-width:768px){.fraud-grid-2{grid-template-columns:1fr}}
        
        /* Form Groups */
        .fraud-form-group{margin-bottom:20px}
        .fraud-form-group label{display:block;font-weight:600;margin-bottom:8px;color:#374151;font-size:14px}
        .fraud-form-group small{display:block;margin-top:6px;color:#64748b;font-size:12px;line-height:1.5}
        
        /* Tabs */
        .wcbd-tabs{display:flex;gap:8px;margin-bottom:25px;background:#f1f5f9;padding:6px;border-radius:14px;overflow-x:auto}
        .wcbd-tab-btn{padding:12px 24px;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;background:transparent;color:#64748b;transition:all 0.2s;white-space:nowrap;display:flex;align-items:center;gap:8px}
        .wcbd-tab-btn.active{background:#fff;color:#0891b2;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
        .wcbd-tab-btn:hover:not(.active){background:rgba(255,255,255,0.5);color:#475569}
        .wcbd-tab-content{display:none;animation:fadeIn 0.3s ease}
        .wcbd-tab-content.active{display:block}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        
        /* Incomplete Orders Table */
        .incomplete-table-wrap{overflow-x:auto;border-radius:12px;border:1px solid #334155}
        .incomplete-table{width:100%;border-collapse:collapse;font-size:13px}
        .incomplete-table th{background:#1e293b;color:#94a3b8;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;padding:14px 16px;text-align:left;border-bottom:1px solid #334155}
        .incomplete-table td{padding:14px 16px;border-bottom:1px solid #334155;color:#e2e8f0}
        .incomplete-table tr:last-child td{border-bottom:none}
        .incomplete-table tr:hover{background:rgba(8,145,178,0.05)}
        .risk-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase}
        .risk-badge.high{background:rgba(239,68,68,0.15);color:#ef4444}
        .risk-badge.medium{background:rgba(245,158,11,0.15);color:#f59e0b}
        .risk-badge.low{background:rgba(16,185,129,0.15);color:#10b981}
        .reason-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:11px;background:#334155;color:#94a3b8}
        
        /* Stats Cards */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:20px}
        @media(max-width:900px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:500px){.stats-grid{grid-template-columns:1fr}}
        .stat-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid #334155;border-radius:14px;padding:20px;text-align:center}
        .stat-card .value{font-size:32px;font-weight:700;margin-bottom:4px}
        .stat-card .label{font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px}
        .stat-card.total .value{color:#00d4ff}
        .stat-card.suspicious .value{color:#ef4444}
        .stat-card.converted .value{color:#10b981}
        .stat-card.today .value{color:#f59e0b}
        
        /* API Result */
        .api-result{margin-left:12px;font-weight:600;padding:4px 12px;border-radius:20px;font-size:13px}
        .api-result.success{color:#10b981;background:rgba(16,185,129,0.1)}
        .api-result.error{color:#ef4444;background:rgba(239,68,68,0.1)}
        
        /* Branding Footer */
        .wcbd-branding{margin-top:30px;padding:30px;background:linear-gradient(145deg,#0f172a,#1e293b);border-radius:20px;text-align:center;border:1px solid #334155}
        .wcbd-branding img{width:70px;height:70px;border-radius:50%;border:3px solid #0891b2;object-fit:contain;background:#fff;padding:8px;margin-bottom:15px}
        .wcbd-branding h3{color:#fff;margin:0 0 5px;font-size:20px}
        .wcbd-branding p{color:#94a3b8;margin:0 0 20px;font-size:14px}
        .wcbd-branding .btn-group{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
        .wcbd-branding .btn-group a{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;color:#fff;text-decoration:none;font-size:14px;font-weight:500;transition:transform 0.2s}
        .wcbd-branding .btn-group a:hover{transform:translateY(-2px)}
        .wcbd-branding .btn-group a.primary{background:linear-gradient(135deg,#0891b2,#06b6d4)}
        .wcbd-branding .btn-group a.secondary{background:#374151}
        .wcbd-branding .copyright{color:#64748b;font-size:12px;margin-top:20px}
        ';
    }
    
    private function get_admin_js() {
        $ajax_url = admin_url('admin-ajax.php');
        $nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        
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
if(tab==="incomplete"){loadIncompleteOrders();}
});

// Test API
jQ("#wcbd-test-api").on("click",function(){
var btn=jQ(this);
var result=jQ("#wcbd-api-result");
btn.prop("disabled",true).html("🔄 Testing...");
result.removeClass("success error").text("");

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_test_api",nonce:"%%NONCE%%"},
success:function(r){
if(r.success){
result.addClass("success").html("✓ Connected");
}else{
result.addClass("error").html("✗ "+r.data);
}
},
error:function(){
result.addClass("error").html("✗ Connection failed");
},
complete:function(){
btn.prop("disabled",false).html("🔌 Test Connection");
}
});
});

// Load incomplete orders on page load if tab is active
if(jQ(".wcbd-tab-btn.active").data("tab")==="incomplete"){
loadIncompleteOrders();
}

function loadIncompleteOrders(){
var container=jQ("#incomplete-orders-container");
container.html('<div style="text-align:center;padding:40px;color:#94a3b8"><span style="font-size:24px">🔄</span><p>Loading incomplete orders...</p></div>');

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_get_incomplete",nonce:"%%NONCE%%"},
success:function(r){
if(r.success&&r.data){
renderIncompleteOrders(r.data);
}else{
container.html('<div style="text-align:center;padding:40px;color:#94a3b8"><span style="font-size:48px">📭</span><p style="margin:15px 0 0">No incomplete orders found</p></div>');
}
},
error:function(){
container.html('<div style="text-align:center;padding:40px;color:#ef4444"><span style="font-size:48px">❌</span><p style="margin:15px 0 0">Failed to load data</p></div>');
}
});
}

function renderIncompleteOrders(data){
var container=jQ("#incomplete-orders-container");
var orders=data.orders||[];
var stats=data.stats||{total:0,suspicious:0,converted:0,today:0};

var html='<div class="stats-grid">';
html+='<div class="stat-card total"><div class="value">'+stats.total+'</div><div class="label">Total</div></div>';
html+='<div class="stat-card suspicious"><div class="value">'+stats.suspicious+'</div><div class="label">Suspicious</div></div>';
html+='<div class="stat-card converted"><div class="value">'+stats.converted+'</div><div class="label">Converted</div></div>';
html+='<div class="stat-card today"><div class="value">'+stats.today+'</div><div class="label">Today</div></div>';
html+='</div>';

if(orders.length===0){
html+='<div style="text-align:center;padding:60px;background:#1e293b;border-radius:16px;border:1px solid #334155"><span style="font-size:64px">📭</span><p style="color:#94a3b8;margin:20px 0 0;font-size:16px">No incomplete orders yet. Orders will appear here when customers leave checkout without completing.</p></div>';
container.html(html);
return;
}

html+='<div class="incomplete-table-wrap"><table class="incomplete-table">';
html+='<thead><tr><th>Phone</th><th>Customer</th><th>Products</th><th>Reason</th><th>Risk</th><th>Cart Total</th><th>Time</th></tr></thead>';
html+='<tbody>';

for(var i=0;i<orders.length;i++){
var o=orders[i];
var riskClass=o.is_suspicious?"high":(o.attempts>3?"medium":"low");
var riskLabel=o.is_suspicious?"🔴 HIGH":(o.attempts>3?"🟡 MEDIUM":"🟢 LOW");
var reasonIcon={"phone_blur":"📱","validation_error":"❌","page_exit":"🚪","payment_failed":"💳"}[o.reason]||"❓";

// Format cart items
var productsHtml="<span style=\\"color:#64748b\\">-</span>";
if(o.cart_items&&o.cart_items.length>0){
productsHtml='<div style="font-size:11px;max-width:200px">';
for(var j=0;j<Math.min(o.cart_items.length,3);j++){
var item=o.cart_items[j];
productsHtml+='<div style="margin-bottom:4px;padding:4px 8px;background:#334155;border-radius:6px">';
productsHtml+='<span style="color:#fff">'+item.name.substring(0,30)+(item.name.length>30?"...":"")+'</span>';
productsHtml+=' <span style="color:#94a3b8">x'+item.quantity+'</span>';
productsHtml+='</div>';
}
if(o.cart_items.length>3){
productsHtml+='<span style="color:#64748b">+'+(o.cart_items.length-3)+' more</span>';
}
productsHtml+='</div>';
}

html+='<tr>';
html+='<td><strong style="color:#fff">'+o.phone+'</strong></td>';
html+='<td>'+(o.name||"<span style=\\"color:#64748b\\">Unknown</span>")+'</td>';
html+='<td>'+productsHtml+'</td>';
html+='<td><span class="reason-badge">'+reasonIcon+' '+o.reason.replace("_"," ")+'</span></td>';
html+='<td><span class="risk-badge '+riskClass+'">'+riskLabel+'</span></td>';
html+='<td>'+(o.cart_total?'৳'+o.cart_total:'<span style="color:#64748b">-</span>')+'</td>';
html+='<td style="color:#94a3b8">'+o.time_ago+'</td>';
html+='</tr>';
}

html+='</tbody></table></div>';
container.html(html);
}

// Refresh button
jQ("#refresh-incomplete").on("click",function(){
loadIncompleteOrders();
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
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        $popup_timer = get_option('wcbd_fraud_guard_popup_timer', '30');
        $msg_cooldown = get_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
        $msg_blacklist = get_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।');
        $whatsapp = get_option('wcbd_fraud_guard_whatsapp', '');
        $phone = get_option('wcbd_fraud_guard_phone', '');
        
        ?>
        <div class="wrap">
            <div class="fraud-wrap">
                <!-- Header -->
                <div class="fraud-header">
                    <div class="fraud-header-text">
                        <h1>🛡️ WCBD Fraud Guard <span class="version">v<?php echo WCBD_FRAUD_GUARD_VERSION; ?></span></h1>
                        <p>Order Limiter & Anti-Fraud Protection with Incomplete Order Tracking</p>
                    </div>
                </div>
                
                <!-- Tabs -->
                <div class="wcbd-tabs">
                    <button type="button" class="wcbd-tab-btn active" data-tab="settings">⚙️ Settings</button>
                    <button type="button" class="wcbd-tab-btn" data-tab="incomplete">📊 Incomplete Orders</button>
                </div>
                
                <!-- Settings Tab -->
                <div id="wcbd-tab-settings" class="wcbd-tab-content active">
                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                    <input type="hidden" name="action" value="wcbd_fraud_guard_save_settings">
                    <?php wp_nonce_field('wcbd_fraud_guard_settings', 'wcbd_fraud_guard_nonce'); ?>
                    
                    <!-- API Key -->
                    <div class="fraud-card">
                        <h2>🔌 API Connection</h2>
                        <div class="fraud-form-group">
                            <label>API Key</label>
                            <div style="display:flex;gap:10px;align-items:center">
                                <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="fraud-input" style="flex:1">
                                <button type="button" id="wcbd-test-api" class="fraud-btn fraud-btn-secondary">🔌 Test Connection</button>
                                <span id="wcbd-api-result" class="api-result"></span>
                            </div>
                            <small>API Key auto-generated by WebCreation BD Dashboard</small>
                        </div>
                    </div>
                    
                    <!-- Incomplete Order Tracking - NEW HIGHLIGHT -->
                    <!-- Incomplete Order Tracking - Always Enabled -->
                    <div class="fraud-card" style="background:linear-gradient(145deg,#7c2d12,#c2410c);border:none;color:#fff">
                        <h2 style="color:#fff;border-bottom-color:rgba(255,255,255,0.2)">📊 Incomplete Order Tracking <span style="background:rgba(16,185,129,0.3);color:#10b981;padding:4px 12px;border-radius:20px;font-size:12px;margin-left:10px">✓ Active</span></h2>
                        <p style="color:#fed7aa;margin:0 0 15px">License সক্রিয় থাকলে সব feature automatically চালু থাকবে।</p>
                        
                        <!-- Feature Grid -->
                        <div class="fraud-feature-grid">
                            <div class="fraud-feature-card" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)">
                                <div class="icon" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">📱</div>
                                <h4 style="color:#fff">Phone Blur Detection</h4>
                                <p style="color:#fed7aa">Customer phone enter করে অন্যখানে click করলে track হবে</p>
                            </div>
                            <div class="fraud-feature-card" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)">
                                <div class="icon" style="background:linear-gradient(135deg,#ef4444,#dc2626)">❌</div>
                                <h4 style="color:#fff">Validation Error</h4>
                                <p style="color:#fed7aa">WooCommerce checkout error হলে auto track হবে</p>
                            </div>
                            <div class="fraud-feature-card" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)">
                                <div class="icon" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🚪</div>
                                <h4 style="color:#fff">Page Exit Detection</h4>
                                <p style="color:#fed7aa">Browser tab close করলে sendBeacon এ track হবে</p>
                            </div>
                            <div class="fraud-feature-card" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2)">
                                <div class="icon" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed)">🔍</div>
                                <h4 style="color:#fff">Smart Risk Detection</h4>
                                <p style="color:#fed7aa">Same phone/IP থেকে 5+ attempts = HIGH RISK</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Popup Settings -->
                    <div class="fraud-card">
                        <h2>🎨 Popup Settings</h2>
                        <div class="fraud-grid fraud-grid-2">
                            <div class="fraud-form-group">
                                <label>Language</label>
                                <select name="language" class="fraud-select" style="width:100%">
                                    <option value="bn" <?php selected($language, 'bn'); ?>>🇧🇩 বাংলা</option>
                                    <option value="en" <?php selected($language, 'en'); ?>>🇬🇧 English</option>
                                </select>
                            </div>
                            <div class="fraud-form-group">
                                <label>Popup Auto-Close (seconds)</label>
                                <input type="number" name="popup_timer" value="<?php echo esc_attr($popup_timer); ?>" class="fraud-input" min="0" max="120">
                                <small>0 = Never auto-close</small>
                            </div>
                        </div>
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
                        <p style="color:#64748b;margin:0 0 15px;font-size:13px">Popup এ যোগাযোগের button দেখানো হবে (যদি number দেওয়া থাকে)</p>
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
                    
                    <!-- Dashboard Link -->
                    <div class="fraud-card dark">
                        <h2>🌐 Dashboard</h2>
                        <p style="color:#94a3b8;margin:0 0 15px">Incomplete orders, blacklist, logs এবং advanced settings manage করতে Dashboard এ যান।</p>
                        <a href="<?php echo esc_url($this->dashboard_url); ?>" target="_blank" class="fraud-btn fraud-btn-primary">
                            📊 Open Dashboard
                        </a>
                    </div>
                    
                    <button type="submit" class="fraud-btn fraud-btn-primary" style="width:100%;padding:16px;font-size:16px;justify-content:center">
                        💾 Save Settings
                    </button>
                </form>
                </div><!-- End Settings Tab -->
                
                <!-- Incomplete Orders Tab -->
                <div id="wcbd-tab-incomplete" class="wcbd-tab-content">
                    <div class="fraud-card dark">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                            <h2 style="margin:0;border:none;padding:0">📊 Incomplete Orders</h2>
                            <button type="button" id="refresh-incomplete" class="fraud-btn fraud-btn-secondary" style="padding:10px 20px">
                                🔄 Refresh
                            </button>
                        </div>
                        <p style="color:#94a3b8;margin:-10px 0 20px">Customers who started checkout but didn't complete their order</p>
                        
                        <div id="incomplete-orders-container">
                            <div style="text-align:center;padding:40px;color:#94a3b8">
                                <span style="font-size:24px">🔄</span>
                                <p>Loading...</p>
                            </div>
                        </div>
                    </div>
                </div><!-- End Incomplete Tab -->
                
                <!-- WebCreation BD Branding -->
                <div class="wcbd-branding">
                    <img src="https://webcreation-bd.lovable.app/logo.png" alt="WebCreation BD">
                    <h3>WebCreation BD</h3>
                    <p>Best Digital Marketing In Bangladesh</p>
                    <div class="btn-group">
                        <a href="https://webcreation-bd.lovable.app" target="_blank" class="primary">🌐 Visit Website</a>
                        <a href="<?php echo esc_url($this->dashboard_url); ?>" target="_blank" class="secondary">📊 Dashboard</a>
                    </div>
                    <p class="copyright">Powered by WebCreation BD © <?php echo date('Y'); ?></p>
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
        update_option('wcbd_fraud_guard_language', sanitize_text_field($_POST['language'] ?? 'bn'));
        update_option('wcbd_fraud_guard_popup_timer', sanitize_text_field($_POST['popup_timer'] ?? '30'));
        update_option('wcbd_fraud_guard_msg_cooldown', sanitize_textarea_field($_POST['msg_cooldown'] ?? ''));
        update_option('wcbd_fraud_guard_msg_blacklist', sanitize_textarea_field($_POST['msg_blacklist'] ?? ''));
        update_option('wcbd_fraud_guard_whatsapp', sanitize_text_field($_POST['whatsapp'] ?? ''));
        update_option('wcbd_fraud_guard_phone', sanitize_text_field($_POST['phone'] ?? ''));
        
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
    
    public function ajax_get_incomplete_orders() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = get_option('wcbd_fraud_guard_api_key', $this->api_key);
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
        // Fetch from API
        $response = wp_remote_post($this->get_incomplete_url, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'limit' => 100
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            wp_send_json_error($body['error'] ?? 'Unknown error');
            return;
        }
        
        wp_send_json_success(array(
            'orders' => $body['orders'] ?? array(),
            'stats' => $body['stats'] ?? array(
                'total' => 0,
                'suspicious' => 0,
                'converted' => 0,
                'today' => 0
            )
        ));
    }
}

new WCBD_Fraud_Guard();
`;
};

export const downloadPluginFile = async (apiKey: string): Promise<void> => {
  try {
    const zip = new JSZip();
    const pluginFolder = zip.folder('wcbd-fraud-guard');
    
    if (!pluginFolder) {
      throw new Error('Failed to create plugin folder');
    }
    
    const pluginContent = generateMainPluginFile(apiKey);
    pluginFolder.file('wcbd-fraud-guard.php', pluginContent);
    
    const readmeContent = `=== WCBD Fraud Guard ===
Contributors: WebCreation BD
Tags: woocommerce, fraud, security, order-limiter, incomplete-orders
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: ${PLUGIN_CONFIG.version}
License: GPLv2 or later

WooCommerce Anti-Fraud Protection System with Incomplete Order Tracking

== Description ==

WCBD Fraud Guard protects your WooCommerce store from fake orders and tracks incomplete checkouts.

**Core Features:**
* Order Limiting (Cooldown Period)
* Phone/IP/Device Blacklisting
* Incomplete Order Tracking
* Beautiful Block Popups
* WhatsApp/Phone Contact Buttons
* Bengali & English Support

**Incomplete Order Tracking (v${PLUGIN_CONFIG.version}):**
* 📱 Phone Blur - Track when customer enters phone and leaves
* ❌ Validation Error - Track WooCommerce checkout errors
* 🚪 Page Exit - Track when browser tab is closed
* 🔍 Smart Risk Detection - Flag suspicious activity

== Installation ==

1. Upload plugin ZIP to WordPress > Plugins > Add New > Upload
2. Activate the plugin
3. Go to Fraud Guard menu
4. API Key is pre-configured
5. Enable features you want

== Changelog ==

= ${PLUGIN_CONFIG.version} =
* NEW: Incomplete Order Tracking
* NEW: Phone Blur detection
* NEW: Page Exit detection with sendBeacon
* NEW: Smart Risk Detection (5+ attempts = HIGH)
* Simplified admin interface
* Removed unused features
* Beautiful new design

== Frequently Asked Questions ==

= How does Incomplete Order Tracking work? =
The plugin monitors three key events: when a customer enters their phone and clicks away, when WooCommerce shows validation errors, and when the browser tab is closed. All attempts are logged and flagged if suspicious.

= What is Smart Risk Detection? =
If the same phone or IP makes 5+ checkout attempts within an hour without completing, they are automatically marked as HIGH risk.

== Upgrade Notice ==

= ${PLUGIN_CONFIG.version} =
Major update with Incomplete Order Tracking. Please update!
`;
    pluginFolder.file('readme.txt', readmeContent);
    
    const blob = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = PLUGIN_CONFIG.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error generating plugin:', error);
    throw error;
  }
};
