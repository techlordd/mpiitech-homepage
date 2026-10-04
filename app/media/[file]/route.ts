import { store } from '@/lib/store';

export const runtime = 'nodejs';

// Serves images uploaded in the admin dashboard. File names are unique, so they can be cached forever.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.[a-z0-9]+$/i, '');
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response('Not found', { status: 404 });
  const file = await store().getFile(id).catch(() => null);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(file.data), { headers: {
    'Content-Type': file.contentType,
    'Content-Length': String(file.data.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox"
  } });
}
