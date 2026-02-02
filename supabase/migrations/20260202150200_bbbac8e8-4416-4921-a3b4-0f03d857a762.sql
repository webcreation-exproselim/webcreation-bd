-- Create customer_reviews table for dynamic reviews management
CREATE TABLE public.customer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  service TEXT NOT NULL,
  review TEXT NOT NULL,
  service_gradient TEXT DEFAULT 'from-yellow-500 to-amber-400',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view active reviews
CREATE POLICY "Anyone can view active reviews"
ON public.customer_reviews
FOR SELECT
USING (is_active = true);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
ON public.customer_reviews
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for customer_reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_reviews;