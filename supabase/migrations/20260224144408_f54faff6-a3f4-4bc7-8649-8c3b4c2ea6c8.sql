
-- Create landing_page_categories table
CREATE TABLE public.landing_page_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view categories
CREATE POLICY "Anyone can view landing page categories"
ON public.landing_page_categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage landing page categories"
ON public.landing_page_categories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add sub_category column to portfolio_items
ALTER TABLE public.portfolio_items
ADD COLUMN sub_category TEXT;

-- Enable realtime for landing_page_categories
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_page_categories;
