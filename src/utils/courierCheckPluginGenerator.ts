import JSZip from 'jszip';
import { COURIER_CHECK_PLUGIN_CONFIG } from '@/config/courierCheckPluginConfig';

const SCRAPE_ENDPOINT = 'https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/scrape-courier-check';
const DASHBOARD_URL = 'https://webcreation-bd.lovable.app/dashboard';

export const generateCourierCheckPluginFile = (apiKey: string): string => {
  return `<?php
/**
 * Plugin Name: WCBD Courier Check
 * Plugin URI: ${DASHBOARD_URL}
 * Description: Check customer courier delivery history & success rate from your WooCommerce order list.
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
            echo '<button class="button wcbd-cc-btn" data-phone="' . esc_attr($phone) . '" title="Check Courier History">📊 Check</button>';
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
            echo '<button class="button wcbd-cc-btn" data-phone="' . esc_attr($phone) . '" title="Check Courier History">📊 Check</button>';
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
        echo '<button class="button button-primary wcbd-cc-btn" data-phone="' . esc_attr($phone) . '" style="width:100%">📊 Check Courier History</button>';
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
        return '
.wcbd-cc-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px}
.wcbd-cc-modal{background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;padding:30px;box-shadow:0 25px 60px rgba(0,0,0,0.3)}
.wcbd-cc-modal h3{margin:0 0 20px;font-size:20px;display:flex;align-items:center;gap:8px}
.wcbd-cc-close{position:absolute;top:15px;right:20px;font-size:24px;cursor:pointer;color:#666;background:none;border:none}
.wcbd-cc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.wcbd-cc-stat{background:#f8f9fa;border-radius:12px;padding:16px;text-align:center}
.wcbd-cc-stat-value{font-size:28px;font-weight:800;margin:0}
.wcbd-cc-stat-label{font-size:12px;color:#666;margin-top:4px}
.wcbd-cc-rate{text-align:center;margin-bottom:20px}
.wcbd-cc-rate-circle{width:120px;height:120px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;color:#fff}
.wcbd-cc-risk{padding:12px 20px;border-radius:12px;text-align:center;font-weight:700;font-size:16px;margin-bottom:20px}
.wcbd-cc-risk.trusted{background:#d1fae5;color:#065f46}
.wcbd-cc-risk.moderate{background:#fef3c7;color:#92400e}
.wcbd-cc-risk.risky{background:#fee2e2;color:#991b1b}
.wcbd-cc-risk.new_customer{background:#dbeafe;color:#1e40af}
.wcbd-cc-table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden}
.wcbd-cc-table th{background:#f1f5f9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748b}
.wcbd-cc-table td{padding:10px 12px;border-bottom:1px solid #f1f5f9}
.wcbd-cc-loading{text-align:center;padding:40px}
.wcbd-cc-loading .spinner{display:inline-block;width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:wcbd-cc-spin 1s linear infinite}
.wcbd-cc-branding{margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center}
.wcbd-cc-branding a{color:#0891b2;text-decoration:none;font-weight:600;font-size:12px}
.wcbd-cc-branding a:hover{text-decoration:underline}
.wcbd-cc-branding-text{font-size:11px;color:#94a3b8}
@keyframes wcbd-cc-spin{to{transform:rotate(360deg)}}
        ';
    }
    
    private function get_admin_js() {
        $config = json_encode(array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wcbd_cc_nonce'),
        ));
        
        $js = 'var wcbdCc=' . $config . ';';
        $js .= <<<'JSBLOCK'
jQuery(document).ready(function($){
    $(document).on('click','.wcbd-cc-btn',function(e){
        e.preventDefault();
        var phone=$(this).data('phone');
        if(!phone)return;
        
        var overlay=$('<div class="wcbd-cc-modal-overlay"><div class="wcbd-cc-modal" style="position:relative"><button class="wcbd-cc-close">&times;</button><div class="wcbd-cc-loading"><div class="spinner"></div><p style="margin-top:12px;color:#666">Checking courier history...</p></div></div></div>');
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
                    var rateColor=d.success_rate>=80?'#10b981':d.success_rate>=50?'#f59e0b':'#ef4444';
                    var html='<h3>📊 Courier Check: '+d.phone+'</h3>';
                    html+='<div class="wcbd-cc-rate"><div class="wcbd-cc-rate-circle" style="background:'+rateColor+'">'+d.success_rate+'%</div><p style="margin-top:8px;color:#666;font-size:13px">Success Rate</p></div>';
                    html+='<div class="wcbd-cc-risk '+d.risk_label+'">'+getRiskLabel(d.risk_label)+'</div>';
                    html+='<div class="wcbd-cc-stats">';
                    html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value">'+d.total_orders+'</p><p class="wcbd-cc-stat-label">Total Orders</p></div>';
                    html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value" style="color:#10b981">'+d.total_delivered+'</p><p class="wcbd-cc-stat-label">Delivered</p></div>';
                    html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value" style="color:#ef4444">'+d.total_returned+'</p><p class="wcbd-cc-stat-label">Returned</p></div>';
                    html+='</div>';
                    if(d.couriers&&d.couriers.length>0){
                        html+='<table class="wcbd-cc-table"><thead><tr><th>Courier</th><th>Orders</th><th>Delivered</th><th>Returned</th><th>Rate</th></tr></thead><tbody>';
                        d.couriers.forEach(function(c){
                            var rColor=c.rate>=80?'#10b981':c.rate>=50?'#f59e0b':'#ef4444';
                            html+='<tr><td><strong>'+c.name+'</strong></td><td>'+c.orders+'</td><td style="color:#10b981">'+c.delivered+'</td><td style="color:#ef4444">'+c.returned+'</td><td><span style="background:'+rColor+'22;color:'+rColor+';padding:2px 8px;border-radius:8px;font-weight:700;font-size:12px">'+c.rate+'%</span></td></tr>';
                        });
                        html+='</tbody></table>';
                    }
                    html+='<div class="wcbd-cc-branding"><p class="wcbd-cc-branding-text">Powered by <a href="https://webcreation-bd.lovable.app" target="_blank">WebCreation BD</a></p></div>';
                    overlay.find('.wcbd-cc-modal').html('<button class="wcbd-cc-close">&times;</button>'+html);
                    overlay.find('.wcbd-cc-close').on('click',function(){overlay.remove();});
                }else{
                    overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444">'+(res.error||'No data found')+'</p>');
                }
            },
            error:function(){
                overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444">Connection failed. Please try again.</p>');
            }
        });
    });
    
    function getRiskLabel(label){
        var labels={trusted:'✅ Trusted Customer',moderate:'⚠️ Moderate Risk',risky:'🚫 High Risk',new_customer:'🆕 New Customer'};
        return labels[label]||label;
    }
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
