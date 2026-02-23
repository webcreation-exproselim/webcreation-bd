
-- Create client_links table for storing portfolio/landing page links
CREATE TABLE public.client_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'landing-page',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_links ENABLE ROW LEVEL SECURITY;

-- Only admins can manage
CREATE POLICY "Admins can manage all client links"
ON public.client_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view (so links can be shared)
CREATE POLICY "Anyone can view client links"
ON public.client_links
FOR SELECT
USING (true);
