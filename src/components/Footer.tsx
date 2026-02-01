import { motion } from "framer-motion";
import { Phone, Mail, Facebook, MessageCircle, MapPin, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { name: "ওয়েব ডেভেলপমেন্ট", href: "/web-development" },
  { name: "গ্রাফিক্স ডিজাইন", href: "/graphics-design" },
  { name: "ভিডিও এডিটিং", href: "/video-editing" },
  { name: "মোশন গ্রাফিক্স", href: "/motion-graphics" },
  { name: "ফেসবুক অ্যাডস", href: "/facebook-ads" },
  { name: "ল্যান্ডিং পেজ", href: "/landing-page" },
];

const quickLinks = [
  { name: "হোম", href: "#" },
  { name: "সার্ভিস", href: "#services" },
  { name: "পোর্টফোলিও", href: "#portfolio" },
  { name: "প্রাইসিং", href: "#pricing" },
  { name: "যোগাযোগ", href: "#contact" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-black via-red-950/10 to-black pt-16 md:pt-24 pb-8">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 tech-grid-pattern opacity-20" />
      
      <div className="relative max-w-6xl mx-auto px-6 sm:px-8 lg:px-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                <span className="text-white font-bold text-2xl font-bengali">W</span>
              </div>
              <div>
                <h3 className="font-bengali text-xl font-bold text-white">
                  Web Creation BD
                </h3>
                <p className="font-bengali text-white/50 text-sm">
                  ডিজিটাল সাফল্যের অংশীদার
                </p>
              </div>
            </div>
            
            <p className="font-bengali text-white/60 text-sm leading-relaxed mb-6">
              আমরা বাংলাদেশের অন্যতম সেরা ডিজিটাল সার্ভিস প্রোভাইডার। 
              আপনার ব্যবসার সফলতাই আমাদের লক্ষ্য।
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/websitecreationbd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/8801332052874"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:webcreationbd99@gmail.com"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-400 transition-all duration-300"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-bengali text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent" />
              সার্ভিস সমূহ
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className="font-bengali text-white/60 text-sm hover:text-yellow-400 hover:pl-2 transition-all duration-300"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-bengali text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent" />
              দ্রুত লিংক
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="font-bengali text-white/60 text-sm hover:text-yellow-400 hover:pl-2 transition-all duration-300"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-bengali text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent" />
              যোগাযোগ
            </h4>
            
            <div className="space-y-4">
              {/* Phone/WhatsApp */}
              <a
                href="https://wa.me/8801332052874"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-bengali text-white/50 text-xs mb-1">WhatsApp / কল</p>
                  <p className="font-bengali text-white text-sm group-hover:text-green-400 transition-colors">
                    ০১৩৩২০৫২৮৭৪
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:webcreationbd99@gmail.com"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                  <Mail className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-bengali text-white/50 text-xs mb-1">ইমেইল</p>
                  <p className="font-bengali text-white text-sm group-hover:text-yellow-400 transition-colors break-all">
                    webcreationbd99@gmail.com
                  </p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/websitecreationbd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bengali text-white/50 text-xs mb-1">ফেসবুক পেজ</p>
                  <p className="font-bengali text-white text-sm group-hover:text-blue-400 transition-colors">
                    @websitecreationbd
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-bengali text-white/50 text-xs mb-1">ঠিকানা</p>
                  <p className="font-bengali text-white text-sm">
                    সাভার, পাকিজা
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="relative pt-8">
          {/* Separator */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-bengali text-white/50 text-sm text-center sm:text-left">
              © ২০২৫ Web Creation BD। সর্বস্বত্ব সংরক্ষিত।
            </p>
            
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400/20 to-red-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400 hover:bg-yellow-400/30 hover:scale-110 transition-all duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
