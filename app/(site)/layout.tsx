import type { Metadata } from 'next';
import '@fontsource-variable/plus-jakarta-sans';
import '../globals.css';
import Footer from '@/components/footer';
import Header from '@/components/header';
import { BodyCode, HeadCode } from '@/lib/custom-code';
import { siteMetadata } from '@/lib/seo';
import { portalPage } from '@/lib/content';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return siteMetadata(await getContent());
}

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { branding, code, contact } = await getContent();
  return <html lang="en" className={branding.stickyHeader ? 'sticky-header' : undefined}><head><HeadCode code={code.head}/></head><body>
    <BodyCode id="custom-body-start" code={code.bodyStart}/>
    <Header logoUrl={branding.logoUrl} logoAlt={branding.logoAlt} topbarText={branding.topbarText} portalUrl={process.env.NEXT_PUBLIC_PORTAL_URL} applyUrl={portalPage('/apply') ?? undefined} sticky={branding.stickyHeader}/>
    {children}
    <Footer siteName={branding.siteName} footerText={branding.footerText} address={contact.address} phone={contact.phone} email={contact.email}/>
    <BodyCode id="custom-body-end" code={code.bodyEnd}/>
  </body></html>;
}
