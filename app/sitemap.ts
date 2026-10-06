import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { siteUrl } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  if (!content.seo.allowIndexing) return [];
  const base = siteUrl(content) || await requestOrigin();
  const pages = [{ key: 'home', path: '/', priority: 1 }, { key: 'hire', path: '/hire-the-center', priority: 0.8 }, { key: 'contact', path: '/contact', priority: 0.7 }] as const;
  return pages.filter(p => !content.seo.pages[p.key].noindex).map(p => ({ url: `${base}${p.path === '/' ? '' : p.path}`, changeFrequency: 'monthly', priority: p.priority }));
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `${h.get('x-forwarded-proto') ?? 'https'}://${host}` : '';
}
