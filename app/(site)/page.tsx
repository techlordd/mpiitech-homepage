import type { Metadata } from 'next';
import AboutSection from '@/components/about-section';
import { EmailForm } from '@/components/forms';
import { HireSection } from '@/components/hire';
import PathwayCard from '@/components/pathway-card';
import StartCard from '@/components/start-card';
import StepsSection from '@/components/steps-section';
import { ArrowIcon } from '@/components/illustrations';
import { organisationJsonLd, pageMetadata } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent(), 'home', '/');
}

const portal = process.env.NEXT_PUBLIC_PORTAL_URL;
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const benefits = [
  { title: 'Practical learning', text: 'Build skills through doing', tone: 'orange', icon: <g {...stroke}><rect x="4" y="6" width="20" height="13" rx="2"/><path d="M2 23h24M11 12l-2.5 2.5L11 17M17 12l2.5 2.5L17 17"/></g> },
  { title: 'Structured training', text: 'Learn with an instructor', tone: 'blue', icon: <g {...stroke}><path d="M14 5 3 10l11 5 11-5z"/><path d="M8 12.5v5c1.6 1.6 3.8 2.5 6 2.5s4.4-.9 6-2.5v-5"/></g> },
  { title: 'Community focused', text: 'Rooted in Modakeke', tone: 'green', icon: <g {...stroke}><path d="M14 24s-9-5.3-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.7-9 12-9 12z"/></g> }
];

export default async function Home() {
  const content = await getContent();
  const { branding, contact } = content;
  const pathways = content.pathways.filter(p => p.visible);
  const featured = pathways.filter(p => p.featured);
  const others = pathways.filter(p => !p.featured);
  const jsonLd = organisationJsonLd(content);
  const faqs = [
    ['Can I start as a beginner?', 'Yes. Digital Foundations is designed for beginners and secondary school students. You can request an update when the next intake is available.'],
    ['Where can I find fees and start dates?', 'Check the application portal for current fees, schedules, and available intakes, or contact the center using the contact page.'],
    ['How do I access my existing account?', portal ? 'Use the portal sign-in button above to access your existing account.' : 'Contact the center team for the current learner portal link and help accessing your account.']
  ];
  return <main id="home">
{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }}/>}
<section className="hero"><div className="wrap hero-grid"><div><span className="eyebrow">Modakeke, Osun State, Nigeria</span><h1>Learn digital skills.<br/><em>Build your<br/>next chapter.</em></h1><p>From your first computer lesson to a career in technology. Learn, practise, and grow at {branding.siteName}. A training space for learners, schools, and organisations.</p><div className="actions"><a className="pill-button" href="#apply">Apply for a programme<span className="pill-arrow"><ArrowIcon/></span></a><a className="ghost-button" href="#programmes">Explore programmes</a></div><small>For students, aspiring professionals, and our community.</small></div>
<figure className="hero-photo">{/* eslint-disable-next-line @next/next/no-img-element -- hero can be any uploaded image */}<img src={branding.heroImageUrl} alt={branding.heroImageAlt} fetchPriority="high"/>{(branding.heroCaption || branding.heroCaptionLabel) && <figcaption><strong>{branding.heroCaption}</strong><span>{branding.heroCaptionLabel}</span></figcaption>}</figure></div></section>
<div className="benefits"><ul className="wrap">{benefits.map(x => <li key={x.title} className={`benefit tone-${x.tone}`}><span className="benefit-icon" aria-hidden="true"><svg viewBox="0 0 28 28">{x.icon}</svg></span><p><strong>{x.title}</strong><span>{x.text}</span></p></li>)}</ul></div>
<section id="programmes" className="section pale"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Find your starting point</span><h2>A foundation today.<br/>More possibilities tomorrow.</h2></div><p>Start with everyday digital skills, or explore a specialist pathway. Check the application portal for available intakes, fees, and schedules.</p></div>
{featured.map(p => <StartCard key={p.id} pathway={p}/>)}
{others.length > 0 && <div className="paths">
  <div className="paths-head"><span className="eyebrow">Pathways to learning</span>
    <h2><span className="paths-spark" aria-hidden="true"/>Choose your <span className="squiggle">learning path<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c40-7 90-9 194-4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></span><span className="paths-spark right" aria-hidden="true"/></h2>
    <p>Practical, hands-on programmes designed for secondary school students and beginners. Build real skills for school, life, and future opportunities.</p></div>
  <div className="paths-grid">{others.map((p, i) => <PathwayCard key={p.id} pathway={p} index={i}/>)}</div>
</div>}
<p className="section-note">Programmes are introduced as instructors and equipment become available. No application fee is collected on this site.</p></div></section>
<AboutSection siteName={branding.siteName}/>
<HireSection siteName={branding.siteName}/>
<StepsSection portalUrl={portal}/>
<section className="section pale lower" aria-label="Portal, visit and newsletter"><div className="wrap">
<div className="portal" id="portal"><div><span className="eyebrow">Already part of {branding.siteName}?</span><h2>Your learning, in one place.</h2><p>Access the center portal for learner information, updates, and fees, as well as training and administration tools.</p></div><div className="portal-actions"><a className="pill-button" href={portal || '/contact'}>{portal ? 'Sign in to the portal' : 'Contact the center'}<span className="pill-arrow"><ArrowIcon/></span></a><a className="portal-help" href="#faq">Need assistance?</a></div></div>
<div className="visit-grid">
  <div className="visit-card" id="visit"><span className="eyebrow">Visit the center</span><h2>Find us in Modakeke.</h2>
    <p className="visit-address"><span className="visit-pin" aria-hidden="true"><svg viewBox="0 0 28 28"><path d="M14 3c-5 0-9 4-9 9 0 6.5 9 13 9 13s9-6.5 9-13c0-5-4-9-9-9z" fill="currentColor"/><circle cx="14" cy="12" r="3.4" fill="#fff"/></svg></span><span className="address">{contact.address}</span></p>
    <div className="visit-links"><a className="pill-button" href="/contact">Contact the team<span className="pill-arrow"><ArrowIcon/></span></a><a className="text-link" href="#about">More about {branding.siteName}</a></div></div>
  <div className="faq" id="faq"><span className="eyebrow">A few useful answers</span><h2>Questions, answered.</h2>{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
</div>
<div className="newsletter"><div><span className="eyebrow">Stay connected</span><h2>What’s next at {branding.siteName}?</h2><p>Get programme announcements, learning opportunities, and news from the center.</p></div><div><EmailForm kind="newsletter"/><small>Your email is used for the updates you select. Contact the team if you need to stop receiving them.</small></div></div>
</div></section></main>;
}
