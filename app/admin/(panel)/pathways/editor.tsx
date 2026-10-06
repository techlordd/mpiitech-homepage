'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PATHWAY_ART, PATHWAY_COLORS, SKILL_ICONS, type Pathway, type PathwayArt, type PathwayColor, type PathwaySkill, type SkillIcon } from '@/lib/content';
import { savePathways } from '../../actions';
import { ImageField, SaveBar, SelectField, TextArea, TextField, Toggle, newKey, useEditor } from '../../ui';

export default function PathwaysEditor({ initial, interest, portalUrl }: { initial: Pathway[]; interest: Record<string, number>; portalUrl: string }) {
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
    setValue(list => [...list, { id, title: '', headline: '', description: '', details: '', skills: [], image: '', imageAlt: '', color: 'auto', art: 'auto', featured: false, visible: true, notify: true, active: false, applyUrl: '' }]);
    setOpen(id);
  };
  let number = 0;
  return <>
    <div className="notice"><b>How pathways appear</b>A <em>featured</em> pathway is shown as the large “Start here” card with its skills list. Other visible pathways are numbered “Pathway / 01, 02…” in the order below. Turn on <em>Active</em> when a programme is accepting applications: its card then shows “Now enrolling” and an “Apply now” button. While it is not active, it shows “Coming soon” and visitors can ask to be emailed when it starts — see <Link href="/admin/submissions?form=programme">Programme interest</Link>.</div>
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
            <small>{label} · {p.active ? <b style={{ color: 'var(--green)' }}>Active – accepting applications</b> : 'Coming soon'}{interest[p.title] ? ` · ${interest[p.title]} interested` : ''}{!p.active && !p.notify ? ' · notifications off' : ''}</small>
          </div>
          <Toggle label="Visible" checked={p.visible} onChange={visible => set(p.id, { visible })}/>
          <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen}>{isOpen ? 'Close' : 'Edit'}</button>
          <button className="btn danger sm" onClick={() => remove(p)}>Remove</button>
        </div>
        {isOpen && <div className="list-body"><div className="grid2">
          <TextField label="Title" value={p.title} max={120} onChange={title => set(p.id, { title })} hint="Shown as the card heading and used in notification emails."/>
          {p.featured && <TextField label="Headline" value={p.headline} max={160} onChange={headline => set(p.id, { headline })} hint="Large heading on the featured card, e.g. “Get comfortable with computers.”"/>}
          <TextArea className="span2" label="Short description" value={p.description} max={600} onChange={description => set(p.id, { description })}/>
          <TextArea className="span2" label={p.featured ? 'Extra details (optional)' : 'Extra details (optional, shown in “Explore the skills”)'} value={p.details} max={2000} onChange={details => set(p.id, { details })}/>
          <SkillsField featured={p.featured} skills={p.skills} onChange={skills => set(p.id, { skills })}/>
          {!p.featured && <>
            <SelectField label="Colour" value={p.color} options={PATHWAY_COLORS.map(c => [c, c === 'auto' ? 'Automatic (by position)' : c[0].toUpperCase() + c.slice(1)])} onChange={color => set(p.id, { color: color as PathwayColor })} hint="The card’s accent colour."/>
            <SelectField label="Illustration" value={p.art} options={PATHWAY_ART.map(a => [a, ART_LABELS[a]])} onChange={art => set(p.id, { art: art as PathwayArt })} hint="Used when no picture is uploaded."/>
          </>}
          <ImageField className="span2" label="Picture" value={p.image} onChange={image => set(p.id, { image })} cover hint={p.featured ? 'Optional. A photo of a learner works best (portrait, at least 700 px wide). Leave empty to show the built-in illustration.' : 'Optional. A photo of a learner works best (square or portrait, at least 600 px wide). Leave empty to show the illustration.'}/>
          {p.image && <TextField className="span2" label="Picture description (alt text)" value={p.imageAlt} max={200} onChange={imageAlt => set(p.id, { imageAlt })} hint="Describe the photo for screen readers, e.g. “A student practising on a laptop at MPIITECH”."/>}
          <Toggle label="Featured “Start here” card" hint="Shows this pathway as the large card above the others." checked={p.featured} onChange={featured => set(p.id, { featured })}/>
          <div className="span2 status-panel">
            <Toggle label="Active — accepting applications" hint="On: the card shows “Now enrolling” and an “Apply now” button. Off: it shows “Coming soon” and the email sign-up." checked={p.active} onChange={active => set(p.id, { active })}/>
            {p.active
              ? <TextField label="“Apply now” link" value={p.applyUrl} max={2000} onChange={applyUrl => set(p.id, { applyUrl })} placeholder={portalUrl || '/contact'}
                  hint={`Where applicants go, e.g. your application form. Leave empty to use ${portalUrl ? 'the application portal' : 'the Contact us page'}.`}/>
              : <Toggle label="“Email me when this programme starts” form" hint="Lets visitors ask to be emailed when applications open." checked={p.notify} onChange={notify => set(p.id, { notify })}/>}
            {p.active && (interest[p.title] ?? 0) > 0 && <div className="notice" style={{ margin: 0 }}><b>{interest[p.title]} {interest[p.title] === 1 ? 'person' : 'people'} asked to be told when this programme starts</b><Link href="/admin/submissions?form=programme">View and export their emails</Link> to let them know applications are open.</div>}
          </div>
        </div></div>}
      </div>;
    })}
    {!items.length && <div className="card empty">No pathways yet. The programmes section will only show its introduction.</div>}
    <button className="btn ghost" onClick={add}>+ Add a pathway</button>
    <SaveBar editor={editor}/>
  </>;
}

const ART_LABELS: Record<PathwayArt, string> = { auto: 'Automatic (from title)', web: 'Web development', network: 'Networks & security', data: 'Data & charts', ai: 'AI & robot', general: 'Books & learning' };
const ICON_LABELS: Record<SkillIcon, string> = { auto: 'Automatic', computer: 'Computer', documents: 'Documents', internet: 'Internet & safety', code: 'Coding', network: 'Network', data: 'Data & charts', ai: 'AI', security: 'Security', design: 'Design', book: 'Book' };

function SkillsField({ skills, onChange, featured }: { skills: PathwaySkill[]; onChange: (s: PathwaySkill[]) => void; featured: boolean }) {
  const update = (i: number, patch: Partial<PathwaySkill>) => onChange(skills.map((s, j) => j === i ? { ...s, ...patch } : s));
  const move = (i: number, by: number) => { const next = [...skills]; const [item] = next.splice(i, 1); next.splice(i + by, 0, item); onChange(next); };
  return <div className="f span2"><span>Skills</span>
    <small>{featured ? 'Shown as colourful numbered cards on the featured card. Four skills fit best.' : 'Shown as tags on the card and in the “Explore the skills” panel. Three skills fit best.'}</small>
    {skills.map((s, i) => <div key={i} className="skill-row">
      <span className="badge orange">{String(i + 1).padStart(2, '0')}</span>
      <input className="input" value={s.title} maxLength={200} placeholder="Skill title" aria-label={`Skill ${i + 1} title`} onChange={e => update(i, { title: e.target.value })}/>
      <input className="input" value={s.description} maxLength={300} placeholder="Short description (optional)" aria-label={`Skill ${i + 1} description`} onChange={e => update(i, { description: e.target.value })}/>
      <select className="input" value={s.icon} aria-label={`Skill ${i + 1} icon`} onChange={e => update(i, { icon: e.target.value as SkillIcon })}>{SKILL_ICONS.map(k => <option key={k} value={k}>{ICON_LABELS[k]}</option>)}</select>
      <div className="row" style={{ gap: 2, flexWrap: 'nowrap' }}>
        <button type="button" className="icon-btn" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
        <button type="button" className="icon-btn" aria-label="Move down" disabled={i === skills.length - 1} onClick={() => move(i, 1)}>▼</button>
        <button type="button" className="icon-btn" aria-label="Remove skill" onClick={() => onChange(skills.filter((_, j) => j !== i))}>✕</button>
      </div>
    </div>)}
    <div><button type="button" className="btn ghost sm" disabled={skills.length >= 20} onClick={() => onChange([...skills, { title: '', description: '', icon: 'auto' }])}>+ Add skill</button></div>
  </div>;
}
