// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "6.6.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~22KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Server-Side Validation + Block Checkout Support",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🛡️", title: "Server-Side Validation", description: "PHP level এ order block - কোনো JS bypass সম্ভব না" },
    { icon: "🧱", title: "Block Checkout Support", description: "WooCommerce Block Checkout (8.3+) পূর্ণ সাপোর্ট" },
    { icon: "⏱️", title: "Cooldown Control", description: "WordPress admin থেকে Cooldown timer নিয়ন্ত্রণ করুন" },
    { icon: "🔄", title: "Order Conversion", description: "Incomplete order কে main order এ convert করুন" },
    { icon: "📱", title: "Incomplete Order Tracking", description: "Phone blur, checkout error ও page exit detect করুন" },
  ],
  
  // All features list
  features: [
    "🛡️ Server-Side PHP Validation",
    "🧱 Block Checkout Support (WC 8.3+)",
    "WooCommerce চেকআউট ইন্টিগ্রেশন",
    "সুন্দর পপআপ নোটিফিকেশন",
    "Device Fingerprinting",
    "বাংলা/English ভাষা সাপোর্ট",
    "Admin Settings প্যানেল",
    "API Key প্রি-কনফিগার্ড",
    "⏱️ Cooldown Control (WordPress)",
    "💬 Custom Block Messages",
    "📞 WhatsApp/Phone Contact",
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
