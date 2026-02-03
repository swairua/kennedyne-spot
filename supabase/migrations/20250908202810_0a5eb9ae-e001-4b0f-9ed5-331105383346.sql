-- Create unique index on blog_posts.slug for server-side protection
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug_unique ON public.blog_posts (slug);