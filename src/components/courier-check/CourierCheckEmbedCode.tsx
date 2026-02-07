import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourierCheckEmbedCodeProps {
  apiKey: string;
}

export function CourierCheckEmbedCode({ apiKey }: CourierCheckEmbedCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const endpointUrl = `https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/scrape-courier-check`;

  const embedCode = `<!-- WCBD Courier Check - Embed Code -->
<script>
(function() {
  var WCBD_CC_API_KEY = '${apiKey}';
  var WCBD_CC_ENDPOINT = '${endpointUrl}';

  // Attach to WooCommerce order list
  jQuery(document).ready(function($) {
    // Add "Courier Check" button to order actions
    function addCourierCheckButtons() {
      $('table.wp-list-table tbody tr').each(function() {
        var $row = $(this);
        if ($row.find('.wcbd-cc-embed-btn').length) return;
        
        var phone = $row.find('a[href*="tel:"]').text().trim();
        if (!phone) {
          var orderText = $row.text();
          var phoneMatch = orderText.match(/01[0-9]{9}/);
          if (phoneMatch) phone = phoneMatch[0];
        }
        
        if (phone) {
          var $actionsCol = $row.find('td.column-order_actions, td.column-wc_actions');
          if ($actionsCol.length) {
            $actionsCol.append('<button class="button wcbd-cc-embed-btn" data-phone="' + phone + '" title="Courier Check" style="margin-left:4px">📊</button>');
          }
        }
      });
    }

    addCourierCheckButtons();

    // Modal + AJAX
    $(document).on('click', '.wcbd-cc-embed-btn', function(e) {
      e.preventDefault();
      var phone = $(this).data('phone');
      if (!phone) return;

      var overlay = $('<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px"><div style="background:#fff;border-radius:16px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;padding:30px;box-shadow:0 25px 60px rgba(0,0,0,0.3);position:relative"><button class="wcbd-cc-close" style="position:absolute;top:15px;right:20px;font-size:24px;cursor:pointer;color:#666;background:none;border:none">&times;</button><div style="text-align:center;padding:40px"><div style="display:inline-block;width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#3b82f6;border-radius:50%;animation:wcbd-cc-spin 1s linear infinite"></div><p style="margin-top:12px;color:#666">Checking courier history...</p></div></div></div>');
      
      if (!document.getElementById('wcbd-cc-style')) {
        $('head').append('<style id="wcbd-cc-style">@keyframes wcbd-cc-spin{to{transform:rotate(360deg)}}</style>');
      }
      
      $('body').append(overlay);
      overlay.find('.wcbd-cc-close').on('click', function() { overlay.remove(); });
      overlay.on('click', function(ev) { if (ev.target === overlay[0]) overlay.remove(); });

      // Clean phone: strip +880/880 prefix
      var cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.indexOf('880') === 0 && cleanPhone.length === 13) {
        cleanPhone = '0' + cleanPhone.substring(3);
      }
      if (cleanPhone.indexOf('1') === 0 && cleanPhone.length === 10) {
        cleanPhone = '0' + cleanPhone;
      }

      $.ajax({
        url: WCBD_CC_ENDPOINT,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ phone: cleanPhone, api_key: WCBD_CC_API_KEY }),
        success: function(res) {
          if (res.success && res.data) {
            var d = res.data;
            var rateColor = d.success_rate >= 80 ? '#10b981' : d.success_rate >= 50 ? '#f59e0b' : '#ef4444';
            var riskLabels = { trusted: '✅ Trusted', moderate: '⚠️ Moderate Risk', risky: '🚫 High Risk', new_customer: '🆕 New Customer' };
            
            var html = '<div style="text-align:center;margin-bottom:20px"><div style="width:100px;height:100px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff;background:' + rateColor + '">' + d.success_rate + '%</div><p style="margin-top:8px;color:#666;font-size:13px">Success Rate</p></div>';
            html += '<div style="padding:10px 16px;border-radius:12px;text-align:center;font-weight:700;margin-bottom:16px;background:' + (d.risk_label === 'trusted' ? '#d1fae5' : d.risk_label === 'risky' ? '#fee2e2' : '#fef3c7') + ';color:' + (d.risk_label === 'trusted' ? '#065f46' : d.risk_label === 'risky' ? '#991b1b' : '#92400e') + '">' + (riskLabels[d.risk_label] || d.risk_label) + '</div>';
            html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px"><div style="background:#f8f9fa;border-radius:10px;padding:14px;text-align:center"><p style="font-size:24px;font-weight:800;margin:0">' + d.total_orders + '</p><p style="font-size:11px;color:#666;margin-top:4px">Total</p></div><div style="background:#f8f9fa;border-radius:10px;padding:14px;text-align:center"><p style="font-size:24px;font-weight:800;margin:0;color:#10b981">' + d.total_delivered + '</p><p style="font-size:11px;color:#666;margin-top:4px">Delivered</p></div><div style="background:#f8f9fa;border-radius:10px;padding:14px;text-align:center"><p style="font-size:24px;font-weight:800;margin:0;color:#ef4444">' + d.total_returned + '</p><p style="font-size:11px;color:#666;margin-top:4px">Returned</p></div></div>';
            
            if (d.couriers && d.couriers.length > 0) {
              html += '<table style="width:100%;border-collapse:collapse"><thead><tr><th style="background:#f1f5f9;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b">Courier</th><th style="background:#f1f5f9;padding:8px 10px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b">Orders</th><th style="background:#f1f5f9;padding:8px 10px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b">Delivered</th><th style="background:#f1f5f9;padding:8px 10px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b">Returned</th><th style="background:#f1f5f9;padding:8px 10px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b">Rate</th></tr></thead><tbody>';
              d.couriers.forEach(function(c) {
                var cColor = c.rate >= 80 ? '#10b981' : c.rate >= 50 ? '#f59e0b' : '#ef4444';
                html += '<tr><td style="padding:8px 10px;border-bottom:1px solid #f1f5f9"><strong>' + c.name + '</strong></td><td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f1f5f9">' + c.orders + '</td><td style="padding:8px 10px;text-align:center;color:#10b981;border-bottom:1px solid #f1f5f9">' + c.delivered + '</td><td style="padding:8px 10px;text-align:center;color:#ef4444;border-bottom:1px solid #f1f5f9">' + c.returned + '</td><td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f1f5f9"><span style="background:' + cColor + '22;color:' + cColor + ';padding:2px 8px;border-radius:8px;font-weight:700;font-size:12px">' + c.rate + '%</span></td></tr>';
              });
              html += '</tbody></table>';
            }
            
            // Branding
            html += '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center"><p style="font-size:11px;color:#94a3b8">Powered by <a href="https://webcreation-bd.lovable.app" target="_blank" style="color:#0891b2;text-decoration:none;font-weight:600">WebCreation BD</a></p></div>';
            
            overlay.find('div:last > div:first').html('<button class="wcbd-cc-close" style="position:absolute;top:15px;right:20px;font-size:24px;cursor:pointer;color:#666;background:none;border:none">&times;</button><h3 style="margin:0 0 20px;font-size:18px">📊 Courier Check: ' + d.phone + '</h3>' + html);
            overlay.find('.wcbd-cc-close').on('click', function() { overlay.remove(); });
          } else {
            overlay.find('div:last > div:last').html('<p style="color:#ef4444">' + (res.error || 'No data found') + '</p>');
          }
        },
        error: function() {
          overlay.find('div:last > div:last').html('<p style="color:#ef4444">Connection failed. Please try again.</p>');
        }
      });
    });
  });
})();
</script>
<!-- End WCBD Courier Check -->`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "✅ কপি হয়েছে!",
      description: "Embed code clipboard-এ কপি হয়েছে",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Code className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 font-bengali">Embed Code</h3>
          <p className="text-sm text-gray-500 font-bengali">Plugin ছাড়াই WordPress-এ বসান</p>
        </div>
      </div>

      <div className="relative">
        <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 overflow-x-auto text-xs text-gray-300 max-h-72">
          <code>{embedCode}</code>
        </pre>
        <Button
          onClick={copyCode}
          size="sm"
          className="absolute top-3 right-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg"
        >
          {copied ? (
            <><Check className="h-4 w-4 mr-1" /> Copied!</>
          ) : (
            <><Copy className="h-4 w-4 mr-1" /> Copy</>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 font-bengali text-sm">📚 ইন্সটলেশন:</h4>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600 font-bengali">
          <li>উপরের কোড কপি করুন</li>
          <li>WordPress → <strong>Appearance → Theme File Editor</strong> যান</li>
          <li>অথবা <strong>"Insert Headers and Footers"</strong> plugin ব্যবহার করুন</li>
          <li><code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">footer.php</code> ফাইলে <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code> এর আগে পেস্ট করুন</li>
          <li>সেভ করুন — WooCommerce Order List-এ "📊" বাটন দেখাবে</li>
        </ol>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <h5 className="font-semibold text-amber-700 text-sm mb-1.5 font-bengali">⚠️ গুরুত্বপূর্ণ:</h5>
          <ul className="list-disc list-inside space-y-1 text-amber-600 text-xs font-bengali">
            <li>এই কোডে jQuery প্রয়োজন (WooCommerce-এ ডিফল্ট থাকে)</li>
            <li>Plugin ও Embed Code একসাথে ব্যবহার করবেন না</li>
            <li>API Key পরিবর্তন হলে নতুন কোড কপি করুন</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
