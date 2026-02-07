import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  FileText,
  MessageCircle,
  Shield,
  User,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "profile";

interface Profile {
  full_name?: string | null;
  avatar_url?: string | null;
}

interface DashboardSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: Profile | null;
  userEmail?: string;
  hasActiveSubscription?: boolean;
  hasPendingOrder?: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
}

const menuItems = [
  { id: "orders" as TabType, label: "অর্ডার সমূহ", icon: Package, color: "from-cyan-400 to-blue-500" },
  { id: "invoices" as TabType, label: "ইনভয়েস", icon: FileText, color: "from-amber-400 to-orange-500" },
  { id: "chat" as TabType, label: "মেসেজ", icon: MessageCircle, color: "from-emerald-400 to-teal-500" },
  { id: "fraudguard" as TabType, label: "Fraud Guard", icon: Shield, color: "from-purple-400 to-violet-500" },
  { id: "profile" as TabType, label: "প্রোফাইল", icon: User, color: "from-pink-400 to-rose-500" },
];

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  profile,
  userEmail,
  hasActiveSubscription,
  hasPendingOrder,
  collapsed,
  setCollapsed,
  onLogout,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 sticky top-0 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 flex-shrink-0 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bengali text-sm font-bold text-white"
            >
              Web Creation BD
            </motion.span>
          )}
        </Link>
      </div>

      {/* User Info */}
      <div className={cn("p-4 border-b border-slate-700/50", collapsed ? "px-3" : "")}>
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0 flex-1">
              <p className="font-bengali text-sm font-semibold text-white truncate">
                {profile?.full_name || "গ্রাহক"}
              </p>
              <p className="text-xs text-cyan-400/60 truncate">
                {userEmail?.split("@")[0]}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isFraudGuard = item.id === "fraudguard";

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bengali transition-all duration-200 group relative",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                )}
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="clientActiveTab"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-15`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${item.color}`} />
                )}

                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all relative",
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-lg`
                      : "bg-slate-800/50 group-hover:bg-slate-700/50"
                  )}
                >
                  <Icon className={cn("w-4.5 h-4.5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                  {isFraudGuard && (hasActiveSubscription || hasPendingOrder) && (
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900",
                        hasActiveSubscription ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                  )}
                </div>
                {!collapsed && (
                  <span className="truncate relative z-10 font-medium">{item.label}</span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-lg font-bengali border border-slate-700/50">
                    {item.label}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Quick Links */}
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 pt-4 border-t border-slate-700/50">
            <p className="px-3 text-xs text-slate-500 font-bengali mb-2">দ্রুত লিংক</p>
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-bengali text-sm">হোম পেজ</span>
            </Link>
          </motion.div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-700/50">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-500 transition-all z-10 shadow-lg"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-bengali text-sm font-medium">লগআউট</span>}
        </button>
      </div>
    </aside>
  );
}
