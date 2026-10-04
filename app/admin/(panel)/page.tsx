import Link from 'next/link';
import { getEmailConfig } from '@/lib/email';
import { siteUrl } from '@/lib/seo';
import { loadContent } from '@/lib/site';
import { store, storageKind } from '@/lib/store';
import { PageHead } from '../ui';
import { FORM_LABELS, formatDate } from '../format';

export const metadata = { title: 'Overview' };

export default async function Overview() {
  const [content, email, counts, recent, log] = await Promise.all([
    loadContent().catch(() => null), getEmailConfig(), store().submissionCounts().catch(() => []),
    store().listSubmissions({ limit: 6 }).catch(() => ({ items: [], total: 0 })), store().listEmailLog({ limit: 1, status: 'failed' }).catch(() => ({ items: [], total: 0 }))
  ]);
  const kind = storageKind();
  const count = (form: string, status?: string) => counts.filter(c => c.form === form && (!status || c.status === status)).reduce((n, c) => n + c.count, 0);
  const pathways = content?.pathways ?? [];
  const checks = [
    { ok: kind === 'postgres', title: 'Database connected', text: kind === 'postgres' ? 'Settings and submissions are saved to Postgres.' : kind === 'file' ? 'Using local development storage (.data folder). Connect a Postgres database before deploying.' : 'No database is connected, so changes cannot be saved. Add a Neon / Vercel Postgres database (DATABASE_URL).' },
    { ok: email.problems.length === 0, title: 'Email sending configured', text: email.problems.length ? email.problems.join(' ') : `Sending from ${email.from} to ${email.recipients.join(', ')}.`, href: '/admin/email' },
    { ok: Boolean(content && siteUrl(content)), title: 'Website address set for SEO', text: content && siteUrl(content) ? `Canonical links and the sitemap use ${siteUrl(content)}.` : 'Add your domain in SEO → General so search engines get the right links.', href: '/admin/seo' },
    { ok: Boolean(content?.seo.googleVerification || content?.code.head.includes('google-site-verification')), title: 'Google Search Console verified', text: 'Paste your verification code in SEO → Verification, or add the tag in Custom code.', href: '/admin/seo?tab=verification' }
  ];
  return <>
    <PageHead title="Overview" description="Everything on the MPIITECH website at a glance."><a className="btn ghost" href="/" target="_blank" rel="noreferrer">View website ↗</a></PageHead>
    <div className="grid4" style={{ marginBottom: 18 }}>
      <Link className="stat" href="/admin/submissions?form=enquiry"><span>Center hire enquiries</span><b>{count('enquiry', 'new')}</b><small>new · {count('enquiry')} total</small></Link>
      <Link className="stat" href="/admin/submissions?form=contact"><span>Contact messages</span><b>{count('contact', 'new')}</b><small>new · {count('contact')} total</small></Link>
      <Link className="stat" href="/admin/submissions?form=programme"><span>Programme interest</span><b>{count('programme')}</b><small>notification requests</small></Link>
      <Link className="stat" href="/admin/submissions?form=newsletter"><span>Newsletter</span><b>{count('newsletter')}</b><small>subscription requests</small></Link>
    </div>
    {log.total > 0 && <div className="notice warn"><b>Some emails failed to send</b>{log.total} failed email{log.total === 1 ? '' : 's'} in the delivery log. <Link href="/admin/email?status=failed">Review the log</Link>.</div>}
    <div className="grid2">
      <div className="card">
        <div className="card-head"><h2>Recent submissions</h2><Link className="btn ghost sm" href="/admin/submissions">View all</Link></div>
        {recent.items.length ? <ul className="check-list">{recent.items.map(s => <li key={s.id}>
          <span className={`badge ${s.status === 'new' ? 'orange' : ''}`}>{FORM_LABELS[s.form] ?? s.form}</span>
          <div style={{ minWidth: 0 }}><Link href={`/admin/submissions?form=${s.form}&open=${s.id}`}><b>{s.name || s.email}</b></Link><div className="small muted">{s.summary || s.email} · {formatDate(s.createdAt)}</div></div>
        </li>)}</ul> : <p>No submissions yet. They will appear here as visitors use the website forms.</p>}
      </div>
      <div className="card">
        <h2>Setup checklist</h2>
        <ul className="check-list">{checks.map(c => <li key={c.title}><span className={`dot ${c.ok ? 'good' : 'bad'}`}>{c.ok ? '✓' : '!'}</span><div><b>{c.href && !c.ok ? <Link href={c.href}>{c.title}</Link> : c.title}</b><div className="small muted">{c.text}</div></div></li>)}</ul>
      </div>
    </div>
    <div className="card">
      <div className="card-head"><h2>Pathways on the website</h2><Link className="btn ghost sm" href="/admin/pathways">Manage pathways</Link></div>
      <div className="row">{pathways.map(p => <span key={p.id} className={`badge ${p.visible ? 'blue' : ''}`}>{p.title}{!p.visible && ' (hidden)'}</span>)}</div>
    </div>
  </>;
}
