-- Create blog-assets storage bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-assets',
  'blog-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for blog-assets bucket

-- Allow public read access to all images
CREATE POLICY "Public read access for blog images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-assets');

-- Allow authenticated users (editors/admins) to upload images
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blog-assets' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'blog-assets'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete blog images
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'blog-assets'
  AND auth.role() = 'authenticated'
);