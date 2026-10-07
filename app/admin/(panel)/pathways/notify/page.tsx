import Link from 'next/link';
import { notFound } from 'next/navigation';
import { applyLink } from '@/lib/content';
import { getEmailConfig } from '@/lib/email';
import { absoluteUrl } from '@/lib/seo';
import { loadContent } from '@/lib/site';
import { programmeSubscribers } from '@/lib/subscribers';
import { PageHead } from '../../../ui';
import NoticeComposer from './composer';

export const metadata = { title: 'Notify subscribers' };

export default async function NotifyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const content = await loadContent();
  const pathway = content.pathways.find(p => p.id === id);
  if (!pathway) notFound();
  const [subs, email] = await Promise.all([programmeSubscribers(pathway.title), getEmailConfig()]);
  const ready = email.problems.filter(p => !p.includes('recipient')).length === 0;
  return <>
    <PageHead title={`Notify subscribers: ${pathway.title}`} description="Email everyone who asked to be told when this programme starts. Each person gets their own email, so nobody sees anyone else’s address.">
      <Link className="btn ghost" href="/admin/pathways">Back to pathways</Link>
      <Link className="btn ghost" href={`/admin/submissions?form=programme&q=${encodeURIComponent(pathway.title)}`}>View requests</Link>
    </PageHead>
    {!pathway.active && <div className="notice warn"><b>This programme is still “Coming soon”</b>If applications are now open, switch it to Active in Pathways first, so the website shows “Apply now” when people arrive from your email.</div>}
    {!ready && <div className="notice error"><b>Email sending is not set up</b>{email.problems.join(' ')} <Link href="/admin/email">Open email settings</Link>.</div>}
    <div className="grid4" style={{ marginBottom: 18 }}>
      <div className="stat"><span>Waiting to hear</span><b>{subs.waiting.length}</b><small>{subs.waiting.length === 1 ? 'person' : 'people'} will get this email</small></div>
      <div className="stat"><span>Already notified</span><b>{subs.notified}</b><small>won’t be emailed again</small></div>
    </div>
    <NoticeComposer pathwayId={pathway.id} programme={pathway.title} siteName={content.branding.siteName} applyLink={absoluteUrl(content, applyLink(pathway))}
      initialSubject={content.messages.programmeNotice.subject} initialBody={content.messages.programmeNotice.body}
      waiting={subs.waiting} defaultTestTo={email.recipients[0] ?? ''} ready={ready}/>
  </>;
}
