'use client';
import { useState, type FormEvent } from 'react';
import { slugify, visibleFields, type FormDef, type FormField } from '@/lib/content';

async function post(payload: Record<string, unknown>) {
  const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, submissionId: crypto.randomUUID() }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Unable to send. Please try again.');
}

export function EmailForm({ kind, programme, label }: { kind: 'programme' | 'newsletter'; programme?: string; label?: string }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const id = `email-${slugify(programme || kind)}`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setStatus('');
    try {
      await post({ ...Object.fromEntries(new FormData(form)), kind, programme });
      setStatus(kind === 'newsletter' ? 'Thank you! Your newsletter request has been received.' : 'Thank you! We have received your request for programme updates.');
      form.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to send. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form className="email-form" onSubmit={submit}>
    <label className="email-label" htmlFor={id}>{label ?? (kind === 'newsletter' ? 'Subscribe to our newsletter' : 'Email me when this programme starts')}</label>
    <div className="email-row"><input id={id} type="email" name="email" placeholder="Your email address" required maxLength={254}/><button disabled={busy} type="submit">{busy ? 'Sending…' : kind === 'newsletter' ? 'Subscribe' : 'Notify me'}</button></div>
    <label className="check"><input type="checkbox" name="consent" value="yes" required/> <span>I agree to receive email updates {kind === 'newsletter' ? 'and newsletters' : 'about this programme'}.</span></label>
    <div className="trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}

/** Renders the enquiry and contact forms from the definitions managed in the admin dashboard. */
export function DynamicForm({ def, initial }: { def: FormDef; initial?: Record<string, string> }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true); setStatus('');
    try {
      await post({ ...Object.fromEntries(new FormData(form)), kind: def.id });
      setStatus(def.successMessage); form.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to submit. Please try again.'); }
    finally { setBusy(false); }
  }
  const shown = new Set(visibleFields(def).map(f => f.id));
  return <form className={`enquiry-form ${def.id}-form`} onSubmit={submit}>
    {def.eyebrow && <span className="eyebrow">{def.eyebrow}</span>}{def.title && <h3>{def.title}</h3>}
    {def.intro && <p>{def.intro}</p>}
    {def.sections.map(section => {
      const fields = section.fields.filter(f => shown.has(f.id));
      if (!fields.length) return null;
      return <fieldset key={section.id} className={section.title ? '' : 'untitled'}>{section.title && <legend>{section.title}</legend>}
        <div className="form-grid">{fields.map(f => <Field key={`${f.id}-${initial?.[f.key] ?? ''}`} field={f} formId={def.id} initial={initial?.[f.key]}/>)}</div>
      </fieldset>;
    })}
    <label className="check consent"><input type="checkbox" name="consent" value="yes" required/><span>{def.consentText}</span></label>
    <div className="trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <button type="submit" disabled={busy}>{busy ? 'Submitting…' : def.submitLabel}</button>
    {status && <p role="status" className="form-status">{status}</p>}
  </form>;
}

function Field({ field: f, formId, initial }: { field: FormField; formId: string; initial?: string }) {
  const required = f.required || f.locked;
  const id = `${formId}-${f.key}`;
  const help = f.help ? <small id={`${id}-help`}>{f.help}</small> : null;
  const describedBy = f.help ? `${id}-help` : undefined;
  const width = f.width === 'full' || f.type === 'textarea' || f.type === 'checkbox' ? 'full' : 'half';
  if (f.type === 'checkbox') return <div className={`field-wrap ${width}`}><label className="check"><input type="checkbox" name={f.key} value="yes" required={required} aria-describedby={describedBy}/><span>{f.label}{required && <b> *</b>}</span></label>{help}</div>;
  const common = { id, name: f.key, required, placeholder: f.placeholder || undefined, 'aria-describedby': describedBy };
  let control;
  if (f.type === 'textarea') control = <textarea {...common} maxLength={3000}/>;
  else if (f.type === 'select') control = <select {...common} defaultValue={initial && f.options.includes(initial) ? initial : ''}><option value="" disabled>{f.placeholder || 'Select an option'}</option>{f.options.map(o => <option key={o}>{o}</option>)}</select>;
  else control = <input {...common} type={f.type} maxLength={f.type === 'email' ? 254 : 200} min={f.type === 'number' ? f.min ?? undefined : undefined} max={f.type === 'number' ? f.max ?? undefined : undefined}/>;
  return <div className={`field-wrap ${width}`}><label className="field" htmlFor={id}>{f.label}{required && <b> *</b>}</label>{control}{help}</div>;
}
