import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Facebook, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Phone, label: "ফোন", value: "০১৩৩২০৫২৮৭৪", href: "tel:+8801332052874", color: "from-blue-500 to-cyan-500" },
  { icon: MessageCircle, label: "WhatsApp", value: "০১৩৩২০৫২৮৭৪", href: "https://wa.me/8801332052874", color: "from-green-500 to-emerald-500" },
  { icon: Mail, label: "ইমেইল", value: "webcreationbd99@gmail.com", href: "mailto:webcreationbd99@gmail.com", color: "from-orange-500 to-amber-500" },
  { icon: Facebook, label: "Facebook", value: "@websitecreationbd", href: "https://www.facebook.com/websitecreationbd", color: "from-blue-600 to-blue-400" },
  { icon: MapPin, label: "ঠিকানা", value: "সাভার, পাকিজা", href: "#", color: "from-red-500 to-pink-500" },
  { icon: Clock, label: "সময়সূচী", value: "সকাল ১০টা - রাত ১০টা", href: "#", color: "from-purple-500 to-violet-500" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      toast({ title: "সব ফিল্ড পূরণ করুন", variant: "destructive" });
      return;
    }
    // Open WhatsApp with the message
    const text = `নাম: ${formData.name}%0Aফোন: ${formData.phone}%0Aইমেইল: ${formData.email || "N/A"}%0A%0A${formData.message}`;
    window.open(`https://wa.me/8801332052874?text=${text}`, "_blank");
    toast({ title: "WhatsApp এ পাঠানো হচ্ছে..." });
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
          >
            <Send className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold font-bengali text-white mb-4"
          >
            আমাদের সাথে <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">যোগাযোগ</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-white/60 font-bengali max-w-2xl mx-auto"
          >
            আপনার প্রজেক্ট নিয়ে আলোচনা করতে বা কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন
          </motion.p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold font-bengali text-white mb-6">
                যোগাযোগের তথ্য
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={info.label}
                      href={info.href}
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-white/40 text-xs font-bengali mb-1">{info.label}</p>
                      <p className="text-white font-medium text-sm font-bengali">{info.value}</p>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold font-bengali text-white mb-6">
                মেসেজ পাঠান
              </h2>
              
              <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 space-y-5">
                <div>
                  <label className="text-sm text-white/60 font-bengali mb-2 block">আপনার নাম *</label>
                  <Input
                    placeholder="নাম লিখুন"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 font-bengali"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 font-bengali mb-2 block">ফোন নম্বর *</label>
                  <Input
                    placeholder="০১XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 font-bengali mb-2 block">ইমেইল (ঐচ্ছিক)</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/60 font-bengali mb-2 block">আপনার মেসেজ *</label>
                  <Textarea
                    placeholder="আপনার প্রজেক্ট সম্পর্কে বিস্তারিত লিখুন..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50 font-bengali resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bengali font-semibold py-3 rounded-xl hover:shadow-xl hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp এ পাঠান
                </Button>

                <p className="text-xs text-white/30 text-center font-bengali">
                  আপনার মেসেজ WhatsApp এর মাধ্যমে পাঠানো হবে
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (optional placeholder) */}
      <section className="py-12 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29209.77!2d90.2467!3d23.8583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755ebd3eaab tried2c59%3A0x3c78dafc3e3c3c3c!2sSavar!5e0!3m2!1sbn!2sbd!4v1234567890"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="opacity-70"
              title="Web Creation BD Location"
            />
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
