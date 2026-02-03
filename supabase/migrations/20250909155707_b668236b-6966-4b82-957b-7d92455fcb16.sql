-- Remove the public read policy for site_settings table
DROP POLICY IF EXISTS "Anyone can read site_settings" ON public.site_settings;

-- Create a security definer function that returns only safe public settings
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE(
  seo_default_description text,
  seo_default_og_image text,
  seo_title_suffix text,
  robots_content text,
  sitemap_enabled boolean
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ss.seo_default_description,
    ss.seo_default_og_image, 
    ss.seo_title_suffix,
    ss.robots_content,
    ss.sitemap_enabled
  FROM public.site_settings ss
  LIMIT 1;
$$;

-- Create a separate function for analytics settings (used by components)
CREATE OR REPLACE FUNCTION public.get_analytics_settings()
RETURNS TABLE(
  ga4_id text,
  gtm_id text
)
LANGUAGE sql  
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ss.ga4_id,
    ss.gtm_id
  FROM public.site_settings ss
  LIMIT 1;
$$;

-- Create a function for contact settings
CREATE OR REPLACE FUNCTION public.get_contact_settings()
RETURNS TABLE(
  whatsapp_number text
)
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT 
    ss.whatsapp_number
  FROM public.site_settings ss
  LIMIT 1;
$$;