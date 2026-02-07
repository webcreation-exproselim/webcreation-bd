export const COURIER_CHECK_PLUGIN_CONFIG = {
  version: "1.2.0",
  name: "WCBD Courier Check",
  slug: "wcbd-courier-check",
  fileName: "wcbd-courier-check.zip",
  fileSize: "~14KB",
  badgeLabel: "UPDATE",
  versionHighlight: "Branding + Embed Code Support",
  features: [
    "📊 Courier Delivery History Check",
    "🔍 Phone Number Based Lookup",
    "📈 Success Rate Visualization",
    "🚚 Courier-wise Breakdown",
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
