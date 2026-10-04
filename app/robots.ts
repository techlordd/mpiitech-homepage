import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { siteUrl } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await getContent();
  const base = siteUrl(content) || await requestOrigin();
  if (!content.seo.allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }, sitemap: base ? `${base}/sitemap.xml` : undefined };
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `${h.get('x-forwarded-proto') ?? 'https'}://${host}` : '';
}
