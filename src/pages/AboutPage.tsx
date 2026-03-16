import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { motion } from "framer-motion";
import { 
  Target, Zap, Award, Heart, Globe, 
  CheckCircle, ArrowRight, Sparkles, Users, ImageIcon
} from "lucide-react";
import logo from "@/assets/logo.png";

const stats = [
  { value: "500+", label: "সম্পন্ন প্রজেক্ট" },
  { value: "300+", label: "সন্তুষ্ট ক্লায়েন্ট" },
  { value: "5+", label: "বছরের অভিজ্ঞতা" },
  { value: "24/7", label: "সাপোর্ট" },
];

const values = [
  { icon: Target, title: "মানসম্মত সেবা", desc: "প্রতিটি প্রজেক্টে সর্বোচ্চ মান নিশ্চিত করি", color: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "দ্রুত ডেলিভারি", desc: "সময়মতো কাজ সম্পন্ন করা আমাদের অঙ্গীকার", color: "from-amber-500 to-orange-500" },
  { icon: Heart, title: "ক্লায়েন্ট সন্তুষ্টি", desc: "আপনার সন্তুষ্টিই আমাদের সাফল্য", color: "from-pink-500 to-rose-500" },
  { icon: Award, title: "বিশ্বস্ততা", desc: "বিশ্বাসযোগ্যতা ও স্বচ্ছতায় আমরা প্রতিশ্রুতিবদ্ধ", color: "from-emerald-500 to-teal-500" },
];

const servicesList = [
  "ওয়েব ডেভেলপমেন্ট ও ই-কমার্স",
  "গ্রাফিক্স ডিজাইন ও ব্র্যান্ডিং",
  "ভিডিও এডিটিং ও মোশন গ্রাফিক্স",
  "ফেসবুক ও ডিজিটাল মার্কেটিং",
  "ল্যান্ডিং পেজ ডিজাইন",
  "Fraud Guard — অর্ডার ফ্রড প্রোটেকশন",
  "Courier Check — কুরিয়ার যাচাই সিস্টেম",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-950" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-1 shadow-2xl shadow-blue-500/30"
          >
            <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Web Creation BD" className="w-16 h-16 object-contain" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold font-bengali text-white mb-4"
          >
            আমাদের <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">সম্পর্কে</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-white/60 font-bengali max-w-2xl mx-auto leading-relaxed"
          >
            Web Creation BD বাংলাদেশের একটি বিশ্বস্ত ডিজিটাল সার্ভিস প্রোভাইডার। 
            আমরা ব্যবসায়িক প্রতিষ্ঠানগুলোকে ডিজিটাল ট্রান্সফর্মেশনের মাধ্যমে সাফল্যের পথে এগিয়ে নিতে সাহায্য করি।
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-blue-100 font-bengali text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Image Placeholder + Our Story */}
      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Team Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center gap-4 overflow-hidden">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Users className="w-10 h-10 text-cyan-400" />
                </div>
                <div className="text-center">
                  <p className="text-white/50 font-bengali text-sm">আমাদের টিম</p>
                  <p className="text-white/30 text-xs font-bengali mt-1">শীঘ্রই ছবি আসছে</p>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />
            </motion.div>

            {/* Story */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-white mb-6">
                আমাদের <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">যাত্রা</span>
              </h2>
              <div className="space-y-4 text-white/60 font-bengali leading-relaxed">
                <p>
                  Web Creation BD প্রতিষ্ঠিত হয়েছে বাংলাদেশের ক্ষুদ্র ও মাঝারি ব্যবসায়ীদের ডিজিটাল সেবা প্রদানের 
                  লক্ষ্যে। আমরা বিশ্বাস করি প্রতিটি ব্যবসার ডিজিটাল উপস্থিতি থাকা উচিত এবং সেটি হওয়া উচিত মানসম্মত ও সাশ্রয়ী।
                </p>
                <p>
                  আমাদের দক্ষ টিম ওয়েব ডেভেলপমেন্ট, গ্রাফিক্স ডিজাইন, ভিডিও এডিটিং, ডিজিটাল মার্কেটিং সহ 
                  বিভিন্ন ডিজিটাল সেবা প্রদান করে থাকে। এছাড়াও আমরা নিজস্ব SaaS প্রোডাক্ট তৈরি করেছি যেমন 
                  Fraud Guard এবং Courier Check যা ই-কমার্স ব্যবসায়ীদের জন্য অত্যন্ত উপকারী।
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-gradient-to-b from-black to-slate-950">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-white mb-6">
                আমাদের <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">সেবাসমূহ</span>
              </h2>
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
                <ul className="space-y-3">
                  {servicesList.map((service, i) => (
                    <motion.li
                      key={service}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className="flex items-center gap-3 font-bengali text-white/70"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      {service}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Values */}
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-white mb-6">
                আমাদের <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">মূল্যবোধ</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((v, i) => {
                  const Icon = v.icon;
                  return (
                    <motion.div
                      key={v.title}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base font-bold font-bengali text-white mb-1">{v.title}</h3>
                      <p className="text-sm text-white/40 font-bengali">{v.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-white mb-6">
              আমাদের <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">লক্ষ্য</span>
            </h2>
            <p className="text-lg text-white/60 font-bengali leading-relaxed max-w-2xl mx-auto mb-8">
              বাংলাদেশের প্রতিটি ব্যবসাকে ডিজিটাল প্ল্যাটফর্মে সফলভাবে প্রতিষ্ঠিত করা এবং আন্তর্জাতিক মানের 
              ডিজিটাল সেবা সাশ্রয়ী মূল্যে প্রদান করা আমাদের মূল লক্ষ্য। আমরা চাই প্রতিটি উদ্যোক্তা তার 
              ব্যবসার সম্পূর্ণ সম্ভাবনা কাজে লাগাতে পারুক।
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bengali font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.03] transition-all duration-300"
            >
              যোগাযোগ করুন
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}
