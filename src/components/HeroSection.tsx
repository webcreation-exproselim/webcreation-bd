export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-agency-green flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-agency-red rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          আপনার ব্যবসাকে
          <br />
          <span className="text-agency-red">ডিজিটাল যুগে</span> নিয়ে যান
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
          আমরা আপনার ব্যবসার জন্য পেশাদার ডিজিটাল মার্কেটিং, ওয়েব ডেভেলপমেন্ট এবং
          গ্রাফিক্স ডিজাইন সেবা প্রদান করি।
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-agency-red text-white font-semibold rounded-md hover:bg-agency-red-dark hover:scale-[1.03] transition-all duration-200"
          >
            যোগাযোগ করুন
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-md hover:bg-white/10 transition-all duration-200"
          >
            আমাদের সেবা দেখুন
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
