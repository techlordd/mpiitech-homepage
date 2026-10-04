'use client';
import { Fragment, useState } from 'react';
import type { Submission, SubmissionStatus } from '@/lib/store';
import { deleteSubmissions, updateSubmission } from '../../actions';
import { STATUS_LABELS, formatDate } from '../../format';
import { Status, useAction } from '../../ui';

const statusClass: Record<string, string> = { new: 'orange', in_progress: 'blue', closed: 'green', spam: 'red' };
const emailBadge = (s: string) => s === 'sent' ? <span className="badge green">Emailed</span> : s === 'pending' ? <span className="badge">Sending</span> : s ? <span className="badge red" title="See Email & delivery log">Email {s === 'not_configured' ? 'not configured' : 'failed'}</span> : null;

export default function SubmissionsTable({ items, openId, simple }: { items: Submission[]; openId?: string; simple: boolean }) {
  const [open, setOpen] = useState<string | null>(openId ?? null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const action = useAction();
  const toggle = (id: string) => setSelected(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const removeSelected = async () => {
    if (!confirm(`Permanently delete ${selected.size} submission${selected.size === 1 ? '' : 's'}?`)) return;
    if (await action.run(() => deleteSubmissions([...selected]))) setSelected(new Set());
  };
  const markSelected = (status: SubmissionStatus) => action.run(async () => {
    for (const id of selected) { const result = await updateSubmission(id, { status }); if (!result.ok) return result; }
    setSelected(new Set());
    return { ok: true, message: `Marked ${selected.size} as ${STATUS_LABELS[status].toLowerCase()}.` };
  });
  if (!items.length) return <div className="table-wrap"><div className="empty">No submissions match.</div></div>;
  return <>
    <Status status={action.status}/>
    {selected.size > 0 && <div className="row" style={{ marginBottom: 10 }}>
      <b>{selected.size} selected</b>
      <button className="btn ghost sm" disabled={action.busy} onClick={() => markSelected('closed')}>Mark closed</button>
      <button className="btn ghost sm" disabled={action.busy} onClick={() => markSelected('spam')}>Mark spam</button>
      <button className="btn danger sm" disabled={action.busy} onClick={removeSelected}>Delete</button>
    </div>}
    <div className="table-wrap"><table>
      <thead><tr>
        <th style={{ width: 30 }}><input type="checkbox" aria-label="Select all" checked={selected.size === items.length} onChange={e => setSelected(e.target.checked ? new Set(items.map(i => i.id)) : new Set())}/></th>
        <th>Received</th><th>{simple ? 'Email' : 'From'}</th><th>{simple ? 'Programme' : 'About'}</th><th>Status</th>
      </tr></thead>
      <tbody>{items.map(s => <Fragment key={s.id}>
        <tr className={`clickable ${open === s.id ? 'open' : ''}`} onClick={e => { if (!(e.target as HTMLElement).closest('input,button,select,a')) setOpen(open === s.id ? null : s.id); }}>
          <td><input type="checkbox" aria-label="Select" checked={selected.has(s.id)} onChange={() => toggle(s.id)}/></td>
          <td style={{ whiteSpace: 'nowrap' }}>{formatDate(s.createdAt)}</td>
          <td>{simple ? s.email : <><b>{s.name || '—'}</b><div className="small muted">{s.email}</div></>}</td>
          <td>{s.summary || '—'}</td>
          <td><div className="row" style={{ gap: 6 }}><span className={`badge ${statusClass[s.status] ?? ''}`}>{STATUS_LABELS[s.status] ?? s.status}</span>{s.emailStatus !== 'sent' && emailBadge(s.emailStatus)}</div></td>
        </tr>
        {open === s.id && <tr><td colSpan={5} className="detail"><Detail s={s}/></td></tr>}
      </Fragment>)}</tbody>
    </table></div>
  </>;
}

function Detail({ s }: { s: Submission }) {
  const [notes, setNotes] = useState(s.notes);
  const action = useAction();
  const reply = `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(`Re: your ${s.form === 'enquiry' ? 'center hire enquiry' : 'message'} to MPIITECH`)}`;
  const phone = s.fields.find(f => f.key === 'phone')?.value.replace(/[^\d]/g, '');
  return <div className="stack">
    <dl className="kv">{s.fields.map(f => <Fragment key={f.key}><dt>{f.label}</dt><dd>{f.value || <span className="muted">Not provided</span>}</dd></Fragment>)}
      <dt>Email notification</dt><dd>{emailBadge(s.emailStatus) ?? '—'}</dd>
    </dl>
    <div className="row">
      <a className="btn sm" href={reply}>Reply by email</a>
      {phone && <a className="btn ghost sm" href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer">WhatsApp</a>}
      <span className="spacer"/>
      <label className="row small"><b>Status</b>
        <select className="input" style={{ width: 150 }} value={s.status} disabled={action.busy} onChange={e => action.run(() => updateSubmission(s.id, { status: e.target.value as SubmissionStatus }))}>
          {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </label>
    </div>
    <label className="f"><span>Internal notes</span><textarea rows={3} value={notes} maxLength={5000} onChange={e => setNotes(e.target.value)} placeholder="Only visible to admins, e.g. “Called on Monday, sent price list.”"/></label>
    <div className="row">
      <button className="btn ghost sm" disabled={action.busy || notes === s.notes} onClick={() => action.run(() => updateSubmission(s.id, { notes }))}>Save notes</button>
      <span className="spacer"/>
      <button className="btn danger sm" disabled={action.busy} onClick={() => { if (confirm('Permanently delete this submission?')) action.run(() => deleteSubmissions([s.id])); }}>Delete</button>
    </div>
    <Status status={action.status}/>
  </div>;
}
