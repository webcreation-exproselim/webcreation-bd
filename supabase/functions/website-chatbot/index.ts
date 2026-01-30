import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEBSITE_INFO = `
আপনি WebCreation BD এর AI সহায়ক। আপনি বাংলায় উত্তর দেবেন।

## কোম্পানি সম্পর্কে:
- নাম: WebCreation BD
- ঠিকানা: সাভার, পাকিজা, বাংলাদেশ
- ফোন/WhatsApp: 01332052874
- ইমেইল: webcreationbd99@gmail.com
- Facebook: facebook.com/websitecreationbd

## আমাদের সেবাসমূহ:

### ১. ওয়েব ডেভেলপমেন্ট
- ব্যক্তিগত পোর্টফোলিও ওয়েবসাইট
- ই-কমার্স ওয়েবসাইট
- ব্যবসায়িক ওয়েবসাইট
- কাস্টম ওয়েব অ্যাপ্লিকেশন

### ২. গ্রাফিক্স ডিজাইন
- লোগো ডিজাইন
- ব্র্যান্ড আইডেন্টিটি
- সোশ্যাল মিডিয়া পোস্ট ডিজাইন
- বিজনেস কার্ড ও স্টেশনারি

### ৩. ল্যান্ডিং পেজ
- কনভার্সন-অপ্টিমাইজড ল্যান্ডিং পেজ
- ফানেল পেজ
- প্রোডাক্ট লঞ্চ পেজ

### ৪. ভিডিও এডিটিং
- YouTube ভিডিও এডিটিং
- সোশ্যাল মিডিয়া রিলস
- বিজ্ঞাপন ভিডিও
- ইভেন্ট ভিডিও

### ৫. মোশন গ্রাফিক্স
- অ্যানিমেটেড লোগো
- প্রোডাক্ট অ্যানিমেশন
- ইনফোগ্রাফিক অ্যানিমেশন

## প্যাকেজ মূল্য:
- স্টার্টার প্যাকেজ: ৫,০০০ টাকা থেকে
- প্রফেশনাল প্যাকেজ: ১৫,০০০ টাকা থেকে
- প্রিমিয়াম প্যাকেজ: ৩০,০০০ টাকা থেকে
- কাস্টম প্যাকেজ: প্রয়োজন অনুযায়ী

## কেন আমাদের বেছে নেবেন:
- ১৫০০+ সন্তুষ্ট ক্লায়েন্ট
- ২০০০+ প্রজেক্ট সম্পন্ন
- ১০০% সন্তুষ্টি গ্যারান্টি
- ২৪/৭ সাপোর্ট
- সময়মতো ডেলিভারি

গ্রাহকদের সাথে বন্ধুত্বপূর্ণ এবং সহায়ক আচরণ করুন। সংক্ষিপ্ত এবং স্পষ্ট উত্তর দিন।
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    console.log("Received message:", message);
    console.log("Conversation history length:", conversationHistory.length);

    const messages = [
      { role: "system", content: WEBSITE_INFO },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "অনেক বেশি রিকোয়েস্ট হয়ে গেছে। একটু পরে আবার চেষ্টা করুন।" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "সার্ভিস সাময়িকভাবে বন্ধ আছে।" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error("AI service error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "দুঃখিত, উত্তর দিতে পারছি না।";
    
    console.log("AI response:", reply.substring(0, 100));

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ error: "দুঃখিত, কিছু সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
