'use client';
import { useState } from 'react';
import { fillTemplate } from '@/lib/content';
import { notifySubscribers } from '../../../actions';
import { Status, TextArea, TextField, useAction } from '../../../ui';

type Props = { pathwayId: string; programme: string; siteName: string; applyLink: string; initialSubject: string; initialBody: string; waiting: string[]; defaultTestTo: string; ready: boolean };

export default function NoticeComposer({ pathwayId, programme, siteName, applyLink, initialSubject, initialBody, waiting, defaultTestTo, ready }: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [testTo, setTestTo] = useState(defaultTestTo);
  const [showList, setShowList] = useState(false);
  // One id per page visit: if "Send" is clicked twice, Resend recognises the repeat and sends nothing new.
  const [sendId] = useState(() => crypto.randomUUID());
  const action = useAction();
  const values = { programme, siteName, applyLink };
  const send = (mode: 'test' | 'all') => action.run(() => notifySubscribers({ pathwayId, subject, body, sendId, testTo, mode }));
  const sendAll = () => {
    if (!confirm(`Send this email to ${waiting.length} ${waiting.length === 1 ? 'person' : 'people'}? Each email counts towards your Resend plan’s daily and monthly limits.`)) return;
    send('all');
  };
  return <div className="grid2">
    <div className="card">
      <h2>Message</h2>
      <p>Use <code>{'{programme}'}</code>, <code>{'{applyLink}'}</code> and <code>{'{siteName}'}</code>; they’re filled in for you. Change the default wording in <a href="/admin/email">Email &amp; delivery log</a>.</p>
      <div className="stack">
        <TextField label="Subject" value={subject} max={200} onChange={setSubject}/>
        <TextArea label="Message" rows={12} value={body} max={5000} onChange={setBody}/>
      </div>
    </div>
    <div>
      <div className="card">
        <h2>Preview</h2>
        <div className="email-preview">
          <div className="small muted">Subject</div>
          <b>{fillTemplate(subject, values)}</b>
          <hr/>
          <div className="email-body">{fillTemplate(body, values)}</div>
        </div>
      </div>
      <div className="card">
        <h2>Send</h2>
        <p>Send yourself a test first. Then send to everyone; people who get it are marked <b>Notified</b> and won’t be emailed again.</p>
        <div className="row" style={{ marginTop: 12 }}>
          <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="you@example.com" aria-label="Send test to"/>
          <button className="btn ghost" disabled={action.busy || !ready} onClick={() => send('test')}>Send test</button>
        </div>
        <hr/>
        <div className="row">
          <button className="btn accent" disabled={action.busy || !ready || !waiting.length} onClick={sendAll}>{action.busy ? 'Sending…' : waiting.length ? `Send to ${waiting.length} ${waiting.length === 1 ? 'person' : 'people'}` : 'Nobody is waiting'}</button>
          {waiting.length > 0 && <button className="btn ghost sm" onClick={() => setShowList(!showList)}>{showList ? 'Hide' : 'Show'} who</button>}
        </div>
        {showList && <ul className="small muted" style={{ margin: '12px 0 0', paddingLeft: 18, maxHeight: 220, overflow: 'auto' }}>{waiting.map(e => <li key={e}>{e}</li>)}</ul>}
        <div style={{ marginTop: 12 }}><Status status={action.status}/></div>
      </div>
    </div>
  </div>;
}
