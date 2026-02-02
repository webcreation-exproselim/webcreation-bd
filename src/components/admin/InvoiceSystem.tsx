import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Plus, Download, Send, Eye, Printer, 
  CheckCircle, Clock, XCircle, Phone, Mail, 
  MessageCircle, Building2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_price: number;
  services: any[];
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  order_id: string | null;
  client_id: string | null;
  created_at: string;
  due_date?: string | null;
}

interface InvoiceSystemProps {
  invoices: Invoice[];
  orders: Order[];
  onRefresh: () => void;
}

export function InvoiceSystem({ invoices, orders, onRefresh }: InvoiceSystemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceType, setInvoiceType] = useState<"order" | "custom">("order");
  const { toast } = useToast();
  
  // Order-based invoice form
  const [invoiceForm, setInvoiceForm] = useState({
    order_id: "",
    amount: 0,
    due_date: "",
    notes: "",
  });

  // Custom invoice form
  const [customForm, setCustomForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    services: [{ name: "", description: "", price: 0 }],
    due_date: "",
    notes: "",
  });

  const addService = () => {
    setCustomForm(prev => ({
      ...prev,
      services: [...prev.services, { name: "", description: "", price: 0 }]
    }));
  };

  const removeService = (index: number) => {
    setCustomForm(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: string, value: string | number) => {
    setCustomForm(prev => ({
      ...prev,
      services: prev.services.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const getCustomTotal = () => {
    return customForm.services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  };

  const createInvoice = async () => {
    if (invoiceType === "order") {
      if (!invoiceForm.order_id || !invoiceForm.amount) {
        toast({ title: "অর্ডার এবং পরিমাণ দিন", variant: "destructive" });
        return;
      }
      
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          order_id: invoiceForm.order_id,
          client_id: null,
          amount: invoiceForm.amount,
          status: "unpaid",
          due_date: invoiceForm.due_date || null,
        });
      
      if (!error) {
        toast({ title: "ইনভয়েস তৈরি হয়েছে" });
        setIsModalOpen(false);
        setInvoiceForm({ order_id: "", amount: 0, due_date: "", notes: "" });
        onRefresh();
      } else {
        toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
      }
    } else {
      // Custom invoice
      if (!customForm.client_name.trim() || !customForm.client_phone.trim()) {
        toast({ title: "ক্লায়েন্টের নাম এবং ফোন নম্বর দিন", variant: "destructive" });
        return;
      }
      
      const validServices = customForm.services.filter(s => s.name.trim() && s.price > 0);
      if (validServices.length === 0) {
        toast({ title: "কমপক্ষে একটি সার্ভিস যোগ করুন", variant: "destructive" });
        return;
      }

      // First create a custom order to store the invoice data
      const orderServices = validServices.map(s => ({
        serviceName: s.name,
        packageName: s.description || "Custom",
        price: s.price
      }));

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customForm.client_name.trim(),
          customer_phone: customForm.client_phone.trim(),
          customer_email: customForm.client_email.trim() || null,
          services: orderServices,
          total_price: getCustomTotal(),
          payment_method: "custom_invoice",
          status: "pending",
          notes: customForm.notes || null,
        })
        .select()
        .single();

      if (orderError) {
        toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
        return;
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      const { error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          order_id: orderData.id,
          client_id: null,
          amount: getCustomTotal(),
          status: "unpaid",
          due_date: customForm.due_date || null,
        });
      
      if (!error) {
        toast({ title: "কাস্টম ইনভয়েস তৈরি হয়েছে" });
        setIsModalOpen(false);
        setCustomForm({
          client_name: "",
          client_phone: "",
          client_email: "",
          services: [{ name: "", description: "", price: 0 }],
          due_date: "",
          notes: "",
        });
        onRefresh();
      } else {
        toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
      }
    }
  };

  const updateInvoiceStatus = async (id: string, status: string, paidAmount?: number) => {
    const updateData: any = { status };
    if (paidAmount !== undefined) updateData.paid_amount = paidAmount;
    
    const { error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id);
    
    if (!error) {
      toast({ title: "ইনভয়েস আপডেট হয়েছে" });
      onRefresh();
    }
  };

  const openPreview = (invoice: Invoice) => {
    const order = orders.find(o => o.id === invoice.order_id);
    setSelectedInvoice(invoice);
    setSelectedOrder(order || null);
    setIsPreviewOpen(true);
  };

  const sendViaWhatsApp = (invoice: Invoice) => {
    const order = orders.find(o => o.id === invoice.order_id);
    if (!order) return;
    
    const message = `🧾 *ইনভয়েস - Web Creation BD*

ইনভয়েস নং: ${invoice.invoice_number}
তারিখ: ${new Date(invoice.created_at).toLocaleDateString("bn-BD")}

*ক্লায়েন্ট:* ${order.customer_name}

*পরিমাণ:* ৳${Number(invoice.amount).toLocaleString()}
*পরিশোধিত:* ৳${Number(invoice.paid_amount).toLocaleString()}
*বাকি:* ৳${(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}

*স্ট্যাটাস:* ${invoice.status === "paid" ? "✅ পরিশোধিত" : invoice.status === "partial" ? "⏳ আংশিক" : "❌ বাকি"}

ধন্যবাদ আপনার সাথে কাজ করতে পেরে! 🙏`;

    const phone = order.customer_phone.replace(/\D/g, '');
    const url = `https://wa.me/88${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const printInvoice = () => {
    window.print();
  };

  const statusConfig: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    unpaid: { bg: "bg-red-50", text: "text-red-600", icon: XCircle, label: "বাকি" },
    partial: { bg: "bg-amber-50", text: "text-amber-600", icon: Clock, label: "আংশিক" },
    paid: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle, label: "পরিশোধিত" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bengali font-bold text-gray-900">ইনভয়েস ম্যানেজমেন্ট</h2>
          <p className="text-sm text-gray-500">পেশাদার ইনভয়েস তৈরি এবং পাঠান</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 font-bengali shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন ইনভয়েস
        </Button>
      </div>

      {/* Invoice List */}
      <div className="grid gap-4">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bengali">কোনো ইনভয়েস নেই</p>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 font-bengali"
            >
              প্রথম ইনভয়েস তৈরি করুন
            </Button>
          </div>
        ) : (
          invoices.map((invoice, index) => {
            const order = orders.find(o => o.id === invoice.order_id);
            const status = statusConfig[invoice.status] || statusConfig.unpaid;
            const StatusIcon = status.icon;
            
            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${status.bg} rounded-xl flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${status.text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {invoice.invoice_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-bengali">
                        {order?.customer_name || "ক্লায়েন্ট"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(invoice.created_at).toLocaleDateString("bn-BD")}
                        </span>
                        {order?.customer_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ৳{Number(invoice.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-emerald-600">
                      পরিশোধিত: ৳{Number(invoice.paid_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPreview(invoice)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    দেখুন
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendViaWhatsApp(invoice)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                  <div className="flex-1" />
                  {invoice.status !== "paid" && (
                    <Button
                      size="sm"
                      onClick={() => updateInvoiceStatus(invoice.id, "paid", invoice.amount)}
                      className="bg-emerald-600 hover:bg-emerald-700 font-bengali"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      পরিশোধিত করুন
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">নতুন ইনভয়েস তৈরি</DialogTitle>
          </DialogHeader>
          
          {/* Invoice Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mt-2">
            <button
              onClick={() => setInvoiceType("order")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bengali font-medium transition-all ${
                invoiceType === "order" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📦 অর্ডার থেকে
            </button>
            <button
              onClick={() => setInvoiceType("custom")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bengali font-medium transition-all ${
                invoiceType === "custom" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ✏️ কাস্টম ইনভয়েস
            </button>
          </div>
          
          {invoiceType === "order" ? (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="font-bengali">অর্ডার সিলেক্ট করুন</Label>
                <Select
                  value={invoiceForm.order_id}
                  onValueChange={(val) => {
                    const order = orders.find(o => o.id === val);
                    setInvoiceForm(prev => ({
                      ...prev,
                      order_id: val,
                      amount: order ? Number(order.total_price) : 0,
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="অর্ডার সিলেক্ট করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        <span className="font-bengali">{order.customer_name}</span>
                        <span className="ml-2 text-gray-500">৳{Number(order.total_price).toLocaleString()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-bengali">পরিমাণ (৳)</Label>
                <Input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="font-bengali">পরিশোধের শেষ তারিখ (ঐচ্ছিক)</Label>
                <Input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Client Info */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">ক্লায়েন্ট তথ্য</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-bengali text-sm">নাম *</Label>
                    <Input
                      placeholder="ক্লায়েন্টের নাম"
                      value={customForm.client_name}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, client_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-bengali text-sm">ফোন *</Label>
                    <Input
                      placeholder="01XXXXXXXXX"
                      value={customForm.client_phone}
                      onChange={(e) => setCustomForm(prev => ({ ...prev, client_phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="font-bengali text-sm">ইমেইল (ঐচ্ছিক)</Label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={customForm.client_email}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, client_email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Services */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">সার্ভিস সমূহ</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addService}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    যোগ করুন
                  </Button>
                </div>
                
                {customForm.services.map((service, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">সার্ভিস #{index + 1}</span>
                      {customForm.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          ✕ মুছুন
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="সার্ভিসের নাম (যেমন: Logo Design)"
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="বিবরণ (ঐচ্ছিক)"
                        value={service.description}
                        onChange={(e) => updateService(index, "description", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="মূল্য (৳)"
                        value={service.price || ""}
                        onChange={(e) => updateService(index, "price", Number(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-bengali font-medium text-gray-700">মোট পরিমাণ</span>
                  <span className="text-xl font-bold text-gray-900">৳{getCustomTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Due Date & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-bengali text-sm">পরিশোধের শেষ তারিখ</Label>
                  <Input
                    type="date"
                    value={customForm.due_date}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, due_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="font-bengali text-sm">নোট (ঐচ্ছিক)</Label>
                  <Input
                    placeholder="অতিরিক্ত তথ্য..."
                    value={customForm.notes}
                    onChange={(e) => setCustomForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={createInvoice}
            className="w-full bg-red-600 hover:bg-red-700 font-bengali mt-4"
          >
            {invoiceType === "order" ? "ইনভয়েস তৈরি করুন" : "কাস্টম ইনভয়েস তৈরি করুন"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl bg-white print:shadow-none">
          <div className="print:p-8" id="invoice-preview">
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">W</span>
                </div>
                <div>
                  <h1 className="font-bengali font-bold text-xl text-gray-900">Web Creation BD</h1>
                  <p className="text-sm text-gray-500">Professional Digital Agency</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-gray-900 font-bengali">ইনভয়েস</h2>
                <p className="font-mono text-sm text-gray-500">{selectedInvoice?.invoice_number}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedInvoice && new Date(selectedInvoice.created_at).toLocaleDateString("bn-BD")}
                </p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">বিল প্রাপক</p>
                <p className="font-bengali font-semibold text-gray-900">{selectedOrder?.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder?.customer_phone}</p>
                {selectedOrder?.customer_email && (
                  <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">স্ট্যাটাস</p>
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedInvoice?.status === "paid" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : selectedInvoice?.status === "partial"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {selectedInvoice?.status === "paid" ? "✅ পরিশোধিত" : selectedInvoice?.status === "partial" ? "⏳ আংশিক" : "❌ বাকি"}
                </span>
              </div>
            </div>

            {/* Services */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 text-xs text-gray-400 uppercase tracking-wider font-bengali">সার্ভিস</th>
                    <th className="text-right py-3 text-xs text-gray-400 uppercase tracking-wider">মূল্য</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder?.services?.map((service: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-4">
                        <p className="font-bengali font-medium text-gray-900">{service.serviceName}</p>
                        <p className="text-sm text-gray-500">{service.packageName}</p>
                      </td>
                      <td className="py-4 text-right font-semibold text-gray-900">
                        ৳{service.price?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-bengali">মোট পরিমাণ</span>
                <span className="text-2xl font-bold text-gray-900">
                  ৳{selectedInvoice && Number(selectedInvoice.amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-bengali">পরিশোধিত</span>
                <span className="text-lg font-semibold text-emerald-600">
                  ৳{selectedInvoice && Number(selectedInvoice.paid_amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold font-bengali">বাকি</span>
                <span className="text-xl font-bold text-red-600">
                  ৳{selectedInvoice && (Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500 font-bengali">
                আপনার সাথে কাজ করতে পেরে আমরা সম্মানিত 🙏
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Web Creation BD | webcreationbd.com
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t print:hidden">
            <Button variant="outline" onClick={printInvoice} className="font-bengali">
              <Printer className="w-4 h-4 mr-2" />
              প্রিন্ট করুন
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedInvoice && sendViaWhatsApp(selectedInvoice)}
              className="text-green-600 border-green-200 hover:bg-green-50 font-bengali"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp এ পাঠান
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
