import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Package, FileText, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/hooks/useNotifications";

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const typeConfig = {
  order: { icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
  invoice: { icon: FileText, color: "text-amber-600", bg: "bg-amber-100" },
  message: { icon: MessageCircle, color: "text-green-600", bg: "bg-green-100" },
};

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "এইমাত্র";
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return `${days} দিন আগে`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-900 font-bengali">নোটিফিকেশন</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bengali"
                  >
                    <CheckCheck className="w-4 h-4" />
                    সব পড়া হয়েছে
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-bengali text-sm">কোন নোটিফিকেশন নেই</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => {
                    const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.message;
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer",
                          !notification.is_read && "bg-blue-50/50"
                        )}
                        onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                          <Icon className={cn("w-5 h-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-bengali line-clamp-1",
                              notification.is_read ? "text-gray-700" : "text-gray-900 font-semibold"
                            )}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
