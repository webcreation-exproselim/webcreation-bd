// Centralized Plugin Configuration (WCBD Bundle: Fraud Guard + Courier Check)
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "9.6.1",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~25KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Block System ON/OFF Control",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🎚️", title: "Cooldown Block ON/OFF", description: "Fraud Guard → Settings থেকে টাইমার/cooldown ব্লক সিস্টেম চালু বা বন্ধ করা যাবে" },
    { icon: "📵", title: "Phone Block ON/OFF", description: "ব্লক করা নম্বর (blacklist) ব্লক করা হবে কিনা — এক ক্লিকে ON/OFF" },
    { icon: "🛡️", title: "Front + Server Both", description: "OFF করলে popup ও আসবে না, server-side checkout block ও হবে না" },
    { icon: "📂", title: "WP Sidebar Submenu", description: "Settings, Cooldown, Incomplete Orders, IP Blocks — সব WordPress সাইডবারে আলাদা মেনু হিসেবে দেখাবে" },

    { icon: "🌐", title: "Order-এ IP দেখা যাবে", description: "WooCommerce Orders লিস্টে প্রতিটি অর্ডারের পাশে কাস্টমারের IP address দেখাবে" },
    { icon: "🚫", title: "Permanent IP Block", description: "এক ক্লিকে IP ব্লক — ব্লক হলে সে আর ওয়েবসাইটেই ঢুকতে পারবে না (403 page)" },
    { icon: "✍️", title: "Manual IP Block", description: "Fraud Guard → IP Blocks tab থেকে যেকোনো IP হাতে লিখে ব্লক/আনব্লক করা যাবে" },
    { icon: "🛒", title: "WooCommerce Checkout Fix", description: "Universal interceptor আর WC classic/block checkout এ interfere করবে না — অর্ডার আবার যাবে এবং popup ও আসবে normally" },
    { icon: "✅", title: "First Order Allowed", description: "প্রথম অর্ডারে popup দেখানোর double-check bug fix" },
    { icon: "🧪", title: "Runtime JS Verified", description: "Generated plugin JS syntax test pass করা হয়েছে—custom checkout blocker এবার load হবে" },
    { icon: "✅", title: "Live JS Syntax Fixed", description: "phone regex error fix করা হয়েছে—Fraud Guard script আর মাঝপথে stop হবে না" },
    { icon: "🔒", title: "AJAX Order Hard Block", description: "choloman.shop style custom AJAX checkout এ popup আসলে backend order request আর যাবে না" },
    { icon: "🧲", title: "Custom $.post Interceptor", description: "theme এর admin-ajax order submit সরাসরি intercept করে fraud check করবে" },
    { icon: "🛑", title: "Custom Checkout Block Fix", description: "যেকোনো React/Next/Custom checkout (choloman style) এ Place Order বাটন ব্লক হবে এবং popup আসার পর অর্ডার যাবে না" },
    { icon: "📝", title: "Universal Incomplete Tracking", description: "Custom theme এর placeholder/label থেকে phone, name, address, email detect করে Incomplete Orders এ save হবে" },
    { icon: "🔍", title: "Placeholder-Based Detection", description: "name/id না থাকলেও placeholder ('017XXXXXXXX', 'মোবাইল নাম্বার' ইত্যাদি) দেখে phone field খুঁজে বের করবে" },
    { icon: "🚫", title: "Same Device Block (Custom)", description: "Custom theme checkout এ একই device/phone থেকে cooldown এর মধ্যে ২য় অর্ডার ব্লক হবে" },
    { icon: "🌐", title: "Universal Checkout Support", description: "CartFlows, Elementor, WPForms, Custom Theme সব checkout এ কাজ করবে" },
    { icon: "🖱️", title: "Button Click Interception", description: "AJAX checkout এর Place Order বাটন ক্লিকেও ফ্রড চেক হবে - form submit লাগবে না" },
    { icon: "⚡", title: "800ms Real-time Tracking", description: "ফিল্ড টাইপ করার ৮০০ms পর অটো-সেভ" },
    { icon: "📧", title: "Email Field Tracking", description: "Name, Phone, Email, Address সব ক্যাপচার" },
  ],

  
  // All features list
  features: [
    "🌐 Universal Loader (All Pages)",
    "🛡️ Server-Side PHP Validation",
    "🧱 Block Checkout Support (WC 8.3+)",
    "🎯 JS Self-Detection (Zero Overhead)",
    "সুন্দর পপআপ নোটিফিকেশন",
    "Device Fingerprinting",
    "বাংলা/English ভাষা সাপোর্ট",
    "Admin Settings প্যানেল",
    "API Key প্রি-কনফিগার্ড",
    "⏱️ Cooldown Control (WordPress)",
    "💬 Custom Block Messages",
    "📞 WhatsApp/Phone Contact",
    "⚡ 800ms Real-time Field Tracking",
    "📧 Email Field Capture",
    "🔍 Checkout Details Modal",
    "✅ Auto-Cleanup on Thank You",
    "🇧🇩 BD Phone Validation",
    "🗑️ Manual Clean All Button",
    "🗑️ Auto-Retention Cleanup (WP-Cron)",
    "🔄 One-Click Order Conversion",
    "🔍 Smart Risk Detection",
  ],
  
  // Requirements
  requirements: {
    wordpress: "5.0+",
    woocommerce: "4.0+",
    php: "7.4+",
  },
  
  // Update notice config
  updateNotice: {
    show: true,
    message: "পুরোনো plugin থাকলে আপডেট করুন",
  },
} as const;

// Helper function to get formatted version string
export const getVersionString = () => `v${PLUGIN_CONFIG.version}`;

// Helper function to get download info text
export const getDownloadInfoText = () => 
  `${PLUGIN_CONFIG.fileName} (~${PLUGIN_CONFIG.fileSize}) • v${PLUGIN_CONFIG.version} (${PLUGIN_CONFIG.versionHighlight})`;

// Helper function to get update banner text
export const getUpdateBannerText = () => 
  `🆕 নতুন Version ${PLUGIN_CONFIG.version} আপডেট!`;
