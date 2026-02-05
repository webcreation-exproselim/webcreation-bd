import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, CheckCircle, Clock, AlertCircle, Download, CreditCard, Loader2, ArrowRight } from "lucide-react";
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
      <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 font-bengali mb-2">কোন ইনভয়েস নেই</h3>
        <p className="text-gray-500 font-bengali text-sm">আপনার ইনভয়েস এখানে দেখা যাবে</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice, idx) => {
        const dueAmount = Number(invoice.amount) - Number(invoice.paid_amount);
        const isPaid = invoice.status === "paid";
        const isPartial = invoice.status === "partial";

        return (
          <motion.div
            key={invoice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300"
          >
            {/* Status Bar */}
            <div className={`h-1 ${isPaid ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"}`} />

            <div className="p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Side */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isPaid ? "bg-emerald-100" : isPartial ? "bg-amber-100" : "bg-red-100"
                  }`}>
                    {isPaid ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : isPartial ? (
                      <Clock className="w-6 h-6 text-amber-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-base font-bold text-gray-900">
                        {invoice.invoice_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isPaid ? "bg-emerald-100 text-emerald-600" :
                        isPartial ? "bg-amber-100 text-amber-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {isPaid ? "পরিশোধিত" : isPartial ? "আংশিক" : "বাকি"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>

                {/* Amount Section */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-bengali">মোট</p>
                    <p className="text-lg font-bold text-gray-900">৳{Number(invoice.amount).toLocaleString()}</p>
                  </div>
                  {!isPaid && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-bengali">বাকি</p>
                      <p className="text-lg font-bold text-red-500">৳{dueAmount.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadInvoice(invoice)}
                    disabled={downloadingInvoiceId === invoice.id}
                    className="border-gray-200 hover:bg-gray-100 font-bengali"
                  >
                    {downloadingInvoiceId === invoice.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    PDF
                  </Button>
                  {!isPaid && (
                    <Link to={`/checkout?invoice=${invoice.id}&amount=${dueAmount}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bengali"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        পেমেন্ট
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
