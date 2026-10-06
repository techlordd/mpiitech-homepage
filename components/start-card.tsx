import { skillIcon, type Pathway } from '@/lib/content';
import { EmailForm } from './forms';
import { ArrowIcon, CapIcon, FoundationsIllustration, MailIcon, SkillIcon } from './illustrations';

/** The large “Start here” card for a featured pathway. */
export default function StartCard({ pathway: p }: { pathway: Pathway }) {
  const headline = (p.headline || p.title).trim();
  const split = headline.lastIndexOf(' ');
  const lead = split > 0 ? headline.slice(0, split + 1) : '';
  const last = split > 0 ? headline.slice(split + 1) : headline;
  const titleId = `start-${p.id}`;
  return <article className="start-card" aria-labelledby={titleId}>
    <div className="start-intro">
      <span className="start-pill"><CapIcon/>Start here</span>
      <span className="start-kicker">{p.title}</span>
      <h3 id={titleId}>{lead}<span className="squiggle">{last}<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c40-7 90-9 194-4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></span></h3>
      <p className="start-lede">{p.description}</p>
      {p.details && <p className="start-details">{p.details}</p>}
      <a className="pill-button" href="#apply">Check available programmes<span className="pill-arrow"><ArrowIcon/></span></a>
      {p.notify && <div className="notify-box"><span className="notify-icon"><MailIcon/></span><EmailForm kind="programme" programme={p.title} label="Get notified about the next intake"/></div>}
    </div>
    <div className={`start-media ${p.image ? 'has-photo' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
      {p.image ? <img src={p.image} alt={p.imageAlt} loading="lazy"/> : <FoundationsIllustration/>}
    </div>
    {p.skills.length > 0 && <div className="start-skills">
      <h4 className="sr-only">What you will learn</h4>
      <ol className="skill-cards">{p.skills.map((s, i) => <li key={`${s.title}-${i}`} className={`skill-card tone-${i % 4}`}>
        <span className="skill-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <SkillIcon name={skillIcon(s)} className="skill-icon"/>
        <h5>{s.title}</h5>
        {s.description && <p>{s.description}</p>}
      </li>)}</ol>
    </div>}
  </article>;
}
