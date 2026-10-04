'use client';
import type { ContactInfo } from '@/lib/content';
import { saveContact } from '../../actions';
import { SaveBar, TextArea, TextField, Toggle, useEditor } from '../../ui';

export default function ContactEditor({ initial }: { initial: ContactInfo }) {
  const editor = useEditor(initial, saveContact);
  const { value: c, update } = editor;
  return <>
    <div className="card">
      <h2>Page heading</h2>
      <p>The banner at the top of the page.</p>
      <div className="grid2">
        <TextField label="Small heading" value={c.eyebrow} max={80} onChange={eyebrow => update({ eyebrow })}/>
        <TextField label="Heading" value={c.heading} max={160} onChange={heading => update({ heading })}/>
        <TextArea className="span2" label="Introduction" value={c.intro} max={600} onChange={intro => update({ intro })}/>
      </div>
    </div>
    <div className="card">
      <h2>Contact details</h2>
      <p>Leave a field empty to hide it.</p>
      <div className="grid2">
        <TextArea label="Address" rows={4} value={c.address} max={500} onChange={address => update({ address })} hint="Line breaks are kept."/>
        <TextArea label="Opening hours" rows={4} value={c.hours} max={500} onChange={hours => update({ hours })}/>
        <TextField label="Phone" value={c.phone} max={60} onChange={phone => update({ phone })} placeholder="+234 …"/>
        <TextField label="WhatsApp number" value={c.whatsapp} max={60} onChange={whatsapp => update({ whatsapp })} placeholder="+234 …" hint="Include the country code. Opens a WhatsApp chat."/>
        <TextField label="Email address" value={c.email} max={254} onChange={email => update({ email })} placeholder="hello@mpiitech.com"/>
      </div>
    </div>
    <div className="card">
      <h2>Map</h2>
      <div className="stack">
        <Toggle label="Show a map" hint="By default the map searches for the address above." checked={c.showMap} onChange={showMap => update({ showMap })}/>
        {c.showMap && <TextArea label="Custom Google Maps embed (optional)" rows={2} value={c.mapEmbedUrl} max={3000} onChange={mapEmbedUrl => update({ mapEmbedUrl })}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=…"></iframe>' hint="In Google Maps: Share → Embed a map → Copy HTML, then paste it here for an exact pin."/>}
      </div>
    </div>
    <SaveBar editor={editor}/>
  </>;
}
