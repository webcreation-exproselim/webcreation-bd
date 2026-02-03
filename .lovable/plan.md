
# Invoice PDF Direct Download এবং Mobile Portfolio Carousel

## সমস্যা সমূহ

### ১. Invoice PDF Download
**বর্তমান অবস্থা:**
- Download button click করলে print window খুলে এবং user কে manually "Save as PDF" করতে হয়
- Logo দেখা যাচ্ছে না কারণ `/logo.png` path দেওয়া কিন্তু public folder এ ফাইল নেই
- `company-logo.jpg` import করা আছে কিন্তু print window এ সেটা ব্যবহার হচ্ছে না

**সমাধান:**
- `html2pdf.js` library install করে সরাসরি PDF generate এবং download করব
- Logo হিসেবে imported `company-logo.jpg` ব্যবহার করব (Base64 এ convert করে embed করব)
- কোনো popup বা print dialog ছাড়াই PDF file download হয়ে যাবে

### ২. Mobile Portfolio Long Page
**বর্তমান অবস্থা:**
- সব pages এ `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` layout আছে
- Mobile এ প্রতিটা item উল্লম্বভাবে stack হয়ে page অনেক লম্বা হচ্ছে
- ৬-১০টা+ item থাকলে অনেক scroll করতে হয়

**সমাধান:**
- নতুন `MobilePortfolioCarousel` component তৈরি করব
- `embla-carousel` ব্যবহার করব (already installed)
- Mobile এ carousel দেখাব, Desktop এ grid দেখাব
- Swipe gesture, dot indicators, এবং navigation arrows যোগ করব

---

## বাস্তবায়ন পরিকল্পনা

### Phase 1: html2pdf.js Library Install এবং Invoice Fix

**ধাপ ১:** `html2pdf.js` package install করব

**ধাপ ২:** `src/components/admin/InvoiceSystem.tsx` আপডেট
- `downloadInvoiceAsPDF()` function এ html2pdf ব্যবহার করব
- Invoice HTML element থেকে সরাসরি PDF generate করব
- Logo হিসেবে imported `company-logo.jpg` embed করব
- Filename: `Invoice-{invoice_number}.pdf`

**ধাপ ৩:** `src/pages/ClientDashboard.tsx` আপডেট
- `downloadInvoice()` function এ একই html2pdf pattern ব্যবহার করব
- Client side থেকেও সরাসরি PDF download করতে পারবে

### Phase 2: Mobile Portfolio Carousel

**ধাপ ১:** নতুন `src/components/MobilePortfolioCarousel.tsx` তৈরি
- Embla Carousel ব্যবহার করব
- Props: items array, service type (modal/url), onItemClick handler
- Swipe gestures support
- Dot indicators (bottom)
- Optional navigation arrows
- Smooth animations

**ধাপ ২:** `src/components/PortfolioSection.tsx` আপডেট (Home Page)
- `useIsMobile()` hook import করব
- Mobile: `MobilePortfolioCarousel` render করব
- Desktop: বর্তমান grid layout রাখব

**ধাপ ৩:** সব Service Pages আপডেট
প্রতিটা page এ portfolio section এ:
- Mobile detection যোগ করব
- Carousel/Grid conditional rendering

আপডেট করা ফাইল:
- `src/pages/FacebookAdsPage.tsx`
- `src/pages/WebDevelopmentPage.tsx`
- `src/pages/GraphicsDesignPage.tsx`
- `src/pages/VideoEditingPage.tsx`
- `src/pages/MotionGraphicsPage.tsx`
- `src/pages/LandingPageDesignPage.tsx`

---

## ফাইল পরিবর্তনের তালিকা

| Action | File Path | Description |
|--------|-----------|-------------|
| Install | html2pdf.js | PDF generation library |
| Create | src/components/MobilePortfolioCarousel.tsx | Mobile carousel component |
| Edit | src/components/admin/InvoiceSystem.tsx | Direct PDF download |
| Edit | src/pages/ClientDashboard.tsx | Direct PDF download |
| Edit | src/components/PortfolioSection.tsx | Mobile carousel integration |
| Edit | src/pages/FacebookAdsPage.tsx | Mobile carousel integration |
| Edit | src/pages/WebDevelopmentPage.tsx | Mobile carousel integration |
| Edit | src/pages/GraphicsDesignPage.tsx | Mobile carousel integration |
| Edit | src/pages/VideoEditingPage.tsx | Mobile carousel integration |
| Edit | src/pages/MotionGraphicsPage.tsx | Mobile carousel integration |
| Edit | src/pages/LandingPageDesignPage.tsx | Mobile carousel integration |

---

## Technical Details

### html2pdf Configuration
```text
Options:
- margin: 10mm
- filename: Invoice-{number}.pdf
- image: { type: 'jpeg', quality: 0.98 }
- html2canvas: { scale: 2 }
- jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
```

### MobilePortfolioCarousel Features
```text
- Embla Carousel base
- 1 item visible at a time
- Infinite loop disabled
- Drag/swipe enabled
- Dot pagination (active: yellow, inactive: gray)
- Keyboard navigation support
- Auto-sizing to content
```

### Responsive Logic
```text
if (isMobile) {
  return <MobilePortfolioCarousel items={items} ... />
} else {
  return <div className="grid sm:grid-cols-2 lg:grid-cols-3">...</div>
}
```

---

## প্রত্যাশিত ফলাফল

### Invoice
- Download button click করলে সরাসরি PDF file download হবে
- কোনো popup বা print dialog আসবে না
- Logo সঠিকভাবে PDF তে দেখা যাবে
- File name হবে: `Invoice-INV-2025-XXXXXX.pdf`

### Portfolio Mobile
- Mobile এ সুন্দর swipeable carousel দেখাবে
- Page লম্বা হবে না
- Smooth animations এবং gestures
- Dot indicators দিয়ে কতটা item আছে বোঝা যাবে
- Desktop এ আগের মত grid layout থাকবে
