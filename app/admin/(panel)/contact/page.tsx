import Link from 'next/link';
import { loadContent } from '@/lib/site';
import { PageHead } from '../../ui';
import ContactEditor from './editor';

export const metadata = { title: 'Contact page' };

export default async function ContactAdminPage() {
  const { contact } = await loadContent();
  return <>
    <PageHead title="Contact page" description="Details shown on the Contact us page. The address is also used in the “Visit the center” section of the home page.">
      <Link className="btn ghost" href="/admin/forms?form=contact">Edit contact form</Link>
      <a className="btn ghost" href="/contact" target="_blank" rel="noreferrer">View page ↗</a>
    </PageHead>
    <ContactEditor initial={contact}/>
  </>;
}
