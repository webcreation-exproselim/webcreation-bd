// Centralized Plugin Configuration (WCBD Bundle: Fraud Guard + Courier Check)
// Update ONLY this file when releasing new plugin versions
// All components will automatically use these values

export const PLUGIN_CONFIG = {
  // Current version - UPDATE THIS WHEN RELEASING NEW VERSIONS
  version: "9.3.1",
  
  // Plugin metadata
  name: "WCBD Fraud Guard",
  slug: "wcbd-fraud-guard",
  fileName: "wcbd-fraud-guard.zip",
  fileSize: "~25KB",
  
  // Version badge styling
  badgeLabel: "STABLE",
  
  // Current version highlights (for banners and feature lists)
  versionHighlight: "Custom Theme Checkout Loader Fix",
  
  // What's new in this version (for feature list)
  whatsNew: [
    { icon: "🎯", title: "Loader Fix", description: "Custom theme checkout (choloman style) এও plugin এখন লোড হবে - phone/mobile field detect করেই active হয়" },
    { icon: "🌐", title: "Universal Checkout Support", description: "CartFlows, Elementor, WPForms, Custom Theme সব checkout এ কাজ করবে" },
    { icon: "🖱️", title: "Button Click Interception", description: "AJAX checkout এর Place Order বাটন ক্লিকেও ফ্রড চেক হবে - form submit লাগবে না" },
    { icon: "📱", title: "Smarter Phone Detection", description: "যেকোনো নামের phone field খুঁজে বের করবে (#phone, mobile, contact, tel ইত্যাদি)" },
    { icon: "🎨", title: "CheckoutGuard Style UI", description: "Clean White/Gray ডিজাইন - Details Modal সহ প্রফেশনাল Dashboard" },
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
