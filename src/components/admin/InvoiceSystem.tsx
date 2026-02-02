import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Plus, Download, Send, Eye, Printer, 
  CheckCircle, Clock, XCircle, Phone, Mail, 
  MessageCircle, Building2, Calendar, Globe, Trash2, Edit2
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import companyLogo from "@/assets/company-logo.jpg";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  // Edit form
  const [editForm, setEditForm] = useState({
    amount: 0,
    paid_amount: 0,
    status: "unpaid",
    due_date: "",
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

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      amount: invoice.amount,
      paid_amount: invoice.paid_amount,
      status: invoice.status,
      due_date: invoice.due_date ? invoice.due_date.split('T')[0] : "",
    });
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingInvoice) return;
    
    const { error } = await supabase
      .from("invoices")
      .update({
        amount: editForm.amount,
        paid_amount: editForm.paid_amount,
        status: editForm.status,
        due_date: editForm.due_date || null,
      })
      .eq("id", editingInvoice.id);
    
    if (!error) {
      toast({ title: "ইনভয়েস আপডেট হয়েছে" });
      setIsEditModalOpen(false);
      setEditingInvoice(null);
      onRefresh();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);
    
    if (!error) {
      toast({ title: "ইনভয়েস ডিলিট হয়েছে" });
      setDeleteConfirm(null);
      onRefresh();
    } else {
      toast({ title: "সমস্যা হয়েছে", variant: "destructive" });
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
    
    const servicesText = order.services?.map((s: any, i: number) => 
      `${i + 1}. ${s.serviceName} - ৳${s.price?.toLocaleString()}`
    ).join('\n') || '';

    const message = `🧾 *ইনভয়েস - Web Creation BD*

ইনভয়েস নং: ${invoice.invoice_number}
তারিখ: ${new Date(invoice.created_at).toLocaleDateString("bn-BD")}

*ক্লায়েন্ট:* ${order.customer_name}
*ফোন:* ${order.customer_phone}
${order.customer_email ? `*ইমেইল:* ${order.customer_email}` : ''}

*সার্ভিস সমূহ:*
${servicesText}

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
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(invoice);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    দেখুন
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendViaWhatsApp(invoice);
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(invoice);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    এডিট
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(invoice.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    ডিলিট
                  </Button>
                  <div className="flex-1" />
                  {invoice.status !== "paid" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateInvoiceStatus(invoice.id, "paid", invoice.amount);
                      }}
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

      {/* Professional Invoice Preview Modal - Compact & Responsive */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md sm:max-w-lg bg-white p-0 print:shadow-none overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="print:p-0" id="invoice-preview">
            {/* Top Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500" />
            
            <div className="p-4 sm:p-5">
              {/* Invoice Header - Compact Layout */}
              <div className="flex items-start justify-between gap-3 mb-5">
                {/* Company Info with Circular Logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-red-100 shadow-md shadow-red-500/20 flex-shrink-0">
                    <img 
                      src={companyLogo} 
                      alt="Web Creation BD" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="font-bengali font-bold text-base sm:text-lg text-gray-900 truncate">Web Creation BD</h1>
                    <p className="text-xs text-gray-400">Professional Digital Agency</p>
                  </div>
                </div>

                {/* Invoice Number Badge */}
                <div className="flex-shrink-0">
                  <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-lg shadow text-center">
                    <p className="text-[10px] uppercase tracking-wider opacity-80">ইনভয়েস</p>
                    <p className="font-mono font-bold text-xs">{selectedInvoice?.invoice_number}</p>
                  </div>
                </div>
              </div>

              {/* Client & Status - Compact Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Client Info */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    বিল প্রাপক
                  </p>
                  <p className="font-bengali font-bold text-sm text-gray-900 truncate">{selectedOrder?.customer_name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {selectedOrder?.customer_phone}
                  </p>
                  {selectedOrder?.customer_email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {selectedOrder.customer_email}
                    </p>
                  )}
                </div>

                {/* Status Card */}
                <div className={`rounded-xl p-3 border ${
                  selectedInvoice?.status === "paid" 
                    ? "bg-emerald-50 border-emerald-200" 
                    : selectedInvoice?.status === "partial"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                }`}>
                  <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 text-gray-500">স্ট্যাটাস</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedInvoice?.status === "paid" 
                      ? "bg-emerald-500 text-white" 
                      : selectedInvoice?.status === "partial"
                      ? "bg-amber-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {selectedInvoice?.status === "paid" ? (
                      <><CheckCircle className="w-3 h-3" /> পরিশোধিত</>
                    ) : selectedInvoice?.status === "partial" ? (
                      <><Clock className="w-3 h-3" /> আংশিক</>
                    ) : (
                      <><XCircle className="w-3 h-3" /> বাকি</>
                    )}
                  </div>
                  <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                    <p>তারিখ: {selectedInvoice && new Date(selectedInvoice.created_at).toLocaleDateString("bn-BD")}</p>
                    {selectedInvoice?.due_date && (
                      <p className="text-red-500">শেষ: {new Date(selectedInvoice.due_date).toLocaleDateString("bn-BD")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Services Table - Compact Design */}
              <div className="mb-4 overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider font-semibold">#</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider font-semibold font-bengali">সার্ভিস বিবরণ</th>
                      <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider font-semibold">মূল্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder?.services && selectedOrder.services.length > 0 ? (
                      selectedOrder.services.map((service: any, idx: number) => (
                        <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="py-2.5 px-3">
                            <p className="font-bengali font-semibold text-gray-900 text-sm">{service.serviceName || service.name || 'সার্ভিস'}</p>
                            <p className="text-xs text-gray-400">{service.packageName || service.description || ''}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-bold text-gray-900">৳{Number(service.price || 0).toLocaleString()}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-white">
                        <td colSpan={3} className="py-4 px-3 text-center text-gray-400 font-bengali text-xs">
                          কোনো সার্ভিস তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Section - Compact Design */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-bengali">সাবটোটাল</span>
                  <span className="font-semibold text-gray-900">
                    ৳{selectedInvoice && Number(selectedInvoice.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-bengali">পরিশোধিত</span>
                  <span className="font-semibold text-emerald-600">
                    - ৳{selectedInvoice && Number(selectedInvoice.paid_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-xl px-4">
                  <span className="text-white font-bengali font-bold">মোট বাকি</span>
                  <span className="text-white font-bold text-lg">
                    ৳{selectedInvoice && (Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Footer - Compact */}
              <div className="border-t border-dashed border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-bengali font-medium">
                      ধন্যবাদ আপনার সাথে কাজ করতে পেরে! 🙏
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">Web Creation BD</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-red-500 to-red-600" />
          </div>

          {/* Actions - Compact */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border-t print:hidden">
            <Button variant="outline" size="sm" onClick={printInvoice} className="font-bengali text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              প্রিন্ট
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedInvoice && sendViaWhatsApp(selectedInvoice)}
              className="text-green-600 border-green-200 hover:bg-green-50 font-bengali text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              WhatsApp
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={() => setIsPreviewOpen(false)}
              className="bg-red-600 hover:bg-red-700 font-bengali text-xs"
            >
              বন্ধ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="font-bengali text-xl">ইনভয়েস এডিট করুন</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label className="font-bengali">পরিমাণ (৳)</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="font-bengali">পরিশোধিত (৳)</Label>
              <Input
                type="number"
                value={editForm.paid_amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, paid_amount: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="font-bengali">স্ট্যাটাস</Label>
              <Select
                value={editForm.status}
                onValueChange={(val) => setEditForm(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid" className="font-bengali">বাকি</SelectItem>
                  <SelectItem value="partial" className="font-bengali">আংশিক</SelectItem>
                  <SelectItem value="paid" className="font-bengali">পরিশোধিত</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-bengali">পরিশোধের শেষ তারিখ</Label>
              <Input
                type="date"
                value={editForm.due_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
                className="mt-1"
              />
            </div>

            <Button
              onClick={saveEdit}
              className="w-full bg-red-600 hover:bg-red-700 font-bengali"
            >
              সেভ করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">ইনভয়েস ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই ইনভয়েসটি স্থায়ীভাবে ডিলিট হয়ে যাবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bengali">বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && deleteInvoice(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700 font-bengali"
            >
              ডিলিট করুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
