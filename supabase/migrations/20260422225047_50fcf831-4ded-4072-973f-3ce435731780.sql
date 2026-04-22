DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatar files can be viewed by direct path" ON storage.objects;

CREATE POLICY "Avatar files can be viewed by direct path"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND storage.filename(name) IS NOT NULL
);