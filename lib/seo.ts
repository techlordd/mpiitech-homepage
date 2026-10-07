import type { Metadata } from 'next';
import { seoVars, type SeoPageKey, type SiteContent } from './content';

export function siteUrl(c: SiteContent) {
  const candidates = [c.seo.siteUrl, process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`];
  for (const value of candidates) {
    if (!value) continue;
    try { const url = new URL(value); if (url.protocol === 'https:' || url.protocol === 'http:') return url.origin; } catch { /* try the next one */ }
  }
  return '';
}

/** A full address for links in emails, where a path such as /contact means nothing. */
export function absoluteUrl(c: SiteContent, url: string, fallbackOrigin = '') {
  const base = siteUrl(c) || fallbackOrigin;
  try { return base ? new URL(url, base).toString() : url; } catch { return url; }
}

const absolute = (base: string, url: string) => { try { return new URL(url, base || 'http://localhost').toString(); } catch { return url; } };

export function pageTitle(c: SiteContent, key: SeoPageKey) {
  return seoVars(c.seo.pages[key].title || '%%sitename%% %%sep%% %%tagline%%', c);
}

/** Site-wide metadata: icons, verification tags and the base URL. */
export function siteMetadata(c: SiteContent): Metadata {
  const base = siteUrl(c);
  const fav = c.branding.faviconUrl || '/favicon.png';
  const isDefaultIcon = fav === '/favicon.png';
  return {
    metadataBase: base ? new URL(base) : undefined,
    applicationName: c.branding.siteName,
    icons: {
      icon: isDefaultIcon ? [{ url: '/favicon.ico', sizes: '48x48' }, { url: '/favicon.png', type: 'image/png', sizes: '512x512' }] : [{ url: fav }],
      apple: isDefaultIcon ? '/apple-touch-icon.png' : fav
    },
    verification: {
      google: c.seo.googleVerification || undefined,
      other: c.seo.bingVerification ? { 'msvalidate.01': c.seo.bingVerification } : undefined
    }
  };
}

/** Per-page title, description, canonical, robots and social metadata (Yoast-style). */
export function pageMetadata(c: SiteContent, key: SeoPageKey, path: string): Metadata {
  const p = c.seo.pages[key];
  const title = pageTitle(c, key);
  const description = seoVars(p.description, c);
  const image = p.ogImageUrl || c.seo.defaultOgImageUrl || c.branding.heroImageUrl;
  const index = c.seo.allowIndexing && !p.noindex;
  const socialTitle = seoVars(p.ogTitle, c) || title;
  const socialDescription = seoVars(p.ogDescription, c) || description;
  const handle = c.seo.twitterHandle ? `@${c.seo.twitterHandle.replace(/^@/, '')}` : undefined;
  return {
    title: { absolute: title },
    description: description || undefined,
    alternates: siteUrl(c) ? { canonical: path } : undefined,
    robots: { index, follow: index },
    openGraph: { type: 'website', siteName: c.branding.siteName, title: socialTitle, description: socialDescription || undefined, url: path, images: image ? [{ url: image }] : undefined },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: socialTitle, description: socialDescription || undefined, images: image ? [image] : undefined, site: handle }
  };
}

export function organisationJsonLd(c: SiteContent) {
  const s = c.seo.schema;
  if (!s.enabled) return null;
  const base = siteUrl(c);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': s.type || 'Organization', name: s.name || c.branding.siteName,
    url: base || undefined, logo: absolute(base, c.branding.logoUrl), image: absolute(base, c.branding.heroImageUrl),
    telephone: s.telephone || undefined, email: s.email || undefined,
    address: { '@type': 'PostalAddress', streetAddress: s.streetAddress || undefined, addressLocality: s.locality || undefined, addressRegion: s.region || undefined, addressCountry: s.country || undefined },
    sameAs: s.sameAs.length ? s.sameAs : undefined
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
