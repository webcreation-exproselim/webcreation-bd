import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { bn } from "date-fns/locale";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  { time: "10:00 AM", label: "সকাল ১০:০০" },
  { time: "11:00 AM", label: "সকাল ১১:০০" },
  { time: "12:00 PM", label: "দুপুর ১২:০০" },
  { time: "02:00 PM", label: "দুপুর ২:০০" },
  { time: "03:00 PM", label: "দুপুর ৩:০০" },
  { time: "04:00 PM", label: "বিকাল ৪:০০" },
  { time: "05:00 PM", label: "বিকাল ৫:০০" },
  { time: "06:00 PM", label: "সন্ধ্যা ৬:০০" },
  { time: "08:00 PM", label: "রাত ৮:০০" },
  { time: "09:00 PM", label: "রাত ৯:০০" },
];

export function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [step, setStep] = useState<"date" | "time" | "confirm">("date");

  const today = startOfToday();
  const maxDate = addDays(today, 30);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep("time");
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleWhatsAppMessage = () => {
    if (!selectedDate || !selectedTime) return;

    const formattedDate = format(selectedDate, "dd MMMM yyyy", { locale: bn });
    const message = encodeURIComponent(
      `🗓️ ফ্রি কনসালটেশন বুকিং\n\n` +
      `📅 তারিখ: ${formattedDate}\n` +
      `⏰ সময়: ${selectedTime}\n\n` +
      `আমি একটি ফ্রি কনসালটেশন নিতে চাই। অনুগ্রহ করে Google Meet লিংক পাঠান।`
    );

    window.open(`https://wa.me/8801332052874?text=${message}`, "_blank");
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setStep("date");
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-gray-900 via-black to-gray-900 border-yellow-400/30 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400/20 to-red-500/20 p-6 border-b border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bengali font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-yellow-400" />
              ফ্রি কনসালটেশন বুকিং
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/70 font-bengali text-sm mt-2">
            আপনার সুবিধামতো তারিখ ও সময় বেছে নিন
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {["date", "time", "confirm"].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step === s
                      ? "bg-gradient-to-r from-yellow-400 to-red-500 text-black"
                      : index < ["date", "time", "confirm"].indexOf(step)
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {index < ["date", "time", "confirm"].indexOf(step) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-1 ${
                      index < ["date", "time", "confirm"].indexOf(step)
                        ? "bg-green-500"
                        : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Date Selection */}
            {step === "date" && (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-white font-bengali font-bold mb-4 text-center">
                  📅 তারিখ সিলেক্ট করুন
                </h3>
                <div className="flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      isBefore(date, today) || date > maxDate
                    }
                    className="rounded-xl border border-white/10 bg-black/50 p-3 pointer-events-auto"
                    classNames={{
                      day_selected: "bg-gradient-to-r from-yellow-400 to-red-500 text-black hover:bg-yellow-500",
                      day_today: "bg-white/10 text-yellow-400",
                      day: "text-white hover:bg-white/10",
                      head_cell: "text-white/60",
                      caption: "text-white font-bengali",
                      nav_button: "text-white hover:bg-white/10",
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Time Selection */}
            {step === "time" && (
              <motion.div
                key="time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("date")}
                    className="text-white/70 hover:text-white"
                  >
                    ← পেছনে যান
                  </Button>
                  <span className="text-yellow-400 font-bengali text-sm">
                    {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: bn })}
                  </span>
                </div>

                <h3 className="text-white font-bengali font-bold mb-4 text-center">
                  ⏰ সময় সিলেক্ট করুন
                </h3>

                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`p-3 rounded-xl border transition-all duration-300 font-bengali text-sm ${
                        selectedTime === slot.time
                          ? "bg-gradient-to-r from-yellow-400 to-red-500 text-black border-transparent"
                          : "bg-black/50 text-white border-white/10 hover:border-yellow-400/50"
                      }`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      {slot.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Confirmation */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("time")}
                  className="text-white/70 hover:text-white mb-4"
                >
                  ← পেছনে যান
                </Button>

                <div className="bg-gradient-to-r from-yellow-400/10 to-red-500/10 rounded-2xl p-6 border border-yellow-400/30 mb-6">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-bengali font-bold text-lg mb-4">
                    আপনার বুকিং ডিটেইলস
                  </h3>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                      <Calendar className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white/60 font-bengali text-xs">তারিখ</p>
                        <p className="text-white font-bengali font-medium">
                          {selectedDate && format(selectedDate, "dd MMMM yyyy", { locale: bn })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white/60 font-bengali text-xs">সময়</p>
                        <p className="text-white font-bengali font-medium">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppMessage}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bengali font-bold py-6 text-base hover:from-green-600 hover:to-green-700 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  হোয়াটসঅ্যাপে কনফার্ম করুন
                </Button>

                <p className="text-white/50 font-bengali text-xs mt-4">
                  আমরা Google Meet লিংক পাঠিয়ে দেব
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
