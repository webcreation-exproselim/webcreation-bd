-- Add unique constraint for upsert functionality
ALTER TABLE public.site_content 
ADD CONSTRAINT site_content_page_section_key_unique 
UNIQUE (page, section, content_key);