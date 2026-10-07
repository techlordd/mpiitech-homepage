'use client';
import { useState } from 'react';
import type { EmailTemplate, SubscriberMessages } from '@/lib/content';
import type { EmailConfig } from '@/lib/email';
import { clearEmailLog, refreshEmailLog, saveEmail, saveMessages, sendTestEmail } from '../../actions';
import { SaveBar, Status, TextArea, TextField, Toggle, useAction, useEditor } from '../../ui';

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

const TEMPLATES: { key: keyof SubscriberMessages; title: string; when: string; toggle?: string }[] = [
  { key: 'programmeConfirm', title: 'Programme sign-up confirmation', when: 'Sent to someone who asks to be emailed when a programme starts.', toggle: 'Send this confirmation' },
  { key: 'newsletterConfirm', title: 'Newsletter sign-up confirmation', when: 'Sent to someone who signs up for updates at the bottom of the home page.', toggle: 'Send this confirmation' },
  { key: 'programmeNotice', title: 'Programme announcement (default wording)', when: 'Filled in for you when you click “Notify subscribers” in Pathways. You can still change it before sending.' }
];

export function SubscriberEmailsEditor({ initial }: { initial: SubscriberMessages }) {
  const editor = useEditor(initial, saveMessages);
  const { value, update } = editor;
  const set = (key: keyof SubscriberMessages, patch: Partial<EmailTemplate>) => update({ [key]: { ...value[key], ...patch } } as Partial<SubscriberMessages>);
  return <div className="card" style={{ marginTop: 18 }}>
    <h2>Subscriber emails</h2>
    <p>What people receive after signing up. <code>{'{programme}'}</code>, <code>{'{applyLink}'}</code> and <code>{'{siteName}'}</code> are filled in for you. Each confirmation is one extra email, which counts towards your Resend plan’s limits.</p>
    <div className="grid3">{TEMPLATES.map(t => <div key={t.key} className="stack">
      <div><b>{t.title}</b><div className="small muted">{t.when}</div></div>
      {t.toggle && <Toggle label={t.toggle} checked={value[t.key].enabled} onChange={enabled => set(t.key, { enabled })}/>}
      <TextField label="Subject" value={value[t.key].subject} max={200} onChange={subject => set(t.key, { subject })}/>
      <TextArea label="Message" rows={9} value={value[t.key].body} max={5000} onChange={body => set(t.key, { body })}/>
    </div>)}</div>
    <SaveBar editor={editor} label="Save subscriber emails"/>
  </div>;
}
