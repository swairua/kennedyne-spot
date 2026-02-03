-- Add social_links JSONB column to site_settings for admin-configurable social media links
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.site_settings.social_links IS 'Array of social media links: [{name: string, href: string, type: string}]';

-- Insert default social links if not already configured
UPDATE public.site_settings
SET social_links = '[
  {"name": "Telegram Channel", "href": "https://t.me/KenneDynespot", "type": "telegram"},
  {"name": "WhatsApp Channel", "href": "https://whatsapp.com/channel/0029Vb7Ar5L3gvWZhG2xc43h", "type": "whatsapp"},
  {"name": "YouTube", "href": "https://www.youtube.com/c/KenneDynespot", "type": "youtube"},
  {"name": "Twitter", "href": "https://x.com/KenneDynespot", "type": "x"},
  {"name": "Instagram", "href": "https://www.instagram.com/kennedynespot", "type": "instagram"}
]'::jsonb
WHERE social_links IS NULL OR social_links = '[]'::jsonb;