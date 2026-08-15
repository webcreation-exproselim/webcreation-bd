export const COURIER_CHECK_PLUGIN_CONFIG = {
  version: "1.4.4",
  name: "WCBD Courier Check",
  slug: "wcbd-courier-check",
  fileName: "wcbd-courier-check.zip",
  fileSize: "~15KB",
  badgeLabel: "UPDATE",
  versionHighlight: "Saved Results (Order Meta Cache) — একবার লোড হলে আর বারবার লোড নেবে না",

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
