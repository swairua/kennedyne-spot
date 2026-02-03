-- Create enum for post status
CREATE TYPE post_status AS ENUM ('draft', 'in_review', 'scheduled', 'published', 'archived');

-- Extend blog_posts table with new columns
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status post_status DEFAULT 'draft';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reading_time_mins INTEGER DEFAULT 5;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS meta_robots TEXT DEFAULT 'index,follow';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS twitter_card TEXT DEFAULT 'summary_large_image';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'Article';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS schema_json_ld JSONB;

-- Create unique index on slug if not exists
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts(slug);

-- Create authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  twitter TEXT,
  linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create series table
CREATE TABLE IF NOT EXISTS public.series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create redirects table
CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_url TEXT NOT NULL,
  code INTEGER DEFAULT 301,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt TEXT,
  width INTEGER,
  height INTEGER,
  credit TEXT,
  used_in JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction tables
CREATE TABLE IF NOT EXISTS public.post_authors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  UNIQUE(post_id, author_id)
);

CREATE TABLE IF NOT EXISTS public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(post_id, category_id)
);

CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.post_related (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  related_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  UNIQUE(post_id, related_post_id),
  CHECK(post_id != related_post_id)
);

-- Create blog_post_versions table
CREATE TABLE IF NOT EXISTS public.blog_post_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, version_number)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  diff JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_settings table (single row config)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seo_title_suffix TEXT DEFAULT ' | KenneDyne spot',
  seo_default_description TEXT DEFAULT 'Professional forex trading education and mentorship',
  seo_default_og_image TEXT,
  robots_content TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://institutional-trader.com/sitemap.xml',
  sitemap_enabled BOOLEAN DEFAULT TRUE,
  ga4_id TEXT,
  gtm_id TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default site settings
INSERT INTO public.site_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_related ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin management
CREATE POLICY "Admins can manage authors" ON public.authors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage series" ON public.series FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage redirects" ON public.redirects FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage media_assets" ON public.media_assets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage post_authors" ON public.post_authors FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage post_categories" ON public.post_categories FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage post_tags" ON public.post_tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage post_related" ON public.post_related FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage blog_post_versions" ON public.blog_post_versions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage audit_logs" ON public.audit_logs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Admins can manage site_settings" ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create public read policies
CREATE POLICY "Anyone can read authors" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Anyone can read series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Anyone can read redirects" ON public.redirects FOR SELECT USING (true);
CREATE POLICY "Anyone can read published post associations" ON public.post_authors FOR SELECT USING (true);
CREATE POLICY "Anyone can read published post categories" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read published post tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can read published post related" ON public.post_related FOR SELECT USING (true);
CREATE POLICY "Anyone can read site_settings" ON public.site_settings FOR SELECT USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create post publishing functions
CREATE OR REPLACE FUNCTION public.publish_post(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET 
    published = true,
    status = 'published',
    published_at = COALESCE(published_at, now())
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'publish', 'blog_post', _post_id, jsonb_build_object('published', true, 'status', 'published'));
END;
$$;

CREATE OR REPLACE FUNCTION public.schedule_post(_post_id uuid, _scheduled_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET 
    status = 'scheduled',
    scheduled_at = _scheduled_at
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'schedule', 'blog_post', _post_id, jsonb_build_object('status', 'scheduled', 'scheduled_at', _scheduled_at));
END;
$$;

CREATE OR REPLACE FUNCTION public.unpublish_post(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts 
  SET 
    published = false,
    status = 'draft'
  WHERE id = _post_id;
  
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, diff)
  VALUES (auth.uid(), 'unpublish', 'blog_post', _post_id, jsonb_build_object('published', false, 'status', 'draft'));
END;
$$;

-- Seed some initial data
INSERT INTO public.authors (name, slug, bio) VALUES 
('KenneDyne spot', 'kennedyne-spot', 'Professional forex trader and educator with over 10 years of experience in institutional trading strategies.'),
('Market Analyst', 'market-analyst', 'Expert in market analysis and technical indicators for forex trading.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (name, slug, description) VALUES 
('Trading Strategies', 'trading-strategies', 'Professional trading strategies and methodologies'),
('Market Analysis', 'market-analysis', 'In-depth market analysis and insights'),
('Education', 'education', 'Educational content for traders'),
('Risk Management', 'risk-management', 'Risk management techniques and best practices')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tags (name, slug) VALUES 
('Forex', 'forex'),
('Technical Analysis', 'technical-analysis'),
('Fundamental Analysis', 'fundamental-analysis'),
('Psychology', 'psychology'),
('Beginners', 'beginners'),
('Advanced', 'advanced')
ON CONFLICT (slug) DO NOTHING;
