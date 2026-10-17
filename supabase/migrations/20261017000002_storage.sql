-- Laud — file storage (public buckets; files live under <user id>/...).
-- work-media: covers and gallery images for portfolio work
-- avatars:    profile photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('work-media', 'work-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('avatars',    'avatars',    true, 2097152,  array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "upload own media" on storage.objects for insert to authenticated
  with check (bucket_id in ('work-media', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "replace own media" on storage.objects for update to authenticated
  using (bucket_id in ('work-media', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own media" on storage.objects for delete to authenticated
  using (bucket_id in ('work-media', 'avatars') and (storage.foldername(name))[1] = auth.uid()::text);
