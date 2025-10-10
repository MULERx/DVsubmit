-- Setup script for DV Photos Storage Bucket
-- Run this in your Supabase SQL Editor

-- Create the storage bucket for DV photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dv-photos',
  'dv-photos',
  false, -- Private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket

-- Policy: Users can upload photos to their own folder
CREATE POLICY "Users can upload own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dv-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own photos
CREATE POLICY "Users can view own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'dv-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'dv-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'dv-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can access all photos
CREATE POLICY "Admins can access all photos" ON storage.objects
FOR ALL USING (
  bucket_id = 'dv-photos' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE supabase_id = auth.uid()::text 
    AND role IN ('ADMIN', 'SUPER_ADMIN')
  )
);

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;