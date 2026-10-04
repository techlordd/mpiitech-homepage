'use client';
import { useState, type FormEvent } from 'react';

type Kind = 'enquiry' | 'programme' | 'newsletter';
export function EmailForm({ kind, programme }: {kind: Exclude<Kind,'enquiry'>; programme?: string}) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true); setStatus('');
    try {
      const response = await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data, kind, programme, submissionId:crypto.randomUUID()})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send. Please try again.');
      setStatus(kind === 'newsletter' ? 'Thank you! Your newsletter request has been received.' : 'Thank you! We have received your request for programme updates.');
      form.reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to send. Please try again.'); }
    finally { setBusy(false); }
  }
  return <form className="email-form" onSubmit={submit}>
    <label className="email-label" htmlFor={`email-${programme || kind}`}>{kind === 'newsletter' ? 'Subscribe to our newsletter' : programme === 'Digital Foundations' ? 'Get notified about the next intake' : 'Email me when this programme starts'}</label>
    <div className="email-row"><input id={`email-${programme || kind}`} type="email" name="email" placeholder="Your email address" required maxLength={254}/><button disabled={busy} type="submit">{busy ? 'Sending…' : kind === 'newsletter' ? 'Subscribe' : 'Notify me'}</button></div>
    <label className="check"><input type="checkbox" name="consent" value="yes" required/> <span>I agree to receive email updates {kind === 'newsletter' ? 'and newsletters' : 'about this programme'}.</span></label>
    <div className="trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {status && <p className="form-status" role="status">{status}</p>}
  </form>;
}
const arrangements = ['Single session','Multiple sessions','Weekly programme','Other'];
export function EnquiryForm() {
  const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget; const data=Object.fromEntries(new FormData(form));
    setBusy(true); setStatus('');
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,kind:'enquiry',submissionId:crypto.randomUUID()})});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error || 'Unable to submit. Please try again.');
      setStatus('Thank you! Your enquiry has been received. The MPIITECH team will contact you to discuss availability and next steps.'); form.reset();
    } catch(error) {setStatus(error instanceof Error?error.message:'Unable to submit. Please try again.');} finally {setBusy(false);}
  }
  return <form className="enquiry-form" onSubmit={submit}>
    <span className="eyebrow">Tell us what you need</span><h3>Enquire about center hire</h3>
    <p>Share a few details about your training or assessment. Tell us what you need, then we’ll confirm the capacity, arrangements, and pricing before a booking is agreed.</p>
    <fieldset><legend>1. Your organisation and contact</legend><div className="form-grid">
      <Field label="Organisation / school name" name="organisation" required/><Field label="Contact person" name="name" required/>
      <Field label="Email address" name="email" type="email" required/><Field label="Phone / WhatsApp number" name="phone" type="tel" placeholder="e.g. +234…" required/>
    </div></fieldset>
    <fieldset><legend>2. What will you use the center for?</legend>
      <label className="field">Training or assessment type <b>*</b><select name="purpose" required defaultValue=""><option value="" disabled>Select a use</option>{['Corporate training','School training sessions','Computer-based testing','Certification programmes','Employee upskilling','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
      <Field label="Training topic / assessment name" name="topic" placeholder="Tell us the subject or programme" required/>
    </fieldset>
    <fieldset><legend>3. Group size and timing</legend><div className="form-grid">
      <Field label="Number of participants" name="participants" type="number" required/><Field label="Preferred session times" name="times" placeholder="e.g. 9am–3pm, three Saturdays"/>
      <Field label="Preferred start date" name="startDate" type="date" required/><Field label="Preferred end date" name="endDate" type="date" required/>
    </div><small>Attendance limit: Capacity will be confirmed by the team.</small><label className="check"><input type="checkbox" name="flexibleDates" value="yes"/> <span>My dates and/or session times are flexible.</span></label></fieldset>
    <fieldset><legend>4. Equipment and support</legend><div className="form-grid">
      <label className="field">What support do you need? <b>*</b><select name="support" required defaultValue=""><option disabled value="">Select an arrangement</option>{arrangements.map(x=><option key={x}>{x}</option>)}</select></label>
      <Field label="Computer systems required" name="computers" type="number"/>
    </div><small>Enter 0 if you will bring your own computers.</small>
    <label className="field">Other equipment / access needs (optional)<textarea name="equipment" placeholder="e.g. projector, sound system, internet, specific software, accessibility requirements" maxLength={2000}/></label>
    <div className="half"><Field label="Budget range in NGN" name="budget" placeholder="e.g. ₦100,000–₦150,000 (optional)"/></div>
    <label className="field">Anything else we should know? (optional)<textarea name="notes" placeholder="Learning goals, frequency, deadlines, or special arrangements" maxLength={3000}/></label>
    </fieldset>
    <label className="check"><input type="checkbox" name="consent" value="yes" required/><span>I agree that MPIITECH may use these details to respond to and manage my enquiry. This does not subscribe me to the newsletter.</span></label>
    <div className="trap" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <button type="submit" disabled={busy}>{busy?'Submitting…':'Submit this enquiry'}</button>
    {status && <p role="status" className="form-status">{status}</p>}
  </form>;
}
function Field({label,name,type='text',placeholder,required=false}:{label:string;name:string;type?:string;placeholder?:string;required?:boolean}) {
  return <label className="field">{label}{required&&<b> *</b>}<input name={name} type={type} placeholder={placeholder} required={required} maxLength={type==='email'?254:200} min={type==='number'?name==='participants'?1:0:undefined} max={type==='number'?10000:undefined}/></label>;
}
