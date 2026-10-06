import type { Metadata } from 'next';
import AboutSection from '@/components/about-section';
import { EmailForm } from '@/components/forms';
import { HireSection } from '@/components/hire';
import PathwayCard from '@/components/pathway-card';
import StartCard from '@/components/start-card';
import { organisationJsonLd, pageMetadata } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent(), 'home', '/');
}

const portal = process.env.NEXT_PUBLIC_PORTAL_URL;

export default async function Home() {
  const content = await getContent();
  const { branding, contact } = content;
  const pathways = content.pathways.filter(p => p.visible);
  const featured = pathways.filter(p => p.featured);
  const others = pathways.filter(p => !p.featured);
  const jsonLd = organisationJsonLd(content);
  return <main id="home">
{jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }}/>}
<section className="hero"><div className="wrap hero-grid"><div><span className="eyebrow">Modakeke, Osun State, Nigeria</span><h1>Learn digital skills.<br/><em>Build your<br/>next chapter.</em></h1><p>From your first computer lesson to a career in technology. Learn, practise, and grow at {branding.siteName}. A training space for learners, schools, and organisations.</p><div className="actions"><a className="button orange" href="#apply">Apply for a programme</a><a className="button outline" href="#programmes">Explore programmes</a></div><small>For students, aspiring professionals, and our community.</small></div>
<figure className="hero-photo">{/* eslint-disable-next-line @next/next/no-img-element -- hero can be any uploaded image */}<img src={branding.heroImageUrl} alt={branding.heroImageAlt} fetchPriority="high"/>{(branding.heroCaption || branding.heroCaptionLabel) && <figcaption><strong>{branding.heroCaption}</strong><span>{branding.heroCaptionLabel}</span></figcaption>}</figure></div></section>
<div className="benefits"><div className="wrap"><div><i>⌁</i><p><strong>Practical learning</strong><span>Build skills through doing</span></p></div><div><i>⌘</i><p><strong>Structured training</strong><span>Learn with an instructor</span></p></div><div><i>♧</i><p><strong>Community focused</strong><span>Rooted in Modakeke</span></p></div></div></div>
<section id="programmes" className="section pale"><div className="wrap"><div className="section-heading"><div><span className="eyebrow">Find your starting point</span><h2>A foundation today.<br/>More possibilities tomorrow.</h2></div><p>Start with everyday digital skills, or explore a specialist pathway. Check the application portal for available intakes, fees, and schedules.</p></div>
{featured.map(p => <StartCard key={p.id} pathway={p}/>)}
{others.length > 0 && <div className="paths">
  <div className="paths-head"><span className="eyebrow">Pathways to learning</span>
    <h2><span className="paths-spark" aria-hidden="true"/>Choose your <span className="squiggle">learning path<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 10c40-7 90-9 194-4" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg></span><span className="paths-spark right" aria-hidden="true"/></h2>
    <p>Practical, hands-on programmes designed for secondary school students and beginners. Build real skills for school, life, and future opportunities.</p></div>
  <div className="paths-grid">{others.map((p, i) => <PathwayCard key={p.id} pathway={p} index={i}/>)}</div>
</div>}
<p className="section-note">Programmes are introduced as instructors and equipment become available. No application fee is collected on this site.</p></div></section>
<AboutSection siteName={branding.siteName} imageUrl={branding.aboutImageUrl} imageAlt={branding.aboutImageAlt}/>
<HireSection siteName={branding.siteName}/>
<section id="apply" className="section pale steps-section"><div className="wrap"><span className="eyebrow">Your next step</span><h2>Getting started is straightforward.</h2><div className="steps">{[['Explore your options', 'Choose the training path that matches your interests and experience.'], ['Check the next intake', 'Visit the application portal for current programme information.'], ['Submit your application', 'Follow the portal instructions and provide your details.']].map(([title, text], i) => <div key={title}><span>{i + 1}</span><div><h4>{title}</h4><p>{text}</p></div></div>)}</div><div className="apply-action"><a className="button" href={portal || '/contact'}>{portal ? 'Open application portal' : 'Contact the center about an intake'}</a></div></div></section>
<section className="section lower"><div className="wrap"><div className="portal" id="portal"><div><span className="eyebrow">Already part of {branding.siteName}?</span><h2>Your learning, in one place.</h2><p>Access the center portal for learner information, updates, and fees, as well as training and administration tools.</p></div><div><a className="button orange" href={portal || '/contact'}>{portal ? 'Sign in to the portal' : 'Contact the center'}</a><a className="portal-help" href="#faq">Need assistance?</a></div></div>
<div className="visit-grid" id="visit"><div><span className="eyebrow orange-text">Visit the center</span><h2>Find us in Modakeke.</h2><p className="address">{contact.address}</p><a className="text-link" href="/contact">Contact the team</a><span className="contact-separator"> · </span><a className="text-link" href="#about">More about {branding.siteName}</a></div><div id="faq"><span className="eyebrow">A few useful answers</span>{[['Can I start as a beginner?', 'Yes. Digital Foundations is designed for beginners and secondary school students. You can request an update when the next intake is available.'], ['Where can I find fees and start dates?', 'Check the application portal for current fees, schedules, and available intakes, or contact the center using the contact page.'], ['How do I access my existing account?', portal ? 'Use the portal sign-in button above to access your existing account.' : 'Contact the center team for the current learner portal link and help accessing your account.']].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div>
<div className="newsletter"><div><span className="eyebrow">Stay connected</span><h2>What’s next at {branding.siteName}?</h2><p>Get programme announcements, learning opportunities, and news from the center.</p></div><div><EmailForm kind="newsletter"/><small>Your email is used for the updates you select. Contact the team if you need to stop receiving them.</small></div></div></div></section></main>;
}
