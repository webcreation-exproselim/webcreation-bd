import { useState } from "react";
import {
  LayoutDashboard, Package, Timer, Users, Shield, FileImage,
  FileText, MessageCircle, CreditCard, Star, PenTool,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

export type TabType = "overview" | "orders" | "projects" | "users" | "portfolio" | "invoices" | "messages" | "payments" | "reviews" | "content" | "fraudguard";

const navItems: { id: TabType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { id: "orders", label: "অর্ডার", icon: Package },
  { id: "projects", label: "প্রজেক্ট টাইমার", icon: Timer },
  { id: "users", label: "ইউজার", icon: Users },
  { id: "fraudguard", label: "Fraud Guard", icon: Shield },
  { id: "portfolio", label: "পোর্টফোলিও", icon: FileImage },
  { id: "invoices", label: "ইনভয়েস", icon: FileText },
  { id: "messages", label: "মেসেজ", icon: MessageCircle },
  { id: "payments", label: "পেমেন্ট", icon: CreditCard },
  { id: "reviews", label: "রিভিউ", icon: Star },
  { id: "content", label: "CMS", icon: PenTool },
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
        "bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col transition-all duration-300 relative shrink-0",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shrink-0">
          <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">Web Creation BD</p>
            <p className="text-[10px] text-slate-500">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bengali transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-cyan-400")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
