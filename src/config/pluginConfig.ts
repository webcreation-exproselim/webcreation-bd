// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "7.1.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~25KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Homepage Checkout + Bulletproof CartFlows Fix",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🏠", title: "Homepage Checkout Fix", description: "Homepage এ CartFlows checkout থাকলেও popup ও tracking কাজ করবে" },
    { icon: "🔍", title: "7-Level Page Detection", description: "7 স্তরে checkout page detect করে - কোনো page মিস হবে না" },
    { icon: "🛡️", title: "Footer Fallback Injection", description: "Primary detection মিস করলে wp_footer থেকে script inject হবে" },
    { icon: "🎯", title: "JS Self-Detection", description: "Checkout element না থাকলে অপ্রয়োজনীয় API call হবে না" },
    { icon: "🔧", title: "PHP check_type Fix", description: "Server-side validation এ duplicate log entry আর হবে না" },
  ],
  
  // All features list
  features: [
    "🎯 Block Checkout Popup Support",
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
