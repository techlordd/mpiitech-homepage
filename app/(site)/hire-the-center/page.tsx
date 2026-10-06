import type { Metadata } from 'next';
import Link from 'next/link';
import { DynamicForm } from '@/components/forms';
import { HIRE_USES, UseIcon } from '@/components/hire';
import { ArrowIcon } from '@/components/illustrations';
import { pageMetadata } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent(), 'hire', '/hire-the-center');
}

const steps = [
  ['Send your enquiry', 'Tell us about your group, preferred dates, equipment, and any assessment requirements.'],
  ['We confirm the details', 'The team checks availability and suitability, then shares the arrangements and pricing.'],
  ['Book and train', 'Once you agree the arrangements, your booking is confirmed and the center is ready for your group.']
];
const checklist = ['Your organisation and a contact person', 'Type of training or assessment', 'Number of participants', 'Preferred dates and session times', 'Computers and other equipment needed', 'Your budget range (optional)'];

export default async function HirePage() {
  const content = await getContent();
  const { contact, branding } = content;
  const whatsapp = contact.whatsapp.replace(/[^\d]/g, '');
  return <main id="hire-the-center">
    <section className="page-hero hire-hero"><div className="wrap">
      <span className="eyebrow">Hire the center</span>
      <h1>Your training. <em>Our center.</em></h1>
      <p>Hire the {branding.siteName} center in Modakeke for organised training, assessments, and workforce development. Tell us what you need and we’ll confirm availability, suitability, and pricing before anything is booked.</p>
      <div className="hire-hero-actions">
        <a className="pill-button" href="#enquiry">Start your enquiry<span className="pill-arrow"><ArrowIcon/></span></a>
        <Link className="hire-hero-link" href="/contact">Ask a question first</Link>
      </div>
    </div></section>

    <section className="section pale" id="uses"><div className="wrap">
      <div className="hire-section-head"><span className="eyebrow">What you can use it for</span><h2>A training space for every kind of group.</h2></div>
      <ul className="use-cards">{HIRE_USES.map(u => <li key={u.title} className={`use-card use-card-${u.tone}`}><UseIcon use={u}/><h3>{u.title}</h3><p>{u.text}</p></li>)}</ul>
    </div></section>

    <section className="section"><div className="wrap">
      <div className="hire-section-head"><span className="eyebrow">How it works</span><h2>From enquiry to training day.</h2></div>
      <ol className="hire-steps">{steps.map(([title, text], i) => <li key={title}><span>{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
    </div></section>

    <section className="section pale" id="enquiry"><div className="wrap hire-form-layout">
      <aside className="hire-aside">
        <div className="card hire-aside-card">
          <h2>What to include</h2>
          <p>The more we know, the faster we can confirm your booking.</p>
          <ul className="hire-checklist">{checklist.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className="card hire-aside-card">
          <h2>Prefer to talk first?</h2>
          <ul className="hire-contact">
            {contact.phone && <li><span>Call</span><a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a></li>}
            {whatsapp && <li><span>WhatsApp</span><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">{contact.whatsapp}</a></li>}
            {contact.email && <li><span>Email</span><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
            <li><span>Message us</span><Link href="/contact">Use the contact form</Link></li>
          </ul>
        </div>
      </aside>
      <DynamicForm def={content.forms.enquiry}/>
    </div></section>
  </main>;
}
