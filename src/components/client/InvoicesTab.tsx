import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertCircle, Download, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import html2pdf from "html2pdf.js";
import companyLogo from "@/assets/company-logo.jpg";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  created_at: string;
}

interface InvoicesTabProps {
  invoices: Invoice[];
}

export function InvoicesTab({ invoices }: InvoicesTabProps) {
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadInvoice = async (invoice: Invoice) => {
    setDownloadingInvoiceId(invoice.id);
    
    try {
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; padding: 20px; max-width: 800px;">
          <div style="height: 6px; background: linear-gradient(to right, #3b82f6, #8b5cf6);"></div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin: 20px 0;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${companyLogo}" alt="Logo" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
              <div>
                <div style="font-weight: bold; font-size: 18px; color: #111827;">Web Creation BD</div>
                <div style="color: #6b7280; font-size: 12px;">Professional Digital Agency</div>
              </div>
            </div>
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 8px 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 10px; text-transform: uppercase; opacity: 0.8;">ইনভয়েস</div>
              <div style="font-family: monospace; font-weight: bold; font-size: 14px;">${invoice.invoice_number}</div>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; margin: 16px 0;">
            <div style="font-size: 10px; color: #9ca3af; text-transform: uppercase; margin-bottom: 6px;">তারিখ</div>
            <div style="font-weight: 600; font-size: 14px;">${new Date(invoice.created_at).toLocaleDateString('bn-BD')}</div>
          </div>
          
          <div style="margin: 16px 0;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #374151;">মোট পরিমাণ</span>
              <span style="color: #111827; font-weight: 600;">৳${Number(invoice.amount).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
              <span style="color: #374151;">পরিশোধিত</span>
              <span style="color: #10b981; font-weight: 600;">- ৳${Number(invoice.paid_amount).toLocaleString()}</span>
            </div>
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 16px; border-radius: 12px; display: flex; justify-content: space-between; margin-top: 8px;">
              <span style="font-weight: bold;">মোট বাকি</span>
              <span style="font-weight: bold; font-size: 18px;">৳${(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}</span>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; margin-top: 16px; display: flex; justify-content: space-between;">
            <div style="font-size: 14px; color: #374151;">ধন্যবাদ! 🙏</div>
            <div style="font-size: 10px; color: #9ca3af;">Web Creation BD</div>
          </div>
          <div style="height: 6px; background: linear-gradient(to right, #3b82f6, #8b5cf6); margin-top: 20px;"></div>
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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-12 text-center shadow-sm">
        <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-3 md:mb-4" />
        <p className="text-gray-500 font-bengali text-sm md:text-base">কোন ইনভয়েস নেই</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {invoices.map((invoice, idx) => {
        const dueAmount = Number(invoice.amount) - Number(invoice.paid_amount);
        const StatusIcon = invoice.status === "paid" 
          ? CheckCircle 
          : invoice.status === "partial" 
          ? Clock 
          : AlertCircle;
        const statusColor = invoice.status === "paid"
          ? "bg-emerald-100 text-emerald-600"
          : invoice.status === "partial"
          ? "bg-amber-100 text-amber-600"
          : "bg-red-100 text-red-600";
        const statusText = invoice.status === "paid" 
          ? "পরিশোধিত" 
          : invoice.status === "partial"
          ? "আংশিক"
          : "বাকি";

        return (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
            
            <div className="p-3.5 md:p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${statusColor} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm md:text-base font-bold text-gray-900">
                      {invoice.invoice_number}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] md:text-xs font-bengali mt-0.5">
                    {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                  </p>
                </div>
              </div>

              {/* Amount Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3 p-2.5 md:p-3.5 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-gray-400 text-[10px] md:text-xs font-bengali mb-0.5">মোট</p>
                  <p className="text-gray-900 font-bold text-xs md:text-sm">৳{Number(invoice.amount).toLocaleString()}</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-gray-400 text-[10px] md:text-xs font-bengali mb-0.5">পরিশোধিত</p>
                  <p className="text-emerald-600 font-bold text-xs md:text-sm">৳{Number(invoice.paid_amount).toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-[10px] md:text-xs font-bengali mb-0.5">বাকি</p>
                  <p className={`font-bold text-xs md:text-sm ${dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    ৳{dueAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoice(invoice)}
                  disabled={downloadingInvoiceId === invoice.id}
                  className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50 font-bengali text-xs md:text-sm h-9 md:h-10"
                >
                  {downloadingInvoiceId === invoice.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {downloadingInvoiceId === invoice.id ? "..." : "PDF"}
                </Button>
                {invoice.status !== "paid" && (
                  <Link to={`/checkout?invoice=${invoice.id}&amount=${dueAmount}`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali text-xs md:text-sm h-9 md:h-10"
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                      পেমেন্ট
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
