
# Client Dashboard Real-time Fix Plan

## সমস্যা চিহ্নিতকরণ

Client dashboard এ reload ছাড়া কোন update হচ্ছে না কারণ:

1. **Supabase Realtime এবং RLS Conflict**: সব table এ RESTRICTIVE RLS policy আছে যা realtime subscription এ সমস্যা তৈরি করছে
2. **Filter format issue**: `filter: \`client_id=eq.${user.id}\`` format টা সব সময় কাজ করে না realtime এ
3. **Channel naming conflict**: একই table এর জন্য multiple channels এ naming issue হতে পারে

## সমাধান পদক্ষেপ

### ধাপ ১: Realtime Subscription সঠিকভাবে করা

`src/pages/ClientDashboard.tsx` ফাইলে পরিবর্তন:

| বর্তমান সমস্যা | সমাধান |
|----------------|---------|
| Filter format সমস্যা | Wildcard subscription + manual filter |
| Multiple useEffect | Single combined realtime hook |
| Channel naming | Unique channel IDs |

### ধাপ ২: Notifications Realtime ঠিক করা

`src/hooks/useNotifications.ts` ফাইলে:
- Channel name unique করা
- Filter ছাড়া subscribe করে client-side filter করা

### ধাপ ৩: InvoicesTab Order Data Sync

`src/components/client/InvoicesTab.tsx` ফাইলে:
- Invoice update হলে order data ও re-fetch করা

---

## Technical Details

### সমাধানের মূল পদ্ধতি

Supabase Realtime এ RLS restrictive policies থাকলে filter-based subscription সঠিকভাবে কাজ না করার সম্ভাবনা থাকে। এক্ষেত্রে:

```text
❌ সমস্যাযুক্ত পদ্ধতি:
supabase.channel('orders')
  .on('postgres_changes', { 
    event: 'INSERT',
    table: 'orders',
    filter: `user_id=eq.${userId}`  // RLS থাকলে কাজ নাও করতে পারে
  })

✅ সঠিক পদ্ধতি:
supabase.channel(`orders-${userId}`)
  .on('postgres_changes', { 
    event: '*',      // সব event শোনা
    table: 'orders'  // Filter ছাড়া
  }, (payload) => {
    // Client-side filter
    if (payload.new?.user_id === userId) {
      // Update state
    }
  })
```

### ফাইল পরিবর্তন তালিকা

| ফাইল | পরিবর্তন |
|------|---------|
| `src/pages/ClientDashboard.tsx` | Realtime subscriptions refactor |
| `src/hooks/useNotifications.ts` | Channel naming fix + better subscription |
| `src/components/client/InvoicesTab.tsx` | Add realtime listener for order updates |

### ClientDashboard.tsx পরিবর্তন

```text
// নতুন approach - সব realtime এক channel এ
useEffect(() => {
  if (!user) return;
  
  const channel = supabase.channel(`dashboard-${user.id}-${Date.now()}`)
    // Orders
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
      (payload) => {
        // RLS pass করলেই এখানে আসবে - client filter দরকার নেই
        // কারণ RLS শুধু user এর নিজের data ই পাঠায়
        handleOrderChange(payload);
      })
    // Invoices
    .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, 
      (payload) => handleInvoiceChange(payload))
    // Profile
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, 
      (payload) => handleProfileChange(payload))
    .subscribe((status) => {
      console.log('Realtime status:', status);
    });

  return () => supabase.removeChannel(channel);
}, [user?.id]);
```

### useNotifications.ts পরিবর্তন

```text
// Unique channel name + status callback
const channel = supabase
  .channel(`notifications-${userId}-${Date.now()}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, (payload) => {
    // RLS শুধু user এর notification ই পাঠাবে
    const newNotification = payload.new as Notification;
    // Sound + toast + state update
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Notifications realtime connected');
    }
  });
```

---

## কার্যক্রম সারসংক্ষেপ

1. সব realtime subscription এ filter remove করা
2. Channel name এ timestamp যোগ করা uniqueness এর জন্য
3. Subscribe callback এ status logging যোগ করা debugging এর জন্য
4. Single combined channel ব্যবহার করা
5. InvoicesTab এ orders update listener যোগ করা

এই পরিবর্তনগুলো করলে Admin থেকে যেকোনো পরিবর্তন Client dashboard এ reload ছাড়াই দেখা যাবে।
