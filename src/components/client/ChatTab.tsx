import { motion } from "framer-motion";
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  status: string;
  progress: number;
}

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

interface ChatTabProps {
  orders: Order[];
  selectedOrder: Order | null;
  messages: Message[];
  newMessage: string;
  setNewMessage: (msg: string) => void;
  onSelectOrder: (order: Order) => void;
  onSendMessage: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "processing":
      return <Clock className="w-4 h-4 text-amber-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "সম্পন্ন";
    case "cancelled": return "বাতিল";
    case "processing": return "প্রসেসিং";
    default: return "পেন্ডিং";
  }
};

export function ChatTab({
  orders,
  selectedOrder,
  messages,
  newMessage,
  setNewMessage,
  onSelectOrder,
  onSendMessage,
}: ChatTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)]">
      {/* Order List - Sidebar */}
      <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 font-bengali mb-3">
            অর্ডার সিলেক্ট করুন
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="অর্ডার খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bengali"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm font-bengali">কোন অর্ডার নেই</p>
            </div>
          ) : (
            <div className="space-y-1">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    selectedOrder?.id === order.id
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bengali">
                      {getStatusText(order.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {order.progress || 0}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
        {selectedOrder ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedOrder.status)}
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    অর্ডার #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500 font-bengali">
                    {getStatusText(selectedOrder.status)} • {selectedOrder.progress || 0}% সম্পন্ন
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-bengali text-sm">
                      কোন মেসেজ নেই। প্রথম মেসেজ পাঠান!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] md:max-w-[60%] p-3 rounded-2xl ${
                        msg.is_admin
                          ? "bg-white border border-gray-200 text-gray-800 rounded-tl-md"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1.5 ${msg.is_admin ? "text-gray-400" : "text-white/70"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("bn-BD", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 font-bengali rounded-xl h-11"
                  onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
                />
                <Button
                  onClick={onSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-xl h-11 w-11 p-0 flex-shrink-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-bengali mb-2">
                চ্যাট শুরু করুন
              </h3>
              <p className="text-gray-500 font-bengali text-sm">
                বামপাশ থেকে একটি অর্ডার সিলেক্ট করে চ্যাট শুরু করুন
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
