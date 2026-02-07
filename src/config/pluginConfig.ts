// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "9.0.3",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~24KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Device + IP Tracking Fix",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🔒", title: "Device + IP Blocking", description: "একই device থেকে ভিন্ন নম্বরেও order block হবে - device fingerprint + IP সার্ভার-সাইডে track" },
    { icon: "🍪", title: "Cookie-Based Device Sync", description: "FingerprintJS device ID cookie তে সংরক্ষিত - server-side PHP ও পাঠায়" },
    { icon: "🌐", title: "IP Address Tracking", description: "সার্ভার-সাইড PHP check এ customer IP address অটোমেটিক capture হয়" },
    { icon: "📝", title: "AJAX Field Tracking", description: "Name, Phone, Address ফিল্ড টাইপ করার সাথে সাথে ক্যাপচার হয় - 2s debounce" },
    { icon: "✅", title: "Auto-Cleanup", description: "Thank You পেজে গেলে incomplete record স্বয়ংক্রিয়ভাবে মুছে যায়" },
    { icon: "🗑️", title: "Manual Clean All", description: "WordPress Admin থেকে সব incomplete records এক ক্লিকে মুছে ফেলুন" },
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
    "📝 AJAX Field Tracking (Debounced)",
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
