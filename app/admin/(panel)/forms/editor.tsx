'use client';
import { useState } from 'react';
import type { FieldType, FormDef, FormField, FormSection } from '@/lib/content';
import { saveForm } from '../../actions';
import { ListField, SaveBar, SelectField, TextArea, TextField, Toggle, newKey, useEditor } from '../../ui';

const TYPES: [FieldType, string][] = [['text', 'Short text'], ['textarea', 'Paragraph'], ['email', 'Email'], ['tel', 'Phone'], ['number', 'Number'], ['date', 'Date'], ['select', 'Dropdown'], ['checkbox', 'Checkbox']];
const typeLabel = (t: FieldType) => TYPES.find(x => x[0] === t)?.[1] ?? t;

function camelKey(label: string) {
  const words = label.normalize('NFKD').replace(/[^\w\s]/g, ' ').trim().split(/\s+/).filter(Boolean).slice(0, 4);
  const key = words.map((w, i) => i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join('').replace(/^[^a-zA-Z]+/, '');
  return key.slice(0, 40) || 'field';
}

export default function FormEditor({ initial, defaultRecipients }: { initial: FormDef; defaultRecipients: string[] }) {
  const editor = useEditor(initial, saveForm);
  const { value: form, update, setValue } = editor;
  const [open, setOpen] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const allKeys = (except?: string) => form.sections.flatMap(s => s.fields).filter(f => f.id !== except).map(f => f.key);

  const setSections = (fn: (sections: FormSection[]) => FormSection[]) => setValue(f => ({ ...f, sections: fn(f.sections) }));
  const setSection = (id: string, patch: Partial<FormSection>) => setSections(list => list.map(s => s.id === id ? { ...s, ...patch } : s));
  const setField = (sectionId: string, fieldId: string, patch: Partial<FormField>) =>
    setSections(list => list.map(s => s.id !== sectionId ? s : { ...s, fields: s.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f) }));
  const moveField = (sectionIndex: number, fieldIndex: number, by: number) => setSections(list => {
    const sections = list.map(s => ({ ...s, fields: [...s.fields] }));
    const [field] = sections[sectionIndex].fields.splice(fieldIndex, 1);
    const target = fieldIndex + by;
    if (target < 0 && sectionIndex > 0) sections[sectionIndex - 1].fields.push(field);
    else if (target > sections[sectionIndex].fields.length && sectionIndex < sections.length - 1) sections[sectionIndex + 1].fields.unshift(field);
    else sections[sectionIndex].fields.splice(Math.max(0, Math.min(target, sections[sectionIndex].fields.length)), 0, field);
    return sections;
  });
  const addField = (sectionId: string) => {
    const id = newKey('field');
    let key = 'newField'; let n = 2;
    while (allKeys().includes(key)) key = `newField${n++}`;
    setSections(list => list.map(s => s.id !== sectionId ? s : { ...s, fields: [...s.fields, { id, key, label: '', type: 'text', placeholder: '', help: '', required: false, visible: true, options: [], width: 'half', min: null, max: null, locked: false }] }));
    setFresh(set => new Set(set).add(id)); setOpen(id);
  };
  const removeField = (sectionId: string, field: FormField) => {
    if (!confirm(`Delete the “${field.label || 'untitled'}” question? Earlier submissions keep their answers. Tip: you can hide a question instead.`)) return;
    setSections(list => list.map(s => s.id !== sectionId ? s : { ...s, fields: s.fields.filter(f => f.id !== field.id) }));
  };
  const relabel = (sectionId: string, field: FormField, label: string) => {
    const patch: Partial<FormField> = { label };
    if (fresh.has(field.id)) { // derive a stable key from the label for brand-new questions
      let key = camelKey(label); let n = 2; const used = allKeys(field.id);
      const base = key; while (used.includes(key) || ['kind', 'consent', 'website', 'submissionId', 'programme'].includes(key)) key = `${base}${n++}`;
      patch.key = key;
    }
    setField(sectionId, field.id, patch);
  };
  const hasDates = allKeys().includes('startDate') && allKeys().includes('endDate');

  return <>
    <div className="card">
      <h2>Form text</h2>
      <p>The heading, introduction and messages around the form.</p>
      <div className="grid2">
        <TextField label="Small heading (eyebrow)" value={form.eyebrow} max={80} onChange={eyebrow => update({ eyebrow })}/>
        <TextField label="Title" value={form.title} max={120} onChange={title => update({ title })}/>
        <TextArea className="span2" label="Introduction" value={form.intro} max={1000} onChange={intro => update({ intro })}/>
        <TextArea className="span2" label="Consent checkbox text" value={form.consentText} max={500} rows={2} onChange={consentText => update({ consentText })} hint="Visitors must tick this before submitting."/>
        <TextField label="Submit button text" value={form.submitLabel} max={60} onChange={submitLabel => update({ submitLabel })}/>
        <TextArea label="Success message" value={form.successMessage} max={500} rows={2} onChange={successMessage => update({ successMessage })} hint="Shown after a successful submission."/>
      </div>
    </div>

    <div className="card">
      <div className="card-head"><div><h2>Questions</h2><p>Reorder with the arrows, hide questions you don’t need, or add your own. Name and email are always required so the team can reply.</p></div></div>
      {form.sections.map((section, si) => <div className="section-box" key={section.id}>
        <div className="row" style={{ marginBottom: 10 }}>
          <input className="input" style={{ flex: 1, fontWeight: 700 }} value={section.title} placeholder="Section heading (optional)" aria-label="Section heading" onChange={e => setSection(section.id, { title: e.target.value })}/>
          <button className="icon-btn" aria-label="Move section up" disabled={si === 0} onClick={() => setSections(list => { const n = [...list]; [n[si - 1], n[si]] = [n[si], n[si - 1]]; return n; })}>▲</button>
          <button className="icon-btn" aria-label="Move section down" disabled={si === form.sections.length - 1} onClick={() => setSections(list => { const n = [...list]; [n[si + 1], n[si]] = [n[si], n[si + 1]]; return n; })}>▼</button>
          <button className="btn danger sm" disabled={section.fields.some(f => f.locked) || form.sections.length === 1} title={section.fields.some(f => f.locked) ? 'Move the name and email questions out first' : undefined}
            onClick={() => { if (confirm('Delete this section and its questions?')) setSections(list => list.filter(s => s.id !== section.id)); }}>Delete section</button>
        </div>
        {section.fields.map((f, fi) => {
          const isOpen = open === f.id;
          return <div key={f.id}>
            <div className={`field-row ${f.visible || f.locked ? '' : 'off'}`}>
              <div className="handle">
                <button className="icon-btn" aria-label="Move up" disabled={si === 0 && fi === 0} onClick={() => moveField(si, fi, -1)}>▲</button>
                <button className="icon-btn" aria-label="Move down" disabled={si === form.sections.length - 1 && fi === section.fields.length - 1} onClick={() => moveField(si, fi, 1)}>▼</button>
              </div>
              <div style={{ minWidth: 0, cursor: 'pointer' }} onClick={() => setOpen(isOpen ? null : f.id)}>
                <b>{f.label || 'Untitled question'}</b>{(f.required || f.locked) && <span style={{ color: 'var(--orange-dark)' }}> *</span>}
                <div className="small muted">{typeLabel(f.type)}{f.locked ? ' · always shown' : !f.visible ? ' · hidden' : ''}</div>
              </div>
              <span className="meta mono">{f.key}</span>
              <div className="row">
                {!f.locked && <Toggle label="Show" checked={f.visible} onChange={visible => setField(section.id, f.id, { visible })}/>}
                <button className="btn ghost sm" onClick={() => setOpen(isOpen ? null : f.id)}>{isOpen ? 'Close' : 'Edit'}</button>
              </div>
            </div>
            {isOpen && <div className="card" style={{ marginTop: -2 }}>
              <div className="grid2">
                <TextField label="Question label" value={f.label} max={300} onChange={label => relabel(section.id, f, label)}/>
                {!f.locked && <SelectField label="Answer type" value={f.type} options={TYPES} onChange={type => setField(section.id, f.id, { type: type as FieldType })}/>}
                {f.type !== 'checkbox' && <TextField label={f.type === 'select' ? 'Prompt (first, empty choice)' : 'Placeholder'} value={f.placeholder} max={200} onChange={placeholder => setField(section.id, f.id, { placeholder })}/>}
                <TextField label="Help text" value={f.help} max={300} onChange={help => setField(section.id, f.id, { help })} hint="Small note shown under the question."/>
                {f.type === 'select' && <ListField className="span2" label="Choices" value={f.options} onChange={options => setField(section.id, f.id, { options })} hint="One choice per line."/>}
                {f.type === 'number' && <>
                  <TextField label="Minimum" type="number" value={f.min == null ? '' : String(f.min)} onChange={v => setField(section.id, f.id, { min: v === '' ? null : Math.trunc(Number(v)) })}/>
                  <TextField label="Maximum" type="number" value={f.max == null ? '' : String(f.max)} onChange={v => setField(section.id, f.id, { max: v === '' ? null : Math.trunc(Number(v)) })}/>
                </>}
                {f.type !== 'textarea' && f.type !== 'checkbox' && <SelectField label="Width" value={f.width} options={[['half', 'Half width'], ['full', 'Full width']]} onChange={width => setField(section.id, f.id, { width: width as 'half' | 'full' })}/>}
                <TextField label="Field key" value={f.key} max={40} onChange={key => { setFresh(set => { const n = new Set(set); n.delete(f.id); return n; }); setField(section.id, f.id, { key: key.replace(/[^a-zA-Z0-9_]/g, '') }); }}
                  hint="Internal name used in exports. Letters, numbers and underscores." className={f.locked ? 'hidden' : ''}/>
              </div>
              <hr/>
              <div className="row">
                {f.locked ? <span className="small muted">Name and email are always required and visible.</span> : <Toggle label="Required" checked={f.required} onChange={required => setField(section.id, f.id, { required })}/>}
                <span className="spacer"/>
                {!f.locked && <button className="btn danger sm" onClick={() => removeField(section.id, f)}>Delete question</button>}
              </div>
            </div>}
          </div>;
        })}
        <button className="btn ghost sm" onClick={() => addField(section.id)}>+ Add question</button>
      </div>)}
      <button className="btn ghost" onClick={() => setSections(list => [...list, { id: newKey('section'), title: `${list.length + 1}. New section`, fields: [] }])}>+ Add section</button>
    </div>

    <div className="card">
      <h2>Email notification</h2>
      <p>Every submission is saved in the dashboard and emailed to your team. Replies go straight to the visitor.</p>
      <div className="grid2">
        <TextField label="Email subject" value={form.subject} max={200} onChange={subject => update({ subject })}/>
        <TextField label="Send to (optional)" value={form.recipients} max={1000} onChange={recipients => update({ recipients })} placeholder={defaultRecipients.join(', ') || 'team@example.com'}
          hint={defaultRecipients.length ? `Leave empty to use the default inbox: ${defaultRecipients.join(', ')}.` : 'Leave empty to use the default inbox from Email settings.'}/>
        {hasDates && <Toggle className="span2" label="Check that the end date is not before the start date" checked={form.checkDateOrder} onChange={checkDateOrder => update({ checkDateOrder })}/>}
      </div>
    </div>

    <div className="card">
      <h2>Automatic reply to the visitor</h2>
      <p>Optionally send the visitor a confirmation email. Use <code>{'{name}'}</code> for their name and <code>{'{siteName}'}</code> for your site title.</p>
      <div className="stack">
        <Toggle label="Send an automatic reply" checked={form.autoReply.enabled} onChange={enabled => update({ autoReply: { ...form.autoReply, enabled } })}/>
        {form.autoReply.enabled && <>
          <TextField label="Subject" value={form.autoReply.subject} max={200} onChange={subject => update({ autoReply: { ...form.autoReply, subject } })}/>
          <TextArea label="Message" rows={7} value={form.autoReply.body} max={5000} onChange={body => update({ autoReply: { ...form.autoReply, body } })}/>
        </>}
      </div>
    </div>
    <SaveBar editor={editor}/>
  </>;
}
