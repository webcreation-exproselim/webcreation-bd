// Centralized Plugin Configuration
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "9.1.0",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~25KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Incomplete Order System Rebuild",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "⚡", title: "800ms Real-time Tracking", description: "ফিল্ড টাইপ করার ৮০০ms পর অটো-সেভ - আগের চেয়ে ২.৫x দ্রুত" },
    { icon: "📧", title: "Email Field Tracking", description: "Email ফিল্ডও এখন ট্র্যাক হবে - Name, Phone, Email, Address সব ক্যাপচার" },
    { icon: "🔥", title: "Hot/Warm/Cold Status", description: "সময় অনুযায়ী স্ট্যাটাস - Hot (<1hr), Warm (1-24hr), Cold (24hr+)" },
    { icon: "💬", title: "WhatsApp Cart Recovery", description: "প্রি-ফিল্ড মেসেজ সহ WhatsApp বাটন - কাস্টমারের নাম ও কার্ট ভ্যালু সহ" },
    { icon: "📞", title: "Direct Call Button", description: "এক ক্লিকে কাস্টমারকে ফোন করুন - tel: লিংক সহ" },
    { icon: "🎨", title: "Clean SaaS Dashboard", description: "সম্পূর্ণ নতুন White/Gray প্রফেশনাল ডিজাইন - WordPress ও React উভয়ে" },
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
    "🔥 Hot/Warm/Cold Status Badges",
    "💬 WhatsApp Cart Recovery Message",
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
