import Link from 'next/link';
import { ArrowIcon } from './illustrations';

type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';
type Use = { title: string; text: string; tone: Tone; icon: React.ReactNode; watermark: React.ReactNode };

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const thin = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const HIRE_USES: Use[] = [
  { title: 'Corporate training', text: 'A dedicated space for company workshops, team learning, and professional development.', tone: 'blue',
    icon: <g {...stroke}><rect x="4" y="8" width="20" height="14" rx="2.5"/><path d="M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 14h20"/></g>,
    watermark: <g {...thin}><rect x="44" y="10" width="50" height="34" rx="3"/><path d="M52 34l10-10 8 6 14-12"/><circle cx="30" cy="22" r="7"/><path d="M18 56c0-10 5-17 12-17 5 0 9 3 11 8l12-9"/><circle cx="20" cy="74" r="6"/><circle cx="44" cy="74" r="6"/><circle cx="68" cy="74" r="6"/><path d="M10 94c0-7 4-12 10-12s10 5 10 12M34 94c0-7 4-12 10-12s10 5 10 12M58 94c0-7 4-12 10-12s10 5 10 12"/></g> },
  { title: 'School training sessions', text: 'Give your learners practical computer experience and digital skills training.', tone: 'orange',
    icon: <g {...stroke}><path d="M14 5 3 10l11 5 11-5z"/><path d="M8 12.5v5c1.6 1.6 3.8 2.5 6 2.5s4.4-.9 6-2.5v-5M25 10v6"/></g>,
    watermark: <g {...thin}><rect x="34" y="12" width="40" height="28" rx="3"/><path d="M54 40v8M44 48h20"/><path d="M12 62h76M20 62v30M80 62v30"/><path d="M26 92V78a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v14M54 92V78a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v14"/></g> },
  { title: 'Computer-based testing', text: 'Deliver assessments using our ICT facilities and equipment, subject to your technical requirements and any approvals.', tone: 'green',
    icon: <g {...stroke}><rect x="3" y="4" width="22" height="15" rx="2"/><path d="M10 23h8M14 19v4M8 11l2.5 2.5L15 9M17 12h4"/></g>,
    watermark: <g {...thin}><rect x="10" y="10" width="80" height="56" rx="5"/><path d="M40 82h20M50 66v16"/><path d="M24 26l4 4 7-8M42 27h30M24 42l4 4 7-8M42 43h24M42 55h18"/></g> },
  { title: 'Certification programmes', text: 'Host certification training and preparation. Please discuss any technical or provider requirements.', tone: 'purple',
    icon: <g {...stroke}><circle cx="14" cy="11" r="6"/><path d="m10.5 16-2 8 5.5-3 5.5 3-2-8M11.5 11l1.8 1.8 3.2-3.3"/></g>,
    watermark: <g {...thin}><rect x="8" y="14" width="84" height="58" rx="4"/><rect x="14" y="20" width="72" height="46" rx="2"/><path d="M28 34h44M34 44h32"/><circle cx="70" cy="66" r="10"/><path d="M64 74l-3 16 9-5 9 5-3-16"/></g> },
  { title: 'Employee upskilling', text: 'Support professional and government employees with digital skills and workplace productivity training.', tone: 'teal',
    icon: <g {...stroke}><path d="M4 22h20M7 18v-4M12 18v-7M17 18v-5M22 18V8M6 10l5-4 5 3 6-5"/><path d="M19 4h3v3"/></g>,
    watermark: <g {...thin}><path d="M10 92h80"/><rect x="16" y="64" width="12" height="22" rx="2"/><rect x="36" y="50" width="12" height="36" rx="2"/><rect x="56" y="38" width="12" height="48" rx="2"/><rect x="76" y="20" width="12" height="66" rx="2"/><path d="M14 46 38 30l18 8 28-26M74 12h10v10"/></g> },
  { title: 'Flexible training arrangements', text: 'Discuss one-off sessions, regular training, and suitable schedules for your group’s needs.', tone: 'pink',
    icon: <g {...stroke}><rect x="4" y="6" width="20" height="18" rx="2.5"/><path d="M4 11h20M9 3v5M19 3v5M9 16h3M16 16h3M9 20h3"/></g>,
    watermark: <g {...thin}><rect x="8" y="16" width="70" height="62" rx="6"/><path d="M8 32h70M24 8v14M62 8v14M20 46h8M38 46h8M56 46h8M20 60h8M38 60h8"/><circle cx="76" cy="76" r="16"/><path d="M76 68v8l6 4"/></g> }
];

export function UseIcon({ use }: { use: Use }) {
  return <span className={`use-icon use-${use.tone}`} aria-hidden="true"><svg viewBox="0 0 28 28">{use.icon}</svg></span>;
}

/** A use card that opens the enquiry form with this use preselected. */
export function UseCard({ use: u }: { use: Use }) {
  return <li className={`use-card use-card-${u.tone}`}>
    <span className="use-watermark" aria-hidden="true"><svg viewBox="0 0 100 100">{u.watermark}</svg></span>
    <UseIcon use={u}/>
    <h3><Link href={`/hire-the-center?use=${encodeURIComponent(u.title)}#enquiry`}>{u.title}</Link></h3>
    <p>{u.text}</p>
    <span className="use-arrow" aria-hidden="true"><ArrowIcon/></span>
  </li>;
}

/** Compact center hire summary for the home page; the full details and form live on /hire-the-center. */
export function HireTeaser({ siteName }: { siteName: string }) {
  return <section id="hire" className="section hire-teaser-section"><div className="wrap">
    <div className="hire-teaser">
      <div className="hire-teaser-text">
        <span className="eyebrow">A space for your organisation</span>
        <h2>Your training.<br/><em>Our center.</em></h2>
        <p>Hire the {siteName} center for organised training, assessments, and workforce development in Modakeke. Tell us what you need and the team will confirm availability, suitability, and pricing.</p>
        <div className="hire-teaser-actions">
          <Link className="pill-button" href="/hire-the-center#enquiry">Enquire about center hire<span className="pill-arrow"><ArrowIcon/></span></Link>
          <Link className="hire-more" href="/hire-the-center">See how it works</Link>
        </div>
      </div>
      <ul className="hire-uses" aria-label="What organisations use the center for">
        {HIRE_USES.map(u => <li key={u.title}><UseIcon use={u}/>{u.title}</li>)}
      </ul>
    </div>
  </div></section>;
}
