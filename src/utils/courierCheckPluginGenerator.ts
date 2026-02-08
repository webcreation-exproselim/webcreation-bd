import JSZip from 'jszip';
import { COURIER_CHECK_PLUGIN_CONFIG } from '@/config/courierCheckPluginConfig';

const SCRAPE_ENDPOINT = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/scrape-courier-check';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';

export const generateCourierCheckPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Courier Check
 * Plugin URI: ${DASHBOARD_URL}
 * Description: Check customer courier delivery history & success rate (Pathao, Steadfast, CarryBee, RedX) from your WooCommerce order list.
 * Version: ${COURIER_CHECK_PLUGIN_CONFIG.version}
 * Author: WebCreation BD
 * Author URI: ${DASHBOARD_URL}
 * Text Domain: wcbd-courier-check
 * Requires at least: 5.0
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) exit;

define('WCBD_CC_VERSION', '${COURIER_CHECK_PLUGIN_CONFIG.version}');
define('WCBD_CC_PATH', plugin_dir_path(__FILE__));
define('WCBD_CC_URL', plugin_dir_url(__FILE__));

class WCBD_Courier_Check {
    
    private $api_key = '${apiKey}';
    private $endpoint = '${SCRAPE_ENDPOINT}';
    private $license_valid = false;
    
    public function __construct() {
        add_action('admin_init', array($this, 'check_woocommerce'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // Add column to order list
        add_filter('manage_edit-shop_order_columns', array($this, 'add_courier_check_column'));
        add_action('manage_shop_order_posts_custom_column', array($this, 'render_courier_check_column'), 10, 2);
        
        // HPOS support
        add_filter('manage_woocommerce_page_wc-orders_columns', array($this, 'add_courier_check_column'));
        add_action('manage_woocommerce_page_wc-orders_custom_column', array($this, 'render_courier_check_column_hpos'), 10, 2);
        
        // AJAX handlers
        add_action('wp_ajax_wcbd_courier_check', array($this, 'ajax_courier_check'));
        
        // Meta box on single order
        add_action('add_meta_boxes', array($this, 'add_order_meta_box'));
        
        // Validate license on init
        add_action('admin_init', array($this, 'validate_license'));
    }
    
    public function check_woocommerce() {
        if (!class_exists('WooCommerce')) {
            add_action('admin_notices', function() {
                echo '<div class="error"><p><strong>WCBD Courier Check</strong> requires WooCommerce to be installed and activated.</p></div>';
            });
        }
    }
    
    public function validate_license() {
        $cached = get_transient('wcbd_cc_license_valid');
        if ($cached !== false) {
            $this->license_valid = ($cached === 'yes');
            return;
        }
        
        $response = wp_remote_post($this->endpoint, array(
            'timeout' => 10,
            'body' => json_encode(array(
                'phone' => '00000000000',
                'api_key' => $this->api_key,
            )),
            'headers' => array('Content-Type' => 'application/json'),
        ));
        
        if (is_wp_error($response)) {
            $this->license_valid = false;
            set_transient('wcbd_cc_license_valid', 'no', 300);
            return;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        // 400 means API key is valid but phone is invalid (expected)
        // 401/403 means invalid API key or inactive
        $this->license_valid = ($code === 200 || $code === 400);
        set_transient('wcbd_cc_license_valid', $this->license_valid ? 'yes' : 'no', 3600);
    }
    
    public function enqueue_admin_scripts($hook) {
        if (!in_array($hook, array('edit.php', 'post.php', 'woocommerce_page_wc-orders'))) return;
        
        wp_enqueue_script('jquery');
        wp_add_inline_script('jquery', $this->get_admin_js(), 'after');
        wp_add_inline_style('wp-admin', $this->get_admin_css());
    }
    
    public function add_courier_check_column($columns) {
        $columns['wcbd_courier_check'] = 'Courier Check';
        return $columns;
    }
    
    public function render_courier_check_column($column, $post_id) {
        if ($column !== 'wcbd_courier_check') return;
        
        $order = wc_get_order($post_id);
        if (!$order) return;
        
        $phone = $order->get_billing_phone();
        if ($phone) {
            echo '<button class="wcbd-cc-btn" data-phone="' . esc_attr($phone) . '" title="Check Courier History">
                <span class="wcbd-cc-btn-icon">📊</span>
                <span class="wcbd-cc-btn-text">Check</span>
            </button>';
        } else {
            echo '<span class="wcbd-cc-no-phone">—</span>';
        }
    }
    
    public function render_courier_check_column_hpos($column, $order) {
        if ($column !== 'wcbd_courier_check') return;
        
        if (is_numeric($order)) {
            $order = wc_get_order($order);
        }
        if (!$order) return;
        
        $phone = $order->get_billing_phone();
        if ($phone) {
            echo '<button class="wcbd-cc-btn" data-phone="' . esc_attr($phone) . '" title="Check Courier History">
                <span class="wcbd-cc-btn-icon">📊</span>
                <span class="wcbd-cc-btn-text">Check</span>
            </button>';
        } else {
            echo '<span class="wcbd-cc-no-phone">—</span>';
        }
    }
    
    public function add_order_meta_box() {
        $screen = class_exists('\\Automattic\\WooCommerce\\Internal\\DataStores\\Orders\\CustomOrdersTableController')
            ? wc_get_page_screen_id('shop-order')
            : 'shop_order';
            
        add_meta_box(
            'wcbd_courier_check_box',
            '📊 Courier Check',
            array($this, 'render_order_meta_box'),
            $screen,
            'side',
            'default'
        );
    }
    
    public function render_order_meta_box($post_or_order) {
        $order = ($post_or_order instanceof \\WP_Post) ? wc_get_order($post_or_order->ID) : $post_or_order;
        if (!$order) return;
        
        $phone = $order->get_billing_phone();
        if (!$phone) {
            echo '<p>No phone number found</p>';
            return;
        }
        
        echo '<div id="wcbd-cc-metabox-result" style="min-height:60px">';
        echo '<button class="wcbd-cc-btn wcbd-cc-btn-full" data-phone="' . esc_attr($phone) . '">📊 Check Courier History</button>';
        echo '</div>';
    }
    
    public function ajax_courier_check() {
        check_ajax_referer('wcbd_cc_nonce', 'nonce');
        
        $phone = sanitize_text_field($_POST['phone']);
        if (empty($phone)) {
            wp_send_json(array('success' => false, 'error' => 'Phone number is required'));
        }
        
        // Clean phone: strip +880 / 880 prefix
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 3) === '880' && strlen($phone) === 13) {
            $phone = '0' . substr($phone, 3);
        }
        if (substr($phone, 0, 1) === '1' && strlen($phone) === 10) {
            $phone = '0' . $phone;
        }
        
        $response = wp_remote_post($this->endpoint, array(
            'timeout' => 30,
            'body' => json_encode(array(
                'phone' => $phone,
                'api_key' => $this->api_key,
            )),
            'headers' => array('Content-Type' => 'application/json'),
        ));
        
        if (is_wp_error($response)) {
            wp_send_json(array('success' => false, 'error' => 'Connection failed: ' . $response->get_error_message()));
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        wp_send_json($body);
    }
    
    private function get_admin_css() {
        return <<<'CSSBLOCK'
/* WCBD Courier Check Button */
.wcbd-cc-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#0891b2,#2563eb);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s ease;box-shadow:0 2px 8px rgba(8,145,178,0.3)}
.wcbd-cc-btn:hover{background:linear-gradient(135deg,#0e7490,#1d4ed8);box-shadow:0 4px 14px rgba(8,145,178,0.4);transform:translateY(-1px)}
.wcbd-cc-btn:active{transform:translateY(0)}
.wcbd-cc-btn-icon{font-size:15px}
.wcbd-cc-btn-text{letter-spacing:0.3px}
.wcbd-cc-btn-full{width:100%;justify-content:center;padding:10px 16px;font-size:14px}

/* Modal Overlay */
.wcbd-cc-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px}

/* Modal Container */
.wcbd-cc-modal{background:#fff;border-radius:20px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.25);position:relative;animation:wcbd-cc-fadeIn 0.3s ease}
@keyframes wcbd-cc-fadeIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}

/* Modal Header */
.wcbd-cc-header{background:linear-gradient(135deg,#0891b2,#2563eb);padding:20px 24px;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:space-between}
.wcbd-cc-header h3{margin:0;font-size:18px;color:#fff;font-weight:700;display:flex;align-items:center;gap:8px}
.wcbd-cc-header .wcbd-cc-phone-badge{background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:13px;color:#fff;font-weight:500}

/* Close Button */
.wcbd-cc-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.wcbd-cc-close:hover{background:rgba(255,255,255,0.35)}

/* Modal Body */
.wcbd-cc-body{padding:20px 24px 24px}

/* Risk Badge */
.wcbd-cc-risk{padding:10px 16px;border-radius:12px;text-align:center;font-weight:700;font-size:15px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.wcbd-cc-risk.trusted{background:#d1fae5;color:#065f46}
.wcbd-cc-risk.moderate{background:#fef3c7;color:#92400e}
.wcbd-cc-risk.risky{background:#fee2e2;color:#991b1b}
.wcbd-cc-risk.new_customer{background:#dbeafe;color:#1e40af}

/* Stats Grid */
.wcbd-cc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.wcbd-cc-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 10px;text-align:center}
.wcbd-cc-stat-value{font-size:26px;font-weight:800;margin:0;line-height:1.2}
.wcbd-cc-stat-label{font-size:11px;color:#64748b;margin-top:4px;font-weight:500}
.wcbd-cc-stat-value.delivered{color:#10b981}
.wcbd-cc-stat-value.returned{color:#ef4444}
.wcbd-cc-stat-value.total{color:#0891b2}

/* Courier Table */
.wcbd-cc-table-wrap{border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:16px}
.wcbd-cc-table{width:100%;border-collapse:collapse}
.wcbd-cc-table thead tr{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-table th{padding:10px 14px;text-align:center;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px}
.wcbd-cc-table th:first-child{text-align:left}
.wcbd-cc-table td{padding:12px 14px;text-align:center;border-bottom:1px solid #f1f5f9;font-size:13px}
.wcbd-cc-table td:first-child{text-align:left}
.wcbd-cc-table tbody tr:hover{background:#f8fafc}
.wcbd-cc-table tbody tr:last-child td{border-bottom:none}
.wcbd-cc-table tfoot tr{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-table tfoot td{padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#fff}
.wcbd-cc-table tfoot td:first-child{text-align:left}

/* Courier Logo */
.wcbd-cc-courier-logo{height:28px;max-width:100px;object-fit:contain}
.wcbd-cc-courier-name{font-weight:600;color:#1e293b}
.wcbd-cc-delivered{color:#10b981;font-weight:700}
.wcbd-cc-orders{color:#475569;font-weight:600}

/* Branding */
.wcbd-cc-branding{margin-top:16px;padding-top:14px;border-top:1px solid #e5e7eb;text-align:center}
.wcbd-cc-branding a{color:#0891b2;text-decoration:none;font-weight:600;font-size:12px}
.wcbd-cc-branding a:hover{text-decoration:underline}
.wcbd-cc-branding-text{font-size:11px;color:#94a3b8}

/* Loading State */
.wcbd-cc-loading{text-align:center;padding:50px 20px}
.wcbd-cc-loading .spinner{display:inline-block;width:44px;height:44px;border:4px solid #e5e7eb;border-top-color:#0891b2;border-radius:50%;animation:wcbd-cc-spin 0.8s linear infinite}
.wcbd-cc-loading p{margin-top:14px;color:#64748b;font-size:14px}
@keyframes wcbd-cc-spin{to{transform:rotate(360deg)}}

/* Refresh Button */
.wcbd-cc-refresh-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;margin-bottom:16px}
.wcbd-cc-refresh-btn:hover{box-shadow:0 4px 12px rgba(37,99,235,0.3);transform:translateY(-1px)}

/* Mobile Responsive */
@media (max-width:600px){
    .wcbd-cc-modal-overlay{padding:8px;align-items:flex-end}
    .wcbd-cc-modal{max-width:100%;max-height:92vh;border-radius:20px 20px 0 0;animation:wcbd-cc-slideUp 0.3s ease}
    @keyframes wcbd-cc-slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    .wcbd-cc-header{padding:16px 18px;border-radius:20px 20px 0 0}
    .wcbd-cc-header h3{font-size:16px}
    .wcbd-cc-body{padding:16px 18px 20px}
    .wcbd-cc-stats{grid-template-columns:repeat(3,1fr);gap:8px}
    .wcbd-cc-stat{padding:10px 6px}
    .wcbd-cc-stat-value{font-size:20px}
    .wcbd-cc-stat-label{font-size:10px}
    .wcbd-cc-risk{font-size:13px;padding:8px 12px}
    .wcbd-cc-table th,.wcbd-cc-table td,.wcbd-cc-table tfoot td{padding:8px 10px;font-size:12px}
    .wcbd-cc-courier-logo{height:22px;max-width:80px}
    .wcbd-cc-close{top:12px;right:12px;width:28px;height:28px;font-size:16px}
}
CSSBLOCK;
    }
    
    private function get_admin_js() {
        $config = json_encode(array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wcbd_cc_nonce'),
        ));
        
        $js = 'var wcbdCc=' . $config . ';';
        $js .= <<<'JSBLOCK'
jQuery(document).ready(function($){
    // Courier logo URLs (CDN hosted)
    var courierLogos = {
        'pathao': 'https://pathao.com/wp-content/themes/flavor/flavor-developer/developer/flavor/assets/images/Pathao-logo.png',
        'steadfast': 'https://steadfast.com.bd/images/logo.svg',
        'carrybee': 'https://carrybee.com.bd/wp-content/uploads/2024/01/Carrybee-Logo-04.png',
        'redx': 'https://redx.com.bd/svg/ic_redx_logo.svg',
        'red x': 'https://redx.com.bd/svg/ic_redx_logo.svg',
        'carry bee': 'https://carrybee.com.bd/wp-content/uploads/2024/01/Carrybee-Logo-04.png'
    };
    
    // Always show these 4 couriers in results
    var defaultCouriers = [
        { name: 'Pathao', key: 'pathao' },
        { name: 'Steadfast', key: 'steadfast' },
        { name: 'CarryBee', key: 'carrybee' },
        { name: 'RedX', key: 'redx' }
    ];
    
    function findCourierData(couriers, key) {
        if (!couriers || !couriers.length) return null;
        for (var i = 0; i < couriers.length; i++) {
            var lower = couriers[i].name.toLowerCase();
            if (lower.indexOf(key) !== -1) return couriers[i];
            if (key === 'carrybee' && lower.indexOf('carry bee') !== -1) return couriers[i];
            if (key === 'redx' && (lower.indexOf('red x') !== -1 || lower.indexOf('redx') !== -1)) return couriers[i];
        }
        return null;
    }

    $(document).on('click','.wcbd-cc-btn',function(e){
        e.preventDefault();
        var phone=$(this).data('phone');
        if(!phone)return;
        
        // Create modal with new design
        var modalHtml = '<div class="wcbd-cc-modal-overlay">';
        modalHtml += '<div class="wcbd-cc-modal">';
        modalHtml += '<button class="wcbd-cc-close">&times;</button>';
        modalHtml += '<div class="wcbd-cc-loading"><div class="spinner"></div><p>Checking courier history...</p></div>';
        modalHtml += '</div></div>';
        
        var overlay = $(modalHtml);
        $('body').append(overlay);
        
        overlay.find('.wcbd-cc-close').on('click',function(){overlay.remove();});
        overlay.on('click',function(ev){if(ev.target===overlay[0])overlay.remove();});
        
        $.ajax({
            url:wcbdCc.ajaxUrl,
            method:'POST',
            data:{action:'wcbd_courier_check',phone:phone,nonce:wcbdCc.nonce},
            success:function(res){
                if(res.success&&res.data){
                    var d=res.data;
                    
                    // Calculate totals from default 4 couriers
                    var totalOrders = 0, totalDelivered = 0, totalReturned = 0;
                    for (var i = 0; i < defaultCouriers.length; i++) {
                        var match = findCourierData(d.couriers, defaultCouriers[i].key);
                        if (match) {
                            totalOrders += match.orders || 0;
                            totalDelivered += match.delivered || 0;
                            totalReturned += match.returned || 0;
                        }
                    }
                    var successRate = totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0;
                    
                    // Determine risk
                    var riskClass = 'new_customer';
                    var riskLabel = '🆕 New Customer';
                    if (totalOrders > 0) {
                        if (successRate >= 80) { riskClass = 'trusted'; riskLabel = '✅ Trusted Customer'; }
                        else if (successRate >= 50) { riskClass = 'moderate'; riskLabel = '⚠️ Moderate Risk'; }
                        else { riskClass = 'risky'; riskLabel = '🚫 High Risk'; }
                    }
                    
                    // Build modal content
                    var html = '';
                    
                    // Header
                    html += '<div class="wcbd-cc-header">';
                    html += '<h3>📊 Courier Check</h3>';
                    html += '<span class="wcbd-cc-phone-badge">' + d.phone + '</span>';
                    html += '</div>';
                    
                    html += '<div class="wcbd-cc-body">';
                    
                    // Risk badge
                    html += '<div class="wcbd-cc-risk ' + riskClass + '">' + riskLabel + ' — ' + successRate + '%</div>';
                    
                    // Stats cards
                    html += '<div class="wcbd-cc-stats">';
                    html += '<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value total">' + totalOrders + '</p><p class="wcbd-cc-stat-label">মোট অর্ডার</p></div>';
                    html += '<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value delivered">' + totalDelivered + '</p><p class="wcbd-cc-stat-label">মোট ডেলিভারি</p></div>';
                    html += '<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value returned">' + totalReturned + '</p><p class="wcbd-cc-stat-label">মোট বাতিল</p></div>';
                    html += '</div>';
                    
                    // Courier table - always show all 4 couriers
                    html += '<div class="wcbd-cc-table-wrap">';
                    html += '<table class="wcbd-cc-table"><thead><tr><th>কুরিয়ার</th><th>মোট</th><th>সফল</th></tr></thead><tbody>';
                    
                    for (var k = 0; k < defaultCouriers.length; k++) {
                        var dc = defaultCouriers[k];
                        var match = findCourierData(d.couriers, dc.key);
                        var orders = match ? (match.orders || 0) : 0;
                        var delivered = match ? (match.delivered || 0) : 0;
                        var logo = courierLogos[dc.key];
                        var courierCell = logo
                            ? '<img src="' + logo + '" alt="' + dc.name + '" class="wcbd-cc-courier-logo" onerror="this.style.display=\\'none\\';this.nextSibling.style.display=\\'inline\\'"><span class="wcbd-cc-courier-name" style="display:none">' + dc.name + '</span>'
                            : '<span class="wcbd-cc-courier-name">' + dc.name + '</span>';
                        
                        html += '<tr>';
                        html += '<td>' + courierCell + '</td>';
                        html += '<td class="wcbd-cc-orders">' + orders + '</td>';
                        html += '<td class="wcbd-cc-delivered">' + delivered + '</td>';
                        html += '</tr>';
                    }
                    
                    html += '</tbody>';
                    html += '<tfoot><tr><td>মোট</td><td>' + totalOrders + '</td><td>' + totalDelivered + '</td></tr></tfoot>';
                    html += '</table></div>';
                    
                    // Branding
                    html += '<div class="wcbd-cc-branding"><p class="wcbd-cc-branding-text">Powered by <a href="https://webcreation-bd.lovable.app" target="_blank">WebCreation BD</a></p></div>';
                    
                    html += '</div>'; // end body
                    
                    overlay.find('.wcbd-cc-modal').html('<button class="wcbd-cc-close">&times;</button>' + html);
                    overlay.find('.wcbd-cc-close').on('click',function(){overlay.remove();});
                }else{
                    overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444;font-size:14px">'+(res.error||'No data found')+'</p>');
                }
            },
            error:function(){
                overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444;font-size:14px">Connection failed. Please try again.</p>');
            }
        });
    });
});
JSBLOCK;
        return $js;
    }
}

new WCBD_Courier_Check();
`;
};

export const downloadCourierCheckPlugin = async (apiKey: string) => {
  const zip = new JSZip();
  const folder = zip.folder('wcbd-courier-check');
  
  if (!folder) return;
  
  folder.file('wcbd-courier-check.php', generateCourierCheckPluginFile(apiKey));
  
  // Add readme.txt
  const readmeContent = `=== WCBD Courier Check ===
Contributors: WebCreation BD
Tags: woocommerce, courier, delivery, check, fraud
Requires at least: 5.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: ${COURIER_CHECK_PLUGIN_CONFIG.version}
License: GPLv2 or later

== Description ==

WCBD Courier Check allows you to check customer courier delivery history & success rate directly from your WooCommerce order list.

**Supported Couriers:**
* Pathao
* Steadfast
* CarryBee
* RedX

**Features:**
* 📊 Courier Delivery History Check
* 🔍 Phone Number Based Lookup
* 📈 Success Rate Visualization
* 🚚 Pathao, Steadfast, CarryBee, RedX Support
* 🏷️ Trust Label (Green/Yellow/Red)
* 📦 WooCommerce Order List Integration
* 💼 Single Order View Analytics
* 🔒 Domain-locked License
* 📱 Mobile Responsive Bottom-Sheet Modal
* 🇧🇩 Bangladesh Courier Support

== Installation ==

1. Upload the plugin ZIP via WordPress Admin → Plugins → Add New → Upload Plugin
2. Activate the plugin
3. Your API key is pre-configured
4. Go to WooCommerce → Orders and click "Check" button on any order

== Changelog ==

= ${COURIER_CHECK_PLUGIN_CONFIG.version} =
* New Design with Gradient Headers & Color-coded Risk Badges
* 3-column Stats Summary (Total Orders, Delivered, Returned)
* Pathao, Steadfast, CarryBee, RedX courier logos
* Mobile responsive bottom-sheet modal for screens under 600px
* Powered by WebCreation BD branding
`;
  folder.file('readme.txt', readmeContent);
  
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = COURIER_CHECK_PLUGIN_CONFIG.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
