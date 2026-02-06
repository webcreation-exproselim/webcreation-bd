// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "8.0.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~22KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Complete Rebuild - Universal Compatibility",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🌐", title: "Universal Loader", description: "সব পেজে লোড হয়, JS নিজেই checkout detect করে - PHP detection দরকার নেই" },
    { icon: "📦", title: "Incomplete Order Tracking", description: "Phone blur, validation error, page exit - সব track হয় cart items সহ" },
    { icon: "🔑", title: "API Key Fix", description: "নতুন plugin install এ পুরোনো key আর override হবে না" },
    { icon: "🏠", title: "CartFlows Homepage Fix", description: "Homepage checkout পেজেও popup ও tracking কাজ করবে" },
    { icon: "🧹", title: "Clean Rebuild", description: "সম্পূর্ণ নতুন করে লেখা - সহজ, নির্ভরযোগ্য কোড" },
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
