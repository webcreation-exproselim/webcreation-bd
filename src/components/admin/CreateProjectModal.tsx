import { useState, useEffect } from "react";
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

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  client_name: string;
  client_phone: string;
  order_id: string;
  invoice_id: string;
  duration_days: number;
}

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProjectFormData) => void;
  orders: Order[];
  invoices: Invoice[];
  editingProject?: {
    id: string;
    title: string;
    description: string | null;
    client_name: string;
    client_phone: string | null;
    order_id: string | null;
    invoice_id: string | null;
    duration_days: number;
  } | null;
}

export function CreateProjectModal({ open, onOpenChange, onSave, orders, invoices, editingProject }: CreateProjectModalProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: "",
    description: "",
    client_name: "",
    client_phone: "",
    order_id: "",
    invoice_id: "",
    duration_days: 7,
  });

  useEffect(() => {
    if (editingProject) {
      setForm({
        title: editingProject.title,
        description: editingProject.description || "",
        client_name: editingProject.client_name,
        client_phone: editingProject.client_phone || "",
        order_id: editingProject.order_id || "",
        invoice_id: editingProject.invoice_id || "",
        duration_days: editingProject.duration_days,
      });
    } else {
      setForm({
        title: "",
        description: "",
        client_name: "",
        client_phone: "",
        order_id: "",
        invoice_id: "",
        duration_days: 7,
      });
    }
  }, [editingProject, open]);

  const handleOrderSelect = (orderId: string) => {
    setForm(prev => ({ ...prev, order_id: orderId }));
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setForm(prev => ({
          ...prev,
          order_id: orderId,
          client_name: prev.client_name || order.customer_name,
          client_phone: prev.client_phone || order.customer_phone,
        }));
      }
    }
  };

  const handleSubmit = () => {
    if (!form.title || !form.client_name || !form.duration_days) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="font-bengali text-xl text-white">
            {editingProject ? "প্রজেক্ট এডিট করুন" : "নতুন প্রজেক্ট তৈরি করুন"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label className="font-bengali text-slate-300">প্রজেক্টের নাম *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 bg-slate-800 border-slate-700 text-white font-bengali"
              placeholder="যেমন: E-commerce ওয়েবসাইট"
            />
          </div>

          <div>
            <Label className="font-bengali text-slate-300">বিবরণ</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1 bg-slate-800 border-slate-700 text-white font-bengali"
              placeholder="প্রজেক্ট সম্পর্কে বিস্তারিত"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="font-bengali text-slate-300">ক্লায়েন্টের নাম *</Label>
              <Input
                value={form.client_name}
                onChange={(e) => setForm(prev => ({ ...prev, client_name: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-700 text-white font-bengali"
                placeholder="নাম"
              />
            </div>
            <div>
              <Label className="font-bengali text-slate-300">ফোন নম্বর</Label>
              <Input
                value={form.client_phone}
                onChange={(e) => setForm(prev => ({ ...prev, client_phone: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-700 text-white"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <Label className="font-bengali text-slate-300">সময়কাল (দিন) *</Label>
            <Input
              type="number"
              value={form.duration_days}
              onChange={(e) => setForm(prev => ({ ...prev, duration_days: parseInt(e.target.value) || 1 }))}
              className="mt-1 bg-slate-800 border-slate-700 text-white"
              min={1}
            />
          </div>

          <div>
            <Label className="font-bengali text-slate-300">অর্ডার লিংক (ঐচ্ছিক)</Label>
            <Select value={form.order_id || "none"} onValueChange={(v) => handleOrderSelect(v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="অর্ডার সিলেক্ট করুন" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none" className="text-slate-400 font-bengali">কোনো অর্ডার নেই</SelectItem>
                {orders.map((order) => (
                  <SelectItem key={order.id} value={order.id} className="text-white font-bengali">
                    {order.customer_name} - #{order.id.slice(0, 8)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-bengali text-slate-300">ইনভয়েস লিংক (ঐচ্ছিক)</Label>
            <Select value={form.invoice_id || "none"} onValueChange={(v) => setForm(prev => ({ ...prev, invoice_id: v === "none" ? "" : v }))}>
              <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="ইনভয়েস সিলেক্ট করুন" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="none" className="text-slate-400 font-bengali">কোনো ইনভয়েস নেই</SelectItem>
                {invoices.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id} className="text-white">
                    {inv.invoice_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bengali"
            disabled={!form.title || !form.client_name || !form.duration_days}
          >
            {editingProject ? "আপডেট করুন" : "প্রজেক্ট তৈরি করুন"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
