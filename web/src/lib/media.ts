import { supabase } from './supabase';

export type Bucket = 'work-media' | 'avatars';

export function publicUrl(bucket: Bucket, path: string): string {
  if (!path) return '';
  if (/^https?:\/\//.test(path) || path.startsWith('/')) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Shrinks large photos before upload so the free 1 GB storage lasts. GIFs are kept as-is. */
async function downscale(file: File, maxSide: number): Promise<Blob> {
  if (file.type === 'image/gif') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) { bitmap.close(); return file; }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
  return blob ?? file;
}

export async function uploadImage(file: File, bucket: Bucket, userId: string, maxSide = 2400): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error('Use a JPG, PNG, WebP or GIF image.');
  if (file.size > 25 * 1024 * 1024) throw new Error('That image is over 25 MB.');
  const blob = await downscale(file, maxSide);
  const ext = blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const limit = bucket === 'avatars' ? 2 * 1024 * 1024 : 10 * 1024 * 1024;
  if (blob.size > limit) throw new Error(`That image is still too large after compression (max ${limit / 1024 / 1024} MB).`);
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || file.type,
    cacheControl: '31536000',
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeFiles(bucket: Bucket, paths: string[]) {
  const own = paths.filter((p) => p && !/^https?:\/\//.test(p));
  if (own.length) await supabase.storage.from(bucket).remove(own);
}
