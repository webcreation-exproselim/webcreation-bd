
# Customer Review Section - Dual Sliding Carousel Plan

## সারাংশ (Summary)
একটি আকর্ষণীয় Customer Review Section তৈরি করা হবে যেখানে দুইটি আলাদা sliding row থাকবে:
1. **প্রথম Row** - Reviews ডান দিকে (right) স্লাইড করবে
2. **দ্বিতীয় Row** - Reviews বাম দিকে (left) স্লাইড করবে slowly

---

## Visual Design

```text
+------------------------------------------------------------------+
|                    আমাদের ক্লায়েন্টদের মতামত                        |
|              ১৫০০+ সন্তুষ্ট ক্লায়েন্টের বিশ্বাস                       |
+------------------------------------------------------------------+
|                                                                  |
|  ←←← [Card 1] [Card 2] [Card 3] [Card 4] [Card 5] ... →→→        |
|                    (Sliding RIGHT slowly)                        |
|                                                                  |
+------------------------------------------------------------------+
|                                                                  |
|  →→→ [Card 6] [Card 7] [Card 8] [Card 9] [Card 10] ... ←←←       |
|                    (Sliding LEFT slowly)                         |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Review Card Design

প্রতিটি Review Card এ থাকবে:
- **Customer Photo** - Avatar সহ বর্ডার গ্লো
- **Customer Name** - Bengali ফন্টে
- **Rating Stars** - ⭐⭐⭐⭐⭐ (গোল্ড কালার)
- **Service Type** - যেমন "ওয়েব ডেভেলপমেন্ট", "গ্রাফিক্স ডিজাইন"
- **Review Text** - Bengali-তে testimonial
- **Glassmorphic background** - Dark premium theme

---

## Technical Implementation

### নতুন ফাইল তৈরি হবে:
| ফাইল | বিবরণ |
|------|-------|
| `src/components/CustomerReviewSection.tsx` | Main review section component |

### CSS Animation - Infinite Sliding

Framer Motion ব্যবহার করে infinite loop animation:

```text
Row 1 (Right Direction):
- x: ["0%", "-50%"] → repeat: Infinity
- duration: 30s (slow, smooth)

Row 2 (Left Direction):  
- x: ["-50%", "0%"] → repeat: Infinity
- duration: 25s (slightly different speed for visual interest)
```

### Component Structure:

```text
CustomerReviewSection
├── Section Header
│   ├── Badge ("১৫০০+ সন্তুষ্ট ক্লায়েন্ট")
│   ├── Title ("আমাদের ক্লায়েন্টদের মতামত")
│   └── Subtitle
│
├── First Slider Row (Right Direction)
│   └── InfiniteSlider with reviews (duplicated for seamless loop)
│       └── ReviewCard × n
│
└── Second Slider Row (Left Direction)
    └── InfiniteSlider with reviews (different set, duplicated)
        └── ReviewCard × n
```

### Sample Review Data Structure:

```typescript
type Review = {
  id: number;
  name: string;           // "মোঃ রফিকুল ইসলাম"
  photo: string;          // Placeholder or real image URL
  rating: number;         // 5
  service: string;        // "ওয়েব ডেভেলপমেন্ট"
  review: string;         // "অসাধারণ সার্ভিস পেয়েছি..."
  serviceGradient: string; // "from-green-500 to-emerald-400"
}
```

---

## Review Cards Sample Data

### Row 1 (Right Sliding):
1. মোঃ রফিকুল ইসলাম - ওয়েব ডেভেলপমেন্ট
2. ফাতেমা বেগম - গ্রাফিক্স ডিজাইন
3. আহমেদ হোসেন - ল্যান্ডিং পেজ
4. সাবরিনা আক্তার - ভিডিও এডিটিং
5. মোঃ করিম উদ্দিন - মোশন গ্রাফিক্স
6. নাজমুল হক - ওয়েব ডেভেলপমেন্ট

### Row 2 (Left Sliding):
1. রাশেদা পারভীন - গ্রাফিক্স ডিজাইন
2. মোঃ আলী হোসেন - ল্যান্ডিং পেজ
3. তানিয়া সুলতানা - ওয়েব ডেভেলপমেন্ট
4. জাকির হোসেন - ভিডিও এডিটিং
5. শাহানা আক্তার - মোশন গ্রাফিক্স
6. মোঃ সোহেল রানা - গ্রাফিক্স ডিজাইন

---

## Styling Details

### Card Styling:
- Background: `bg-black/60 backdrop-blur-sm`
- Border: `border border-white/10`
- Hover: `hover:border-yellow-400/30`
- Width: `min-w-[300px] sm:min-w-[350px]`
- Border Radius: `rounded-2xl`

### Avatar Styling:
- Size: `w-14 h-14`
- Border: Gradient border (yellow to red)
- Shadow: `shadow-lg shadow-yellow-400/20`

### Rating Stars:
- Color: `text-yellow-400`
- Icon: `Star` from lucide-react (filled)

### Service Badge:
- Dynamic gradient based on service type
- Rounded pill shape: `rounded-full px-3 py-1`

---

## Animation Configuration

```typescript
// Row 1 - Sliding Right
animate: { x: [0, -totalWidth] }
transition: {
  duration: 30,
  repeat: Infinity,
  ease: "linear"
}

// Row 2 - Sliding Left  
animate: { x: [-totalWidth, 0] }
transition: {
  duration: 25,
  repeat: Infinity,
  ease: "linear"
}
```

---

## Integration

### Index.tsx এ যোগ করা হবে:

```text
<PricingSection />
<CustomerReviewSection />  ← নতুন
<section id="web-development">...
```

---

## Mobile Responsiveness

- Cards: `min-w-[280px]` on mobile, `min-w-[350px]` on desktop
- Gap between cards: `gap-4 sm:gap-6`
- Section padding: `py-16 md:py-24`
- Text sizes: Responsive with `sm:`, `md:`, `lg:` prefixes

---

## প্রত্যাশিত ফলাফল

1. সুন্দর glassmorphic review cards
2. দুইটি row - একটা ডানে স্লাইড, আরেকটা বামে স্লাইড (slowly, smoothly)
3. Infinite loop - কখনো থামবে না
4. Hover এ card glow effect
5. Premium dark theme এ মানানসই
6. Fully mobile responsive
