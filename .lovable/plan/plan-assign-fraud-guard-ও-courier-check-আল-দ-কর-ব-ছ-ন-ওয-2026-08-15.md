# Plan Assign: Fraud Guard ও Courier Check আলাদা করে বেছে নেওয়া

## এখন যা হয়
Plan Assign করলে সবসময় দুটোই একসাথে তৈরি হয় — Fraud Guard merchant এবং Courier Check subscription। শুধু একটা দেওয়ার কোনো উপায় নেই।

## যা করা হবে
Plan Assign মডালে একটা নতুন ধাপ যোগ হবে: **কোন সার্ভিস দেবেন?**

তিনটি অপশন (চেকবক্স, দুটোই ডিফল্টে টিক দেওয়া থাকবে):
- Fraud Guard
- Courier Check
- (দুটোই টিক দিলে আগের মতোই দুটোই তৈরি হবে)

নিয়ম:
- অন্তত একটা সিলেক্ট করতেই হবে, নাহলে Assign বাটন কাজ করবে না।
- শুধু Fraud Guard দিলে merchant রেকর্ড তৈরি হবে, courier subscription হবে না।
- শুধু Courier Check দিলে courier subscription তৈরি হবে, merchant হবে না।
- Domain, Store Name, Plan (Monthly/Yearly) এবং মেয়াদ আগের মতোই দুটোতেই একই ভাবে বসবে।
- সফল হলে টোস্টে দেখাবে কোন কোন সার্ভিস দেওয়া হলো।

সারাংশ বক্সেও (নীল বক্স) লেখা থাকবে কোন সার্ভিসগুলো assign হচ্ছে।

## টেকনিক্যাল
- ফাইল: `src/components/admin/AssignPlanModal.tsx`
- নতুন state: `giveFraudGuard: boolean`, `giveCourierCheck: boolean` (দুটোই ডিফল্ট `true`, মডাল খুললে রিসেট)
- `handleAssignPlan`-এ `merchants` insert শুধু `giveFraudGuard` হলে, `courier_check_subscriptions` insert শুধু `giveCourierCheck` হলে চলবে
- Assign বাটনের `disabled`-এ যোগ হবে `!giveFraudGuard && !giveCourierCheck`
- ডাটাবেস স্কিমা বা প্লাগইনে কোনো পরিবর্তন লাগবে না
