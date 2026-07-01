
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Site videos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view stories" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read TTS audio" ON storage.objects;
DROP POLICY IF EXISTS "Bug screenshots are publicly readable" ON storage.objects;

CREATE POLICY "Admins can view bug screenshots"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bug-screenshots' AND has_role(auth.uid(), 'admin'::app_role));
