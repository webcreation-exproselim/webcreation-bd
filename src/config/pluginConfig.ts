// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "9.2.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~25KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "CheckoutGuard Style Dashboard",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🎨", title: "CheckoutGuard Style UI", description: "সম্পূর্ণ নতুন Clean White/Gray ডিজাইন - Details Modal সহ প্রফেশনাল Dashboard" },
    { icon: "📊", title: "Smart Stats Cards", description: "Last 24h Carts, Cart Value, Total Count - এক নজরে সব তথ্য" },
    { icon: "🔍", title: "Details Modal", description: "Customer Info, Cart Items, Checkout Info - সব ডিটেইলস এক ক্লিকে" },
    { icon: "⚡", title: "800ms Real-time Tracking", description: "ফিল্ড টাইপ করার ৮০০ms পর অটো-সেভ - আগের চেয়ে ২.৫x দ্রুত" },
    { icon: "📧", title: "Email Field Tracking", description: "Email ফিল্ডও এখন ট্র্যাক হবে - Name, Phone, Email, Address সব ক্যাপচার" },
    { icon: "❌", title: "Quick Cancel", description: "এক ক্লিকে রেকর্ড ডিলিট - টেবিল থেকে সরাসরি Cancel বাটন" },
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
