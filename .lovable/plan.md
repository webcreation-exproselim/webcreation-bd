

## Plan: Portfolio Image Cleanup + Fraud Logs Auto-Delete (15 days)

### Problem
1. **Portfolio delete** only removes the database row — the uploaded image stays in storage, wasting space
2. **Fraud logs** accumulate indefinitely — need automatic cleanup every 15 days

---

### Change 1: Clean up storage on portfolio delete

**File: `src/pages/AdminDashboard.tsx`** — Update `deletePortfolio` function

Before deleting the DB row, extract the storage path from `image_url` and delete the file from the `payment-screenshots` bucket:

```typescript
const deletePortfolio = async (id: string) => {
  // Find the item to get its image_url
  const item = portfolioItems.find(p => p.id === id);
  
  // Delete storage file if it's an uploaded image (not YouTube URL)
  if (item?.image_url?.includes('payment-screenshots')) {
    const path = item.image_url.split('/payment-screenshots/')[1];
    if (path) {
      await supabase.storage.from('payment-screenshots').remove([decodeURIComponent(path)]);
    }
  }
  
  // Delete DB row
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (!error) {
    toast({ title: "ডিলিট হয়েছে" });
    fetchPortfolio();
  }
};
```

This skips YouTube URLs (video-editing/motion-graphics categories) since those aren't stored files.

---

### Change 2: Auto-cleanup fraud logs older than 15 days

**New Edge Function: `supabase/functions/cleanup-old-data/index.ts`**

- Deletes rows from `fraud_logs` where `created_at` is older than 15 days
- Uses service role key for direct access
- Called via `pg_cron` on a daily schedule

**Database: Create cron job** (via insert tool, not migration)

- Enable `pg_cron` and `pg_net` extensions if not already
- Schedule daily cron job to invoke the edge function

---

### Summary
- 2 files changed/created
- 1 cron job configured
- Portfolio images get cleaned from storage on delete
- Fraud logs auto-purge every 15 days

