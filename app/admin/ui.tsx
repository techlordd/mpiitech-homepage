'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { ActionResult } from './actions';

/* ---------- Editor state with save + unsaved-changes tracking ---------- */
export function useEditor<T>(initial: T, action: (value: T) => Promise<ActionResult>) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(value) !== saved;
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const update = (patch: Partial<T>) => setValue(v => ({ ...v, ...patch }));
  async function save() {
    setSaving(true); setStatus(null);
    try {
      const result = await action(value);
      if (result.ok) { setSaved(JSON.stringify(value)); setStatus({ ok: true, text: result.message || 'Saved.' }); router.refresh(); }
      else setStatus({ ok: false, text: result.error });
    } catch { setStatus({ ok: false, text: 'Could not reach the server. Check your connection and try again.' }); }
    finally { setSaving(false); }
  }
  const reset = () => { setValue(JSON.parse(saved)); setStatus(null); };
  return { value, setValue, update, dirty, saving, status, save, reset };
}

export function SaveBar({ editor, label = 'Save changes' }: { editor: Pick<ReturnType<typeof useEditor>, 'dirty' | 'saving' | 'status' | 'save' | 'reset'>; label?: string }) {
  const { dirty, saving, status } = editor;
  return <div className="savebar">
    <span className={`msg ${status ? (status.ok ? 'ok' : 'err') : ''}`} role="status">
      {status && (!dirty || !status.ok) ? status.text : dirty ? 'You have unsaved changes.' : 'All changes saved.'}
    </span>
    {dirty && <button className="btn ghost sm" onClick={editor.reset} disabled={saving}>Discard</button>}
    <button className="btn accent" onClick={editor.save} disabled={saving || !dirty}>{saving ? 'Saving…' : label}</button>
  </div>;
}

/* ---------- Inputs ---------- */
type Base = { label: string; hint?: ReactNode; className?: string };

export function TextField({ label, hint, className, value, onChange, placeholder, type = 'text', max, recommend }: Base & {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; max?: number; recommend?: [number, number];
}) {
  return <label className={`f ${className ?? ''}`}><span>{label}</span>
    <input type={type} value={value} placeholder={placeholder} maxLength={max} onChange={e => onChange(e.target.value)}/>
    {(hint || recommend) && <Hint hint={hint} length={value.length} recommend={recommend}/>}
  </label>;
}

export function TextArea({ label, hint, className, value, onChange, placeholder, rows = 3, max, code, recommend }: Base & {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; max?: number; code?: boolean; recommend?: [number, number];
}) {
  return <label className={`f ${className ?? ''}`}><span>{label}</span>
    <textarea className={code ? 'code' : ''} rows={rows} value={value} placeholder={placeholder} maxLength={max} spellCheck={!code} onChange={e => onChange(e.target.value)}/>
    {(hint || recommend) && <Hint hint={hint} length={value.length} recommend={recommend}/>}
  </label>;
}

function Hint({ hint, length, recommend }: { hint?: ReactNode; length: number; recommend?: [number, number] }) {
  if (!recommend) return <small>{hint}</small>;
  const [min, max] = recommend;
  const colour = length === 0 ? '#d93025' : length < min ? '#f0a020' : length <= max ? '#3ba55d' : '#d93025';
  return <div>
    <div className="meter"><i style={{ width: `${Math.min(100, (length / max) * 100)}%`, background: colour }}/></div>
    <div className="counter"><small>{hint}</small><small>{length} / {max} characters</small></div>
  </div>;
}

export function Toggle({ label, hint, checked, onChange, className }: Base & { checked: boolean; onChange: (v: boolean) => void }) {
  return <label className={`toggle ${className ?? ''}`}><input type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)}/>
    <span><b>{label}</b>{hint && <small>{hint}</small>}</span></label>;
}

export function SelectField({ label, hint, className, value, onChange, options }: Base & { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <label className={`f ${className ?? ''}`}><span>{label}</span>
    <select value={value} onChange={e => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    {hint && <small>{hint}</small>}
  </label>;
}

export function ListField({ label, hint, className, value, onChange, placeholder, rows = 4 }: Base & { value: string[]; onChange: (v: string[]) => void; placeholder?: string; rows?: number }) {
  // Keep the raw text while typing so blank lines are not swallowed; resync when the list changes elsewhere (e.g. Discard).
  const [text, setText] = useState(value.join('\n'));
  const parse = (t: string) => t.split('\n').map(x => x.trim()).filter(Boolean);
  useEffect(() => { setText(t => parse(t).join('\n') === value.join('\n') ? t : value.join('\n')); }, [value]);
  return <label className={`f ${className ?? ''}`}><span>{label}</span>
    <textarea rows={rows} value={text} placeholder={placeholder} onChange={e => { setText(e.target.value); onChange(parse(e.target.value)); }}/>
    <small>{hint ?? 'One per line.'}</small>
  </label>;
}

export function ImageField({ label, hint, value, onChange, dark, cover, className }: Base & { value: string; onChange: (v: string) => void; dark?: boolean; cover?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  async function upload(file: File) {
    setBusy(true); setError('');
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      onChange(result.url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return <div className={`f ${className ?? ''}`}><span>{label}</span>
    <div className="image-field">
      <div className={`image-preview ${dark ? 'dark' : ''} ${cover ? 'cover' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt=""/> : <small className="muted">No image</small>}
      </div>
      <div className="stack">
        <div className="row">
          <button type="button" className="btn ghost sm" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : 'Upload image'}</button>
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/avif" hidden onChange={e => e.target.files?.[0] && upload(e.target.files[0])}/>
        </div>
        <input className="input" value={value} onChange={e => onChange(e.target.value)} placeholder="/media/… or https://…" aria-label={`${label} URL`}/>
        {error ? <small style={{ color: 'var(--red)' }}>{error}</small> : hint && <small>{hint}</small>}
      </div>
    </div>
  </div>;
}

export function PageHead({ title, description, children }: { title: string; description?: ReactNode; children?: ReactNode }) {
  return <div className="page-head"><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="row">{children}</div>}</div>;
}

/** Runs a one-off server action (delete, refresh…) and refreshes the page. */
export function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  async function run(fn: () => Promise<ActionResult>) {
    setBusy(true); setStatus(null);
    try {
      const result = await fn();
      setStatus(result.ok ? { ok: true, text: result.message || 'Done.' } : { ok: false, text: result.error });
      if (result.ok) router.refresh();
      return result.ok;
    } catch { setStatus({ ok: false, text: 'Could not reach the server. Please try again.' }); return false; }
    finally { setBusy(false); }
  }
  return { busy, status, run, setStatus };
}

export function Status({ status }: { status: { ok: boolean; text: string } | null }) {
  return status ? <div className={`notice ${status.ok ? 'success' : 'error'}`} role="status">{status.text}</div> : null;
}

export const newKey = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
