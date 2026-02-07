import { useState } from "react";
import {
  LayoutDashboard, Package, Timer, Users, Shield, FileImage,
  FileText, MessageCircle, CreditCard, Star, PenTool,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export type TabType = "overview" | "orders" | "projects" | "users" | "portfolio" | "invoices" | "messages" | "payments" | "reviews" | "content" | "fraudguard";

const navItems: { id: TabType; label: string; icon: typeof LayoutDashboard; color: string }[] = [
  { id: "overview", label: "ড্যাশবোর্ড", icon: LayoutDashboard, color: "from-cyan-400 to-blue-500" },
  { id: "orders", label: "অর্ডার", icon: Package, color: "from-orange-400 to-red-500" },
  { id: "projects", label: "প্রজেক্ট টাইমার", icon: Timer, color: "from-emerald-400 to-teal-500" },
  { id: "users", label: "ইউজার", icon: Users, color: "from-blue-400 to-indigo-500" },
  { id: "fraudguard", label: "Fraud Guard", icon: Shield, color: "from-purple-400 to-violet-500" },
  { id: "portfolio", label: "পোর্টফোলিও", icon: FileImage, color: "from-pink-400 to-rose-500" },
  { id: "invoices", label: "ইনভয়েস", icon: FileText, color: "from-amber-400 to-orange-500" },
  { id: "messages", label: "মেসেজ", icon: MessageCircle, color: "from-green-400 to-emerald-500" },
  { id: "payments", label: "পেমেন্ট", icon: CreditCard, color: "from-cyan-400 to-teal-500" },
  { id: "reviews", label: "রিভিউ", icon: Star, color: "from-yellow-400 to-amber-500" },
  { id: "content", label: "CMS", icon: PenTool, color: "from-violet-400 to-purple-500" },
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
        "bg-slate-900/90 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all duration-300 relative shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shrink-0 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="text-sm font-bold text-white truncate">Web Creation BD</p>
            <p className="text-[10px] text-cyan-400/60">Admin Panel</p>
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
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
              title={collapsed ? item.label : undefined}
            >
              {/* Active background glow */}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-15`}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${item.color}`} />
              )}
              
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                isActive 
                  ? `bg-gradient-to-br ${item.color} shadow-lg` 
                  : "bg-slate-800/50 group-hover:bg-slate-700/50"
              )}>
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
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
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all z-10 shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
