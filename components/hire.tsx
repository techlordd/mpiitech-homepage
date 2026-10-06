import Link from 'next/link';
import { ArrowIcon } from './illustrations';

type Use = { title: string; text: string; tone: 'blue' | 'orange' | 'green' | 'purple' | 'teal' | 'pink'; icon: React.ReactNode };

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const HIRE_USES: Use[] = [
  { title: 'Corporate training', text: 'A dedicated space for company workshops, team learning, and professional development.', tone: 'blue',
    icon: <g {...stroke}><rect x="4" y="8" width="20" height="14" rx="2.5"/><path d="M10 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 14h20"/></g> },
  { title: 'School training sessions', text: 'Give your learners practical computer experience and digital skills training.', tone: 'orange',
    icon: <g {...stroke}><path d="M14 5 3 10l11 5 11-5z"/><path d="M8 12.5v5c1.6 1.6 3.8 2.5 6 2.5s4.4-.9 6-2.5v-5M25 10v6"/></g> },
  { title: 'Computer-based testing', text: 'Deliver assessments using our ICT facilities and equipment, subject to your technical requirements and any approvals.', tone: 'green',
    icon: <g {...stroke}><rect x="3" y="4" width="22" height="15" rx="2"/><path d="M10 23h8M14 19v4M8 11l2.5 2.5L15 9M17 12h4"/></g> },
  { title: 'Certification programmes', text: 'Host certification training and preparation. Please discuss any technical or provider requirements.', tone: 'purple',
    icon: <g {...stroke}><circle cx="14" cy="11" r="6"/><path d="m10.5 16-2 8 5.5-3 5.5 3-2-8M11.5 11l1.8 1.8 3.2-3.3"/></g> },
  { title: 'Employee upskilling', text: 'Support professional and government employees with digital skills and workplace productivity training.', tone: 'teal',
    icon: <g {...stroke}><path d="M4 22h20M7 18v-4M12 18v-7M17 18v-5M22 18V8M6 10l5-4 5 3 6-5"/><path d="M19 4h3v3"/></g> },
  { title: 'Flexible training arrangements', text: 'Discuss one-off sessions, regular training, and suitable schedules for your group’s needs.', tone: 'pink',
    icon: <g {...stroke}><rect x="4" y="6" width="20" height="18" rx="2.5"/><path d="M4 11h20M9 3v5M19 3v5M9 16h3M16 16h3M9 20h3"/></g> }
];

export function UseIcon({ use }: { use: Use }) {
  return <span className={`use-icon use-${use.tone}`} aria-hidden="true"><svg viewBox="0 0 28 28">{use.icon}</svg></span>;
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
