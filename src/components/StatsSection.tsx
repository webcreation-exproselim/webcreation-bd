import { motion } from "framer-motion";
import { Calendar, FolderCheck, Users, UserCheck } from "lucide-react";

const stats = [
  {
    icon: Calendar,
    value: "৪+",
    label: "বছরের অভিজ্ঞতা",
    color: "from-orange-400 to-orange-600",
  },
  {
    icon: FolderCheck,
    value: "২০০০+",
    label: "সম্পন্ন প্রজেক্ট",
    color: "from-green-400 to-emerald-500",
  },
  {
    icon: Users,
    value: "১৫০০+",
    label: "সন্তুষ্ট ক্লায়েন্ট",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: UserCheck,
    value: "৫০০+",
    label: "চলমান ক্লায়েন্ট",
    color: "from-purple-400 to-pink-500",
  },
];

export const StatsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 hex-pattern opacity-30" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bengali font-bold text-white">
            আমাদের <span className="text-gradient-brand">সাফল্যের</span> গল্প
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-bengali">
            বছরের পর বছর ক্লায়েন্টদের বিশ্বাস অর্জন করে আমরা তৈরি করেছি সাফল্যের এক অনন্য ইতিহাস
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="relative group"
            >
              {/* Card with animated border */}
              <div className="relative p-1 rounded-2xl bg-gradient-to-br from-cyan-400/50 via-transparent to-blue-500/50 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-500">
                {/* Inner card */}
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 sm:p-6 md:p-8 text-center relative overflow-hidden">
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br ${stat.color} p-3 sm:p-3.5 md:p-4 shadow-lg`}
                  >
                    <stat.icon className="w-full h-full text-white" />
                  </motion.div>

                  {/* Value */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand font-bengali mb-1 sm:mb-2">
                    {stat.value}
                  </h3>

                  {/* Label */}
                  <p className="text-xs sm:text-sm md:text-base text-white/80 font-bengali font-medium">
                    {stat.label}
                  </p>

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>

              {/* Outer glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
