export const COURIER_CHECK_PLUGIN_CONFIG = {
  version: "1.1.0",
  name: "WCBD Courier Check",
  slug: "wcbd-courier-check",
  fileName: "wcbd-courier-check.zip",
  fileSize: "~12KB",
  badgeLabel: "UPDATE",
  versionHighlight: "CSRF Fix + Improved Stability",
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
  ],
  requirements: {
    wordpress: "5.0+",
    woocommerce: "4.0+",
    php: "7.4+",
  },
} as const;

export const getCourierCheckVersionString = () => `v${COURIER_CHECK_PLUGIN_CONFIG.version}`;
