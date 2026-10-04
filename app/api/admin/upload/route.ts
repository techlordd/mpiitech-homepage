import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { newId, store, StorageUnavailableError } from '@/lib/store';

export const runtime = 'nodejs';

const TYPES: Record<string, string> = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg',
  'image/x-icon': 'ico', 'image/vnd.microsoft.icon': 'ico', 'image/avif': 'avif'
};
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: 'Your session has expired. Please sign in again.' }, { status: 401 });
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get('file'); } catch { return NextResponse.json({ error: 'Upload failed. The file may be too large (max 4 MB).' }, { status: 400 }); }
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a file to upload.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Upload a PNG, JPG, WebP, GIF, SVG, AVIF or ICO image.' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Images must be 4 MB or smaller.' }, { status: 413 });
  const id = newId();
  try {
    await store().putFile({ id, name: file.name.slice(0, 200), contentType: file.type, size: file.size, data: Buffer.from(await file.arrayBuffer()), createdAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof StorageUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
  return NextResponse.json({ url: `/media/${id}.${ext}` });
}
