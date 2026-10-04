import { loadContent } from '@/lib/site';
import { PageHead } from '../../ui';
import SeoEditor from './editor';

export const metadata = { title: 'SEO' };

export default async function SeoPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ seo, branding }, { tab }] = await Promise.all([loadContent(), searchParams]);
  return <>
    <PageHead title="SEO" description="Control how your pages appear in Google and when shared on social media. A sitemap and robots.txt are generated automatically.">
      <a className="btn ghost" href="/sitemap.xml" target="_blank" rel="noreferrer">Sitemap ↗</a><a className="btn ghost" href="/robots.txt" target="_blank" rel="noreferrer">robots.txt ↗</a>
    </PageHead>
    <SeoEditor initial={seo} branding={branding} initialTab={tab}/>
  </>;
}
