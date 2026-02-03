-- Add folder and ordering support to media_assets table
ALTER TABLE public.media_assets 
ADD COLUMN folder TEXT DEFAULT NULL,
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Create index for faster folder queries
CREATE INDEX idx_media_assets_folder ON public.media_assets(folder);
CREATE INDEX idx_media_assets_order ON public.media_assets(folder, order_index);

-- Add comment for documentation
COMMENT ON COLUMN public.media_assets.folder IS 'Folder/category name for organizing images. NULL represents root folder.';
COMMENT ON COLUMN public.media_assets.order_index IS 'Custom ordering index within a folder. Lower numbers appear first.';