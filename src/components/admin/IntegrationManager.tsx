import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Globe, Copy, Search, RefreshCw, Loader2, Shield, Truck,
  CheckCircle, XCircle, ExternalLink, Trash2, Eye, EyeOff,
  Plus, Code, Calendar, BarChart3, LayoutDashboard
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { AssignPlanModal } from "./AssignPlanModal";
import { AssignCourierCheckPlanModal } from "./AssignCourierCheckPlanModal";

interface IntegrationRecord {
  id: string;
  type: "fraudguard" | "couriercheck";
  user_id: string;
  api_key: string;
  website_url: string | null;
  store_name: string | null;
  is_active: boolean;
  plan_expires_at: string | null;
  requests_used: number;
  max_requests: number;
  current_plan?: string | null;
  user_name?: string | null;
  user_phone?: string | null;
}

export function IntegrationManager() {
  const [records, setRecords] = useState<IntegrationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "fraudguard" | "couriercheck" | "active" | "inactive">("all");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"fraudguard" | "couriercheck" | null>(null);
  const [showAssignFG, setShowAssignFG] = useState(false);
  const [showAssignCC, setShowAssignCC] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IntegrationRecord | null>(null);
  const [dashboardCodeRecord, setDashboardCodeRecord] = useState<IntegrationRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch merchants (Fraud Guard)
      const { data: merchants } = await supabase
        .from('merchants')
        .select('id, user_id, api_key, website_url, store_name, is_active, plan_expires_at, requests_used, max_requests, current_plan')
        .order('created_at', { ascending: false });

      // Fetch courier check subscriptions
      const { data: ccSubs } = await supabase
        .from('courier_check_subscriptions')
        .select('id, user_id, api_key, website_url, store_name, is_active, plan_expires_at, requests_used, max_requests')
        .order('created_at', { ascending: false });

      // Fetch profiles for names
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone');

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const fgRecords: IntegrationRecord[] = (merchants || []).map(m => ({
        id: m.id,
        type: "fraudguard" as const,
        user_id: m.user_id,
        api_key: m.api_key,
        website_url: m.website_url,
        store_name: m.store_name,
        is_active: m.is_active,
        plan_expires_at: m.plan_expires_at,
        requests_used: m.requests_used,
        max_requests: m.max_requests,
        current_plan: m.current_plan,
        user_name: profileMap.get(m.user_id)?.full_name,
        user_phone: profileMap.get(m.user_id)?.phone,
      }));

      const ccRecords: IntegrationRecord[] = (ccSubs || []).map(c => ({
        id: c.id,
        type: "couriercheck" as const,
        user_id: c.user_id,
        api_key: c.api_key,
        website_url: c.website_url,
        store_name: c.store_name,
        is_active: c.is_active,
        plan_expires_at: c.plan_expires_at,
        requests_used: c.requests_used,
        max_requests: c.max_requests,
        user_name: profileMap.get(c.user_id)?.full_name,
        user_phone: profileMap.get(c.user_id)?.phone,
      }));

      setRecords([...fgRecords, ...ccRecords]);
    } catch (err) {
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "কপি হয়েছে!", description: `${label} কপি করা হয়েছে` });
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleActive = async (record: IntegrationRecord) => {
    const table = record.type === "fraudguard" ? "merchants" : "courier_check_subscriptions";
    const { error } = await supabase
      .from(table)
      .update({ is_active: !record.is_active })
      .eq('id', record.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: record.is_active ? "নিষ্ক্রিয় করা হয়েছে" : "সক্রিয় করা হয়েছে" });
      fetchAll();
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    const table = deleteType === "fraudguard" ? "merchants" : "courier_check_subscriptions";
    const { error } = await supabase.from(table).delete().eq('id', deleteId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "মুছে ফেলা হয়েছে" });
      fetchAll();
    }
    setDeleteId(null);
    setDeleteType(null);
  };

  const getEndpointUrl = (type: "fraudguard" | "couriercheck") => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'gtjmfvwkatrorhuyrpby';
    return type === "fraudguard"
      ? `https://${projectId}.supabase.co/functions/v1/check-order-eligibility`
      : `https://${projectId}.supabase.co/functions/v1/scrape-courier-check`;
  };

  const getIntegrationCode = (record: IntegrationRecord) => {
    if (record.type === "fraudguard") {
      return `// Fraud Guard Integration
const response = await fetch('${getEndpointUrl("fraudguard")}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: '${record.api_key}',
    phone: customerPhone,
    device_id: deviceFingerprint,
    check_type: 'order'
  })
});
const result = await response.json();
if (!result.allowed) {
  // Order blocked - show message
  alert(result.message);
}`;
    } else {
      return `<!-- WCBD Courier Check - Complete Integration with Popup -->
<!-- এই কোডটি আপনার সাইটের <head> বা <body> এর শেষে বসান -->
<style>
.wcbd-cc-trigger{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:none;border-radius:10px;background:linear-gradient(135deg,#0891b2,#2563eb);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(8,145,178,.3)}
.wcbd-cc-trigger:hover{background:linear-gradient(135deg,#0e7490,#1d4ed8);transform:translateY(-1px)}
.wcbd-cc-popup-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;animation:wcbd-fadeIn .2s ease}
@keyframes wcbd-fadeIn{from{opacity:0}to{opacity:1}}
.wcbd-cc-popup{background:#fff;border-radius:20px;max-width:480px;width:100%;box-shadow:0 25px 60px rgba(0,0,0,.25);overflow:hidden;animation:wcbd-scaleIn .3s ease}
@keyframes wcbd-scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
.wcbd-cc-popup-header{background:linear-gradient(135deg,#0891b2,#2563eb);padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
.wcbd-cc-popup-header h3{margin:0;font-size:16px;color:#fff;font-weight:700;display:flex;align-items:center;gap:8px}
.wcbd-cc-popup-phone{background:rgba(255,255,255,.2);padding:3px 10px;border-radius:16px;font-size:12px;color:#fff}
.wcbd-cc-popup-close{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.2);border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.wcbd-cc-popup-close:hover{background:rgba(255,255,255,.35)}
.wcbd-cc-popup-body{padding:16px 20px 20px}
.wcbd-cc-popup-risk{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:10px;font-weight:700;font-size:13px;margin-bottom:12px}
.wcbd-cc-popup-risk.trusted{background:#d1fae5;color:#065f46}
.wcbd-cc-popup-risk.moderate{background:#fef3c7;color:#92400e}
.wcbd-cc-popup-risk.risky{background:#fee2e2;color:#991b1b}
.wcbd-cc-popup-risk.new_customer{background:#dbeafe;color:#1e40af}
.wcbd-cc-popup-stats{display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap}
.wcbd-cc-popup-stat{display:flex;align-items:center;gap:4px;font-size:13px;color:#475569;font-weight:500}
.wcbd-cc-popup-stat strong{font-weight:700}
.wcbd-cc-popup-stat .success{color:#10b981}
.wcbd-cc-popup-stat .returned{color:#ef4444}
.wcbd-cc-popup-stat .total{color:#0891b2}
.wcbd-cc-popup-table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;margin-bottom:14px}
.wcbd-cc-popup-table thead{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-popup-table th{padding:8px 12px;font-size:11px;font-weight:700;color:#fff;text-align:center}
.wcbd-cc-popup-table th:first-child{text-align:left}
.wcbd-cc-popup-table td{padding:10px 12px;text-align:center;border-bottom:1px solid #f1f5f9;font-size:12px}
.wcbd-cc-popup-table td:first-child{text-align:left;font-weight:600;color:#1e293b}
.wcbd-cc-popup-table tfoot{background:linear-gradient(135deg,#2563eb,#4f46e5)}
.wcbd-cc-popup-table tfoot td{color:#fff;font-weight:700;font-size:12px}
.wcbd-cc-popup-branding{text-align:center;padding-top:12px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8}
.wcbd-cc-popup-branding a{color:#0891b2;text-decoration:none;font-weight:600}
.wcbd-cc-popup-loading{text-align:center;padding:40px 20px}
.wcbd-cc-popup-spinner{display:inline-block;width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#0891b2;border-radius:50%;animation:wcbd-spin .7s linear infinite}
@keyframes wcbd-spin{to{transform:rotate(360deg)}}
@media(max-width:600px){
.wcbd-cc-popup-overlay{align-items:flex-end;padding:0}
.wcbd-cc-popup{border-radius:20px 20px 0 0;max-height:90vh;overflow-y:auto;animation:wcbd-slideUp .3s ease}
@keyframes wcbd-slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
}
</style>
<script>
(function(){
  var WCBD_API_KEY='${record.api_key}';
  var WCBD_ENDPOINT='${getEndpointUrl("couriercheck")}';
  var defaultCouriers=[{name:'Pathao',key:'pathao'},{name:'Steadfast',key:'steadfast'},{name:'CarryBee',key:'carrybee'},{name:'RedX',key:'redx'}];

  window.wcbdCourierCheck=function(phone){
    if(!phone)return;
    var clean=String(phone).replace(/[^0-9]/g,'');
    if(clean.indexOf('880')===0&&clean.length===13)clean='0'+clean.substring(3);
    if(clean.indexOf('1')===0&&clean.length===10)clean='0'+clean;

    var ov=document.createElement('div');ov.className='wcbd-cc-popup-overlay';
    ov.innerHTML='<div class="wcbd-cc-popup"><div class="wcbd-cc-popup-header"><h3>📦 Courier History</h3><button class="wcbd-cc-popup-close">&times;</button></div><div class="wcbd-cc-popup-body"><div class="wcbd-cc-popup-loading"><div class="wcbd-cc-popup-spinner"></div><p style="margin-top:12px;color:#64748b;font-size:13px">Checking...</p></div></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('.wcbd-cc-popup-close').onclick=function(){ov.remove();};
    ov.onclick=function(e){if(e.target===ov)ov.remove();};

    fetch(WCBD_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone:clean,api_key:WCBD_API_KEY})})
    .then(function(r){return r.json()})
    .then(function(res){
      if(!res.success||!res.data){ov.querySelector('.wcbd-cc-popup-body').innerHTML='<p style="color:#ef4444;text-align:center;padding:20px">'+( res.error||'No data found')+'</p>';return;}
      var d=res.data,tO=0,tD=0,tR=0;
      for(var i=0;i<defaultCouriers.length;i++){var m=findMatch(d.couriers,defaultCouriers[i].key);if(m){tO+=m.orders||0;tD+=m.delivered||0;tR+=m.returned||0;}}
      var sr=tO>0?Math.round((tD/tO)*100):0;
      var rc='new_customer',rl='🆕 New Customer';
      if(tO>0){if(sr>=80){rc='trusted';rl='✅ Trusted'}else if(sr>=50){rc='moderate';rl='⚠️ Moderate'}else{rc='risky';rl='🚫 High Risk'}}

      var h='<div class="wcbd-cc-popup-header"><h3>📦 Courier History</h3><span class="wcbd-cc-popup-phone">'+d.phone+'</span><button class="wcbd-cc-popup-close" style="position:absolute;top:12px;right:12px">&times;</button></div>';
      h+='<div class="wcbd-cc-popup-body">';
      h+='<div class="wcbd-cc-popup-risk '+rc+'">'+rl+' &nbsp; Success: '+sr+'%</div>';
      h+='<div class="wcbd-cc-popup-stats">';
      h+='<div class="wcbd-cc-popup-stat"><strong class="total">'+tO+'</strong> Orders</div>';
      h+='<div class="wcbd-cc-popup-stat">✅ <strong class="success">'+tD+'</strong></div>';
      h+='<div class="wcbd-cc-popup-stat">📦 <strong class="returned">'+tR+'</strong></div>';
      h+='</div>';
      h+='<table class="wcbd-cc-popup-table"><thead><tr><th>Courier</th><th>Orders</th><th>Delivered</th></tr></thead><tbody>';
      for(var j=0;j<defaultCouriers.length;j++){var cm=findMatch(d.couriers,defaultCouriers[j].key);h+='<tr><td>'+defaultCouriers[j].name+'</td><td>'+(cm?cm.orders:0)+'</td><td style="color:'+(cm&&cm.delivered>0?'#10b981':'#94a3b8')+';font-weight:700">'+(cm?cm.delivered:0)+'</td></tr>';}
      h+='</tbody><tfoot><tr><td>Total</td><td>'+tO+'</td><td>'+tD+'</td></tr></tfoot></table>';
      h+='<div class="wcbd-cc-popup-branding">Powered by <a href="https://www.webcreationbd.online" target="_blank">WebCreation BD</a></div>';
      h+='</div>';
      ov.querySelector('.wcbd-cc-popup').innerHTML=h;
      ov.querySelector('.wcbd-cc-popup-close').onclick=function(){ov.remove();};
    }).catch(function(){ov.querySelector('.wcbd-cc-popup-body').innerHTML='<p style="color:#ef4444;text-align:center;padding:20px">Connection failed</p>';});
  };

  function findMatch(couriers,key){if(!couriers)return null;for(var i=0;i<couriers.length;i++){var l=couriers[i].name.toLowerCase();if(l.indexOf(key)!==-1)return couriers[i];if(key==='carrybee'&&l.indexOf('carry bee')!==-1)return couriers[i];if(key==='redx'&&(l.indexOf('red x')!==-1||l.indexOf('redx')!==-1))return couriers[i];}return null;}
})();
</script>

<!-- ব্যবহার: যেকোনো জায়গায় button বা JS দিয়ে call করুন -->
<!-- Example 1: Button -->
<button class="wcbd-cc-trigger" onclick="wcbdCourierCheck('01XXXXXXXXX')">📊 Check Courier</button>

<!-- Example 2: JavaScript -->
<script>
// যেকোনো phone number দিয়ে popup দেখান:
// wcbdCourierCheck('01712345678');
</script>`;
    }
  };

  const getManageStoreEndpoint = () => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'gtjmfvwkatrorhuyrpby';
    return `https://${projectId}.supabase.co/functions/v1/manage-store`;
  };

  const getManageDashboardCode = (record: IntegrationRecord) => {
    const endpoint = getManageStoreEndpoint();
    return `// ═══════════════════════════════════════════════════════════
// WCBD Fraud Guard - Remote Dashboard Integration
// এই কোডটি অন্য Lovable সাইটে বসিয়ে API দিয়ে সব manage করুন
// ═══════════════════════════════════════════════════════════

const API_KEY = '${record.api_key}';
const ENDPOINT = '${endpoint}';

// Helper function - সব API call এটা দিয়ে হবে
async function manageStore(action, params = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: API_KEY, action, params })
  });
  return await res.json();
}

// ══════ EXAMPLES ══════

// 1️⃣ Dashboard Summary (সব তথ্য একসাথে)
const dashboard = await manageStore('get_dashboard');
// dashboard.data = { subscription, incomplete_orders, fraud_logs, blacklist_count, abandoned_carts }

// 2️⃣ Settings দেখুন
const settings = await manageStore('get_settings');

// 3️⃣ Settings আপডেট করুন
await manageStore('update_settings', {
  cooldown_period_minutes: 1440,
  msg_cooldown: 'আপনি সম্প্রতি অর্ডার করেছেন।'
});

// 4️⃣ Incomplete Orders দেখুন
const orders = await manageStore('get_incomplete_orders', { limit: 50, filter: 'pending' });

// 5️⃣ Order Convert করুন
await manageStore('convert_order', { order_id: 'ORDER_UUID' });

// 6️⃣ Incomplete Order মুছুন
await manageStore('delete_incomplete_order', { order_id: 'ORDER_UUID' });

// 7️⃣ সব Pending Orders একসাথে মুছুন
await manageStore('cleanup_incomplete_orders');

// 8️⃣ Blacklist দেখুন
const bl = await manageStore('get_blacklist');

// 9️⃣ Blacklist-এ যোগ করুন
await manageStore('add_blacklist', { value: '01700000000', type: 'phone', reason: 'Fraud' });

// 🔟 Blacklist থেকে বাদ দিন
await manageStore('remove_blacklist', { id: 'ENTRY_UUID' });

// 1️⃣1️⃣ Fraud Logs দেখুন
const logs = await manageStore('get_fraud_logs', { limit: 100 });

// 1️⃣2️⃣ Abandoned Carts দেখুন
const carts = await manageStore('get_abandoned_carts');

// 1️⃣3️⃣ Abandoned Cart Recovered mark করুন
await manageStore('recover_abandoned', { id: 'CART_UUID' });

// 1️⃣4️⃣ Abandoned Cart মুছুন
await manageStore('delete_abandoned', { id: 'CART_UUID' });`;
  };

  const filtered = records.filter(r => {
    if (filter === "fraudguard" && r.type !== "fraudguard") return false;
    if (filter === "couriercheck" && r.type !== "couriercheck") return false;
    if (filter === "active" && !r.is_active) return false;
    if (filter === "inactive" && r.is_active) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        r.website_url?.toLowerCase().includes(s) ||
        r.store_name?.toLowerCase().includes(s) ||
        r.user_name?.toLowerCase().includes(s) ||
        r.user_phone?.includes(s) ||
        r.api_key.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const stats = {
    total: records.length,
    active: records.filter(r => r.is_active).length,
    fg: records.filter(r => r.type === "fraudguard").length,
    cc: records.filter(r => r.type === "couriercheck").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "মোট Integration", value: stats.total, icon: Globe, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "সক্রিয়", value: stats.active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Fraud Guard", value: stats.fg, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Courier Check", value: stats.cc, icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-bengali">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Domain, Store, User দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 font-bengali"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "all", label: "সব" },
            { id: "fraudguard", label: "FG" },
            { id: "couriercheck", label: "CC" },
            { id: "active", label: "সক্রিয়" },
            { id: "inactive", label: "নিষ্ক্রিয়" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bengali whitespace-nowrap transition-all ${
                filter === f.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setShowAssignFG(true)} className="bg-purple-600 hover:bg-purple-700 font-bengali text-xs">
            <Plus className="w-3 h-3 mr-1" /> FG Assign
          </Button>
          <Button size="sm" onClick={() => setShowAssignCC(true)} className="bg-cyan-600 hover:bg-cyan-700 font-bengali text-xs">
            <Plus className="w-3 h-3 mr-1" /> CC Assign
          </Button>
          <Button size="sm" variant="outline" onClick={fetchAll}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Integration Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-bengali">কোনো Integration পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((record, index) => {
            const isExpired = record.plan_expires_at && new Date(record.plan_expires_at) < new Date();
            const showKey = visibleKeys.has(record.id);
            const showCode = selectedRecord?.id === record.id;

            return (
              <motion.div
                key={`${record.type}-${record.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        record.type === "fraudguard" ? "bg-purple-100" : "bg-cyan-100"
                      }`}>
                        {record.type === "fraudguard"
                          ? <Shield className="w-5 h-5 text-purple-600" />
                          : <Truck className="w-5 h-5 text-cyan-600" />
                        }
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {record.store_name || record.website_url || 'Unknown'}
                          </h3>
                          <Badge variant={record.type === "fraudguard" ? "default" : "secondary"} className={`text-[10px] ${
                            record.type === "fraudguard" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"
                          }`}>
                            {record.type === "fraudguard" ? "Fraud Guard" : "Courier Check"}
                          </Badge>
                          {record.is_active ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px]">সক্রিয়</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-[10px]">নিষ্ক্রিয়</Badge>
                          )}
                          {isExpired && (
                            <Badge className="bg-yellow-100 text-yellow-700 text-[10px]">মেয়াদ শেষ</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {record.website_url && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {record.website_url}
                            </span>
                          )}
                          {record.user_name && (
                            <span>👤 {record.user_name}</span>
                          )}
                          {record.user_phone && (
                            <span>📱 {record.user_phone}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedRecord(showCode ? null : record)}
                        title="Integration Code"
                      >
                        <Code className="w-4 h-4 text-gray-500" />
                      </Button>
                      {record.type === "fraudguard" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDashboardCodeRecord(dashboardCodeRecord?.id === record.id ? null : record)}
                          title="Dashboard Management Code"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(record)}
                        title={record.is_active ? "Deactivate" : "Activate"}
                      >
                        {record.is_active
                          ? <XCircle className="w-4 h-4 text-red-500" />
                          : <CheckCircle className="w-4 h-4 text-green-500" />
                        }
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setDeleteId(record.id); setDeleteType(record.type); }}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>

                  {/* API Key & Usage Row */}
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-400 shrink-0">API Key:</span>
                      <code className="text-xs text-gray-700 truncate flex-1">
                        {showKey ? record.api_key : '••••••••-••••-••••-••••-••••••••••••'}
                      </code>
                      <button onClick={() => toggleKeyVisibility(record.id)} className="text-gray-400 hover:text-gray-600">
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => copyToClipboard(record.api_key, 'API Key')} className="text-gray-400 hover:text-blue-600">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {record.requests_used}/{record.max_requests}
                      </span>
                      {record.plan_expires_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.plan_expires_at).toLocaleDateString('bn-BD')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Integration Code Block */}
                  {showCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard(getIntegrationCode(record), 'Integration Code')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre font-mono">
                          {getIntegrationCode(record)}
                        </pre>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 font-bengali bg-blue-50 border border-blue-100 rounded-lg p-2">
                        💡 এই কোডটি আপনার অন্য Lovable সাইটে বা যেকোনো frontend থেকে ব্যবহার করুন। API Key দিয়ে সরাসরি call করলেই কাজ করবে।
                      </div>
                    </motion.div>
                  )}

                  {/* Dashboard Management Code Block */}
                  {record.type === "fraudguard" && dashboardCodeRecord?.id === record.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard(getManageDashboardCode(record), 'Dashboard Code')}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <pre className="text-xs text-cyan-400 overflow-x-auto whitespace-pre font-mono max-h-80 overflow-y-auto">
                          {getManageDashboardCode(record)}
                        </pre>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 font-bengali bg-emerald-50 border border-emerald-100 rounded-lg p-2">
                        🎛️ এই কোড দিয়ে অন্য Lovable সাইটে Fraud Guard সম্পূর্ণ manage করুন — Incomplete Orders, Blacklist, Logs, Settings সব API দিয়ে control হবে।
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Assign Modals */}
      <AssignPlanModal open={showAssignFG} onOpenChange={setShowAssignFG} onSuccess={fetchAll} />
      <AssignCourierCheckPlanModal open={showAssignCC} onOpenChange={setShowAssignCC} onSuccess={fetchAll} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => { setDeleteId(null); setDeleteType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই integration record মুছে ফেললে API key আর কাজ করবে না। এটি undo করা যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bengali">
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
