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

  const embedCode = `<!-- WCBD Courier Check v1.3.0 - Embed Code -->
<style>
.wcbd-cc-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#0891b2,#2563eb);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(8,145,178,.3)}
.wcbd-cc-btn:hover{background:linear-gradient(135deg,#0e7490,#1d4ed8);box-shadow:0 4px 14px rgba(8,145,178,.4);transform:translateY(-1px)}
.wcbd-cc-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px}
.wcbd-cc-modal{background:#fff;border-radius:20px;max-width:520px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.25);position:relative;animation:wcbd-cc-fadeIn .3s ease}
@keyframes wcbd-cc-fadeIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.wcbd-cc-header{background:linear-gradient(135deg,#0891b2,#2563eb);padding:20px 24px;border-radius:20px 20px 0 0;display:flex;align-items:center;justify-content:space-between}
.wcbd-cc-header h3{margin:0;font-size:18px;color:#fff;font-weight:700;display:flex;align-items:center;gap:8px}
.wcbd-cc-phone-badge{background:rgba(255,255,255,.2);padding:4px 12px;border-radius:20px;font-size:13px;color:#fff;font-weight:500}
.wcbd-cc-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.wcbd-cc-close:hover{background:rgba(255,255,255,.35)}
.wcbd-cc-body{padding:20px 24px 24px}
.wcbd-cc-risk{padding:10px 16px;border-radius:12px;text-align:center;font-weight:700;font-size:15px;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px}
.wcbd-cc-risk.trusted{background:#d1fae5;color:#065f46}
.wcbd-cc-risk.moderate{background:#fef3c7;color:#92400e}
.wcbd-cc-risk.risky{background:#fee2e2;color:#991b1b}
.wcbd-cc-risk.new_customer{background:#dbeafe;color:#1e40af}
.wcbd-cc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
.wcbd-cc-stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 10px;text-align:center}
.wcbd-cc-stat-value{font-size:26px;font-weight:800;margin:0;line-height:1.2}
.wcbd-cc-stat-label{font-size:11px;color:#64748b;margin-top:4px;font-weight:500}
.wcbd-cc-stat-value.delivered{color:#10b981}
.wcbd-cc-stat-value.returned{color:#ef4444}
.wcbd-cc-stat-value.total{color:#0891b2}
.wcbd-cc-table-wrap{border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:16px}
.wcbd-cc-table{width:100%;border-collapse:collapse}
.wcbd-cc-table thead tr{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-table th{padding:10px 14px;text-align:center;font-size:12px;font-weight:700;color:#fff;letter-spacing:.5px}
.wcbd-cc-table th:first-child{text-align:left}
.wcbd-cc-table td{padding:12px 14px;text-align:center;border-bottom:1px solid #f1f5f9;font-size:13px}
.wcbd-cc-table td:first-child{text-align:left}
.wcbd-cc-table tbody tr:hover{background:#f8fafc}
.wcbd-cc-table tbody tr:last-child td{border-bottom:none}
.wcbd-cc-table tfoot tr{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-table tfoot td{padding:10px 14px;text-align:center;font-size:13px;font-weight:700;color:#fff}
.wcbd-cc-table tfoot td:first-child{text-align:left}
.wcbd-cc-courier-logo{height:28px;max-width:100px;object-fit:contain}
.wcbd-cc-courier-name{font-weight:600;color:#1e293b}
.wcbd-cc-delivered{color:#10b981;font-weight:700}
.wcbd-cc-orders{color:#475569;font-weight:600}
.wcbd-cc-branding{margin-top:16px;padding-top:14px;border-top:1px solid #e5e7eb;text-align:center}
.wcbd-cc-branding a{color:#0891b2;text-decoration:none;font-weight:600;font-size:12px}
.wcbd-cc-branding-text{font-size:11px;color:#94a3b8}
.wcbd-cc-loading{text-align:center;padding:50px 20px}
.wcbd-cc-loading .spinner{display:inline-block;width:44px;height:44px;border:4px solid #e5e7eb;border-top-color:#0891b2;border-radius:50%;animation:wcbd-cc-spin .8s linear infinite}
.wcbd-cc-loading p{margin-top:14px;color:#64748b;font-size:14px}
@keyframes wcbd-cc-spin{to{transform:rotate(360deg)}}
@media(max-width:600px){
.wcbd-cc-modal-overlay{padding:8px;align-items:flex-end}
.wcbd-cc-modal{max-width:100%;max-height:92vh;border-radius:20px 20px 0 0;animation:wcbd-cc-slideUp .3s ease}
@keyframes wcbd-cc-slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.wcbd-cc-header{padding:16px 18px;border-radius:20px 20px 0 0}
.wcbd-cc-header h3{font-size:16px}
.wcbd-cc-body{padding:16px 18px 20px}
.wcbd-cc-stats{gap:8px}
.wcbd-cc-stat{padding:10px 6px}
.wcbd-cc-stat-value{font-size:20px}
.wcbd-cc-stat-label{font-size:10px}
.wcbd-cc-risk{font-size:13px;padding:8px 12px}
.wcbd-cc-table th,.wcbd-cc-table td,.wcbd-cc-table tfoot td{padding:8px 10px;font-size:12px}
.wcbd-cc-courier-logo{height:22px;max-width:80px}
.wcbd-cc-close{top:12px;right:12px;width:28px;height:28px;font-size:16px}
}
</style>
<script>
(function() {
  var WCBD_CC_API_KEY = '${apiKey}';
  var WCBD_CC_ENDPOINT = '${endpointUrl}';
  var courierLogos = {
    'pathao': 'https://pathao.com/wp-content/themes/flavor/flavor-developer/developer/flavor/assets/images/Pathao-logo.png',
    'steadfast': 'https://steadfast.com.bd/images/logo.svg',
    'carrybee': 'https://carrybee.com.bd/wp-content/uploads/2024/01/Carrybee-Logo-04.png',
    'redx': 'https://redx.com.bd/svg/ic_redx_logo.svg',
    'red x': 'https://redx.com.bd/svg/ic_redx_logo.svg',
    'carry bee': 'https://carrybee.com.bd/wp-content/uploads/2024/01/Carrybee-Logo-04.png'
  };
  var allowedCouriers = ['pathao','steadfast','carrybee','carry bee','redx','red x','redx logistics','red x logistics'];

  function getCourierLogo(name) {
    var lower = name.toLowerCase();
    for (var key in courierLogos) { if (lower.indexOf(key) !== -1) return courierLogos[key]; }
    return null;
  }
  function isAllowed(name) {
    var lower = name.toLowerCase();
    for (var i = 0; i < allowedCouriers.length; i++) { if (lower.indexOf(allowedCouriers[i]) !== -1) return true; }
    return false;
  }

  jQuery(document).ready(function($) {
    // Add buttons to order list
    $('table.wp-list-table tbody tr').each(function() {
      var $row = $(this);
      if ($row.find('.wcbd-cc-btn').length) return;
      var phone = $row.find('a[href*="tel:"]').text().trim();
      if (!phone) { var m = $row.text().match(/01[0-9]{9}/); if (m) phone = m[0]; }
      if (phone) {
        var $col = $row.find('td.column-order_actions, td.column-wc_actions');
        if ($col.length) $col.append('<button class="wcbd-cc-btn" data-phone="' + phone + '" title="Courier Check" style="margin-left:4px"><span>📊</span> <span>Check</span></button>');
      }
    });

    $(document).on('click', '.wcbd-cc-btn', function(e) {
      e.preventDefault();
      var phone = $(this).data('phone');
      if (!phone) return;

      var overlay = $('<div class="wcbd-cc-modal-overlay"><div class="wcbd-cc-modal"><button class="wcbd-cc-close">&times;</button><div class="wcbd-cc-loading"><div class="spinner"></div><p>Checking courier history...</p></div></div></div>');
      $('body').append(overlay);
      overlay.find('.wcbd-cc-close').on('click', function() { overlay.remove(); });
      overlay.on('click', function(ev) { if (ev.target === overlay[0]) overlay.remove(); });

      var cleanPhone = String(phone).replace(/[^0-9]/g, '');
      if (cleanPhone.indexOf('880') === 0 && cleanPhone.length === 13) cleanPhone = '0' + cleanPhone.substring(3);
      if (cleanPhone.indexOf('1') === 0 && cleanPhone.length === 10) cleanPhone = '0' + cleanPhone;

      $.ajax({
        url: WCBD_CC_ENDPOINT,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ phone: cleanPhone, api_key: WCBD_CC_API_KEY }),
        success: function(res) {
          if (res.success && res.data) {
            var d = res.data;
            var filtered = [];
            if (d.couriers) { for (var i = 0; i < d.couriers.length; i++) { if (isAllowed(d.couriers[i].name)) filtered.push(d.couriers[i]); } }
            var tO=0,tD=0,tR=0;
            for (var j=0;j<filtered.length;j++){tO+=filtered[j].orders||0;tD+=filtered[j].delivered||0;tR+=filtered[j].returned||0;}
            var sr=tO>0?Math.round((tD/tO)*100):0;
            var rc='new_customer',rl='🆕 New Customer';
            if(tO>0){if(sr>=80){rc='trusted';rl='✅ Trusted Customer'}else if(sr>=50){rc='moderate';rl='⚠️ Moderate Risk'}else{rc='risky';rl='🚫 High Risk'}}

            var html='<div class="wcbd-cc-header"><h3>📊 Courier Check</h3><span class="wcbd-cc-phone-badge">'+d.phone+'</span></div>';
            html+='<div class="wcbd-cc-body">';
            html+='<div class="wcbd-cc-risk '+rc+'">'+rl+' — '+sr+'%</div>';
            html+='<div class="wcbd-cc-stats">';
            html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value total">'+tO+'</p><p class="wcbd-cc-stat-label">মোট অর্ডার</p></div>';
            html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value delivered">'+tD+'</p><p class="wcbd-cc-stat-label">মোট ডেলিভারি</p></div>';
            html+='<div class="wcbd-cc-stat"><p class="wcbd-cc-stat-value returned">'+tR+'</p><p class="wcbd-cc-stat-label">মোট বাতিল</p></div>';
            html+='</div>';
            if(filtered.length>0){
              html+='<div class="wcbd-cc-table-wrap"><table class="wcbd-cc-table"><thead><tr><th>কুরিয়ার</th><th>মোট</th><th>সফল</th></tr></thead><tbody>';
              for(var k=0;k<filtered.length;k++){var c=filtered[k];var logo=getCourierLogo(c.name);
                var cell=logo?'<img src="'+logo+'" alt="'+c.name+'" class="wcbd-cc-courier-logo" onerror="this.style.display=\\'none\\';this.nextSibling.style.display=\\'inline\\'"><span class="wcbd-cc-courier-name" style="display:none">'+c.name+'</span>':'<span class="wcbd-cc-courier-name">'+c.name+'</span>';
                html+='<tr><td>'+cell+'</td><td class="wcbd-cc-orders">'+c.orders+'</td><td class="wcbd-cc-delivered">'+c.delivered+'</td></tr>';}
              html+='</tbody><tfoot><tr><td>মোট</td><td>'+tO+'</td><td>'+tD+'</td></tr></tfoot></table></div>';}
            html+='<div class="wcbd-cc-branding"><p class="wcbd-cc-branding-text">Powered by <a href="https://www.webcreationbd.online" target="_blank">WebCreation BD</a></p></div>';
            html+='</div>';
            overlay.find('.wcbd-cc-modal').html('<button class="wcbd-cc-close">&times;</button>'+html);
            overlay.find('.wcbd-cc-close').on('click',function(){overlay.remove();});
          } else {
            overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444;font-size:14px">'+(res.error||'No data found')+'</p>');
          }
        },
        error: function() {
          overlay.find('.wcbd-cc-loading').html('<p style="color:#ef4444;font-size:14px">Connection failed. Please try again.</p>');
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
          <li>সেভ করুন — WooCommerce Order List-এ "📊 Check" বাটন দেখাবে</li>
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
