import { pathwayArt, pathwayColor, type Pathway } from '@/lib/content';
import { EmailForm } from './forms';
import { ArrowIcon, MailIcon, PathwayScene } from './illustrations';

const ART_LABELS = {
  web: 'Illustration of a code editor and a web page layout',
  network: 'Illustration of network servers, Wi-Fi and a security shield',
  data: 'Illustration of charts and a Python file',
  ai: 'Illustration of an AI chip and a friendly robot',
  general: 'Illustration of an open book'
};

export default function PathwayCard({ pathway: p, index }: { pathway: Pathway; index: number }) {
  const number = String(index + 1).padStart(2, '0');
  const art = pathwayArt(p);
  const hasMore = Boolean(p.details || p.skills.some(s => s.description));
  return <article className={`path-card tone-${pathwayColor(p, index)}`} aria-labelledby={`path-${p.id}`}>
    <div className="path-top">
      <div className="path-text">
        <span className="path-num" aria-label={`Pathway ${number}`}>{number}</span>
        <h3 id={`path-${p.id}`}>{p.title}</h3>
        <p>{p.description}</p>
        {p.skills.length > 0 && <ul className="path-tags" aria-label="Skills you will learn">{p.skills.slice(0, 4).map((s, i) => <li key={i}>{s.title}</li>)}{p.skills.length > 4 && <li>+{p.skills.length - 4} more</li>}</ul>}
      </div>
      <div className={`path-art ${p.image ? 'has-photo' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
        {p.image ? <img src={p.image} alt={p.imageAlt} loading="lazy"/> : <PathwayScene name={art} label={ART_LABELS[art]}/>}
      </div>
    </div>
    {hasMore && <details className="path-more">
      <summary className="path-button">Explore the skills<span className="pill-arrow"><ArrowIcon/></span></summary>
      <div className="path-panel">
        {p.details && <p>{p.details}</p>}
        {p.skills.length > 0 && <ol>{p.skills.map((s, i) => <li key={i}><b>{s.title}</b>{s.description && <span>{s.description}</span>}</li>)}</ol>}
      </div>
    </details>}
    {p.notify && <div className="notify-box path-notify"><span className="notify-icon"><MailIcon/></span><EmailForm kind="programme" programme={p.title}/></div>}
  </article>;
}
