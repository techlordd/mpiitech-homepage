import { applyLink, skillIcon, type Pathway } from '@/lib/content';
import { CardActions, NotifyButton } from './card-actions';
import { StatusBadge } from './pathway-card';
import { ArrowIcon, CapIcon, FoundationsIllustration, SkillIcon } from './illustrations';

/** The large “Start here” card for a featured pathway. */
export default function StartCard({ pathway: p }: { pathway: Pathway }) {
  const title = p.title.trim();
  const split = title.lastIndexOf(' ');
  const lead = split > 0 ? title.slice(0, split + 1) : '';
  const last = split > 0 ? title.slice(split + 1) : title;
  const titleId = `start-${p.id}`;
  const hasPanel = Boolean(p.details || p.skills.length);
  return <article className={`start-card ${p.active ? 'is-active' : ''}`} aria-labelledby={titleId}>
    <div className="start-intro">
      <div className="start-badges"><span className="start-pill"><CapIcon/>Start here</span><StatusBadge active={p.active}/></div>
      <h3 id={titleId}>{lead}<span className="squiggle">{last}<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c40-7 90-9 194-4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></span></h3>
      <p className="start-lede">{p.description}</p>
    </div>
    <div className={`start-media ${p.image ? 'has-photo' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
      {p.image ? <img src={p.image} alt={p.imageAlt} loading="lazy"/> : <FoundationsIllustration/>}
    </div>
    <CardActions className="start-actions" panelClassName="start-panel"
      leading={p.active && <a className="pill-button" href={applyLink(p)}>Apply now<span className="pill-arrow"><ArrowIcon/></span></a>}
      trailing={!p.active && p.notify && <NotifyButton programme={p.title}/>}
      panel={hasPanel && <>
        {p.details && <p className="start-details">{p.details}</p>}
        {p.skills.length > 0 && <ol className="skill-cards" aria-label="What you will learn">{p.skills.map((s, i) => <li key={`${s.title}-${i}`} className={`skill-card tone-${i % 4}`} tabIndex={s.description ? 0 : undefined}>
          <span className="skill-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <SkillIcon name={skillIcon(s)} className="skill-icon"/>
          <h4>{s.title}</h4>
          {s.description && <>
            <span className="reveal-hint" aria-hidden="true">Hover for details</span>
            {/* On a mouse, this slides over the card on hover; on touch screens it shows below the title. */}
            <div className="skill-more"><b aria-hidden="true">{s.title}</b><p>{s.description}</p></div>
          </>}
        </li>)}</ol>}
      </>}/>
  </article>;
}
