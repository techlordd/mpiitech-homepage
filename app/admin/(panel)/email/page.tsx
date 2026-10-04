import Link from 'next/link';
import { getEmailConfig } from '@/lib/email';
import { getEmailSettings } from '@/lib/site';
import { store } from '@/lib/store';
import { PageHead } from '../../ui';
import { formatDate } from '../../format';
import { EmailSettingsEditor, LogActions, TestEmail } from './editor';

export const metadata = { title: 'Email & delivery log' };
const PAGE_SIZE = 30;
const STATUS: Record<string, [string, string]> = { sent: ['Accepted', 'green'], failed: ['Failed', 'red'], not_configured: ['Not configured', 'amber'] };
const EVENT: Record<string, string> = { delivered: 'green', opened: 'green', clicked: 'green', sent: 'blue', queued: 'blue', scheduled: 'blue', delivery_delayed: 'amber', bounced: 'red', complained: 'red', failed: 'red', suppressed: 'red', canceled: '' };
const KIND: Record<string, string> = { enquiry: 'Center hire', contact: 'Contact', programme: 'Programme', newsletter: 'Newsletter', test: 'Test', 'enquiry-autoreply': 'Auto-reply', 'contact-autoreply': 'Auto-reply' };

export default async function EmailPage({ searchParams }: { searchParams: Promise<{ status?: string; page?: string }> }) {
  const sp = await searchParams;
  const status = sp.status && sp.status in STATUS ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [settings, config, log] = await Promise.all([getEmailSettings(), getEmailConfig(), store().listEmailLog({ status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE })]);
  const pages = Math.max(1, Math.ceil(log.total / PAGE_SIZE));
  const link = (p: Record<string, string | undefined>) => `/admin/email?${new URLSearchParams(Object.entries({ status, ...p }).filter(([, v]) => v) as [string, string][])}`;
  const source = (s: string) => s === 'dashboard' ? 'set here' : s === 'environment' ? 'from environment variables' : 'missing';
  return <>
    <PageHead title="Email & delivery log" description="Website emails are sent through Resend. Set who receives form notifications, send a test, and check what was delivered."/>
    {config.problems.length > 0
      ? <div className="notice warn"><b>Email sending is not ready</b>{config.problems.join(' ')} Submissions are still saved in the dashboard.</div>
      : <div className="notice success"><b>Email sending is configured</b>From <code>{config.from}</code> to <code>{config.recipients.join(', ')}</code>. API key {source(config.sources.apiKey)}.</div>}
    <div className="grid2">
      <EmailSettingsEditor initial={{ fromName: settings.fromName, fromEmail: settings.fromEmail, recipients: settings.recipients, apiKey: '', clearApiKey: false }}
        hasDashboardKey={Boolean(settings.apiKey)} sources={config.sources} envFrom={process.env.RESEND_FROM_EMAIL ?? ''} envRecipients={process.env.CONTACT_TO_EMAIL ?? ''}/>
      <div>
        <TestEmail defaultTo={config.recipients[0] ?? ''}/>
        <div className="card">
          <h2>Setting up Resend</h2>
          <ol className="small muted" style={{ paddingLeft: 18, margin: '8px 0 0', display: 'grid', gap: 6 }}>
            <li>Create a free account at <a href="https://resend.com" target="_blank" rel="noreferrer">resend.com</a>.</li>
            <li>Add and verify your domain under <b>Domains</b> (add the DNS records it shows).</li>
            <li>Create an API key with “Sending access” and paste it here, or set <code>RESEND_API_KEY</code> in Vercel.</li>
            <li>Use a sender on that domain, e.g. <code>hello@your-domain.com</code>, then send a test.</li>
          </ol>
        </div>
      </div>
    </div>
    <div className="card-head" style={{ marginTop: 10 }}>
      <div><h2>Delivery log</h2><p className="small">Every email the website tries to send. “Accepted” means Resend took the email; refresh to see whether it was delivered, opened or bounced.</p></div>
      <LogActions/>
    </div>
    <div className="tabs">
      <Link href="/admin/email" className={!status ? 'active' : ''}>All</Link>
      {Object.entries(STATUS).map(([k, [l]]) => <Link key={k} href={link({ status: k, page: undefined })} className={status === k ? 'active' : ''}>{l}</Link>)}
    </div>
    <div className="table-wrap"><table>
      <thead><tr><th>Time</th><th>Type</th><th>To</th><th>Subject</th><th>Result</th><th>Delivery</th></tr></thead>
      <tbody>{log.items.length ? log.items.map(e => <tr key={e.id}>
        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(e.createdAt)}</td>
        <td>{KIND[e.kind] ?? e.kind}</td>
        <td style={{ maxWidth: 220, wordBreak: 'break-word' }}>{e.to.join(', ')}</td>
        <td>{e.subject}{e.error && <div className="small" style={{ color: 'var(--red)' }}>{e.error}</div>}</td>
        <td><span className={`badge ${STATUS[e.status]?.[1] ?? ''}`}>{STATUS[e.status]?.[0] ?? e.status}</span></td>
        <td>{e.lastEvent ? <span className={`badge ${EVENT[e.lastEvent] ?? ''}`}>{e.lastEvent.replace('_', ' ')}</span> : <span className="muted">—</span>}{e.providerId && <div className="small muted mono" title="Resend email ID">{e.providerId.slice(0, 8)}…</div>}</td>
      </tr>) : <tr><td colSpan={6} className="empty">No emails logged yet.</td></tr>}</tbody>
    </table></div>
    <div className="pager">
      <span>{log.total} email{log.total === 1 ? '' : 's'}{pages > 1 && ` · page ${page} of ${pages}`}</span>
      <div className="row">
        {page > 1 && <Link className="btn ghost sm" href={link({ page: String(page - 1) })}>← Newer</Link>}
        {page < pages && <Link className="btn ghost sm" href={link({ page: String(page + 1) })}>Older →</Link>}
      </div>
    </div>
  </>;
}
