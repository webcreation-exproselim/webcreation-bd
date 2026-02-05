-- Add RedX courier API token column to merchants table
ALTER TABLE public.merchants ADD COLUMN IF NOT EXISTS redx_api_token TEXT;