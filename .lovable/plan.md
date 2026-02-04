
# WCBD Fraud Guard Plugin v3.0 - Enhanced Features

## সমস্যা ও সমাধান

আপনি যা চাইছেন:
1. **Plugin download কাজ করছে না** - Fix করতে হবে
2. **Timer Control** - মিনিট থেকে শুরু, WordPress settings থেকে control করা যাবে
3. **Block popup message customizable** - কি message দেখাবে সেটা পরিবর্তন করা যাবে
4. **WhatsApp ও Phone number fields** - Block হলে contact করার জন্য
5. **Fraud Protection page link** - বিস্তারিত জানতে link
6. **Developed by WebCreation BD** - Branding text
7. **Circle Logo** - Plugin-এ সুন্দর logo দেখাবে
8. **WhatsApp contact button** - সরাসরি যোগাযোগ করতে পারবে

---

## Plugin v3.0 - নতুন Features

### WordPress Admin Settings Panel (Enhanced)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo] WCBD Fraud Guard v3.0                                   │
│  Developed by WebCreation BD                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔑 API Settings                                                 │
│  ├── API Key: [___________________] [Test]                      │
│                                                                  │
│  ⚙️ General Settings                                             │
│  ├── Protection Status: [Toggle ON/OFF]                         │
│  ├── Popup Language: [Bengali/English]                          │
│                                                                  │
│  ⏱️ Timer Settings (NEW!)                                        │
│  ├── Popup Timer: [_30_] seconds (default: 30)                  │
│  │   └── 0 = No timer (manual close only)                       │
│                                                                  │
│  💬 Custom Messages (NEW!)                                       │
│  ├── Blocked Message (Cooldown):                                │
│  │   [আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে অপেক্ষা করুন।]    │
│  ├── Blocked Message (Blacklist):                               │
│  │   [আপনার অর্ডার ব্লক করা হয়েছে।]                              │
│                                                                  │
│  📞 Contact Information (NEW!)                                   │
│  ├── WhatsApp Number: [+8801332052874]                          │
│  ├── Phone Number: [+8801332052874]                             │
│  ├── Show Contact in Popup: [Toggle ON/OFF]                     │
│                                                                  │
│  [💾 Save Settings]                                              │
│                                                                  │
│  ℹ️ About                                                        │
│  ├── [Logo] Developed by WebCreation BD                         │
│  ├── [বিস্তারিত জানুন →] (Link to /fraud-guard)                 │
│  ├── [WhatsApp-এ যোগাযোগ করুন →]                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Enhanced Popup Design

Block হলে যে popup দেখাবে সেটাতে থাকবে:
- Timer countdown (যদি set করা থাকে)
- Custom message (admin settings থেকে)
- Contact buttons (WhatsApp/Phone)
- "বিস্তারিত জানুন" link
- WebCreation BD branding with logo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                    [Circle Logo]                                 │
│                  WebCreation BD                                  │
│                                                                  │
│                       ⏱️                                         │
│              অপেক্ষা করুন                                        │
│                                                                  │
│     আপনি সম্প্রতি অর্ডার করেছেন।                                 │
│     অনুগ্রহ করে অপেক্ষা করুন।                                    │
│                                                                  │
│              ⏰ 2 ঘন্টা 30 মিনিট বাকি                             │
│                                                                  │
│     ┌─────────────────────────────────────┐                     │
│     │ 📞 সমস্যা হলে যোগাযোগ করুন          │                     │
│     │                                     │                     │
│     │ [WhatsApp] [Phone Call]             │                     │
│     └─────────────────────────────────────┘                     │
│                                                                  │
│              [ঠিক আছে] (25s)                                     │
│                                                                  │
│     বিস্তারিত জানতে এখানে ক্লিক করুন →                           │
│                                                                  │
│         Powered by WebCreation BD                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Changes

### 1. Plugin Generator Update
**File:** `src/utils/pluginGenerator.ts`

নতুন features:
- Timer control (seconds)
- Custom messages for cooldown/blacklist
- WhatsApp and Phone number fields
- Show/hide contact in popup
- Circle logo with WebCreation BD branding
- "বিস্তারিত জানুন" link to /fraud-guard
- Popup auto-close timer with countdown
- Enhanced CSS for modern popup design

### 2. Logo Copy to Public Folder
**Action:** Copy `src/assets/logo.png` to `public/logo.png`

Plugin-এ logo URL হবে: `https://webcreation-bd.lovable.app/logo.png`

### 3. SetupGuide Component Update
**File:** `src/components/fraud-protection/SetupGuide.tsx`

- Download button fix verify
- Add note about new features

### 4. PluginDownload Component Update  
**File:** `src/components/fraud-protection/PluginDownload.tsx`

- Add note about v3.0 features
- List new customization options

---

## Technical Implementation

### New WordPress Options (Database)

```php
// নতুন settings যা WordPress database-এ save হবে:
'wcbd_fraud_guard_popup_timer' => 30,  // seconds (0 = no timer)
'wcbd_fraud_guard_msg_cooldown' => 'আপনি সম্প্রতি অর্ডার করেছেন...',
'wcbd_fraud_guard_msg_blacklist' => 'আপনার অর্ডার ব্লক করা হয়েছে।',
'wcbd_fraud_guard_whatsapp' => '+8801332052874',
'wcbd_fraud_guard_phone' => '+8801332052874',
'wcbd_fraud_guard_show_contact' => '1',  // 1 or 0
```

### Enhanced Popup CSS

```css
/* Circle Logo */
.fraud-popup-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.2);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  margin: 0 auto 10px;
}

/* Contact Buttons */
.fraud-popup-contact {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.fraud-popup-whatsapp {
  background: linear-gradient(135deg, #25D366, #128C7E);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  text-decoration: none;
}

.fraud-popup-phone {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  text-decoration: none;
}

/* Timer Countdown */
.fraud-popup-countdown {
  font-size: 14px;
  color: #888;
}

/* Branding */
.fraud-popup-branding {
  font-size: 12px;
  color: #666;
  margin-top: 15px;
}
```

### Enhanced Popup JavaScript

```javascript
popup: function(type, msg, mins) {
  var self = this;
  var timer = parseInt('<?php echo get_option("wcbd_fraud_guard_popup_timer", 30); ?>');
  var whatsapp = '<?php echo esc_attr(get_option("wcbd_fraud_guard_whatsapp", "")); ?>';
  var phone = '<?php echo esc_attr(get_option("wcbd_fraud_guard_phone", "")); ?>';
  var showContact = '<?php echo get_option("wcbd_fraud_guard_show_contact", "1"); ?>' === '1';
  
  var contactHtml = '';
  if (showContact && (whatsapp || phone)) {
    contactHtml = '<div class="fraud-popup-contact-box">' +
      '<p class="fraud-popup-contact-title">' + (this.lang === 'bn' ? '📞 সমস্যা হলে যোগাযোগ করুন' : '📞 Contact Us') + '</p>' +
      '<div class="fraud-popup-contact">';
    
    if (whatsapp) {
      contactHtml += '<a href="https://wa.me/' + whatsapp.replace(/\D/g,'') + '" target="_blank" class="fraud-popup-whatsapp">WhatsApp</a>';
    }
    if (phone) {
      contactHtml += '<a href="tel:' + phone + '" class="fraud-popup-phone">' + (this.lang === 'bn' ? 'ফোন করুন' : 'Call') + '</a>';
    }
    
    contactHtml += '</div></div>';
  }
  
  var timerHtml = timer > 0 ? '<span class="fraud-popup-countdown">(' + timer + 's)</span>' : '';
  
  var html = '<div class="fraud-popup-overlay" id="fraudPopup">' +
    '<div class="fraud-popup-modal">' +
    '<img src="https://webcreation-bd.lovable.app/logo.png" class="fraud-popup-logo" alt="Logo">' +
    '<div class="fraud-popup-icon ' + type + '">' + (icons[type] || '⚠️') + '</div>' +
    '<h3 class="fraud-popup-title">' + (titles[type] || 'Error') + '</h3>' +
    '<p class="fraud-popup-message">' + msg + '</p>' +
    timeDisplay +
    contactHtml +
    '<button class="fraud-popup-button" id="fraudPopupBtn">' + btnText + ' ' + timerHtml + '</button>' +
    '<a href="https://webcreation-bd.lovable.app/fraud-guard" target="_blank" class="fraud-popup-link">' + 
      (this.lang === 'bn' ? 'বিস্তারিত জানতে এখানে ক্লিক করুন →' : 'Learn more →') + 
    '</a>' +
    '<p class="fraud-popup-branding">Powered by WebCreation BD</p>' +
    '</div></div>';
  
  $('body').append(html);
  
  // Timer countdown
  if (timer > 0) {
    var countdown = timer;
    var interval = setInterval(function() {
      countdown--;
      $('#fraudPopupBtn .fraud-popup-countdown').text('(' + countdown + 's)');
      if (countdown <= 0) {
        clearInterval(interval);
        $('#fraudPopup').remove();
      }
    }, 1000);
  }
}
```

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| Timer Control | None | Configurable (0-60 seconds) |
| Custom Messages | Fixed | Editable in settings |
| Contact Info | None | WhatsApp + Phone in popup |
| Logo | None | Circle logo at top |
| Branding | None | "Powered by WebCreation BD" |
| Learn More Link | None | Link to /fraud-guard |
| Popup Auto-close | No | Yes, with countdown |

---

## Implementation Steps

1. Copy logo to public folder
2. Update pluginGenerator.ts with v3.0 code
3. Update SetupGuide.tsx to mention new features
4. Update PluginDownload.tsx to highlight v3.0
5. Test plugin download functionality
