const ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility';
const INCOMPLETE_ENDPOINT_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/log-checkout-attempt';
const GET_INCOMPLETE_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/get-incomplete-orders';
const UPDATE_SETTINGS_URL = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/update-merchant-settings';
const DASHBOARD_URL = 'https://www.webcreationbd.online/dashboard';
const WHATSAPP_DEFAULT = '+8801332052874';
import JSZip from 'jszip';
import { PLUGIN_CONFIG } from '@/config/pluginConfig';

export const generateMainPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Fraud Guard
 * Plugin URI: https://www.webcreationbd.online/fraud-guard
 * Description: Order Limiter & Anti-Fraud System for WooCommerce - Protect your store from fake orders with Incomplete Order Tracking.
 * Version: ${PLUGIN_CONFIG.version}
 * Author: WebCreation BD
 * Author URI: https://www.webcreationbd.online
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
    private $update_settings_url = '${UPDATE_SETTINGS_URL}';
    private $dashboard_url = '${DASHBOARD_URL}';
    private $whatsapp_default = '${WHATSAPP_DEFAULT}';
    
    public function __construct() {
        // NO auto-sync of API key here - only set on activation via set_default_options()
        
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('admin_post_wcbd_fraud_guard_save_settings', array($this, 'save_settings'));
        add_action('wp_ajax_wcbd_fraud_guard_test_api', array($this, 'test_api_connection'));
        add_action('wp_ajax_wcbd_fraud_guard_get_incomplete', array($this, 'ajax_get_incomplete_orders'));
        add_action('wp_ajax_wcbd_fraud_guard_get_cooldown', array($this, 'ajax_get_cooldown'));
        add_action('wp_ajax_wcbd_fraud_guard_update_cooldown', array($this, 'ajax_update_cooldown'));
        add_action('wp_ajax_wcbd_fraud_guard_convert_order', array($this, 'ajax_convert_order'));
        add_action('wp_ajax_wcbd_fraud_guard_cleanup', array($this, 'ajax_cleanup_orders'));
        add_action('wp_ajax_wcbd_fraud_guard_clean_all', array($this, 'ajax_clean_all_orders'));
        add_action('wp_footer', array($this, 'inject_popup_styles'), 99);
        
        // SERVER-SIDE fraud validation (works for ALL checkout types)
        add_action('woocommerce_checkout_process', array($this, 'server_side_fraud_check'));
        add_action('woocommerce_blocks_loaded', array($this, 'register_block_checkout_validation'));
        
        register_activation_hook(__FILE__, array($this, 'set_default_options'));
    }
    
    public function set_default_options() {
        // Only set key on first activation - use add_option (won't overwrite existing)
        add_option('wcbd_fraud_guard_api_key', $this->api_key);
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
    
    /**
     * Popup CSS - injected on ALL frontend pages (it's just CSS, zero overhead)
     */
    public function inject_popup_styles() {
        if (is_admin()) return;
        
        echo '<style id="wcbd-fraud-guard-popup-css">
.wcbd-fraud-popup-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;background:rgba(0,0,0,0.92)!important;backdrop-filter:blur(12px)!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:20px!important;box-sizing:border-box!important;margin:0!important;animation:wcbdFadeIn 0.3s ease!important;transform:none!important}
.wcbd-fraud-popup-modal{background:linear-gradient(145deg,#1a1a2e,#16213e)!important;border:1px solid rgba(255,255,255,0.12)!important;border-radius:24px!important;padding:40px 30px!important;max-width:420px!important;width:100%!important;text-align:center!important;box-shadow:0 25px 60px rgba(0,0,0,0.6)!important;animation:wcbdScaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)!important;position:relative!important;box-sizing:border-box!important;transform:none!important}
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
    
    /**
     * v8.0.0 UNIVERSAL LOADER - Load on ALL frontend pages
     * Instead of trying to detect checkout pages in PHP (which fails on CartFlows homepage),
     * we load a tiny inline loader script on every page. The JS checks the DOM for checkout
     * elements before doing anything. If no checkout found = zero overhead.
     */
    public function enqueue_frontend_scripts() {
        if (is_admin()) return;
        
        // Load tiny loader script on ALL pages - it self-detects checkout via DOM
        wp_enqueue_script('jquery');
        wp_add_inline_script('jquery', $this->get_loader_js(), 'after');
    }
    
    /**
     * Tiny loader script (< 500 bytes minified)
     * Checks DOM for checkout elements, only loads FingerprintJS + full Fraud Guard if found
     */
    private function get_loader_js() {
        $api_key = $this->api_key;
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        $popup_timer = intval(get_option('wcbd_fraud_guard_popup_timer', 30));
        $msg_cooldown = esc_js(get_option('wcbd_fraud_guard_msg_cooldown', 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।'));
        $msg_blacklist = esc_js(get_option('wcbd_fraud_guard_msg_blacklist', 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।'));
        $whatsapp = esc_js(get_option('wcbd_fraud_guard_whatsapp', ''));
        $phone = esc_js(get_option('wcbd_fraud_guard_phone', ''));
        $endpoint = esc_js($this->endpoint);
        $incomplete_endpoint = esc_js($this->incomplete_endpoint);
        
        $js_template = <<<'LOADERJS'
(function(){
'use strict';
function wcbdIsThankYou(){
var url=window.location.href;
if(url.indexOf('/order-received/')!==-1||url.indexOf('order-received')!==-1||url.indexOf('/checkout/order-received/')!==-1)return true;
var tySelectors=['.woocommerce-order-received','.woocommerce-thankyou-order-received','.wc-block-order-confirmation-status','.wc-block-order-confirmation-summary','[data-block-name="woocommerce/order-confirmation-status"]'];
for(var i=0;i<tySelectors.length;i++){if(document.querySelector(tySelectors[i]))return true;}
return false;
}
function wcbdCheckout(){
var selectors=[
'form.checkout','.wc-block-checkout','.woocommerce-checkout','#payment','#order_review',
'#billing_phone','input[name="billing_phone"]','.wc-block-components-text-input input[type="tel"]','input[autocomplete="tel"]',
'input[type="tel"]','input[inputmode="tel"]','input[inputmode="numeric"]',
'input[id*="phone" i]','input[name*="phone" i]',
'input[id*="mobile" i]','input[name*="mobile" i]',
'input[id*="contact" i]','input[name*="contact" i]',
'.cartflows-form-container','.cf-step','.elementor-form','.wpforms-form','.gform_wrapper','.fluentform'
];
for(var i=0;i<selectors.length;i++){try{if(document.querySelector(selectors[i]))return true;}catch(e){}}
// Placeholder-based detection (custom React/Next themes with bare inputs)
var phRe=/(01[\s0-9xX*-]{6,}|phone|mobile|tel|whatsapp|মোবাইল|ফোন|নাম্বার|নম্বর)/i;
var allInputs=document.querySelectorAll('input,textarea');
for(var p=0;p<allInputs.length;p++){
try{
var inp=allInputs[p];
var ph=(inp.getAttribute&&(inp.getAttribute('placeholder')||inp.getAttribute('aria-label')))||'';
if(ph&&phRe.test(ph))return true;
}catch(e){}
}
// Heuristic: any form with a phone-like input
var forms=document.querySelectorAll('form');
for(var k=0;k<forms.length;k++){
try{if(forms[k].querySelector('input[type="tel"], [name*="phone" i], [name*="mobile" i], [id*="phone" i], [id*="mobile" i]'))return true;}catch(e){}
}
return false;
}

function wcbdCleanupCompleted(){
console.log('[WCBD v${PLUGIN_CONFIG.version}] Thank You page detected - running cleanup...');
var jQ=jQuery;
var orderPhone='';
var phoneSelectors=[
'.woocommerce-order-overview .woocommerce-order-overview__phone',
'.woocommerce-customer-details address',
'.woocommerce-column--billing-address address',
'.wc-block-order-confirmation-billing-address',
'.wc-block-order-confirmation-summary',
'.wc-block-order-confirmation-billing-wrapper address',
'.woocommerce-column--billing-address',
'[data-block-name="woocommerce/order-confirmation-billing-address"]'
];
jQ(phoneSelectors.join(',')).each(function(){
var text=jQ(this).text();
var match=text.match(/01[0-9]{9}/);
if(match&&!orderPhone)orderPhone=match[0];
});
if(!orderPhone){
var allText=document.body.innerText||'';
var phoneMatch=allText.match(/01[0-9]{9}/);
if(phoneMatch)orderPhone=phoneMatch[0];
}
if(orderPhone){
console.log('[WCBD] Cleaning up incomplete record for phone:',orderPhone);
jQ.ajax({
url:'%%INCOMPLETE_ENDPOINT%%',method:'POST',contentType:'application/json',
data:JSON.stringify({api_key:'%%APIKEY%%',action:'completed',phone:orderPhone}),
success:function(r){console.log('[WCBD] ✅ Incomplete record cleaned up:',r);},
error:function(xhr,status,err){console.error('[WCBD] Cleanup error:',err);}
});
}else{
console.log('[WCBD] Could not detect phone number on Thank You page - retrying in 2s...');
setTimeout(function(){
var retryText=document.body.innerText||'';
var retryMatch=retryText.match(/01[0-9]{9}/);
if(retryMatch){
console.log('[WCBD] Retry: found phone',retryMatch[0]);
jQ.ajax({
url:'%%INCOMPLETE_ENDPOINT%%',method:'POST',contentType:'application/json',
data:JSON.stringify({api_key:'%%APIKEY%%',action:'completed',phone:retryMatch[0]}),
success:function(r){console.log('[WCBD] ✅ Retry cleanup success:',r);},
error:function(xhr,status,err){console.error('[WCBD] Retry cleanup error:',err);}
});
}else{
console.log('[WCBD] Retry: still no phone found on page');
}
},2000);
}
}
function wcbdLoad(){
if(wcbdIsThankYou()){wcbdCleanupCompleted();return;}
if(!wcbdCheckout()){return;}
console.log('[WCBD v${PLUGIN_CONFIG.version}] Checkout detected - loading Fraud Guard...');
var s=document.createElement('script');
s.src='https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
s.onload=function(){wcbdInit();};
s.onerror=function(){console.warn('[WCBD] FingerprintJS failed to load - continuing without device ID');wcbdInit();};
document.head.appendChild(s);
}
function wcbdInit(){
var jQ=jQuery;
var WCBD_FG={
deviceId:null,
endpoint:'%%ENDPOINT%%',
incompleteEndpoint:'%%INCOMPLETE_ENDPOINT%%',
apiKey:'%%APIKEY%%',
lang:'%%LANG%%',
popupTimer:%%TIMER%%,
msgCooldown:'%%MSG_COOLDOWN%%',
msgBlacklist:'%%MSG_BLACKLIST%%',
whatsapp:'%%WHATSAPP%%',
phone:'%%PHONE%%',
incompleteLogged:{},
licenseValid:false,
isBlockCheckout:false,
blockCheckoutValidating:false,
blockCheckoutAllowed:false,
universalValidating:false,
universalAllowed:false,
ajaxOrderValidating:false,
ajaxOrderReplaying:false,

init:function(){
var self=this;
console.log('[WCBD Fraud Guard v${PLUGIN_CONFIG.version}] Initializing...');

this.validateLicense(function(valid){
if(!valid){
console.warn('[WCBD] License invalid - All features DISABLED');
return;
}
self.licenseValid=true;
console.log('[WCBD] License valid - Enabling features...');

if(typeof FingerprintJS!=='undefined'){
FingerprintJS.load().then(function(fp){fp.get().then(function(r){
self.deviceId=r.visitorId;
console.log('[WCBD] Device ID ready:',r.visitorId);
document.cookie='wcbd_device_id='+r.visitorId+';path=/;max-age=86400;SameSite=Lax';
var existingHidden=document.querySelector('input[name=wcbd_device_id]');
if(!existingHidden){
var forms=document.querySelectorAll('form.checkout,form.wc-block-checkout__form,.wp-block-woocommerce-checkout form');
forms.forEach(function(f){var h=document.createElement('input');h.type='hidden';h.name='wcbd_device_id';h.value=r.visitorId;f.appendChild(h);});
}else{existingHidden.value=r.visitorId;}
});});
}

self.isBlockCheckout=self.detectBlockCheckout();
console.log('[WCBD] Checkout type: '+(self.isBlockCheckout?'Block':'Classic'));

if(self.isBlockCheckout){
self.hookBlockCheckout();
}else{
jQ('form.checkout').on('checkout_place_order',function(){return self.validate(jQ(this));});
}

self.setupUniversalInterceptor();
self.setupAjaxOrderInterceptor();
self.setupIncompleteTracking();
console.log('[WCBD Fraud Guard v${PLUGIN_CONFIG.version}] Ready');
});
},

detectBlockCheckout:function(){
if(document.querySelector('.wc-block-checkout')||document.querySelector('.wp-block-woocommerce-checkout')||document.querySelector('[data-block-name="woocommerce/checkout"]'))return true;
if(document.querySelector('form.checkout.woocommerce-checkout'))return false;
if(document.querySelector('.wc-block-components-checkout-place-order-button'))return true;
return false;
},

hookBlockCheckout:function(){
var self=this;
console.log('[WCBD] Setting up Block Checkout interception...');

var observer=new MutationObserver(function(){
var btn=document.querySelector('.wc-block-components-checkout-place-order-button');
if(btn&&!btn.dataset.wcbdHooked){
btn.dataset.wcbdHooked='true';
console.log('[WCBD] Block checkout button found - attaching interceptor');
self.attachBlockInterceptor(btn);
}
});
observer.observe(document.body,{childList:true,subtree:true});

var btn=document.querySelector('.wc-block-components-checkout-place-order-button');
if(btn&&!btn.dataset.wcbdHooked){
btn.dataset.wcbdHooked='true';
self.attachBlockInterceptor(btn);
}

jQ(document).on('click','.wc-block-components-checkout-place-order-button',function(e){
if(!self.licenseValid)return;
if(self.blockCheckoutAllowed)return;
if(self.blockCheckoutValidating)return;
var btn=this;
if(!this.dataset.wcbdHooked){
this.dataset.wcbdHooked='true';
e.preventDefault();
e.stopImmediatePropagation();
var ph=self.getBlockCheckoutPhone();
if(!ph||ph.length<5)return;
self.doPrecheck(ph,jQ(btn),function(allowed){
if(allowed){
self.blockCheckoutAllowed=true;
btn.click();
}
});
}
});
},

attachBlockInterceptor:function(btn){
var self=this;
btn.addEventListener('click',function(e){
if(self.blockCheckoutValidating)return;
if(self.blockCheckoutAllowed){self.blockCheckoutAllowed=false;console.log('[WCBD] Block checkout allowed - submitting');return;}

e.preventDefault();
e.stopImmediatePropagation();
self.blockCheckoutValidating=true;
var ph=self.getBlockCheckoutPhone();

if(!ph){
self.blockCheckoutValidating=false;
self.blockCheckoutAllowed=true;
btn.click();
return;
}

if(!self.phoneOk(ph)){self.blockCheckoutValidating=false;self.phoneError();return;}

console.log('[WCBD] Block checkout prechecking phone:',ph);
self.doPrecheck(ph,jQ(btn),function(allowed){
self.blockCheckoutValidating=false;
if(allowed){
self.blockCheckoutAllowed=true;
btn.click();
}
});
},true);
},

getBlockCheckoutPhone:function(){
// Broad phone-field detection for ANY checkout (Woo classic, block, CartFlows, Elementor, WPForms, custom themes)
var selectors=[
'#billing_phone','#phone','#billing-phone','#mobile','#contact_phone','#customer_phone',
'input[name="billing_phone"]','input[name="phone"]','input[name="mobile"]','input[name="contact"]','input[name="contact_phone"]','input[name="customer_phone"]','input[name="phone_number"]','input[name="tel"]',
'input[id*="phone" i]','input[id*="mobile" i]','input[name*="phone" i]','input[name*="mobile" i]',
'.wc-block-components-text-input input[type="tel"]','input[autocomplete="tel"]','input[autocomplete="tel-national"]','input[type="tel"]','input[inputmode="tel"]','input[inputmode="numeric"]'
];
for(var i=0;i<selectors.length;i++){
try{
var els=document.querySelectorAll(selectors[i]);
for(var j=0;j<els.length;j++){
var el=els[j];
if(el&&el.value&&(''+el.value).trim().length>=5&&el.offsetParent!==null)return (''+el.value).trim();
}
}catch(e){}
}
// Placeholder/aria-label heuristic for custom React/Next themes (no name/id/type)
var phRe=/(01[\s0-9xX*-]{4,}|phone|mobile|tel|whatsapp|মোবাইল|ফোন|নাম্বার|নম্বর)/i;
var allInputs=document.querySelectorAll('input,textarea');
for(var k=0;k<allInputs.length;k++){
try{
var inp=allInputs[k];
if(!inp.value||inp.offsetParent===null)continue;
var v=(''+inp.value).trim();
if(v.length<5)continue;
var meta=((inp.getAttribute&&(inp.getAttribute('placeholder')||''))+' '+(inp.getAttribute&&(inp.getAttribute('aria-label')||''))).toLowerCase();
// Match if placeholder/label looks phone-like OR value itself matches BD phone
if(phRe.test(meta)||/^01[0-9]{9}$/.test(v.replace(/[^0-9]/g,'').replace(/^880/,'0'))) return v;
}catch(e){}
}
return '';
},


validateLicense:function(callback){
console.log('[WCBD] Validating license...');
jQ.ajax({
url:this.endpoint,method:'POST',contentType:'application/json',timeout:10000,
data:JSON.stringify({api_key:this.apiKey,check_type:'license',domain:window.location.hostname}),
success:function(r){
console.log('[WCBD] License check response:',r);
if(r.reason==='inactive'||r.reason==='expired'||r.reason==='limit_exceeded'||r.reason==='domain_mismatch'){
callback(false);
}else{
callback(true);
}
},
error:function(xhr,status,err){
console.error('[WCBD] License validation error:',err);
callback(false);
}
});
},

setupUniversalInterceptor:function(){
var self=this;
if(!this.licenseValid)return;
console.log('[WCBD] Setting up universal fallback interceptor (form submit + button click)...');

// Helper: does this element/form look like a checkout?
function looksLikeCheckout(root){
if(!root)return false;
var hay=(root.className||'')+' '+(root.id||'');
if(/checkout|order|cartflows|cf-|elementor-form|wpforms|gform|fluentform/i.test(hay))return true;
if(root.querySelector&&(root.querySelector('[name*="billing_phone"]')||root.querySelector('input[autocomplete="tel"]')||root.querySelector('input[type="tel"]')||root.querySelector('[name*="phone" i]')||root.querySelector('[name*="mobile" i]')))return true;
return false;
}

// 1) Form-submit interception (covers traditional + jQuery submit)
jQ(document).on('submit','form',function(e){
if(!self.licenseValid)return;
if(self.universalAllowed){self.universalAllowed=false;return;}
if(self.blockCheckoutAllowed)return;
if(self.universalValidating)return;

var form=jQ(this);
var formEl=form[0];
// SKIP: standard WooCommerce classic checkout — handled by checkout_place_order event
if(formEl&&formEl.classList&&(formEl.classList.contains('checkout')||formEl.classList.contains('woocommerce-checkout')))return;
// SKIP: WooCommerce block checkout — handled by attachBlockInterceptor
if(self.isBlockCheckout)return;
if(formEl&&formEl.closest&&formEl.closest('.wc-block-checkout, .wp-block-woocommerce-checkout'))return;

if(!looksLikeCheckout(formEl))return;

var ph=self.getBlockCheckoutPhone();
if(!ph||ph.length<5)return;

if(!self.phoneOk(ph)){e.preventDefault();e.stopImmediatePropagation();self.phoneError();return;}

e.preventDefault();
e.stopImmediatePropagation();
self.universalValidating=true;
console.log('[WCBD] Universal interceptor caught form submit, phone:',ph);

self.doPrecheck(ph,form.find('button[type="submit"],input[type="submit"]'),function(allowed){
self.universalValidating=false;
if(allowed){
self.universalAllowed=true;
try{formEl.submit();}catch(e){form.trigger('submit');}
}
});
});

// 2) Capture-phase button-click interception (covers AJAX/custom checkouts that never .submit())
document.addEventListener('click',function(e){
if(!self.licenseValid)return;
if(self.universalAllowed){self.universalAllowed=false;return;}
if(self.blockCheckoutAllowed)return;
if(self.universalValidating)return;

var t=e.target;
if(!t)return;
// Walk up to find a button/link
var btn=t.closest&&t.closest('button,input[type="submit"],input[type="button"],a.button,a.btn,[role="button"]');
if(!btn)return;
if(btn.dataset&&btn.dataset.wcbdClickHooked==='1')return;

// Skip Woo block checkout button — handled separately
if(btn.classList&&btn.classList.contains('wc-block-components-checkout-place-order-button'))return;
// SKIP: button inside standard WooCommerce classic/block checkout — let WC handle it
if(btn.closest&&btn.closest('form.checkout, form.woocommerce-checkout, .wc-block-checkout, .wp-block-woocommerce-checkout'))return;
if(self.isBlockCheckout)return;

var label=((btn.textContent||btn.value||'')+' '+(btn.className||'')+' '+(btn.id||'')+' '+(btn.getAttribute('name')||'')).toLowerCase();
var bn=(btn.textContent||btn.value||'').trim();
// Match common place-order labels in English + Bangla (removed bare "checkout" — too broad)
var isOrderBtn=/place\s*order|place_order|placeorder|confirm\s*order|submit\s*order|complete\s*order|buy\s*now|order\s*now|pay\s*now|অর্ডার|কনফার্ম|নিশ্চিত|কিনুন|পেমেন্ট/i.test(label)||/অর্ডার|কনফার্ম|নিশ্চিত|কিনুন/i.test(bn);
if(!isOrderBtn)return;

// Make sure there's a phone field on the page
var ph=self.getBlockCheckoutPhone();
if(!ph||ph.length<5)return;

// Make sure we're on something checkout-like
var container=btn.closest&&btn.closest('form, .checkout, .cartflows-container, .cf-step, .elementor-form, .wpforms-form, .gform_wrapper, .fluentform, body');
if(!looksLikeCheckout(container)&&!looksLikeCheckout(document.body))return;

if(!self.phoneOk(ph)){e.preventDefault();e.stopImmediatePropagation();self.phoneError();return;}

e.preventDefault();
e.stopImmediatePropagation();
self.universalValidating=true;
console.log('[WCBD] Universal click interceptor caught button:',bn,'phone:',ph);

self.doPrecheck(ph,jQ(btn),function(allowed){
self.universalValidating=false;
if(allowed){
self.universalAllowed=true;
btn.dataset.wcbdClickHooked='1';
// Replay the click so the site's own handler runs
setTimeout(function(){try{btn.click();}catch(e){}},10);
}
});
},true);
},

setupAjaxOrderInterceptor:function(){
var self=this;
if(!this.licenseValid||!window.jQuery||window.__wcbdAjaxOrderHooked)return;
window.__wcbdAjaxOrderHooked=true;
console.log('[WCBD] Setting up AJAX order interceptor for custom checkouts...');

var originalAjax=jQ.ajax;
var originalPost=jQ.post;

function dataToString(data){
try{
if(!data)return '';
if(typeof data==='string')return data;
if(data instanceof FormData){var arr=[];data.forEach(function(v,k){arr.push(k+'='+v);});return arr.join('&');}
if(typeof data==='object')return Object.keys(data).map(function(k){return k+'='+data[k];}).join('&');
return ''+data;
}catch(e){return '';}
}

function dataValue(data,key){
try{
if(!data)return '';
if(typeof data==='object'&&!(data instanceof FormData))return data[key]||'';
if(data instanceof FormData)return data.get(key)||'';
var m=('&'+dataToString(data)).match(new RegExp('[&?]'+key+'=([^&]+)','i'));
return m?decodeURIComponent((''+m[1]).replace(/\\+/g,' ')):'';
}catch(e){return '';}
}

function normalizePhone(v){return (''+(v||'')).replace(/[^0-9]/g,'').replace(/^0088/,'0').replace(/^880/,'0');}

function ajaxLooksLikeOrder(url,data){
var hay=((url||'')+' '+dataToString(data)).toLowerCase();
if(hay.indexOf('check-order-eligibility')!==-1||hay.indexOf('log-checkout-attempt')!==-1)return false;
if(/wc-ajax=checkout|woocommerce_checkout/i.test(hay))return false;
if(/choloman_place_order|custom_place_order|place_order|place-order|submit_order|confirm_order/i.test(hay))return true;
if(/admin-ajax\.php/i.test(hay)&&/action=.*(order|checkout|place)/i.test(hay)&&/(phone|mobile|billing_phone|address|product_id)/i.test(hay))return true;
return false;
}

function phoneFromAjax(data){
var ph=dataValue(data,'billing_phone')||dataValue(data,'phone')||dataValue(data,'mobile')||dataValue(data,'customer_phone')||self.getBlockCheckoutPhone();
var normalized=normalizePhone(ph);
return /^01[0-9]{9}$/.test(normalized)?normalized:ph;
}

function guardedAjax(args,runner,settings){
var url=(settings&&settings.url)||'';
var data=settings&&settings.data;
if(!ajaxLooksLikeOrder(url,data))return runner();
if(self.ajaxOrderReplaying)return runner();
if(self.ajaxOrderValidating)return runner();
var ph=phoneFromAjax(data);
if(!ph||(''+ph).length<5)return runner();
if(!self.phoneOk(ph)){
self.phoneError();
var d0=jQ.Deferred();
d0.rejectWith(settings||this,[{status:400,responseJSON:{success:false,data:{message:'Invalid phone number'}}},'wcbd_invalid_phone','Invalid phone number']);
return d0.promise({abort:function(){d0.reject();}});
}

console.log('[WCBD] AJAX order intercepted, phone:',ph);
var dfd=jQ.Deferred();
var btn=jQ('button[type="submit"]:visible,input[type="submit"]:visible').last();
self.ajaxOrderValidating=true;
self.doPrecheck(ph,btn,function(allowed){
self.ajaxOrderValidating=false;
if(allowed){
self.ajaxOrderReplaying=true;
var req=runner();
self.ajaxOrderReplaying=false;
req.done(function(){dfd.resolveWith(this,arguments);}).fail(function(){dfd.rejectWith(this,arguments);}).always(function(){dfd.notifyWith&&dfd.notifyWith(this,arguments);});
}else{
dfd.rejectWith(settings||this,[{status:403,responseJSON:{success:false,data:{message:'Blocked by WCBD Fraud Guard'}}},'wcbd_blocked','Blocked by WCBD Fraud Guard']);
}
},'order');
return dfd.promise({abort:function(){dfd.reject();}});
}

jQ.ajax=function(url,options){
var args=arguments;
var settings=typeof url==='object'?url:(options||{});
if(typeof url==='string')settings=Object.assign({},settings,{url:url});
return guardedAjax(args,function(){return originalAjax.apply(jQ,args);},settings);
};

jQ.post=function(url,data,success,dataType){
var args=arguments;
var settings={url:url,data:data,type:'POST'};
return guardedAjax(args,function(){return originalPost.apply(jQ,args);},settings);
};
},

normalizeBdPhone:function(v){return (''+(v||'')).replace(/[^0-9]/g,'').replace(/^0088/,'0').replace(/^880/,'0');},

phoneOk:function(v){return /^01[0-9]{9}$/.test(this.normalizeBdPhone(v));},

phoneError:function(){
var msg=this.lang==='bn'?'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)':'Please enter a valid 11-digit mobile number (e.g. 01XXXXXXXXX)';
try{
var el=document.querySelector('#billing_phone,#phone,#billing-phone,input[type="tel"],input[name*="phone" i],input[name*="mobile" i],input[id*="phone" i],input[id*="mobile" i]');
var box=document.getElementById('wcbd-phone-error');
if(!box){
box=document.createElement('div');
box.id='wcbd-phone-error';
box.style.cssText='color:#e11d48;font-size:14px;font-weight:600;margin:6px 0;line-height:1.4;';
if(el&&el.parentElement)el.parentElement.appendChild(box);else document.body.appendChild(box);
}
box.textContent=msg;
if(el){
try{el.style.borderColor='#e11d48';}catch(e){}
try{el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
if(!el.dataset.wcbdPhoneWatch){
el.dataset.wcbdPhoneWatch='1';
el.addEventListener('input',function(){
var b=document.getElementById('wcbd-phone-error');
if(b&&/^01[0-9]{9}$/.test((el.value||'').replace(/[^0-9]/g,'').replace(/^0088/,'0').replace(/^880/,'0'))){b.textContent='';try{el.style.borderColor='';}catch(e){}}
});
}
}else{alert(msg);}
}catch(e){try{alert(msg);}catch(e2){}}
},

doPrecheck:function(phone,btnEl,callback){
var self=this;
var origText=btnEl.length?btnEl.text():'';
if(btnEl.length){btnEl.prop('disabled',true).text(self.lang==='bn'?'চেক করা হচ্ছে...':'Checking...');}

var checkType=arguments.length>3&&arguments[3]?arguments[3]:'precheck';
jQ.ajax({
url:self.endpoint,method:'POST',contentType:'application/json',timeout:12000,
data:JSON.stringify({api_key:self.apiKey,phone:phone,device_id:self.deviceId,domain:window.location.hostname,check_type:checkType}),
success:function(r){
console.log('[WCBD] Precheck response:',r);
if(r.popup_settings)self.applyRemoteSettings(r.popup_settings);
if(r.allowed){
if(btnEl.length)btnEl.prop('disabled',false).text(origText);
if(callback)callback(true);
}else{
if(btnEl.length)btnEl.prop('disabled',false).text(origText);
var customMsg=r.reason==='blacklist'?self.msgBlacklist:self.msgCooldown;
self.popup(r.reason,customMsg,r.minutes_remaining);
if(callback)callback(false);
}
},
error:function(xhr,status,err){
console.error('[WCBD] Precheck error:',err);
if(btnEl.length)btnEl.prop('disabled',false).text(origText);
if(callback)callback(true);
}
});
},

setupIncompleteTracking:function(){
var self=this;
if(!this.licenseValid)return;
console.log('[WCBD] Setting up v${PLUGIN_CONFIG.version} AJAX field tracking (800ms debounce + universal field detection)...');

var trackTimer=null;
var phoneSelector='#billing_phone,#phone,#billing-phone,input[id*="phone"],input[autocomplete="tel"],input[name="billing_phone"]';
var nameSelector='#billing_first_name,input[name="billing_first_name"],input[autocomplete="given-name"]';
var addressSelector='#billing_address_1,input[name="billing_address_1"],input[autocomplete="address-line1"]';
var emailSelector='#billing_email,input[name="billing_email"],input[autocomplete="email"]';

function fieldMeta(el){
try{
var s=((el.getAttribute('placeholder')||'')+' '+(el.getAttribute('aria-label')||'')+' '+(el.getAttribute('name')||'')+' '+(el.id||'')+' '+(el.className||''));
// also include nearby label text
var parent=el.parentElement;
if(parent){
var lbl=parent.querySelector&&parent.querySelector('label');
if(lbl)s+=' '+lbl.textContent;
var prev=el.previousElementSibling;
if(prev&&prev.tagName==='LABEL')s+=' '+prev.textContent;
}
return s.toLowerCase();
}catch(e){return '';}
}

function detectField(kind){
// kind: 'phone'|'name'|'address'|'email'
var fixedSel={
phone:phoneSelector,
name:nameSelector,
address:addressSelector,
email:emailSelector
}[kind];
// 1) Try known WooCommerce-style selectors first
var sels=fixedSel.split(',');
for(var i=0;i<sels.length;i++){
try{var el=document.querySelector(sels[i].trim());if(el&&el.value&&el.offsetParent!==null)return (el.value||'').trim();}catch(e){}
}
// 2) Heuristic across all visible inputs (custom React/Next themes)
var re=({
phone:/(phone|mobile|tel|whatsapp|মোবাইল|ফোন|নাম্বার|নম্বর)/i,
name:/(name|নাম|আপনার নাম)/i,
address:/(address|ঠিকানা|বাড়ি|রোড|এরিয়া|থানা|জেলা)/i,
email:/(email|ই-?মেইল|ইমেইল)/i
})[kind];
var inputs=document.querySelectorAll('input,textarea');
for(var k=0;k<inputs.length;k++){
try{
var inp=inputs[k];
if(!inp.value||inp.offsetParent===null)continue;
var meta=fieldMeta(inp);
if(re&&re.test(meta))return (''+inp.value).trim();
// phone fallback: BD pattern in value
if(kind==='phone'){
var nv=(''+inp.value).replace(/[^0-9]/g,'');
if(/^(880)?0?1[0-9]{9}$/.test(nv))return (''+inp.value).trim();
}
}catch(e){}
}
return '';
}

function getCartItems(){
try{
var items=[];
jQ('.woocommerce-checkout-review-order-table .cart_item').each(function(){
var row=jQ(this);
var name=row.find('.product-name').text().trim().split('\\n')[0].trim();
var qty=parseInt(row.find('.product-quantity').text().replace(/[^0-9]/g,''))||1;
var priceText=row.find('.product-total .amount').text().replace(/[^0-9.]/g,'');
var price=parseFloat(priceText)||0;
if(name){items.push({name:name,price:price,quantity:qty});}
});
return items;
}catch(e){return [];}
}

function getCartTotal(){
try{
var total=jQ('.order-total .amount').text().replace(/[^0-9.]/g,'');
return parseFloat(total)||0;
}catch(e){return 0;}
}

function trackFields(){
var phone=detectField('phone');
if(!phone)return;
var normalized=phone.replace(/[^0-9]/g,'').replace(/^880/,'0').replace(/^0088/,'0');
if(!/^01[0-9]{9}$/.test(normalized))return;

var name=detectField('name');
var lastNameEl=document.querySelector('#billing_last_name,input[name="billing_last_name"],input[autocomplete="family-name"]');
var lastName=(lastNameEl&&lastNameEl.value&&lastNameEl.value!=='undefined')?lastNameEl.value.trim():'';
if(lastName)name=(name+' '+lastName).trim();
var address=detectField('address');
var email=detectField('email');

console.log('[WCBD] Tracking checkout fields:',normalized,email?'(email: '+email+')':'');

var data={
api_key:self.apiKey,
action:'update',
phone:normalized,
name:name||'',
email:email||'',
address:address||'',
ip:'',
device_id:self.deviceId||'',
cart_total:getCartTotal(),
cart_items:getCartItems()
};

jQ.ajax({
url:self.incompleteEndpoint,method:'POST',contentType:'application/json',
data:JSON.stringify(data),
success:function(r){console.log('[WCBD] Field tracking logged:',r);},
error:function(xhr,status,err){console.error('[WCBD] Field tracking error:',err);}
});
}

// Bind to KNOWN selectors AND to every input/textarea on the page (covers custom themes with no name/id)
jQ(document).on('input',phoneSelector+','+nameSelector+','+addressSelector+','+emailSelector+',input,textarea',function(){
clearTimeout(trackTimer);
trackTimer=setTimeout(trackFields,800);
});

console.log('[WCBD] v${PLUGIN_CONFIG.version} AJAX field tracking ready (800ms debounce + universal detection)');
},


validate:function(f){
var self=this;
if(!this.licenseValid){
console.warn('[WCBD] License invalid - skipping validation');
return true;
}
var ph=jQ('#billing_phone').val()||this.getBlockCheckoutPhone();
if(!this.phoneOk(ph)){this.phoneError();return false;}
var btn=f.find('button[type=submit]');
btn.prop('disabled',true).data('txt',btn.text()).html(this.lang==='bn'?'চেক করা হচ্ছে...':'Checking...');
console.log('[WCBD] Validating order...');
this.checkEligibility(f,ph,btn);
return false;
},

checkEligibility:function(f,phone,btn){
var self=this;
jQ.ajax({
url:this.endpoint,method:'POST',contentType:'application/json',
data:JSON.stringify({api_key:this.apiKey,phone:phone,device_id:this.deviceId,domain:window.location.hostname,check_type:'precheck'}),
success:function(r){
console.log('[WCBD] API Response:',r);
if(r.popup_settings)self.applyRemoteSettings(r.popup_settings);
if(r.allowed){
f.off('checkout_place_order').submit();
}else{
var customMsg=r.reason==='blacklist'?self.msgBlacklist:self.msgCooldown;
self.popup(r.reason,customMsg,r.minutes_remaining);
btn.prop('disabled',false).text(btn.data('txt'));
}
},
error:function(xhr,status,err){
console.error('[WCBD] API Error:',err);
f.off('checkout_place_order').submit();
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
console.log('[WCBD] Applied remote settings');
},

formatTime:function(mins){
if(mins<60)return mins+(this.lang==='bn'?' মিনিট':' minute(s)');
var hours=Math.floor(mins/60);
var m=mins%60;
if(mins<1440){
var hourStr=hours+(this.lang==='bn'?' ঘন্টা':' hour(s)');
var minStr=m>0?' '+m+(this.lang==='bn'?' মিনিট':' min'):'';
return hourStr+minStr;
}
var days=Math.floor(mins/1440);
var remHrs=Math.floor((mins%1440)/60);
var dayStr=days+(this.lang==='bn'?' দিন':' day(s)');
var hrStr=remHrs>0?' '+remHrs+(this.lang==='bn'?' ঘন্টা':' hr'):'';
return dayStr+hrStr;
},

popup:function(type,msg,mins){
var self=this;
if(!this.licenseValid)return;
console.log('[WCBD] Showing popup:',type);

jQ('#wcbdFraudPopup').remove();

var icons={blacklist:'🚫',cooldown:'⏱️'};
var titles=this.lang==='bn'?{blacklist:'অর্ডার ব্লক করা হয়েছে',cooldown:'অপেক্ষা করুন'}:{blacklist:'Order Blocked',cooldown:'Please Wait'};

var timeDisplay=mins?'<p class="wcbd-fraud-popup-time">⏰ '+this.formatTime(mins)+' '+(this.lang==='bn'?'বাকি':'remaining')+'</p>':'';

var contactHtml='';
if(this.whatsapp||this.phone){
contactHtml='<div class="wcbd-fraud-popup-contact-box">';
contactHtml+='<p class="wcbd-fraud-popup-contact-title">'+(this.lang==='bn'?'📞 সমস্যা হলে যোগাযোগ করুন':'📞 Contact Us')+'</p>';
contactHtml+='<div class="wcbd-fraud-popup-contact">';
if(this.whatsapp){
var waNum=this.whatsapp.replace(/\\D/g,'');
contactHtml+='<a href="https://wa.me/'+waNum+'" target="_blank" class="wcbd-fraud-popup-whatsapp">💬 WhatsApp</a>';
}
if(this.phone){
contactHtml+='<a href="tel:'+this.phone+'" class="wcbd-fraud-popup-phone">📱 '+(this.lang==='bn'?'ফোন করুন':'Call')+'</a>';
}
contactHtml+='</div></div>';
}

var timerHtml=this.popupTimer>0?'<span class="wcbd-fraud-popup-countdown">('+this.popupTimer+'s)</span>':'';
var btnText=this.lang==='bn'?'ঠিক আছে':'OK';

var html='<div class="wcbd-fraud-popup-overlay" id="wcbdFraudPopup" style="position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;background:rgba(0,0,0,0.92)!important;backdrop-filter:blur(12px)!important;margin:0!important;padding:20px!important;box-sizing:border-box!important;transform:none!important">';
html+='<div class="wcbd-fraud-popup-modal" style="position:relative!important;transform:none!important;max-width:420px!important;width:100%!important">';
html+='<div class="wcbd-fraud-popup-icon '+type+'">'+(icons[type]||'⚠️')+'</div>';
html+='<h3 class="wcbd-fraud-popup-title">'+(titles[type]||'Error')+'</h3>';
html+='<p class="wcbd-fraud-popup-message">'+msg+'</p>';
html+=timeDisplay;
html+=contactHtml;
html+='<button class="wcbd-fraud-popup-button" id="wcbdFraudBtn">'+btnText+' '+timerHtml+'</button>';
html+='</div></div>';

var existing=document.getElementById('wcbdFraudPopup');
if(existing){existing.remove();}
var container=document.createElement('div');
container.innerHTML=html;
var popup=container.firstChild;
document.body.appendChild(popup);
document.body.style.overflow='hidden';
window.scrollTo(0,0);

var wcbdClosePopup=function(){var el=document.getElementById('wcbdFraudPopup');if(el){el.remove();}document.body.style.overflow='';jQ(document).off('keydown.wcbdPopup');};
jQ('#wcbdFraudBtn').on('click',wcbdClosePopup);
jQ(document).on('keydown.wcbdPopup',function(e){if(e.key==='Escape'){wcbdClosePopup();}});
jQ('#wcbdFraudPopup').on('click',function(e){if(jQ(e.target).hasClass('wcbd-fraud-popup-overlay')){wcbdClosePopup();}});

if(this.popupTimer>0){
var countdown=this.popupTimer;
var interval=setInterval(function(){
countdown--;
jQ('#wcbdFraudBtn .wcbd-fraud-popup-countdown').text('('+countdown+'s)');
if(countdown<=0){
clearInterval(interval);
wcbdClosePopup();
}
},1000);
}
}
};

WCBD_FG.init();
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',wcbdLoad);}else{wcbdLoad();}
})();
LOADERJS;

        return str_replace(
            array('%%ENDPOINT%%', '%%INCOMPLETE_ENDPOINT%%', '%%APIKEY%%', '%%LANG%%', '%%TIMER%%', '%%MSG_COOLDOWN%%', '%%MSG_BLACKLIST%%', '%%WHATSAPP%%', '%%PHONE%%'),
            array($endpoint, $incomplete_endpoint, esc_js($api_key), $language, $popup_timer, $msg_cooldown, $msg_blacklist, $whatsapp, $phone),
            $js_template
        );
    }
    
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_wcbd-fraud-guard') return;
        
        wp_add_inline_style('wp-admin', $this->get_admin_css());
        wp_add_inline_script('jquery', $this->get_admin_js(), 'after');
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
        
        .fraud-card{background:#fff;border:1px solid #e0e0e0;border-radius:16px;padding:25px;margin-bottom:20px;box-shadow:0 4px 12px rgba(0,0,0,0.05);transition:transform 0.2s,box-shadow 0.2s}
        .fraud-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08)}
        .fraud-card h2{margin:0 0 20px;padding:0 0 15px;border-bottom:2px solid #f1f5f9;font-size:18px;display:flex;align-items:center;gap:10px;color:#1e293b}
        .fraud-card.dark{background:linear-gradient(145deg,#0f172a,#1e293b);border:1px solid #334155}
        .fraud-card.dark h2{color:#00d4ff;border-bottom-color:#334155}
        .fraud-card.dark label{color:#e2e8f0}
        
        .fraud-feature-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin-bottom:20px}
        @media(max-width:768px){.fraud-feature-grid{grid-template-columns:1fr}}
        .fraud-feature-card{background:linear-gradient(145deg,#f8fafc,#f1f5f9);border:1px solid #e2e8f0;border-radius:12px;padding:20px;transition:all 0.2s}
        .fraud-feature-card:hover{border-color:#0891b2;box-shadow:0 4px 12px rgba(8,145,178,0.15)}
        .fraud-feature-card .icon{width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px}
        .fraud-feature-card h4{margin:0 0 6px;font-size:15px;font-weight:600;color:#1e293b}
        .fraud-feature-card p{margin:0;font-size:13px;color:#64748b;line-height:1.5}
        
        .fraud-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;padding:10px 0}
        .fraud-toggle input{display:none}
        .fraud-toggle-slider{width:52px;height:28px;background:#cbd5e1;border-radius:28px;position:relative;transition:0.3s}
        .fraud-toggle-slider::before{content:\\'\\';position:absolute;width:22px;height:22px;background:#fff;border-radius:50%;top:3px;left:3px;transition:0.3s;box-shadow:0 2px 4px rgba(0,0,0,0.2)}
        .fraud-toggle input:checked+.fraud-toggle-slider{background:linear-gradient(135deg,#0891b2,#06b6d4)}
        .fraud-toggle input:checked+.fraud-toggle-slider::before{transform:translateX(24px)}
        .fraud-toggle span:last-child{font-weight:500;color:#374151}
        
        .fraud-input{width:100%;padding:14px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;transition:all 0.2s;background:#fff}
        .fraud-input:focus{outline:none;border-color:#0891b2;box-shadow:0 0 0 4px rgba(8,145,178,0.1)}
        .fraud-input.dark{background:#0f172a;border-color:#334155;color:#fff}
        .fraud-input.dark:focus{border-color:#00d4ff}
        .fraud-textarea{min-height:100px;resize:vertical}
        .fraud-select{padding:14px 18px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;background:#fff;cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' fill=\\'none\\' viewBox=\\'0 0 24 24\\' stroke=\\'%2364748b\\'%3E%3Cpath stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\' stroke-width=\\'2\\' d=\\'M19 9l-7 7-7-7\\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:20px}
        
        .fraud-btn{padding:14px 28px;border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:600;transition:all 0.2s;display:inline-flex;align-items:center;gap:8px}
        .fraud-btn-primary{background:linear-gradient(135deg,#0891b2,#0e7490);color:#fff;box-shadow:0 4px 14px rgba(8,145,178,0.3)}
        .fraud-btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(8,145,178,0.4)}
        .fraud-btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
        .fraud-btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff}
        .fraud-btn-secondary{background:#f1f5f9;color:#475569;border:2px solid #e2e8f0}
        .fraud-btn-secondary:hover{background:#e2e8f0}
        
        .fraud-grid{display:grid;gap:20px}
        .fraud-grid-2{grid-template-columns:repeat(2,1fr)}
        @media(max-width:768px){.fraud-grid-2{grid-template-columns:1fr}}
        
        .fraud-form-group{margin-bottom:20px}
        .fraud-form-group label{display:block;font-weight:600;margin-bottom:8px;color:#374151;font-size:14px}
        .fraud-form-group small{display:block;margin-top:6px;color:#64748b;font-size:12px;line-height:1.5}
        
        .wcbd-tabs{display:flex;gap:8px;margin-bottom:25px;background:#f1f5f9;padding:6px;border-radius:14px;overflow-x:auto}
        .wcbd-tab-btn{padding:12px 24px;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;background:transparent;color:#64748b;transition:all 0.2s;white-space:nowrap;display:flex;align-items:center;gap:8px}
        .wcbd-tab-btn.active{background:#fff;color:#0891b2;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
        .wcbd-tab-btn:hover:not(.active){background:rgba(255,255,255,0.5);color:#475569}
        .wcbd-tab-content{display:none;animation:fadeIn 0.3s ease}
        .wcbd-tab-content.active{display:block}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        
        .incomplete-table-wrap{overflow-x:auto;border-radius:12px;border:1px solid #e5e7eb}
        .incomplete-table{width:100%;border-collapse:collapse;font-size:13px}
        .incomplete-table th{background:#f9fafb;color:#6b7280;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:0.5px;padding:14px 16px;text-align:left;border-bottom:2px solid #e5e7eb}
        .incomplete-table td{padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#374151}
        .incomplete-table tr:last-child td{border-bottom:none}
        .incomplete-table tr:hover{background:#f9fafb}
        
        .customer-avatar{width:32px;height:32px;border-radius:50%;background:#f3f4f6;display:inline-flex;align-items:center;justify-content:center;margin-right:10px;vertical-align:middle;color:#9ca3af;font-size:14px}
        .contact-phone{display:inline-flex;align-items:center;gap:6px;color:#374151;font-size:13px}
        .contact-phone .phone-icon{color:#9ca3af;font-size:12px}
        
        .btn-details{padding:4px 12px;border:1px solid #bfdbfe;border-radius:6px;background:#fff;color:#2563eb;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s}
        .btn-details:hover{background:#eff6ff}
        .btn-cancel{padding:4px 12px;border:1px solid #fecaca;border-radius:6px;background:#fff;color:#ef4444;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s}
        .btn-cancel:hover{background:#fef2f2}
        .btn-convert-sm{padding:4px 12px;border:1px solid #a7f3d0;border-radius:6px;background:#fff;color:#059669;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.2s}
        .btn-convert-sm:hover{background:#ecfdf5}
        
        .details-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px}
        .details-modal{background:#fff;border-radius:16px;max-width:440px;width:100%;padding:24px;box-shadow:0 25px 50px rgba(0,0,0,0.15);position:relative;max-height:90vh;overflow-y:auto}
        .details-modal h3{font-size:18px;font-weight:600;color:#111827;margin:0 0 20px;padding:0 0 12px;border-bottom:1px solid #e5e7eb}
        .details-modal .close-btn{position:absolute;top:16px;right:16px;width:28px;height:28px;border:none;background:#f3f4f6;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#6b7280;transition:all 0.2s}
        .details-modal .close-btn:hover{background:#e5e7eb;color:#111827}
        .details-section{margin-bottom:20px}
        .details-section h4{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin:0 0 12px}
        .details-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f9fafb}
        .details-row:last-child{border-bottom:none}
        .details-row .label{font-size:13px;color:#6b7280}
        .details-row .value{font-size:13px;font-weight:500;color:#111827}
        .details-item{background:#f9fafb;border-radius:8px;padding:8px 12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;font-size:12px}
        .details-item .item-name{color:#374151}
        .details-item .item-meta{color:#6b7280}
        
        .api-result{margin-left:12px;font-weight:600;padding:4px 12px;border-radius:20px;font-size:13px}
        .api-result.success{color:#10b981;background:rgba(16,185,129,0.1)}
        .api-result.error{color:#ef4444;background:rgba(239,68,68,0.1)}
        
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
        
        .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
        @media(max-width:768px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
        .stat-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;transition:all 0.2s}
        .stat-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06)}
        .stat-card .value{font-size:28px;font-weight:700;color:#111827;margin-bottom:4px}
        .stat-card .label{font-size:12px;color:#6b7280;font-weight:500}
        .stat-card.today{border-color:#ddd6fe}
        .stat-card.today:hover{border-color:#a78bfa}
        
        .retention-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px}
        .retention-card label{font-size:14px;font-weight:600;color:#374151;display:block;margin-bottom:10px}
        .retention-card select{padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;background:#fff;cursor:pointer}
        
        .incomplete-search{width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;margin-bottom:16px;background:#fff;transition:border-color 0.2s}
        .incomplete-search:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
        ';
    }
    
    private function get_admin_js() {
        $ajax_url = admin_url('admin-ajax.php');
        $nonce = wp_create_nonce('wcbd_fraud_guard_nonce');
        
        $js_template = <<<'ADMINJSTEMPLATE'
(function(jQ){
jQ(document).ready(function(){
jQ(".wcbd-tab-btn").on("click",function(){
var tab=jQ(this).data("tab");
jQ(".wcbd-tab-btn").removeClass("active");
jQ(this).addClass("active");
jQ(".wcbd-tab-content").removeClass("active");
jQ("#wcbd-tab-"+tab).addClass("active");
if(tab==="incomplete"){loadIncompleteOrders();}
if(tab==="cooldown"){loadCooldown();}
});

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
var stats=data.stats||{total:0,converted:0,today:0,potentialRevenue:0};
var nowDate=new Date();

var last24hCount=0;
var last24hValue=0;
for(var i=0;i<orders.length;i++){
var o=orders[i];
if(!o.is_converted){
var diff=(nowDate-new Date(o.created_at))/(1000*60*60);
if(diff<24){last24hCount++;last24hValue+=(o.cart_total||0);}
}
}

var html='<div class="stats-grid">';
html+='<div class="stat-card total"><div class="value">'+last24hCount+'</div><div class="label">Incomplete Carts (Last 24h)</div></div>';
html+='<div class="stat-card converted"><div class="value">৳'+last24hValue.toLocaleString()+'</div><div class="label">Value of Carts (Last 24h)</div></div>';
html+='<div class="stat-card revenue"><div class="value">'+stats.total+'</div><div class="label">Total Incomplete Carts</div></div>';
html+='</div>';

html+='<div class="retention-card">';
html+='<label>🗑️ Auto-delete records older than:</label>';
html+='<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">';
html+='<select id="retention-days"><option value="7">7 দিন</option><option value="15">15 দিন</option><option value="30" selected>30 দিন</option></select>';
html+='<button type="button" id="run-cleanup" class="fraud-btn fraud-btn-primary" style="padding:8px 18px;font-size:13px">🧹 Cleanup Now</button>';
html+='<button type="button" id="run-clean-all" class="fraud-btn fraud-btn-danger" style="padding:8px 18px;font-size:13px">🗑️ Clean All</button>';
html+='<span id="cleanup-status" style="font-size:12px"></span>';
html+='</div></div>';

if(orders.length===0){
html+='<div style="text-align:center;padding:60px;background:#f9fafb;border-radius:16px;border:1px solid #e5e7eb"><span style="font-size:64px">📭</span><p style="color:#6b7280;margin:20px 0 0;font-size:16px">No incomplete orders yet. Orders will appear here when customers leave checkout.</p></div>';
container.html(html);
return;
}

html+='<input type="text" class="incomplete-search" id="incomplete-search" placeholder="🔍 Search checkouts...">';

html+='<div class="incomplete-table-wrap"><table class="incomplete-table">';
html+='<thead><tr><th>Customer</th><th>Contact</th><th>Cart</th><th>Last Active</th><th>Actions</th></tr></thead>';
html+='<tbody>';

for(var i=0;i<orders.length;i++){
var o=orders[i];

function timeAgo(dateStr){
var diff=(nowDate-new Date(dateStr))/1000;
if(diff<60)return 'just now';
if(diff<3600)return Math.floor(diff/60)+' min ago';
if(diff<86400)return Math.floor(diff/3600)+' hr ago';
return Math.floor(diff/86400)+' day'+(Math.floor(diff/86400)>1?'s':'')+' ago';
}

var itemCount=0;
if(o.cart_items&&o.cart_items.length){
for(var j=0;j<o.cart_items.length;j++){itemCount+=(o.cart_items[j].quantity||1);}
}

html+='<tr>';
html+='<td><span class="customer-avatar">👤</span><strong style="color:#111827">'+(o.name||'Unknown')+'</strong></td>';
html+='<td><span class="contact-phone"><span class="phone-icon">📱</span>'+o.phone+'</span></td>';
html+='<td>'+(o.cart_total?'<strong style="color:#111827">৳'+o.cart_total.toLocaleString()+'</strong>':'<span style="color:#9ca3af">—</span>')+(itemCount?' <span style="color:#9ca3af;font-size:11px">('+itemCount+' items)</span>':'')+'</td>';
html+='<td style="color:#6b7280;font-size:12px">'+timeAgo(o.created_at)+'</td>';
html+='<td>';
html+='<button type="button" class="btn-details details-btn" data-idx="'+i+'">Details</button> ';
if(!o.is_converted){
html+='<button type="button" class="btn-convert-sm convert-order-btn" data-id="'+o.id+'" data-phone="'+o.phone+'" data-name="'+((o.name||"").replace(/'/g,"&#39;"))+'" data-address="'+((o.address||"").replace(/'/g,"&#39;"))+'" data-total="'+(o.cart_total||0)+'" data-items="'+encodeURIComponent(JSON.stringify(o.cart_items||[]))+'">Convert</button> ';
}
html+='<button type="button" class="btn-cancel cancel-order-btn" data-id="'+o.id+'">Cancel</button>';
html+='</td>';
html+='</tr>';
}

html+='</tbody></table></div>';
container.html(html);

jQ("#incomplete-search").on("input",function(){
var val=jQ(this).val().toLowerCase();
jQ(".incomplete-table tbody tr").each(function(){
var text=jQ(this).text().toLowerCase();
jQ(this).toggle(text.indexOf(val)!==-1);
});
});

jQ(".details-btn").on("click",function(){
var idx=parseInt(jQ(this).data("idx"));
var o=orders[idx];
if(!o)return;

function fmtDate(d){try{var dt=new Date(d);return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})+' '+dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}catch(e){return d;}}

var modalHtml='<div class="details-overlay" id="wcbd-details-modal">';
modalHtml+='<div class="details-modal">';
modalHtml+='<button class="close-btn" id="close-details">✕</button>';
modalHtml+='<h3>Checkout Details</h3>';

modalHtml+='<div class="details-section">';
modalHtml+='<h4>Customer Information</h4>';
modalHtml+='<div class="details-row"><span class="label">Name</span><span class="value">'+(o.name||'Not provided')+'</span></div>';
modalHtml+='<div class="details-row"><span class="label">Email</span><span class="value" style="color:#9ca3af">'+(o.email||'Not provided')+'</span></div>';
modalHtml+='<div class="details-row"><span class="label">Phone</span><span class="value">'+o.phone+'</span></div>';
modalHtml+='</div>';

modalHtml+='<div class="details-section">';
modalHtml+='<h4>Cart Details</h4>';
modalHtml+='<div class="details-row"><span class="label">Cart Value</span><span class="value">'+(o.cart_total?'৳'+o.cart_total.toLocaleString():'—')+'</span></div>';
if(o.cart_items&&o.cart_items.length>0){
for(var k=0;k<o.cart_items.length;k++){
var item=o.cart_items[k];
modalHtml+='<div class="details-item"><span class="item-name">'+item.name+'</span><span class="item-meta">×'+(item.quantity||1)+' — ৳'+(item.price||0).toLocaleString()+'</span></div>';
}
}
modalHtml+='</div>';

modalHtml+='<div class="details-section">';
modalHtml+='<h4>Checkout Information</h4>';
modalHtml+='<div class="details-row"><span class="label">Address</span><span class="value">'+(o.address||'Not provided')+'</span></div>';
modalHtml+='<div class="details-row"><span class="label">Captured on</span><span class="value">'+fmtDate(o.created_at)+'</span></div>';
modalHtml+='</div>';

modalHtml+='</div></div>';

jQ("#wcbd-details-modal").remove();
jQ("body").append(modalHtml);
jQ("#close-details").on("click",function(){jQ("#wcbd-details-modal").remove();});
jQ("#wcbd-details-modal").on("click",function(e){if(jQ(e.target).hasClass("details-overlay"))jQ("#wcbd-details-modal").remove();});
});

jQ(".cancel-order-btn").on("click",function(){
var btn=jQ(this);
var orderId=btn.data("id");
if(!confirm("এই record মুছে ফেলতে চান?")){return;}
btn.prop("disabled",true).text("...");
jQ.ajax({
url:"%%AJAX_URL%%",method:"POST",
data:{action:"wcbd_fraud_guard_cleanup",nonce:"%%NONCE%%",order_id:orderId,single_delete:true},
success:function(r){
btn.closest("tr").fadeOut(300,function(){jQ(this).remove();});
},
error:function(){
alert("❌ Delete failed");
btn.prop("disabled",false).text("Cancel");
}
});
});

jQ("#run-cleanup").on("click",function(){
var days=parseInt(jQ("#retention-days").val());
var statusEl=jQ("#cleanup-status");
statusEl.html('<span style="color:#f59e0b">🔄 Cleaning...</span>');
jQ.ajax({
url:"%%AJAX_URL%%",method:"POST",
data:{action:"wcbd_fraud_guard_cleanup",nonce:"%%NONCE%%",retention_days:days},
success:function(r){
if(r.success){statusEl.html('<span style="color:#10b981">✅ '+(r.data.removed||0)+' records removed</span>');setTimeout(function(){loadIncompleteOrders();},1500);}
else{statusEl.html('<span style="color:#ef4444">❌ '+(r.data||'Error')+'</span>');}
},
error:function(){statusEl.html('<span style="color:#ef4444">❌ Connection error</span>');}
});
});

jQ("#run-clean-all").on("click",function(){
if(!confirm("⚠️ সব incomplete (non-converted) records মুছে ফেলতে চান?\\nএই action undo করা যাবে না।")){return;}
var statusEl=jQ("#cleanup-status");
statusEl.html('<span style="color:#f59e0b">🔄 Cleaning all...</span>');
jQ.ajax({
url:"%%AJAX_URL%%",method:"POST",
data:{action:"wcbd_fraud_guard_clean_all",nonce:"%%NONCE%%"},
success:function(r){
if(r.success){statusEl.html('<span style="color:#10b981">✅ '+(r.data.removed||0)+' records removed</span>');setTimeout(function(){loadIncompleteOrders();},1500);}
else{statusEl.html('<span style="color:#ef4444">❌ '+(r.data||'Error')+'</span>');}
},
error:function(){statusEl.html('<span style="color:#ef4444">❌ Connection error</span>');}
});
});

jQ(".convert-order-btn").on("click",function(){
var btn=jQ(this);
var orderId=btn.data("id");
var phone=btn.data("phone");
var name=(btn.attr("data-name")||"").replace(/&#39;/g,"'");
var address=(btn.attr("data-address")||"").replace(/&#39;/g,"'");
var total=btn.data("total")||0;
var cartItems=btn.attr("data-items")||"[]";
try{cartItems=decodeURIComponent(cartItems);}catch(e){cartItems="[]";}

if(!confirm("📦 Convert to WooCommerce Order?\\n\\nPhone: "+phone+"\\nName: "+(name||"Unknown")+"\\nAddress: "+(address||"N/A")+"\\nTotal: ৳"+total)){return;}

btn.prop("disabled",true).text("Converting...");

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_convert_order",nonce:"%%NONCE%%",order_id:orderId,customer_name:name,customer_phone:phone,customer_address:address,total_price:total,cart_items:cartItems},
success:function(r){
if(r.success){
var wcLink=r.data&&r.data.wc_order_id?'<a href="post.php?post='+r.data.wc_order_id+'&action=edit" style="color:#10b981;font-size:12px;font-weight:600;text-decoration:underline">✅ Order #'+r.data.wc_order_id+'</a>':'<span style="color:#10b981;font-size:12px;font-weight:600">✅ Converted</span>';
btn.replaceWith(wcLink);
}else{
alert("❌ Error: "+(r.data||"Conversion failed"));
btn.prop("disabled",false).text("Convert");
}
},
error:function(){
alert("❌ Connection error");
btn.prop("disabled",false).text("Convert");
}
});
});
}


function formatCooldownTime(mins){
if(mins<60) return mins+" মিনিট";
if(mins<1440){var h=Math.floor(mins/60);var m=mins%60;return h+" ঘন্টা"+(m>0?" "+m+" মিনিট":"");}
var d=Math.floor(mins/1440);var rh=Math.floor((mins%1440)/60);return d+" দিন"+(rh>0?" "+rh+" ঘন্টা":"");
}

function loadCooldown(){
var container=jQ("#cooldown-container");
container.html('<div style="text-align:center;padding:40px;color:#94a3b8"><span style="font-size:24px">🔄</span><p>Loading...</p></div>');

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_get_cooldown",nonce:"%%NONCE%%"},
success:function(r){
if(r.success){
renderCooldown(r.data.cooldown_minutes);
}else{
container.html('<div style="text-align:center;padding:40px;color:#ef4444"><span style="font-size:48px">❌</span><p>Failed to load cooldown</p></div>');
}
},
error:function(){
container.html('<div style="text-align:center;padding:40px;color:#ef4444"><span style="font-size:48px">❌</span><p>Connection error</p></div>');
}
});
}

function renderCooldown(currentMins){
var container=jQ("#cooldown-container");
var presets=[
{label:"5 মিনিট",value:5},
{label:"15 মিনিট",value:15},
{label:"30 মিনিট",value:30},
{label:"1 ঘন্টা",value:60},
{label:"2 ঘন্টা",value:120},
{label:"6 ঘন্টা",value:360},
{label:"12 ঘন্টা",value:720},
{label:"1 দিন",value:1440},
{label:"3 দিন",value:4320},
{label:"7 দিন",value:10080},
{label:"15 দিন",value:21600},
{label:"30 দিন",value:43200}
];

var html='<div style="text-align:center;margin-bottom:30px">';
html+='<div style="display:inline-flex;align-items:center;gap:16px;background:linear-gradient(135deg,#0891b2,#0e7490);padding:20px 30px;border-radius:16px">';
html+='<span style="font-size:32px">⏱️</span>';
html+='<div style="text-align:left"><p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0">বর্তমান Cooldown</p>';
html+='<p style="color:#fff;font-size:24px;font-weight:700;margin:0" id="cooldown-display">'+formatCooldownTime(currentMins)+'</p></div>';
html+='</div></div>';

html+='<p style="color:#94a3b8;margin:0 0 20px;font-size:14px;text-align:center">Quick Presets - একটি ক্লিক করুন</p>';
html+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:25px">';
for(var i=0;i<presets.length;i++){
var p=presets[i];
var isActive=p.value===currentMins?"background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;border-color:#0891b2;font-weight:700":"background:#1e293b;color:#94a3b8;border-color:#334155";
html+='<button type="button" class="cooldown-preset-btn" data-value="'+p.value+'" style="padding:12px 8px;border-radius:10px;border:2px solid;cursor:pointer;font-size:13px;transition:all 0.2s;'+isActive+'">'+p.label+'</button>';
}
html+='</div>';

html+='<div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-bottom:20px">';
html+='<label style="color:#e2e8f0;font-size:14px;white-space:nowrap">Custom মিনিট:</label>';
html+='<input type="number" id="cooldown-custom-input" value="'+currentMins+'" min="1" max="43200" class="fraud-input dark" style="width:120px;text-align:center">';
html+='<button type="button" id="cooldown-save-custom" class="fraud-btn fraud-btn-primary" style="padding:10px 24px">💾 Save</button>';
html+='</div>';

html+='<div id="cooldown-status" style="text-align:center;margin-top:15px"></div>';

container.html(html);

jQ(".cooldown-preset-btn").on("click",function(){
var val=parseInt(jQ(this).data("value"));
saveCooldown(val);
});

jQ("#cooldown-save-custom").on("click",function(){
var val=parseInt(jQ("#cooldown-custom-input").val());
if(val>=1&&val<=43200){
saveCooldown(val);
}else{
jQ("#cooldown-status").html('<span style="color:#ef4444">❌ 1 থেকে 43200 মিনিটের মধ্যে দিন</span>');
}
});
}

function saveCooldown(minutes){
var statusEl=jQ("#cooldown-status");
statusEl.html('<span style="color:#f59e0b">🔄 Saving...</span>');

jQ.ajax({
url:"%%AJAX_URL%%",
method:"POST",
data:{action:"wcbd_fraud_guard_update_cooldown",nonce:"%%NONCE%%",cooldown_minutes:minutes},
success:function(r){
if(r.success){
statusEl.html('<span style="color:#10b981">✅ Cooldown আপডেট হয়েছে: '+formatCooldownTime(minutes)+'</span>');
jQ("#cooldown-display").text(formatCooldownTime(minutes));
jQ("#cooldown-custom-input").val(minutes);
jQ(".cooldown-preset-btn").css({"background":"#1e293b","color":"#94a3b8","border-color":"#334155","font-weight":"normal"});
jQ(".cooldown-preset-btn[data-value='"+minutes+"']").css({"background":"linear-gradient(135deg,#0891b2,#06b6d4)","color":"#fff","border-color":"#0891b2","font-weight":"700"});
setTimeout(function(){statusEl.html("");},3000);
}else{
statusEl.html('<span style="color:#ef4444">❌ '+(r.data||"Update failed")+'</span>');
}
},
error:function(){
statusEl.html('<span style="color:#ef4444">❌ Connection error</span>');
}
});
}

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
        $api_key = $this->api_key;
        $language = get_option('wcbd_fraud_guard_language', 'bn');
        $popup_timer = get_option('wcbd_fraud_guard_popup_timer', '30');
        $msg_cooldown = get_option('wcbd_fraud_guard_msg_cooldown', '');
        $msg_blacklist = get_option('wcbd_fraud_guard_msg_blacklist', '');
        $whatsapp = get_option('wcbd_fraud_guard_whatsapp', '');
        $phone = get_option('wcbd_fraud_guard_phone', '');
        $saved = isset($_GET['saved']);
        
        echo '<div class="fraud-wrap">';
        
        // Header
        echo '<div class="fraud-header"><div class="fraud-header-text">';
        echo '<h1>🛡️ WCBD Fraud Guard <span class="version">v' . WCBD_FRAUD_GUARD_VERSION . '</span></h1>';
        echo '<p>WooCommerce Anti-Fraud Protection System with Incomplete Order Tracking</p>';
        echo '</div></div>';
        
        // Success message
        if ($saved) {
            echo '<div style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:16px 24px;border-radius:14px;margin-bottom:20px;font-weight:500;display:flex;align-items:center;gap:10px"><span style="font-size:20px">✅</span> Settings saved successfully!</div>';
        }
        
        // Tabs
        echo '<div class="wcbd-tabs">';
        echo '<button class="wcbd-tab-btn active" data-tab="settings">⚙️ Settings</button>';
        echo '<button class="wcbd-tab-btn" data-tab="cooldown">⏱️ Cooldown</button>';
        echo '<button class="wcbd-tab-btn" data-tab="incomplete">📦 Incomplete Orders</button>';
        echo '</div>';
        
        // Tab 1: Settings
        echo '<div id="wcbd-tab-settings" class="wcbd-tab-content active">';
        
        // API Connection Card
        echo '<div class="fraud-card">';
        echo '<h2>🔌 API Connection</h2>';
        echo '<div style="display:flex;align-items:center;gap:15px;flex-wrap:wrap">';
        echo '<button id="wcbd-test-api" class="fraud-btn fraud-btn-primary">🔌 Test Connection</button>';
        echo '<span id="wcbd-api-result" class="api-result"></span>';
        echo '</div>';
        echo '<div style="margin-top:15px;padding:15px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">';
        echo '<p style="margin:0;font-size:13px;color:#64748b"><strong>API Key:</strong> <code style="background:#e2e8f0;padding:3px 8px;border-radius:6px;font-size:12px">' . substr($api_key, 0, 8) . '...' . substr($api_key, -4) . '</code></p>';
        echo '<p style="margin:8px 0 0;font-size:12px;color:#94a3b8">💡 API Key is pre-configured. Manage from your <a href="' . esc_url($this->dashboard_url) . '" target="_blank" style="color:#0891b2">dashboard</a>.</p>';
        echo '</div>';
        echo '</div>';
        
        // Settings Form
        echo '<form method="post" action="' . admin_url('admin-post.php') . '">';
        echo '<input type="hidden" name="action" value="wcbd_fraud_guard_save_settings">';
        wp_nonce_field('wcbd_fraud_guard_settings', 'wcbd_fraud_guard_nonce');
        echo '<input type="hidden" name="api_key" value="' . esc_attr($api_key) . '">';
        
        // Popup Settings Card
        echo '<div class="fraud-card">';
        echo '<h2>🎨 Popup Settings</h2>';
        echo '<div class="fraud-grid fraud-grid-2">';
        
        echo '<div class="fraud-form-group">';
        echo '<label>🌐 ভাষা (Language)</label>';
        echo '<select name="language" class="fraud-select" style="width:100%">';
        echo '<option value="bn"' . ($language === 'bn' ? ' selected' : '') . '>বাংলা (Bengali)</option>';
        echo '<option value="en"' . ($language === 'en' ? ' selected' : '') . '>English</option>';
        echo '</select>';
        echo '</div>';
        
        echo '<div class="fraud-form-group">';
        echo '<label>⏱️ Popup Timer (seconds)</label>';
        echo '<input type="number" name="popup_timer" value="' . esc_attr($popup_timer) . '" min="0" max="120" class="fraud-input">';
        echo '<small>0 = auto-close disabled</small>';
        echo '</div>';
        
        echo '</div>';
        
        echo '<div class="fraud-form-group">';
        echo '<label>⏳ Cooldown Message</label>';
        echo '<textarea name="msg_cooldown" class="fraud-input fraud-textarea">' . esc_textarea($msg_cooldown) . '</textarea>';
        echo '</div>';
        
        echo '<div class="fraud-form-group">';
        echo '<label>🚫 Blacklist Message</label>';
        echo '<textarea name="msg_blacklist" class="fraud-input fraud-textarea">' . esc_textarea($msg_blacklist) . '</textarea>';
        echo '</div>';
        
        echo '</div>';
        
        // Contact Settings Card
        echo '<div class="fraud-card">';
        echo '<h2>📞 Contact Settings</h2>';
        echo '<div class="fraud-grid fraud-grid-2">';
        
        echo '<div class="fraud-form-group">';
        echo '<label>💬 WhatsApp Number</label>';
        echo '<input type="text" name="whatsapp" value="' . esc_attr($whatsapp) . '" class="fraud-input" placeholder="+880...">';
        echo '<small>International format (with country code)</small>';
        echo '</div>';
        
        echo '<div class="fraud-form-group">';
        echo '<label>📱 Phone Number</label>';
        echo '<input type="text" name="phone" value="' . esc_attr($phone) . '" class="fraud-input" placeholder="+880...">';
        echo '</div>';
        
        echo '</div>';
        echo '</div>';
        
        echo '<button type="submit" class="fraud-btn fraud-btn-primary" style="width:100%;justify-content:center;font-size:16px;padding:18px">💾 Save Settings</button>';
        echo '</form>';
        echo '</div>'; // End settings tab
        
        // Tab 2: Cooldown
        echo '<div id="wcbd-tab-cooldown" class="wcbd-tab-content">';
        echo '<div class="fraud-card dark">';
        echo '<h2>⏱️ Cooldown Period Control</h2>';
        echo '<div id="cooldown-container"><div style="text-align:center;padding:40px;color:#94a3b8"><p>Click the Cooldown tab to load settings</p></div></div>';
        echo '</div>';
        echo '</div>';
        
        // Tab 3: Incomplete Orders
        echo '<div id="wcbd-tab-incomplete" class="wcbd-tab-content">';
        echo '<div class="fraud-card">';
        echo '<h2>📦 Incomplete Order Tracking <button id="refresh-incomplete" class="fraud-btn fraud-btn-secondary" style="margin-left:auto;padding:8px 16px;font-size:12px">🔄 Refresh</button></h2>';
        echo '<div id="incomplete-orders-container"><div style="text-align:center;padding:40px;color:#6b7280"><p>Click the Incomplete Orders tab to load data</p></div></div>';
        echo '</div>';
        echo '</div>';
        
        // Features
        echo '<div class="fraud-card" style="margin-top:25px">';
        echo '<h2>✨ v' . WCBD_FRAUD_GUARD_VERSION . ' Features</h2>';
        echo '<div class="fraud-feature-grid">';
        
        $features = array(
            array("icon" => "📦", "bg" => "linear-gradient(135deg,#f97316,#ea580c)", "title" => "AJAX Field Tracking", "desc" => "Checkout এ Name, Phone, Email, Address real-time capture - 800ms debounce"),
            array("icon" => "✅", "bg" => "linear-gradient(135deg,#10b981,#059669)", "title" => "Auto-Cleanup", "desc" => "Thank You page detect করলে incomplete record auto-remove"),
            array("icon" => "🗑️", "bg" => "linear-gradient(135deg,#3b82f6,#1d4ed8)", "title" => "Manual Clean All", "desc" => "সব incomplete records এক ক্লিকে মুছে ফেলুন - Stats cards সহ"),
            array("icon" => "🔒", "bg" => "linear-gradient(135deg,#8b5cf6,#7c3aed)", "title" => "BD Phone Validation", "desc" => "শুধু 01XXXXXXXXX format accept - invalid phone ignore"),
            array("icon" => "🛡️", "bg" => "linear-gradient(135deg,#ef4444,#dc2626)", "title" => "Server-Side Validation", "desc" => "PHP level এ order validate - bypass করা সম্ভব না"),
            array("icon" => "🗑️", "bg" => "linear-gradient(135deg,#0891b2,#0e7490)", "title" => "Retention Policy", "desc" => "WP-Cron দিয়ে পুরনো records auto-delete (7/15/30 দিন)")
        );
        
        foreach ($features as $f) {
            echo '<div class="fraud-feature-card">';
            echo '<div class="icon" style="background:' . $f["bg"] . '">' . $f["icon"] . '</div>';
            echo '<h4>' . $f["title"] . '</h4>';
            echo '<p>' . $f["desc"] . '</p>';
            echo '</div>';
        }
        
        echo '</div></div>';
        
        // Branding Footer
        echo '<div class="wcbd-branding">';
        echo '<img src="https://www.webcreationbd.online/logo.png" alt="WebCreation BD">';
        echo '<h3>WebCreation BD</h3>';
        echo '<p>Professional Web Solutions</p>';
        echo '<div class="btn-group">';
        echo '<a href="' . esc_url($this->dashboard_url) . '" target="_blank" class="primary">🔗 Dashboard</a>';
        echo '<a href="https://wa.me/8801332052874" target="_blank" class="secondary">💬 WhatsApp Support</a>';
        echo '</div>';
        echo '<p class="copyright">© ' . date("Y") . ' WebCreation BD. All rights reserved.</p>';
        echo '</div>';
        
        echo '</div>'; // End fraud-wrap
    }
    
    public function server_side_fraud_check() {
        $phone = isset($_POST['billing_phone']) ? sanitize_text_field($_POST['billing_phone']) : '';
        $this->validate_order_server_side($phone);
    }
    
    public function register_block_checkout_validation() {
        if (!class_exists('Automattic\\\\WooCommerce\\\\StoreApi\\\\Schemas\\\\V1\\\\CheckoutSchema')) {
            add_action('woocommerce_store_api_checkout_update_order_from_request', function($order, $request) {
                $phone = $order->get_billing_phone();
                $this->validate_order_server_side($phone, true);
            }, 10, 2);
            return;
        }
        add_action('woocommerce_store_api_checkout_update_order_from_request', function($order, $request) {
            $phone = $order->get_billing_phone();
            $this->validate_order_server_side($phone, true);
        }, 10, 2);
    }
    
    private function validate_order_server_side($phone, $is_block = false) {
        if (empty($phone)) return;
        
        if (defined('WCBD_FRAUD_CHECKED')) return;
        define('WCBD_FRAUD_CHECKED', true);
        
        $api_key = $this->api_key;
        if (empty($api_key)) return;
        
        // Get device ID from cookie (set by FingerprintJS on client side)
        $device_id = isset($_COOKIE['wcbd_device_id']) ? sanitize_text_field($_COOKIE['wcbd_device_id']) : '';
        // Also try POST hidden field as fallback
        if (empty($device_id) && isset($_POST['wcbd_device_id'])) {
            $device_id = sanitize_text_field($_POST['wcbd_device_id']);
        }
        
        // Get client IP address
        $ip = '';
        if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
            $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
        } elseif (!empty($_SERVER['HTTP_X_REAL_IP'])) {
            $ip = $_SERVER['HTTP_X_REAL_IP'];
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        $ip = sanitize_text_field($ip);
        
        error_log('[WCBD Fraud Guard] Server-side check for phone: ' . $phone . ' device: ' . $device_id . ' ip: ' . $ip . ' (block: ' . ($is_block ? 'yes' : 'no') . ')');
        
        $request_data = array(
            'api_key' => $api_key,
            'phone' => $phone,
            'domain' => wp_parse_url(home_url(), PHP_URL_HOST),
            'check_type' => 'order'
        );
        if (!empty($device_id)) $request_data['device_id'] = $device_id;
        if (!empty($ip)) $request_data['ip'] = $ip;
        
        $response = wp_remote_post($this->endpoint, array(
            'timeout' => 10,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode($request_data)
        ));
        
        if (is_wp_error($response)) {
            error_log('[WCBD Fraud Guard] API call failed: ' . $response->get_error_message());
            return;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        error_log('[WCBD Fraud Guard] API response: ' . wp_remote_retrieve_body($response));
        
        if (isset($body['allowed']) && $body['allowed'] === false) {
            $message = $body['message'] ?? 'আপনি এখন অর্ডার করতে পারবেন না। অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।';
            
            if ($is_block) {
                throw new \\Exception($message);
            } else {
                wc_add_notice($message, 'error');
            }
        }
    }
    
    public function save_settings() {
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        if (!isset($_POST['wcbd_fraud_guard_nonce']) || !wp_verify_nonce($_POST['wcbd_fraud_guard_nonce'], 'wcbd_fraud_guard_settings')) {
            wp_die('Security check failed');
        }
        
        // NOTE: API key is NOT saved from form - it's hardcoded and managed via dashboard
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
        
        $api_key = $this->api_key;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
        }
        
        $response = wp_remote_post($this->endpoint, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'check_type' => 'test',
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
        
        $api_key = $this->api_key;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
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
                'converted' => 0,
                'today' => 0,
                'potentialRevenue' => 0
            )
        ));
    }
    
    public function ajax_get_cooldown() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = $this->api_key;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
        $response = wp_remote_post($this->update_settings_url, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'action' => 'get_cooldown'
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
            'cooldown_minutes' => $body['cooldown_minutes'] ?? 1440
        ));
    }
    
    public function ajax_update_cooldown() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = $this->api_key;
        $cooldown_minutes = isset($_POST['cooldown_minutes']) ? intval($_POST['cooldown_minutes']) : 0;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
        if ($cooldown_minutes < 1 || $cooldown_minutes > 43200) {
            wp_send_json_error('Invalid cooldown value');
            return;
        }
        
        $response = wp_remote_post($this->update_settings_url, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'action' => 'update_cooldown',
                'cooldown_minutes' => $cooldown_minutes
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            wp_send_json_error($body['error'] ?? 'Update failed');
            return;
        }
        
        wp_send_json_success(array(
            'cooldown_minutes' => $body['cooldown_minutes'] ?? $cooldown_minutes
        ));
    }
    
    public function ajax_convert_order() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = $this->api_key;
        $order_id = isset($_POST['order_id']) ? sanitize_text_field($_POST['order_id']) : '';
        $customer_name = isset($_POST['customer_name']) ? sanitize_text_field($_POST['customer_name']) : '';
        $customer_phone = isset($_POST['customer_phone']) ? sanitize_text_field($_POST['customer_phone']) : '';
        $customer_address = isset($_POST['customer_address']) ? sanitize_textarea_field($_POST['customer_address']) : '';
        $total_price = isset($_POST['total_price']) ? floatval($_POST['total_price']) : 0;
        $cart_items_json = isset($_POST['cart_items']) ? wp_unslash($_POST['cart_items']) : '[]';
        $cart_items = json_decode($cart_items_json, true);
        if (!is_array($cart_items)) $cart_items = array();
        
        if (empty($api_key) || empty($order_id)) {
            wp_send_json_error('Missing required fields');
            return;
        }
        
        if (!function_exists('wc_create_order')) {
            wp_send_json_error('WooCommerce is not active');
            return;
        }
        
        try {
            $wc_order = wc_create_order(array(
                'status' => 'on-hold',
            ));
            
            if (is_wp_error($wc_order)) {
                wp_send_json_error('Failed to create WooCommerce order: ' . $wc_order->get_error_message());
                return;
            }
            
            $name_parts = explode(' ', $customer_name, 2);
            $wc_order->set_billing_first_name($name_parts[0] ?? '');
            $wc_order->set_billing_last_name($name_parts[1] ?? '');
            $wc_order->set_billing_phone($customer_phone);
            if (!empty($customer_address)) {
                $wc_order->set_billing_address_1($customer_address);
            }
            
            if (!empty($cart_items)) {
                foreach ($cart_items as $item) {
                    $item_name = isset($item['name']) ? sanitize_text_field($item['name']) : 'Product';
                    $item_qty = isset($item['quantity']) ? intval($item['quantity']) : 1;
                    $item_price = isset($item['price']) ? floatval($item['price']) : 0;
                    
                    $product_id = 0;
                    $products = wc_get_products(array(
                        'name' => $item_name,
                        'limit' => 1,
                    ));
                    if (!empty($products)) {
                        $product_id = $products[0]->get_id();
                    }
                    
                    if ($product_id > 0) {
                        $wc_order->add_product(wc_get_product($product_id), $item_qty);
                    } else {
                        $line_item = new \\WC_Order_Item_Fee();
                        $line_item->set_name($item_name . ' x' . $item_qty);
                        $line_item->set_amount($item_price * $item_qty);
                        $line_item->set_total($item_price * $item_qty);
                        $wc_order->add_item($line_item);
                    }
                }
            } else {
                $line_item = new \\WC_Order_Item_Fee();
                $line_item->set_name('Converted from incomplete order');
                $line_item->set_amount($total_price);
                $line_item->set_total($total_price);
                $wc_order->add_item($line_item);
            }
            
            $wc_order->set_payment_method_title('Manual (Converted)');
            $wc_order->calculate_totals();
            $wc_order->add_order_note('🔄 Auto-converted from incomplete order #' . substr($order_id, 0, 8) . ' via WCBD Fraud Guard');
            $wc_order->save();
            
            $wc_order_id = $wc_order->get_id();
            
        } catch (\\Exception $e) {
            wp_send_json_error('WooCommerce order error: ' . $e->getMessage());
            return;
        }
        
        // Mark as converted in dashboard (no orders table insert)
        $response = wp_remote_post($this->update_settings_url, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'action' => 'convert_order',
                'order_id' => $order_id
            ))
        ));
        
        wp_send_json_success(array(
            'message' => 'Order converted successfully',
            'wc_order_id' => $wc_order_id
        ));
    }
    
    public function ajax_cleanup_orders() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = $this->api_key;
        $retention_days = isset($_POST['retention_days']) ? intval($_POST['retention_days']) : 30;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
        if ($retention_days < 1 || $retention_days > 365) {
            wp_send_json_error('Invalid retention period');
            return;
        }
        
        $response = wp_remote_post($this->incomplete_endpoint, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'action' => 'cleanup',
                'retention_days' => $retention_days
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            wp_send_json_error($body['error'] ?? 'Cleanup failed');
            return;
        }
        
        wp_send_json_success(array(
            'removed' => $body['removed'] ?? 0
        ));
    }
    
    public function ajax_clean_all_orders() {
        check_ajax_referer('wcbd_fraud_guard_nonce', 'nonce');
        
        $api_key = $this->api_key;
        
        if (empty($api_key)) {
            wp_send_json_error('No API key configured');
            return;
        }
        
        $response = wp_remote_post($this->incomplete_endpoint, array(
            'timeout' => 15,
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'api_key' => $api_key,
                'action' => 'clean_all'
            ))
        ));
        
        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
            return;
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (!isset($body['success']) || !$body['success']) {
            wp_send_json_error($body['error'] ?? 'Clean all failed');
            return;
        }
        
        wp_send_json_success(array(
            'removed' => $body['removed'] ?? 0
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
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: ${PLUGIN_CONFIG.version}
License: GPLv2 or later

WooCommerce Anti-Fraud Protection System with Incomplete Order Tracking

== Description ==

WCBD Fraud Guard protects your WooCommerce store from fake orders and tracks incomplete checkouts.

**v${PLUGIN_CONFIG.version} - CheckoutGuard Style Dashboard:**
* CheckoutGuard Style Clean White/Gray UI - Professional Dashboard
* Smart Stats Cards - Last 24h Carts, Cart Value, Total Count
* Details Modal - Customer Info, Cart Items, Checkout Info at one click
* 800ms Real-time Field Tracking - Name, Phone, Email, Address capture
* Email Field Tracking support
* Quick Cancel - one-click record delete from table
* Bangladeshi Phone Validation (01XXXXXXXXX format only)
* Auto-Cleanup on Thank You page
* Server-side PHP validation (bulletproof)
* Device Fingerprinting via FingerprintJS

== Installation ==

1. Upload plugin ZIP to WordPress > Plugins > Add New > Upload
2. Activate the plugin
3. Go to Fraud Guard menu
4. API Key is pre-configured
5. Click Test Connection to verify

== Changelog ==

= ${PLUGIN_CONFIG.version} =
* CheckoutGuard Style UI - Clean White/Gray Professional Dashboard
* Smart Stats Cards: Last 24h count, Last 24h value, Total carts
* Details Modal with Customer Info, Cart Items, Checkout Info
* 800ms Real-time AJAX field tracking (Name, Phone, Email, Address)
* Quick Cancel button for one-click record deletion
* Auto-cleanup on Thank You page detection
* Manual Clean All and Retention policy cleanup
* Convert to WooCommerce Order with full address support

== Upgrade Notice ==

= ${PLUGIN_CONFIG.version} =
Major UI rebuild! Delete old plugin and install fresh. CheckoutGuard style dashboard with Details modal.
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
