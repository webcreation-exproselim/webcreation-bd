import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, Timer, Users, Shield, FileImage,
  FileText, MessageCircle, CreditCard, Star, PenTool,
  Search, Link2, Menu, X, ChevronRight, Globe, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabType } from "@/components/admin/AdminSidebar";

const navItems: { id: TabType; label: string; icon: typeof LayoutDashboard; color: string }[] = [
  { id: "overview", label: "ড্যাশবোর্ড", icon: LayoutDashboard, color: "from-blue-600 to-purple-600" },
  { id: "orders", label: "অর্ডার", icon: Package, color: "from-orange-500 to-red-500" },
  { id: "projects", label: "প্রজেক্ট", icon: Timer, color: "from-emerald-500 to-teal-500" },
  { id: "users", label: "ইউজার", icon: Users, color: "from-blue-500 to-indigo-500" },
  { id: "fraudguard", label: "Fraud Guard", icon: Shield, color: "from-purple-500 to-violet-500" },
  { id: "couriercheck", label: "Courier Check", icon: Search, color: "from-cyan-500 to-blue-500" },
  { id: "portfolio", label: "পোর্টফোলিও", icon: FileImage, color: "from-pink-500 to-rose-500" },
  { id: "invoices", label: "ইনভয়েস", icon: FileText, color: "from-amber-500 to-orange-500" },
  { id: "messages", label: "মেসেজ", icon: MessageCircle, color: "from-green-500 to-emerald-500" },
  { id: "payments", label: "পেমেন্ট", icon: CreditCard, color: "from-cyan-500 to-teal-500" },
  { id: "reviews", label: "রিভিউ", icon: Star, color: "from-yellow-500 to-amber-500" },
  { id: "content", label: "CMS", icon: PenTool, color: "from-violet-500 to-purple-500" },
  { id: "clientlinks", label: "ক্লায়েন্ট লিংক", icon: Link2, color: "from-teal-500 to-emerald-500" },
  { id: "integrations", label: "Integrations", icon: Globe, color: "from-rose-500 to-pink-500" },
  { id: "dollartracker", label: "ডলার হিসাব", icon: DollarSign, color: "from-green-500 to-emerald-500" },
];

interface AdminMobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AdminMobileNav({ activeTab, onTabChange }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTabChange = (tab: TabType) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button - Fixed bottom right */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bengali font-bold text-gray-900">মেনু</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bengali transition-all relative",
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : "text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-gray-500")} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
