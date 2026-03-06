import { useState } from "react";
import {
  LayoutDashboard, Package, Timer, Users, Shield, FileImage,
  FileText, MessageCircle, CreditCard, Star, PenTool,
  ChevronLeft, ChevronRight, Search, Link2, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export type TabType = "overview" | "orders" | "projects" | "users" | "portfolio" | "invoices" | "messages" | "payments" | "reviews" | "content" | "fraudguard" | "couriercheck" | "clientlinks" | "integrations";

const navItems: { id: TabType; label: string; icon: typeof LayoutDashboard; color: string; iconBg: string; iconColor: string }[] = [
  { id: "overview", label: "ড্যাশবোর্ড", icon: LayoutDashboard, color: "from-blue-600 to-purple-600", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: "orders", label: "অর্ডার", icon: Package, color: "from-orange-500 to-red-500", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: "projects", label: "প্রজেক্ট টাইমার", icon: Timer, color: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { id: "users", label: "ইউজার", icon: Users, color: "from-blue-500 to-indigo-500", iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  { id: "fraudguard", label: "Fraud Guard", icon: Shield, color: "from-purple-500 to-violet-500", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { id: "couriercheck", label: "Courier Check", icon: Search, color: "from-cyan-500 to-blue-500", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { id: "portfolio", label: "পোর্টফোলিও", icon: FileImage, color: "from-pink-500 to-rose-500", iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { id: "invoices", label: "ইনভয়েস", icon: FileText, color: "from-amber-500 to-orange-500", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { id: "messages", label: "মেসেজ", icon: MessageCircle, color: "from-green-500 to-emerald-500", iconBg: "bg-green-100", iconColor: "text-green-600" },
  { id: "payments", label: "পেমেন্ট", icon: CreditCard, color: "from-cyan-500 to-teal-500", iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { id: "reviews", label: "রিভিউ", icon: Star, color: "from-yellow-500 to-amber-500", iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { id: "content", label: "CMS", icon: PenTool, color: "from-violet-500 to-purple-500", iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { id: "clientlinks", label: "ক্লায়েন্ট লিংক", icon: Link2, color: "from-teal-500 to-emerald-500", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  { id: "integrations", label: "Integrations", icon: Globe, color: "from-rose-500 to-pink-500", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
];

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-white/95 backdrop-blur-xl border-r border-gray-100 flex flex-col transition-all duration-300 relative shrink-0 shadow-sm",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 shrink-0 shadow-lg shadow-blue-500/20">
          <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">Web Creation BD</p>
            <p className="text-[10px] text-blue-500/60">Admin Panel</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item, index) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bengali transition-all duration-200 group relative",
                isActive
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active background */}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                isActive 
                  ? "bg-white/20" 
                  : `${item.iconBg}`
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : item.iconColor)} />
              </div>
              {!collapsed && (
                <span className="truncate relative z-10">{item.label}</span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-400 transition-all z-10 shadow-md"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
