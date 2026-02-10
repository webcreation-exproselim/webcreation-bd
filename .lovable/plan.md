

# Admin Dashboard থেকে Plugin Orders সরানো

## সমস্যা
Admin Dashboard-এ ৬টা order দেখাচ্ছে যেগুলো WordPress plugin থেকে এসেছে (user_id NULL)। এগুলো শুধু client dashboard-এর Fraud Guard section-এ থাকা উচিত।

## সমাধান

### ধাপ ১: বিদ্যমান ডেটা মুছে ফেলা
- `orders` table থেকে সব `user_id IS NULL` rows delete করা (৬টা record)

### ধাপ ২: ভবিষ্যতে আর যাতে না আসে
- `orders` table-এ একটি RLS policy বা database constraint যোগ করা যাতে `user_id` NULL হলে insert হতে না পারে
- অথবা Admin Dashboard-এর query-তে `user_id IS NOT NULL` filter যোগ করা

## Technical Details
- Database query: `DELETE FROM orders WHERE user_id IS NULL`
- Admin dashboard component-এ query filter update করা যাতে future-proof হয়
- Plugin code কোনো edit লাগবে না

