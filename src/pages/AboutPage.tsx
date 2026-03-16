import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { motion } from "framer-motion";
import { 
  Target, Users, Zap, Award, Heart, Globe, 
  CheckCircle, ArrowRight, Sparkles 
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

const services = [
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
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-cyan-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-1 shadow-2xl shadow-blue-500/30"
          >
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
              <img src={logo} alt="Web Creation BD" className="w-16 h-16 object-contain" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold font-bengali text-gray-900 mb-4"
          >
            আমাদের <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">সম্পর্কে</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-600 font-bengali max-w-2xl mx-auto leading-relaxed"
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

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-gray-900 mb-6">
                আমাদের <span className="text-blue-600">যাত্রা</span>
              </h2>
              <div className="space-y-4 text-gray-600 font-bengali leading-relaxed">
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

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold font-bengali text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  আমাদের সেবাসমূহ
                </h3>
                <ul className="space-y-3">
                  {services.map((service, i) => (
                    <motion.li
                      key={service}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={fadeUp}
                      className="flex items-center gap-3 font-bengali text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      {service}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-gray-900 mb-3">
              আমাদের <span className="text-blue-600">মূল্যবোধ</span>
            </h2>
            <p className="text-gray-500 font-bengali max-w-lg mx-auto">
              যে নীতিগুলো আমাদের কাজের ভিত্তি
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold font-bengali text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 font-bengali">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-bengali text-gray-900 mb-6">
              আমাদের <span className="text-blue-600">লক্ষ্য</span>
            </h2>
            <p className="text-lg text-gray-600 font-bengali leading-relaxed max-w-2xl mx-auto mb-8">
              বাংলাদেশের প্রতিটি ব্যবসাকে ডিজিটাল প্ল্যাটফর্মে সফলভাবে প্রতিষ্ঠিত করা এবং আন্তর্জাতিক মানের 
              ডিজিটাল সেবা সাশ্রয়ী মূল্যে প্রদান করা আমাদের মূল লক্ষ্য। আমরা চাই প্রতিটি উদ্যোক্তা তার 
              ব্যবসার সম্পূর্ণ সম্ভাবনা কাজে লাগাতে পারুক।
            </p>
            <a
              href="/#contact"
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