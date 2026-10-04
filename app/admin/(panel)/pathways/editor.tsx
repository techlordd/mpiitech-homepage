'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Pathway } from '@/lib/content';
import { savePathways } from '../../actions';
import { ListField, SaveBar, TextArea, TextField, Toggle, newKey, useEditor } from '../../ui';

export default function PathwaysEditor({ initial, interest }: { initial: Pathway[]; interest: Record<string, number> }) {
  const editor = useEditor(initial, savePathways);
  const { value: items, setValue } = editor;
  const [open, setOpen] = useState<string | null>(null);
  const set = (id: string, patch: Partial<Pathway>) => setValue(list => list.map(p => p.id === id ? { ...p, ...patch } : p));
  const move = (index: number, by: number) => setValue(list => { const next = [...list]; const [item] = next.splice(index, 1); next.splice(index + by, 0, item); return next; });
  const remove = (p: Pathway) => {
    if (!confirm(`Remove “${p.title}” from the website? You can undo this with “Discard” until you save.`)) return;
    setValue(list => list.filter(x => x.id !== p.id));
  };
  const add = () => {
    const id = newKey('pathway');
    setValue(list => [...list, { id, title: '', headline: '', description: '', details: '', skills: [], featured: false, visible: true, notify: true }]);
    setOpen(id);
  };
  let number = 0;
  return <>
    <div className="notice"><b>How pathways appear</b>A <em>featured</em> pathway is shown as the large “Start here” card with its skills list. Other visible pathways are numbered “Pathway / 01, 02…” in the order below. Visitors can ask to be emailed when a pathway with notifications turned on starts — see <Link href="/admin/submissions?form=programme">Programme interest</Link>.</div>
    {items.map((p, i) => {
      const label = p.featured ? 'Featured · Start here' : p.visible ? `Pathway / ${String(++number).padStart(2, '0')}` : 'Hidden';
      const isOpen = open === p.id;
      return <div key={p.id} className={`list-item ${p.visible ? '' : 'hidden-item'}`}>
        <div className="list-head">
          <div className="handle">
            <button className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
            <button className="icon-btn" aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>▼</button>
          </div>
          <div className="title" onClick={() => setOpen(isOpen ? null : p.id)}>
            <b>{p.title || 'Untitled pathway'}</b>
            <small>{label}{interest[p.title] ? ` · ${interest[p.title]} interested` : ''}{!p.notify ? ' · notifications off' : ''}</small>
          </div>
          <Toggle label="Visible" checked={p.visible} onChange={visible => set(p.id, { visible })}/>
          <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen}>{isOpen ? 'Close' : 'Edit'}</button>
          <button className="btn danger sm" onClick={() => remove(p)}>Remove</button>
        </div>
        {isOpen && <div className="list-body"><div className="grid2">
          <TextField label="Title" value={p.title} max={120} onChange={title => set(p.id, { title })} hint="Shown as the card heading and used in notification emails."/>
          {p.featured && <TextField label="Headline" value={p.headline} max={160} onChange={headline => set(p.id, { headline })} hint="Large heading on the featured card, e.g. “Get comfortable with computers.”"/>}
          <TextArea className="span2" label="Short description" value={p.description} max={600} onChange={description => set(p.id, { description })}/>
          <TextArea className="span2" label={p.featured ? 'Extra details (optional)' : 'Skills summary (shown under “Explore the skills”)'} value={p.details} max={2000} onChange={details => set(p.id, { details })}/>
          <ListField className="span2" label="Skills list" value={p.skills} onChange={skills => set(p.id, { skills })} placeholder={'HTML and CSS\nJavaScript\nDatabases'} hint={p.featured ? 'Shown as the numbered list on the featured card. One per line.' : 'Optional bullet list under “Explore the skills”. One per line.'}/>
          <Toggle label="Featured “Start here” card" hint="Shows this pathway as the large card above the others." checked={p.featured} onChange={featured => set(p.id, { featured })}/>
          <Toggle label="“Email me when this programme starts” form" hint="Lets visitors request an update for this pathway." checked={p.notify} onChange={notify => set(p.id, { notify })}/>
        </div></div>}
      </div>;
    })}
    {!items.length && <div className="card empty">No pathways yet. The programmes section will only show its introduction.</div>}
    <button className="btn ghost" onClick={add}>+ Add a pathway</button>
    <SaveBar editor={editor}/>
  </>;
}
