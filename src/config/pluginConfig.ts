// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "6.5.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~20KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "License Optimization + Cooldown Fix",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "⏱️", title: "Cooldown Control", description: "WordPress admin থেকে Cooldown timer নিয়ন্ত্রণ করুন" },
    { icon: "🔄", title: "Order Conversion", description: "Incomplete order কে main order এ convert করুন (WordPress + Dashboard)" },
    { icon: "🛒", title: "Cart Products Tracking", description: "Customer কি product কিনছিল সেটা দেখুন" },
    { icon: "📱", title: "Incomplete Order Tracking", description: "Phone blur, checkout error ও page exit detect করুন" },
    { icon: "🔍", title: "Smart Risk Detection", description: "5+ attempts = HIGH risk auto flag" },
  ],
  
  // All features list
  features: [
    "WooCommerce চেকআউট ইন্টিগ্রেশন",
    "সুন্দর পপআপ নোটিফিকেশন",
    "Device Fingerprinting",
    "বাংলা/English ভাষা সাপোর্ট",
    "Admin Settings প্যানেল",
    "API Key প্রি-কনফিগার্ড",
    "⏱️ Cooldown Control (WordPress)",
    "💬 Custom Block Messages",
    "📞 WhatsApp/Phone Contact",
    "🎨 Circle Logo + Branding",
    "📊 Incomplete Order Tracking",
    "🛒 Cart Products Tracking",
    "🔄 Order Conversion",
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
