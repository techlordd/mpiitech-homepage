import { loadContent } from '@/lib/site';
import { PageHead } from '../../ui';
import BrandingEditor from './editor';

export const metadata = { title: 'Site branding' };

export default async function BrandingPage() {
  const { branding } = await loadContent();
  return <>
    <PageHead title="Site branding" description="Your site name, logo, favicon and the main image on the home page."/>
    <BrandingEditor initial={branding}/>
  </>;
}
