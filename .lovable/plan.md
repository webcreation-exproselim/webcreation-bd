
## সমস্যা

choloman.shop এর order form একটা **custom theme-built form** — WooCommerce এর default checkout না। তাই Fraud Guard plugin এর tiny "loader script" এর `wcbdCheckout()` gate এ false return হয় এবং পুরো Fraud Guard সিস্টেম (FingerprintJS, validator, popup, universal interceptor) কখনোই লোড হয় না।

প্রমাণ (live site থেকে):
- Network requests এ কোনো `wcbd` / `fingerprintjs` script নেই
- Console এ কোনো `[WCBD]` log নেই
- form এর phone input এ `name="billing_phone"`, `autocomplete="tel"`, বা `type="tel"` কিছুই নেই — শুধু placeholder `017XXXXXXXX`

## কী ঠিক করব

শুধু **loader gate** (`wcbdCheckout()` function in `src/utils/pluginGenerator.ts`, line ~163) broaden করব। এটাই একমাত্র পরিবর্তন — interceptor logic আগের turn এ ঠিক হয়েই আছে, কিন্তু loader আগেই থামিয়ে দিচ্ছে তাই সেটা চালু হচ্ছে না।

### File: `src/utils/pluginGenerator.ts`

`wcbdCheckout()` এ নতুন detection rules যোগ:
- `input[type="tel"]`
- `input[id*="phone" i]`, `input[name*="phone" i]`
- `input[id*="mobile" i]`, `input[name*="mobile" i]`
- `input[id*="contact" i]`, `input[name*="contact" i]`
- Known builder containers: `.cartflows-form-container`, `.cf-step`, `.elementor-form`, `.wpforms-form`, `.gform_wrapper`, `.fluentform`
- Heuristic fallback: যেকোনো `<form>` যার ভিতরে phone-like input আছে + একটা submit button "অর্ডার / order / checkout / buy / pay" keyword এ match করে

```js
function wcbdCheckout(){
  var selectors=[
    'form.checkout','.wc-block-checkout','.woocommerce-checkout','#payment','#order_review',
    '#billing_phone','input[name="billing_phone"]','.wc-block-components-text-input input[type="tel"]','input[autocomplete="tel"]',
    'input[type="tel"]',
    'input[id*="phone" i]','input[name*="phone" i]',
    'input[id*="mobile" i]','input[name*="mobile" i]',
    'input[id*="contact" i]','input[name*="contact" i]',
    '.cartflows-form-container','.cf-step','.elementor-form','.wpforms-form','.gform_wrapper','.fluentform'
  ];
  for(var i=0;i<selectors.length;i++){if(document.querySelector(selectors[i]))return true;}
  // Heuristic: any form with phone-like input
  var forms=document.querySelectorAll('form');
  for(var k=0;k<forms.length;k++){
    var f=forms[k];
    if(f.querySelector('input[type="tel"], [name*="phone" i], [name*="mobile" i], [id*="phone" i], [id*="mobile" i]')) return true;
  }
  return false;
}
```

### File: `src/config/pluginConfig.ts`

Version bump → `9.3.1` সাথে whatsNew এ যোগ:
- "🎯 Loader Fix: Custom theme checkout এও plugin এখন লোড হবে (choloman style sites)"

## Client কে কী করতে হবে

1. Dashboard থেকে নতুন **v9.3.1** plugin ZIP download করতে হবে
2. choloman.shop এ পুরোনো `wcbd-fraud-guard` plugin deactivate → delete → নতুনটা upload + activate
3. Settings এ গিয়ে API key ও domain যাচাই (auto pre-configured থাকবে domain-specific build হলে)
4. Order form এ একটা test phone দিয়ে verify — console এ `[WCBD v9.3.1] Checkout detected - loading Fraud Guard...` log আসবে

## কী পরিবর্তন হচ্ছে না (safety)

- বাকি running sites (vesoj.store, organiccare.com.bd ইত্যাদি WooCommerce sites) এ কোনো প্রভাব নেই — gate শুধু আরও বেশি match করছে, কম না
- License check, domain binding, blacklist, cooldown, fraud_logs — সব unchanged
- Block checkout + classic WooCommerce interceptor — unchanged
- Edge function (`check-order-eligibility`) — কোনো পরিবর্তন না
