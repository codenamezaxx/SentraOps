-- Add image_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create public-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for product images
CREATE POLICY "Public access for product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'public-assets');

-- Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'public-assets'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update their own product images
CREATE POLICY "Authenticated users can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'public-assets'
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete their own product images
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'public-assets'
  AND auth.role() = 'authenticated'
);