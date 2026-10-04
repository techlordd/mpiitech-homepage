import Link from 'next/link';
import { store, storageKind } from '@/lib/store';
import { PageHead } from '../../ui';
import { FORM_LABELS, STATUS_LABELS } from '../../format';
import SubmissionsTable from './table';

export const metadata = { title: 'Submissions' };
const PAGE_SIZE = 25;
const FORMS = ['enquiry', 'contact', 'programme', 'newsletter'];
const TITLES: Record<string, [string, string]> = {
  enquiry: ['Center hire enquiries', 'Requests to hire the center for training or assessments.'],
  contact: ['Contact messages', 'Messages sent from the Contact us page.'],
  programme: ['Programme interest', 'Visitors who asked to be emailed when a pathway starts.'],
  newsletter: ['Newsletter', 'Visitors who asked to receive news and announcements.']
};

type Search = { form?: string; status?: string; q?: string; page?: string; open?: string };

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const form = FORMS.includes(sp.form ?? '') ? sp.form! : 'enquiry';
  const status = sp.status && sp.status in STATUS_LABELS ? sp.status : '';
  const q = (sp.q ?? '').slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);
  const [result, counts] = await Promise.all([
    store().listSubmissions({ form, status: status || undefined, q: q || undefined, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    store().submissionCounts().catch(() => [])
  ]);
  const count = (f: string, s?: string) => counts.filter(c => c.form === f && (!s || c.status === s)).reduce((n, c) => n + c.count, 0);
  const query = (patch: Partial<Search>) => {
    const p = new URLSearchParams(Object.entries({ form, status, q, page: String(page), ...patch }).filter(([, v]) => v && v !== '1') as [string, string][]);
    return `/admin/submissions?${p}`;
  };
  const exportParams = new URLSearchParams(Object.entries({ form, status, q }).filter(([, v]) => v) as [string, string][]);
  const pages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  return <>
    <PageHead title={TITLES[form][0]} description={TITLES[form][1]}>
      {(form === 'enquiry' || form === 'contact') && <Link className="btn ghost" href={`/admin/forms?form=${form}`}>Edit form</Link>}
      <a className="btn ghost" href={`/api/admin/export?${exportParams}`}>Download CSV</a>
    </PageHead>
    {storageKind() === 'none' && <div className="notice warn"><b>Submissions are not being saved</b>No database is connected, so form submissions are only emailed. Connect a Postgres database (DATABASE_URL) to keep them here.</div>}
    <div className="tabs">{FORMS.map(f => <Link key={f} href={`/admin/submissions?form=${f}`} className={f === form ? 'active' : ''}>{FORM_LABELS[f]}{count(f, 'new') > 0 && <span className="badge orange">{count(f, 'new')} new</span>}</Link>)}</div>
    <form className="row" style={{ marginBottom: 14 }} action="/admin/submissions">
      <input type="hidden" name="form" value={form}/>
      <select className="input" style={{ width: 170 }} name="status" defaultValue={status} aria-label="Status">
        <option value="">All statuses ({count(form)})</option>
        {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l} ({count(form, k)})</option>)}
      </select>
      <input className="input" style={{ flex: 1, minWidth: 180 }} name="q" defaultValue={q} placeholder="Search name, email or answers…" aria-label="Search"/>
      <button className="btn">Filter</button>
      {(status || q) && <Link className="btn ghost" href={`/admin/submissions?form=${form}`}>Clear</Link>}
    </form>
    <SubmissionsTable items={result.items} openId={sp.open} simple={form === 'programme' || form === 'newsletter'}/>
    <div className="pager">
      <span>{result.total} submission{result.total === 1 ? '' : 's'}{pages > 1 && ` · page ${page} of ${pages}`}</span>
      <div className="row">
        {page > 1 && <Link className="btn ghost sm" href={query({ page: String(page - 1) })}>← Newer</Link>}
        {page < pages && <Link className="btn ghost sm" href={query({ page: String(page + 1) })}>Older →</Link>}
      </div>
    </div>
  </>;
}
