export const COURIER_CHECK_PLUGIN_CONFIG = {
  version: "1.4.5",
  name: "WCBD Courier Check",
  slug: "wcbd-courier-check",
  fileName: "wcbd-courier-check.zip",
  fileSize: "~15KB",
  badgeLabel: "UPDATE",
  versionHighlight: "Auto-load বন্ধ — ম্যানুয়াল 'চেক করুন' বাটন + ৭ দিনের সেভড রেজাল্ট ক্যাশ",

  pricing: {
    monthly: 399,
    yearly: 999,
    note: "WCBD Bundle (Fraud Guard + Courier Check)",
  },
  features: [
    "📊 Courier Delivery History Check",
    "🔍 Phone Number Based Lookup",
    "📈 Success Rate Visualization",
    "🚚 সব কুরিয়ার সাপোর্ট (Pathao, Steadfast, RedX, CarryBee, Paperfly সহ সব)",
    "🏷️ Trust Label (Green/Yellow/Red)",
    "📦 WooCommerce Order List Integration",
    "💼 Single Order View Analytics",
    "🔒 Domain-locked License",
    "🇧🇩 Bangladesh Courier Support",
    "🏢 WebCreation BD Branding",
  ],
  requirements: {
    wordpress: "5.0+",
    woocommerce: "4.0+",
    php: "7.4+",
  },
} as const;

export const getCourierCheckVersionString = () => `v${COURIER_CHECK_PLUGIN_CONFIG.version}`;
