

# Portfolio Section এবং Landing Page Design Update Plan

## সারাংশ (Summary)
এই প্ল্যানে ৩টি প্রধান কাজ করা হবে:
1. **Motion Graphics** - এখন Web Development এর মতো নয়, Facebook Ads/Graphics Design এর মতো Modal system হবে
2. **Landing Page Design** - নতুন সার্ভিস যোগ হবে (Web Development এর মতো Live URL open হবে)
3. **সব জায়গায় যোগ করা** - Submenu, Services Section, Portfolio Section

---

## পরিবর্তনের সারণী

### Service-wise Portfolio Behavior:

| সার্ভিস | Image Click | Live Preview Button |
|---------|-------------|---------------------|
| Facebook Ads | Modal open (বড় image) | Modal open |
| Graphics Design | Modal open (বড় image) | Modal open |
| Video Editing | Modal open (বড় image) | Modal open |
| Motion Graphics | Modal open (বড় image) | Modal open |
| Web Development | No action | Live URL open |
| **Landing Page Design (নতুন)** | **No action** | **Live URL open** |

---

## Step 1: Portfolio Section Modal System

### যা তৈরি হবে:
- Fullscreen Image Preview Modal/Lightbox
- Dark overlay background
- Close button (X) এবং backdrop click এ close
- Framer Motion animation সহ smooth transition

### Logic:
```text
Modal Services (image/video বড় করে দেখাবে):
├── Facebook Ads
├── Graphics Design  
├── Video Editing
└── Motion Graphics  ← এটা এখন modal হবে

URL Services (Live URL open):
├── Web Development
└── Landing Page Design  ← নতুন
```

---

## Step 2: Landing Page Design সার্ভিস যোগ

### ফাইল: `src/components/Header.tsx`
serviceItems array তে যোগ:
- `{ label: "ল্যান্ডিং পেজ ডিজাইন", href: "#landing-page" }`

### ফাইল: `src/components/MobileDrawer.tsx`
serviceItems array তে যোগ:
- `{ label: "ল্যান্ডিং পেজ ডিজাইন", href: "#landing-page" }`

### ফাইল: `src/components/ServicesSection.tsx`
services array তে নতুন card যোগ:
```text
{
  icon: Layout,
  title: "ল্যান্ডিং পেজ ডিজাইন",
  description: "হাই-কনভার্টিং ল্যান্ডিং পেজ...",
  features: ["কনভার্সন অপটিমাইজড", "A/B টেস্টিং", "মোবাইল ফার্স্ট", "ফাস্ট লোডিং"],
  gradient: "from-teal-500 to-cyan-400"
}
```

### ফাইল: `src/components/PortfolioSection.tsx`
serviceTabs এ নতুন tab যোগ:
```text
{ id: "landing-page", label: "ল্যান্ডিং পেজ", icon: Layout, gradient: "from-teal-500 to-cyan-400" }
```

portfolioData তে নতুন data যোগ:
```text
"landing-page": [
  { id: 1, title: "ই-কমার্স ল্যান্ডিং", image: "...", liveUrl: "#" },
  { id: 2, title: "অ্যাপ ল্যান্ডিং", image: "...", liveUrl: "#" },
  ...
]
```

---

## Step 3: Grid Layout Update (Services Section)

### বর্তমান Layout:
- Top row: ৩টি সার্ভিস (lg:grid-cols-3)
- Bottom row: ২টি সার্ভিস (centered)

### নতুন Layout (৬টি সার্ভিস):
- সব ৬টি সার্ভিস একটি grid এ: `lg:grid-cols-3`
- ২টি row তে ৩টি করে card
- সুন্দর ও balanced design

---

## Technical Implementation

### Modified Files:

| ফাইল | পরিবর্তন |
|------|----------|
| `src/components/Header.tsx` | serviceItems এ Landing Page Design যোগ |
| `src/components/MobileDrawer.tsx` | serviceItems এ Landing Page Design যোগ |
| `src/components/ServicesSection.tsx` | নতুন সার্ভিস card + grid layout update |
| `src/components/PortfolioSection.tsx` | Modal system + নতুন tab + Motion Graphics behavior change |

### New State Management (PortfolioSection):
```text
- selectedItem: object | null  → কোন item select হয়েছে
- isModalOpen: boolean         → modal visibility
```

### Modal Component Design:
- shadcn/ui Dialog component ব্যবহার
- Fullscreen image view with title
- Close button উপরে ডানে
- Dark glassmorphic overlay (`bg-black/80 backdrop-blur-md`)
- Mobile responsive

---

## প্রত্যাশিত ফলাফল

1. **Facebook Ads, Graphics Design, Video Editing, Motion Graphics** → image/Live Preview ক্লিক করলে বড় করে modal এ দেখাবে

2. **Web Development, Landing Page Design** → Live Preview বাটনে ক্লিক করলে external URL open হবে

3. **Landing Page Design** সার্ভিস:
   - Header submenu তে দেখাবে
   - Mobile drawer এ দেখাবে
   - Services Section এ card দেখাবে
   - Portfolio Section এ tab দেখাবে

