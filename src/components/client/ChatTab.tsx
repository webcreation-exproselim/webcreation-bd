import { motion } from "framer-motion";
import { MessageCircle, Send, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
      {/* Order List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 md:p-4 max-h-[300px] lg:max-h-[450px] overflow-y-auto shadow-sm">
        <h3 className="text-gray-900 font-bengali font-bold text-sm md:text-base mb-3">
          অর্ডার সিলেক্ট করুন
        </h3>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-xs md:text-sm font-bengali text-center py-6">
            কোন অর্ডার নেই
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className={`w-full p-2.5 md:p-3 rounded-xl text-left transition-all active:scale-[0.98] ${
                  selectedOrder?.id === order.id
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                }`}
              >
                <p className="text-gray-900 text-xs md:text-sm font-medium">
                  অর্ডার #{order.id.slice(0, 8)}
                </p>
                <p className="text-gray-500 text-[10px] md:text-xs font-bengali">
                  {getStatusText(order.status)} • {order.progress || 0}% সম্পন্ন
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 flex flex-col h-[350px] md:h-[450px] shadow-sm">
        {selectedOrder ? (
          <>
            <div className="p-3 md:p-4 border-b border-gray-100">
              <p className="text-gray-900 font-bengali font-bold text-sm md:text-base">
                অর্ডার #{selectedOrder.id.slice(0, 8)}
              </p>
              <p className="text-gray-500 text-[11px] md:text-xs font-bengali">
                {getStatusText(selectedOrder.status)}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs md:text-sm font-bengali">
                    কোন মেসেজ নেই। প্রথম মেসেজ পাঠান!
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 md:p-3 rounded-2xl ${
                        msg.is_admin
                          ? "bg-white border border-gray-100 text-gray-800"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      }`}
                    >
                      <p className="text-xs md:text-sm">{msg.content}</p>
                      <p className={`text-[10px] md:text-xs mt-1 ${msg.is_admin ? "text-gray-400" : "text-white/70"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("bn-BD")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 md:p-4 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="মেসেজ লিখুন..."
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 font-bengali rounded-xl text-sm h-10"
                  onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
                />
                <Button
                  onClick={onSendMessage}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-xl h-10 w-10 p-0"
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <MessageCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bengali text-sm md:text-base">
                চ্যাট করতে একটি অর্ডার সিলেক্ট করুন
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
