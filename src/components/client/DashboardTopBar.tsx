import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  LogOut,
  User,
  ChevronDown,
  Package,
  FileText,
  MessageCircle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { Notification } from "@/hooks/useNotifications";

type TabType = "orders" | "invoices" | "chat" | "fraudguard" | "profile";

interface Profile {
  full_name?: string | null;
  avatar_url?: string | null;
}

interface DashboardTopBarProps {
  profile: Profile | null;
  userEmail?: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const tabTitles: Record<TabType, { title: string; icon: React.ElementType }> = {
  orders: { title: "অর্ডার সমূহ", icon: Package },
  invoices: { title: "ইনভয়েস", icon: FileText },
  chat: { title: "মেসেজ", icon: MessageCircle },
  fraudguard: { title: "Fraud Guard", icon: Shield },
  profile: { title: "প্রোফাইল", icon: User },
};

export function DashboardTopBar({
  profile,
  userEmail,
  activeTab,
  setActiveTab,
  onLogout,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: DashboardTopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const CurrentIcon = tabTitles[activeTab].icon;

  return (
    <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-40">
      {/* Left - Page Title */}
      <div className="flex items-center gap-3">
        <motion.div
          key={activeTab}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center"
        >
          <CurrentIcon className="w-5 h-5 text-cyan-400" />
        </motion.div>
        <div>
          <motion.h1
            key={activeTab}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-xl font-bold text-white font-bengali"
          >
            {tabTitles[activeTab].title}
          </motion.h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString("bn-BD", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden xl:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="খুঁজুন..."
            className="pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 w-64 font-bengali"
          />
        </div>

        {/* Notifications */}
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNotificationClick={(tab) => setActiveTab(tab as TabType)}
        />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden ring-2 ring-cyan-500/30">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-sm font-medium text-white font-bengali">
                {profile?.full_name || "গ্রাহক"}
              </p>
              <p className="text-xs text-slate-500">{userEmail?.split("@")[0]}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden xl:block" />
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700/50 py-2 z-50 backdrop-blur-xl"
                >
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <p className="text-sm font-medium text-white font-bengali">
                      {profile?.full_name || "গ্রাহক"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white font-bengali transition-colors"
                    >
                      <User className="w-4 h-4" />
                      প্রোফাইল সেটিংস
                    </button>
                    <Link
                      to="/"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white font-bengali transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      হোম পেজ
                    </Link>
                  </div>
                  <div className="border-t border-slate-700/50 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 font-bengali transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
