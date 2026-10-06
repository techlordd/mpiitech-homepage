import { ArrowIcon } from './illustrations';
import { portalPage } from '@/lib/content';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const steps = [
  { title: 'Explore your options', text: 'Choose the training path that matches your interests and experience.', tone: 'orange',
    icon: <g {...stroke}><circle cx="12.5" cy="12.5" r="7.5"/><path d="m18 18 6 6M9.5 12.5h6M12.5 9.5v6"/></g> },
  { title: 'Check the next intake', text: 'Visit the application portal for current programme information.', tone: 'blue',
    icon: <g {...stroke}><rect x="4" y="6" width="20" height="18" rx="2.5"/><path d="M4 11h20M9 3v5M19 3v5M9.5 17.5l2.5 2.5 5-5"/></g> },
  { title: 'Submit your application', text: 'Follow the portal instructions and provide your details.', tone: 'green',
    icon: <g {...stroke}><path d="M24.5 3.5 3.5 12l8.5 3.5L15.5 24z"/><path d="m12 15.5 6-6"/></g> }
];

/** “Getting started is straightforward”: three numbered steps and the application button. */
export default function StepsSection() {
  const applyUrl = portalPage('/apply');
  return <section id="apply" className="section steps-section"><div className="wrap">
    <span className="eyebrow">Your next step</span>
    <h2>Getting started is straightforward.</h2>
    <ol className="steps">{steps.map((s, i) => <li key={s.title} className={`step step-${s.tone}`}>
      <div className="step-top">
        <span className="step-icon" aria-hidden="true"><svg viewBox="0 0 28 28">{s.icon}</svg></span>
        <span className="step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      </div>
      <h3><span className="sr-only">Step {i + 1}: </span>{s.title}</h3>
      <p>{s.text}</p>
    </li>)}</ol>
    <div className="apply-action">
      <a className="pill-button" href={applyUrl || '/contact'}>{applyUrl ? 'Open the application form' : 'Contact the center about an intake'}<span className="pill-arrow"><ArrowIcon/></span></a>
      <a className="text-link" href="#programmes">Explore programmes first</a>
    </div>
  </div></section>;
}
