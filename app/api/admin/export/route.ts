import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

const cell = (value: string) => {
  const v = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value; // avoid spreadsheet formula injection
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
};

/** Downloads submissions as a CSV file, e.g. /api/admin/export?form=enquiry&status=new */
export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response('Unauthorised', { status: 401 });
  const params = new URL(request.url).searchParams;
  const form = params.get('form') || undefined;
  const status = params.get('status') || undefined;
  const { items } = await store().listSubmissions({ form, status, q: params.get('q') || undefined, limit: 10000 });
  const keys: string[] = []; const labels = new Map<string, string>();
  for (const s of items) for (const f of s.fields) if (!labels.has(f.key)) { labels.set(f.key, f.label); keys.push(f.key); }
  const header = ['Submitted', 'Form', 'Status', ...keys.map(k => labels.get(k) ?? k), 'Internal notes', 'Email notification'];
  const rows = items.map(s => {
    const values = Object.fromEntries(s.fields.map(f => [f.key, f.value]));
    return [s.createdAt, s.form, s.status, ...keys.map(k => values[k] ?? ''), s.notes, s.emailStatus];
  });
  const csv = '﻿' + [header, ...rows].map(r => r.map(x => cell(String(x ?? ''))).join(',')).join('\r\n');
  const name = `mpiitech-${form ?? 'submissions'}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}"`, 'Cache-Control': 'no-store' } });
}
