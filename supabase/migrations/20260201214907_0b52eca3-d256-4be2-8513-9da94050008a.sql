-- Add live_url column for external website links (for web development and landing page portfolios)
ALTER TABLE public.portfolio_items 
ADD COLUMN live_url text;

-- Add a comment to explain the column
COMMENT ON COLUMN public.portfolio_items.live_url IS 'External URL for live preview (used for web development and landing page portfolio items)';