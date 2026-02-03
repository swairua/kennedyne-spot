-- Add columns for image optimization metadata
ALTER TABLE public.media_assets 
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS original_size INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS optimized_size INTEGER DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.media_assets.sizes IS 'JSON object containing URLs for different responsive sizes (small, medium, large, xlarge)';
COMMENT ON COLUMN public.media_assets.original_size IS 'Original file size in bytes before optimization';
COMMENT ON COLUMN public.media_assets.optimized_size IS 'Total optimized file size in bytes (including all responsive sizes)';