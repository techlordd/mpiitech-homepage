'use client';
import { useState } from 'react';
import type { EmailConfig } from '@/lib/email';
import { clearEmailLog, refreshEmailLog, saveEmail, sendTestEmail } from '../../actions';
import { SaveBar, Status, TextField, Toggle, useAction, useEditor } from '../../ui';

type Settings = { fromName: string; fromEmail: string; recipients: string; apiKey: string; clearApiKey: boolean };

export function EmailSettingsEditor({ initial, hasDashboardKey, sources, envFrom, envRecipients }: {
  initial: Settings; hasDashboardKey: boolean; sources: EmailConfig['sources']; envFrom: string; envRecipients: string;
}) {
  const editor = useEditor(initial, saveEmail);
  const { value: s, update } = editor;
  return <div className="card">
    <h2>Sending settings</h2>
    <p>Values entered here override the Vercel environment variables. Leave a field empty to use the environment variable.</p>
    <div className="stack">
      <div className="grid2">
        <TextField label="Sender name" value={s.fromName} max={80} onChange={fromName => update({ fromName })} placeholder="MPIITECH"/>
        <TextField label="Sender email" value={s.fromEmail} max={254} onChange={fromEmail => update({ fromEmail })} placeholder={envFrom || 'hello@your-domain.com'} hint="Must be on a domain verified in Resend."/>
      </div>
      <TextField label="Send form notifications to" value={s.recipients} max={1000} onChange={recipients => update({ recipients })} placeholder={envRecipients || 'team@example.com, director@example.com'} hint="Separate several inboxes with commas. Individual forms can override this."/>
      <TextField label="Resend API key" type="password" value={s.apiKey} max={200} onChange={apiKey => update({ apiKey, clearApiKey: false })}
        placeholder={hasDashboardKey ? '•••••••••• (saved — leave empty to keep)' : sources.apiKey === 'environment' ? 'Using RESEND_API_KEY from environment' : 're_…'}
        hint="Stored securely on the server and never shown again. Starts with re_."/>
      {hasDashboardKey && <Toggle label="Remove the saved API key" hint={sources.apiKey === 'dashboard' ? 'The RESEND_API_KEY environment variable will be used instead, if set.' : undefined} checked={s.clearApiKey} onChange={clearApiKey => update({ clearApiKey, apiKey: '' })}/>}
    </div>
    <SaveBar editor={editor} label="Save email settings"/>
  </div>;
}

export function TestEmail({ defaultTo }: { defaultTo: string }) {
  const [to, setTo] = useState(defaultTo);
  const action = useAction();
  return <div className="card">
    <h2>Send a test email</h2>
    <p>Check that emails reach your inbox. Save any settings changes first.</p>
    <div className="row">
      <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="you@example.com" aria-label="Send test to"/>
      <button className="btn accent" disabled={action.busy} onClick={() => action.run(() => sendTestEmail(to))}>{action.busy ? 'Sending…' : 'Send test'}</button>
    </div>
    <div style={{ marginTop: 12 }}><Status status={action.status}/></div>
  </div>;
}

export function LogActions() {
  const action = useAction();
  return <div className="stack" style={{ alignItems: 'flex-end', gap: 8 }}>
    <div className="row">
      <button className="btn ghost sm" disabled={action.busy} onClick={() => action.run(refreshEmailLog)}>{action.busy ? 'Working…' : 'Refresh delivery status'}</button>
      <button className="btn danger sm" disabled={action.busy} onClick={() => { if (confirm('Clear the whole delivery log? Submissions are not affected.')) action.run(clearEmailLog); }}>Clear log</button>
    </div>
    {action.status && <span className="small" style={{ color: action.status.ok ? 'var(--green)' : 'var(--red)' }}>{action.status.text}</span>}
  </div>;
}
