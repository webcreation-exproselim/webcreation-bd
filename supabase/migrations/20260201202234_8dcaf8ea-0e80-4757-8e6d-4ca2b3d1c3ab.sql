-- Add columns for payment proof system
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS sender_number text,
ADD COLUMN IF NOT EXISTS payment_screenshot_url text;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for uploading payment screenshots (anyone can upload)
CREATE POLICY "Anyone can upload payment screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-screenshots');

-- Create policy for viewing payment screenshots (anyone can view)
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-screenshots');