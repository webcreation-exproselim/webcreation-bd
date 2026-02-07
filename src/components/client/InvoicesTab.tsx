import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertCircle, Download, CreditCard, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2pdf from "html2pdf.js";
import companyLogo from "@/assets/company-logo.jpg";

interface OrderService {
  serviceName: string;
  packageName: string;
  price: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
  order_id?: string | null;
  due_date?: string | null;
}

interface OrderData {
  id: string;
  customer_name: string;
  services: OrderService[];
  created_at: string;
}

interface InvoicesTabProps {
  invoices: Invoice[];
}

export function InvoicesTab({ invoices }: InvoicesTabProps) {
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [ordersMap, setOrdersMap] = useState<Record<string, OrderData>>({});
  const { toast } = useToast();

  const fetchOrderDetails = async () => {
    const orderIds = invoices.filter(inv => inv.order_id).map(inv => inv.order_id!);
    if (orderIds.length === 0) return;

    const { data } = await supabase
      .from("orders")
      .select("id, customer_name, services, created_at")
      .in("id", orderIds);

    if (data) {
      const map: Record<string, OrderData> = {};
      data.forEach(order => {
        map[order.id] = {
          ...order,
          services: (order.services as unknown) as OrderService[],
        };
      });
      setOrdersMap(map);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [invoices]);

  useEffect(() => {
    const orderIds = invoices.filter(inv => inv.order_id).map(inv => inv.order_id!);
    if (orderIds.length === 0) return;

    const channelName = `invoices-orders-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const updatedOrder = payload.new as any;
          if (orderIds.includes(updatedOrder.id)) {
            setOrdersMap(prev => ({
              ...prev,
              [updatedOrder.id]: {
                ...updatedOrder,
                services: (updatedOrder.services as unknown) as OrderService[],
              }
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log("InvoicesTab orders realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invoices]);

  const downloadInvoice = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    const order = invoice.order_id ? ordersMap[invoice.order_id] : null;
    
    try {
      const servicesHtml = order?.services?.map((s, i) => `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div>
            <span style="color: #e2e8f0; font-weight: 500;">${i + 1}. ${s.serviceName}</span>
            <span style="color: #67e8f9; font-size: 12px; margin-left: 8px;">(${s.packageName})</span>
          </div>
          <span style="color: #34d399; font-weight: 600;">৳${Number(s.price).toLocaleString()}</span>
        </div>
      `).join('') || '<div style="color: #94a3b8; padding: 12px 0;">কোন সার্ভিস নেই</div>';

      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); padding: 32px; max-width: 800px; color: white;">
          <div style="height: 6px; background: linear-gradient(to right, #22d3ee, #3b82f6, #8b5cf6); border-radius: 4px;"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 28px 0;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 60px; height: 60px; border-radius: 16px; overflow: hidden; border: 2px solid rgba(34, 211, 238, 0.3);">
                <img src="${companyLogo}" alt="Logo" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
              </div>
              <div>
                <div style="font-weight: bold; font-size: 20px; color: #ffffff;">Web Creation BD</div>
                <div style="color: #67e8f9; font-size: 12px;">Professional Digital Agency</div>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, #22d3ee, #3b82f6); color: white; padding: 12px 20px; border-radius: 12px; text-align: center;">
              <div style="font-size: 10px; text-transform: uppercase; opacity: 0.8;">ইনভয়েস</div>
              <div style="font-family: monospace; font-weight: bold; font-size: 16px;">${invoice.invoice_number}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
            <div style="background: rgba(255,255,255,0.08); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 10px; color: #67e8f9; text-transform: uppercase; margin-bottom: 6px;">তারিখ</div>
              <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${new Date(invoice.created_at).toLocaleDateString('bn-BD')}</div>
            </div>
            ${invoice.due_date ? `
            <div style="background: rgba(255,255,255,0.08); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 10px; color: #f97316; text-transform: uppercase; margin-bottom: 6px;">ডিউ ডেট</div>
              <div style="font-weight: 600; font-size: 14px; color: #ffffff;">${new Date(invoice.due_date).toLocaleDateString('bn-BD')}</div>
            </div>
            ` : ''}
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 16px; margin: 20px 0;">
            <div style="font-size: 11px; color: #67e8f9; text-transform: uppercase; margin-bottom: 12px; font-weight: 600;">সার্ভিস সমূহ</div>
            ${servicesHtml}
          </div>
          <div style="margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">মোট পরিমাণ</span>
              <span style="color: #ffffff; font-weight: 600;">৳${Number(invoice.amount).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="color: #94a3b8;">পরিশোধিত</span>
              <span style="color: #34d399; font-weight: 600;">- ৳${Number(invoice.paid_amount).toLocaleString()}</span>
            </div>
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 16px 20px; border-radius: 12px; display: flex; justify-content: space-between; margin-top: 12px;">
              <span style="font-weight: bold;">মোট বাকি</span>
              <span style="font-weight: bold; font-size: 22px;">৳${(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}</span>
            </div>
          </div>
          <div style="border-top: 1px dashed rgba(255,255,255,0.2); padding-top: 20px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 14px; color: #e2e8f0;">ধন্যবাদ! 🙏</div>
            <div style="font-size: 10px; color: #64748b;">© Web Creation BD</div>
          </div>
          <div style="height: 6px; background: linear-gradient(to right, #22d3ee, #3b82f6, #8b5cf6); margin-top: 20px; border-radius: 4px;"></div>
        </div>
      `;
      
      const opt = {
        margin: 10,
        filename: `Invoice-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(container).save();
      
      toast({ title: "✅ PDF ডাউনলোড হয়েছে" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({ title: "PDF তৈরি করতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  if (invoices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white font-bengali mb-2">কোন ইনভয়েস নেই</h3>
        <p className="text-slate-400 font-bengali text-sm">আপনার ইনভয়েস এখানে দেখা যাবে</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice, idx) => {
        const dueAmount = Number(invoice.amount) - Number(invoice.paid_amount);
        const isPaid = invoice.status === "paid";
        const isPartial = invoice.status === "partial";
        const order = invoice.order_id ? ordersMap[invoice.order_id] : null;

        return (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ y: -2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 shadow-lg"
          >
            {/* Status Bar */}
            <div className={`h-1.5 ${isPaid ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"}`} />

            <div className="p-5">
              {/* Header Row */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                {/* Left Side - Invoice Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                    isPaid ? "bg-emerald-500/10 border-emerald-500/30" : isPartial ? "bg-amber-500/10 border-amber-500/30" : "bg-red-500/10 border-red-500/30"
                  }`}>
                    {isPaid ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : isPartial ? (
                      <Clock className="w-6 h-6 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-base font-bold text-white">
                        {invoice.invoice_number}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        isPaid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                        isPartial ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                        "bg-red-500/10 text-red-400 border-red-500/30"
                      }`}>
                        {isPaid ? "পরিশোধিত" : isPartial ? "আংশিক" : "বাকি"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                      {invoice.due_date && (
                        <span className="text-amber-400 ml-2">
                          • ডিউ: {new Date(invoice.due_date).toLocaleDateString("bn-BD")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bengali mb-0.5">মোট</p>
                    <p className="text-lg font-bold text-white">৳{Number(invoice.amount).toLocaleString()}</p>
                  </div>
                  {!isPaid && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bengali mb-0.5">বাকি</p>
                      <p className="text-lg font-bold text-red-400">৳{dueAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Services List */}
              {order?.services && order.services.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-4 mb-4 border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">সার্ভিস সমূহ</span>
                  </div>
                  <div className="space-y-2">
                    {order.services.map((service, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-medium border border-cyan-500/30">
                            {sIdx + 1}
                          </span>
                          <span className="text-slate-200 font-medium">{service.serviceName}</span>
                          <span className="text-slate-500 text-xs">({service.packageName})</span>
                        </div>
                        <span className="text-emerald-400 font-semibold">৳{Number(service.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoice(invoice)}
                  disabled={downloadingInvoiceId === invoice.id}
                  className="border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-700/60 hover:text-white font-bengali"
                >
                  {downloadingInvoiceId === invoice.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF ডাউনলোড
                </Button>
                {!isPaid && (
                  <Link to={`/checkout?invoice=${invoice.id}&amount=${dueAmount}`}>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-white font-bengali shadow-lg shadow-cyan-500/20"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      পেমেন্ট করুন
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
