import Link from 'next/link';
import { ArrowIcon } from './illustrations';

type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal';
type Use = { title: string; text: string; tone: Tone; icon: React.ReactNode; watermark: React.ReactNode };

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const thin = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const HIRE_USES: Use[] = [
  { title: 'Corporate training', text: 'A dedicated space for company workshops, team learning, and professional development.', tone: 'blue',
    icon: <g {...stroke}><circle cx="14" cy="9" r="3.5"/><circle cx="6.5" cy="11" r="2.6"/><circle cx="21.5" cy="11" r="2.6"/><path d="M8 22c0-4 2.7-7 6-7s6 3 6 7M2.5 21c0-3 1.7-5 4-5 1 0 1.9.3 2.6.9M25.5 21c0-3-1.7-5-4-5-1 0-1.9.3-2.6.9"/></g>,
    watermark: <g {...thin}><rect x="44" y="10" width="50" height="34" rx="3"/><path d="M52 34l10-10 8 6 14-12"/><circle cx="30" cy="22" r="7"/><path d="M18 56c0-10 5-17 12-17 5 0 9 3 11 8l12-9"/><circle cx="20" cy="74" r="6"/><circle cx="44" cy="74" r="6"/><circle cx="68" cy="74" r="6"/><path d="M10 94c0-7 4-12 10-12s10 5 10 12M34 94c0-7 4-12 10-12s10 5 10 12M58 94c0-7 4-12 10-12s10 5 10 12"/></g> },
  { title: 'School training sessions', text: 'Give your learners practical computer experience and digital skills training.', tone: 'green',
    icon: <g {...stroke}><path d="M14 5 3 10l11 5 11-5z"/><path d="M8 12.5v5c1.6 1.6 3.8 2.5 6 2.5s4.4-.9 6-2.5v-5M25 10v6"/></g>,
    watermark: <g {...thin}><rect x="34" y="12" width="40" height="28" rx="3"/><path d="M54 40v8M44 48h20"/><path d="M12 62h76M20 62v30M80 62v30"/><path d="M26 92V78a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v14M54 92V78a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v14"/></g> },
  { title: 'Computer-based testing', text: 'Deliver assessments using our ICT facilities and equipment, subject to your technical requirements and any approvals.', tone: 'purple',
    icon: <g {...stroke}><path d="M7 3h10l5 5v17H7z"/><path d="M17 3v5h5M10.5 13h8M10.5 17h8M10.5 21h5"/></g>,
    watermark: <g {...thin}><rect x="10" y="10" width="80" height="56" rx="5"/><path d="M40 82h20M50 66v16"/><path d="M24 26l4 4 7-8M42 27h30M24 42l4 4 7-8M42 43h24M42 55h18"/></g> },
  { title: 'Certification programmes', text: 'Host certification training and preparation. Please discuss any technical or provider requirements.', tone: 'orange',
    icon: <g {...stroke}><circle cx="14" cy="11" r="6"/><path d="m10.5 16-2 8 5.5-3 5.5 3-2-8M11.5 11l1.8 1.8 3.2-3.3"/></g>,
    watermark: <g {...thin}><rect x="8" y="14" width="84" height="58" rx="4"/><rect x="14" y="20" width="72" height="46" rx="2"/><path d="M28 34h44M34 44h32"/><circle cx="70" cy="66" r="10"/><path d="M64 74l-3 16 9-5 9 5-3-16"/></g> },
  { title: 'Employee upskilling', text: 'Support professional and government employees with digital skills and workplace productivity training.', tone: 'pink',
    icon: <g {...stroke}><path d="M4 23h20M7 19v-4M12 19v-7M17 19v-5M22 19V9M6 11l5-4 5 3 6-5"/><path d="M19 5h3v3"/></g>,
    watermark: <g {...thin}><path d="M10 92h80"/><rect x="16" y="64" width="12" height="22" rx="2"/><rect x="36" y="50" width="12" height="36" rx="2"/><rect x="56" y="38" width="12" height="48" rx="2"/><rect x="76" y="20" width="12" height="66" rx="2"/><path d="M14 46 38 30l18 8 28-26M74 12h10v10"/></g> },
  { title: 'Flexible training arrangements', text: 'Discuss one-off sessions, regular training, and suitable schedules for your group’s needs.', tone: 'teal',
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

/** Default artwork: a ready training room (no people), replaced by an uploaded photo when set. */
export function TrainingRoomIllustration() {
  return <svg className="hire-art-svg" viewBox="0 0 440 320" role="img" aria-label="Illustration of a computer training room with a whiteboard and desks">
    <path d="M30 150c10-90 120-130 230-110s190 80 170 170-110 120-240 106S20 240 30 150z" fill="#e3effd"/>
    <circle cx="96" cy="96" r="58" fill="#ffd9b3"/>
    <g stroke="#ff861f" strokeWidth="7" strokeLinecap="round"><path d="M34 70 50 84M22 104l20 2M60 40l4 20"/></g>
    <rect x="128" y="44" width="200" height="112" rx="10" fill="#fff" stroke="#d6e0eb" strokeWidth="3"/>
    <rect x="128" y="44" width="200" height="16" rx="8" fill="#1f3a5f"/>
    <path d="M150 132l32-30 26 18 40-42 30 22" stroke="#2563eb" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="150" y="72" width="54" height="8" rx="4" fill="#ff861f"/><rect x="260" y="118" width="48" height="7" rx="3.5" fill="#cfd9e5"/>
    <path d="M200 156v14M256 156v14" stroke="#9fb0c3" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="372" cy="70" r="20" fill="#fff" stroke="#d6e0eb" strokeWidth="3"/><path d="M372 58v12l8 5" stroke="#1f3a5f" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <rect x="40" y="226" width="360" height="12" rx="6" fill="#33475f"/>
    <path d="M60 238v52M380 238v52" stroke="#33475f" strokeWidth="8" strokeLinecap="round"/>
    {[70, 170, 270].map((x, i) => <g key={x}>
      <rect x={x} y="168" width="96" height="58" rx="7" fill="#1d2b44"/>
      <rect x={x + 6} y="174" width="84" height="44" rx="3" fill={['#4aa3ff', '#4fd17c', '#a78bfa'][i]}/>
      <rect x={x + 14} y="184" width="40" height="6" rx="3" fill="#fff" opacity=".85"/><rect x={x + 14} y="196" width="58" height="5" rx="2.5" fill="#fff" opacity=".5"/>
      <rect x={x + 40} y="226" width="16" height="4" fill="#1d2b44"/>
    </g>)}
    {[[86, '#16a34a'], [186, '#ff861f'], [286, '#2563eb']].map(([x, c]) => <g key={x as number}>
      <rect x={x as number} y="250" width="64" height="44" rx="14" fill={c as string}/>
      <rect x={(x as number) + 10} y="294" width="44" height="10" rx="5" fill={c as string} opacity=".7"/>
    </g>)}
    <path d="M410 300c0-30-10-56-24-62M410 300c0-24 10-44 22-50M404 300c-6-24-22-40-36-42" stroke="#16a34a" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <rect x="392" y="292" width="34" height="26" rx="6" fill="#ff861f"/>
    <g className="art-float"><rect x="296" y="10" width="132" height="40" rx="14" fill="#fff" stroke="#e1e8f0"/>
      <circle cx="318" cy="30" r="11" fill="#1f9d5c"/><path d="M312.5 30l4 4 7-7.5" stroke="#fff" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="336" y="27" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#0c2338">Room ready</text>
      <text x="336" y="41" fontFamily="Arial, sans-serif" fontSize="9.5" fill="#61758a">for your session</text></g>
  </svg>;
}

const needs = [
  ['Preferred dates', 'Choose when it works for you', <g key="d" {...stroke}><rect x="4" y="6" width="20" height="18" rx="2.5"/><path d="M4 11h20M9 3v5M19 3v5"/></g>],
  ['Group size', 'Small or large groups', <g key="g" {...stroke}><circle cx="10" cy="10" r="3.5"/><circle cx="19" cy="11" r="2.8"/><path d="M3.5 22c0-4 2.9-7 6.5-7s6.5 3 6.5 7M17 16.3c3.4-.6 6.5 1.8 6.5 5.7"/></g>],
  ['Equipment needs', 'We’ll confirm suitability', <g key="e" {...stroke}><circle cx="14" cy="14" r="4"/><path d="M14 3v3M14 22v3M3 14h3M22 14h3M6.2 6.2l2.1 2.1M19.7 19.7l2.1 2.1M6.2 21.8l2.1-2.1M19.7 8.3l2.1-2.1"/></g>]
] as const;

/** Home page center hire section. The full details and form live on /hire-the-center. */
export function HireSection({ siteName, imageUrl, imageAlt }: { siteName: string; imageUrl: string; imageAlt: string }) {
  return <section id="hire" className="section hire-section"><div className="wrap">
    <div className="hire-layout">
      <div className="hire-intro"><div className="hire-copy">
        <span className="eyebrow hire-eyebrow">A space for your organisation</span>
        <h2>Your training.<br/><em>Our <span className="squiggle">center.<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c40-7 90-9 194-4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></span></em></h2>
        <p>Hire the {siteName} center for organised training, assessments, and workforce development in Modakeke.</p>
        </div>
        <div className={`hire-art ${imageUrl ? 'has-photo' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
          {imageUrl ? <img src={imageUrl} alt={imageAlt} loading="lazy"/> : <TrainingRoomIllustration/>}
        </div>
      </div>
      <ul className="use-cards">{HIRE_USES.map(u => <UseCard key={u.title} use={u}/>)}</ul>
    </div>
    <div className="needs-bar">
      <div className="needs-lead">
        <span className="needs-icon" aria-hidden="true"><svg viewBox="0 0 28 28"><g {...stroke}><path d="M5 5h18a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H12l-6 5v-5H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M9 11h10M9 15h6"/></g></svg></span>
        <div><b>Tell us your needs</b><span>Share your preferred dates, group size, equipment, and assessment needs. Our team will confirm availability, suitability, and pricing.</span></div>
      </div>
      <ul className="needs-list">{needs.map(([title, text, icon]) => <li key={title}><span aria-hidden="true"><svg viewBox="0 0 28 28">{icon}</svg></span><div><b>{title}</b><small>{text}</small></div></li>)}</ul>
      <Link className="pill-button needs-cta" href="/hire-the-center#enquiry">Enquire about center hire<span className="pill-arrow"><ArrowIcon/></span></Link>
    </div>
  </div></section>;
}
