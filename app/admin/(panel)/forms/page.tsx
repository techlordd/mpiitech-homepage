import Link from 'next/link';
import type { FormId } from '@/lib/content';
import { getEmailConfig } from '@/lib/email';
import { loadContent } from '@/lib/site';
import { PageHead } from '../../ui';
import FormEditor from './editor';

export const metadata = { title: 'Forms' };

export default async function FormsPage({ searchParams }: { searchParams: Promise<{ form?: string }> }) {
  const id: FormId = (await searchParams).form === 'contact' ? 'contact' : 'enquiry';
  const [{ forms }, email] = await Promise.all([loadContent(), getEmailConfig()]);
  return <>
    <PageHead title="Forms" description="Change the questions, wording, options and email notifications of the website forms.">
      <Link className="btn ghost" href={`/admin/submissions?form=${id}`}>View submissions</Link>
      <a className="btn ghost" href={id === 'enquiry' ? '/#enquiry' : '/contact'} target="_blank" rel="noreferrer">Preview form ↗</a>
    </PageHead>
    <div className="tabs">
      <Link href="/admin/forms?form=enquiry" className={id === 'enquiry' ? 'active' : ''}>Center hire enquiry</Link>
      <Link href="/admin/forms?form=contact" className={id === 'contact' ? 'active' : ''}>Contact us</Link>
    </div>
    <FormEditor key={id} initial={forms[id]} defaultRecipients={email.recipients}/>
  </>;
}
