import { ArrowIcon } from './illustrations';

type Value = { title: string; text: string; tone: 'peach' | 'blue' | 'green' | 'purple'; icon: React.ReactNode; watermark: React.ReactNode };

const sparks = <svg className="value-spark" viewBox="0 0 30 30" aria-hidden="true"><g stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"><path d="M8 3 5 11M21 7l-8 8M26 19l-10 2"/></g></svg>;

const values = (siteName: string): Value[] => [
  {
    title: 'Learn by doing', text: 'Hands-on exercises and practical work help turn curiosity into skills.', tone: 'peach',
    icon: <svg viewBox="0 0 48 48"><rect x="9" y="11" width="30" height="20" rx="3" fill="#1f3a5f"/><rect x="12" y="14" width="24" height="14" rx="1.5" fill="#4aa3ff"/><path d="M12 24l9-10h6L12 28z" fill="#fff" opacity=".3"/><path d="M5 33h38l-3 5H8z" fill="#ff861f"/></svg>,
    watermark: <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M50 18a24 24 0 0 0-14 43c3 3 5 6 5 10h18c0-4 2-7 5-10a24 24 0 0 0-14-43z"/><path d="M41 78h18M44 86h12M50 6v4M22 18l3 3M78 18l-3 3M12 44h5M83 44h5"/></g></svg>
  },
  {
    title: 'A clear learning journey', text: 'Build from basic digital literacy toward more advanced technology skills.', tone: 'blue',
    icon: <svg viewBox="0 0 48 48"><rect x="8" y="26" width="7" height="12" rx="2" fill="#4aa3ff"/><rect x="18" y="19" width="7" height="19" rx="2" fill="#2563eb"/><rect x="28" y="12" width="7" height="26" rx="2" fill="#1d4ed8"/><path d="M7 40h34" stroke="#1f3a5f" strokeWidth="3" strokeLinecap="round"/><path d="M38 8v10M38 8h7l-2 3 2 3h-7" fill="#ff861f" stroke="#ff861f" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    watermark: <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 90c30 0 40-12 20-22s-12-24 20-24 30-14 18-20"/><path d="M76 24V6h14l-4 5 4 5H76"/></g></svg>
  },
  {
    title: 'Guidance that matters', text: 'Learn with instructors who explain, demonstrate, and support your progress.', tone: 'green',
    icon: <svg viewBox="0 0 48 48"><circle cx="17" cy="16" r="6" fill="#ffc53d"/><circle cx="31" cy="16" r="6" fill="#16a34a"/><path d="M6 38c0-8 5-13 11-13s11 5 11 13z" fill="#16a34a"/><path d="M20 38c0-8 5-13 11-13s11 5 11 13z" fill="#ffc53d"/></svg>,
    watermark: <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="36" y="12" width="56" height="40" rx="3"/><circle cx="22" cy="30" r="9"/><path d="M8 70c0-12 6-20 14-20 6 0 10 3 13 8l14-10"/><circle cx="56" cy="70" r="7"/><circle cx="80" cy="70" r="7"/><path d="M44 92c0-8 5-13 12-13s12 5 12 13M68 92c0-8 5-13 12-13s12 5 12 13"/></g></svg>
  },
  {
    title: 'A place to focus', text: `Use dedicated learning spaces at the ${siteName} center in Modakeke.`, tone: 'purple',
    icon: <svg viewBox="0 0 48 48"><path d="M24 4c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" fill="#7c3aed"/><circle cx="24" cy="18" r="6" fill="#fff"/></svg>,
    watermark: <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 90V50l40-24 40 24v40z"/><path d="M50 26V8h14l-4 4 4 4H50M42 90V70a8 8 0 0 1 16 0v20M20 60h10v10H20zM70 60h10v10H70z"/><circle cx="50" cy="48" r="7"/></g></svg>
  }
];

/** Flat illustration of three students sharing a laptop, used until a real photo is uploaded. */
function StudentsIllustration() {
  const skin = ['#8a5229', '#6e3c1e', '#9c5f30'];
  return <svg className="about-art-svg" viewBox="0 0 460 330" role="img" aria-label="Illustration of three smiling students working together on a laptop">
    <path d="M40 120c30-70 150-100 250-70s170 60 160 150-60 140-200 130S0 250 40 120z" fill="#e3effd"/>
    <circle cx="350" cy="110" r="70" fill="#ffd9b3"/>
    <g stroke="#ff861f" strokeWidth="7" strokeLinecap="round"><path d="M196 40l10 20M222 28l-2 24"/></g>
    <circle cx="70" cy="110" r="8" fill="#5fd38d"/><circle cx="420" cy="230" r="7" fill="#7c5cf2"/>
    {/* left student: navy hoodie */}
    <g>
      <path d="M30 330c0-70 30-100 85-100s85 30 85 100z" fill="#1e3a5f"/>
      <path d="M78 236c10 18 64 18 74 0" stroke="#162c48" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <rect x="104" y="204" width="22" height="30" rx="8" fill={skin[0]}/>
      <circle cx="115" cy="176" r="40" fill={skin[0]}/>
      <circle cx="76" cy="180" r="7" fill={skin[0]}/><circle cx="154" cy="180" r="7" fill={skin[0]}/>
      <path d="M75 172c-4-34 22-50 44-48s44 18 36 48c-6-16-22-20-40-20s-34 4-40 20z" fill="#1b1410"/>
      <circle cx="101" cy="180" r="4" fill="#1b1410"/><circle cx="129" cy="180" r="4" fill="#1b1410"/>
      <path d="M100 196q15 14 30 0z" fill="#fff" stroke="#1b1410" strokeWidth="2.5" strokeLinejoin="round"/>
    </g>
    {/* right student: blue hoodie, glasses */}
    <g>
      <path d="M262 330c0-70 30-104 88-104s88 34 88 104z" fill="#2563eb"/>
      <path d="M310 232c10 18 70 18 80 0" stroke="#1d4ed8" strokeWidth="10" fill="none" strokeLinecap="round"/>
      <rect x="339" y="198" width="22" height="30" rx="8" fill={skin[2]}/>
      <circle cx="350" cy="168" r="41" fill={skin[2]}/>
      <circle cx="310" cy="172" r="7" fill={skin[2]}/><circle cx="390" cy="172" r="7" fill={skin[2]}/>
      <path d="M309 162c-2-34 22-48 43-46s45 14 38 46c-8-14-24-18-41-18s-32 4-40 18z" fill="#1b1410"/>
      <g fill="none" stroke="#1b1410" strokeWidth="3.5"><rect x="321" y="160" width="24" height="18" rx="7"/><rect x="355" y="160" width="24" height="18" rx="7"/><path d="M345 168h10"/></g>
      <circle cx="333" cy="170" r="3.5" fill="#1b1410"/><circle cx="367" cy="170" r="3.5" fill="#1b1410"/>
      <path d="M335 189q15 14 30 0z" fill="#fff" stroke="#1b1410" strokeWidth="2.5" strokeLinejoin="round"/>
    </g>
    {/* middle student: cream sweater, braids */}
    <g>
      <path d="M140 330c0-66 32-96 92-96s92 30 92 96z" fill="#f1e7da"/>
      <path d="M200 238q32 22 64 0" stroke="#e2d4c2" strokeWidth="9" fill="none" strokeLinecap="round"/>
      <rect x="221" y="204" width="22" height="32" rx="8" fill={skin[1]}/>
      <g fill="#231812">{[0, 1, 2].map(i => <rect key={`l${i}`} x={180 + i * 9} y={170} width="8" height={86 - i * 8} rx="4"/>)}{[0, 1, 2].map(i => <rect key={`r${i}`} x={278 - i * 9} y={170} width="8" height={86 - i * 8} rx="4"/>)}</g>
      <ellipse cx="232" cy="174" rx="39" ry="42" fill={skin[1]}/>
      <path d="M192 168c0-30 18-46 40-46s40 16 40 46c-10-16-24-22-40-22s-30 6-40 22z" fill="#231812"/>
      <path d="M232 124v26M214 128l6 22M250 128l-6 22" stroke="#3a2a20" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="218" cy="178" r="4" fill="#1b1410"/><circle cx="246" cy="178" r="4" fill="#1b1410"/>
      <path d="M217 194q15 15 30 0z" fill="#fff" stroke="#1b1410" strokeWidth="2.5" strokeLinejoin="round"/>
    </g>
    {/* laptop (back of the lid) */}
    <path d="M150 262h176l14 68H136z" fill="#c9d3de"/>
    <path d="M150 262h176l3 12H147z" fill="#e3e9ef"/>
    <circle cx="238" cy="300" r="9" fill="#dfe6ed"/>
    <g className="art-float"><rect x="378" y="52" width="70" height="34" rx="12" fill="#fff" stroke="#e1e8f0"/><circle cx="396" cy="69" r="8" fill="#1f9d5c"/><path d="M392 69l3 3 5-6" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round"/><rect x="409" y="63" width="30" height="5" rx="2.5" fill="#0c2338"/><rect x="409" y="72" width="22" height="4" rx="2" fill="#cfd9e5"/></g>
  </svg>;
}

export default function AboutSection({ siteName, imageUrl, imageAlt }: { siteName: string; imageUrl: string; imageAlt: string }) {
  return <section id="about" className="section about-section">
    <div className="wrap about-layout">
      <div className="about-intro">
        <span className="eyebrow about-eyebrow">Built around our community</span>
        <h2>Technology skills.<br/><em>Opportunity close to home.</em></h2>
        <p>Founded by Modakeke Progressive International (MPI), USA &amp; Canada, {siteName} brings practical skills and community investment closer to Modakeke and surrounding communities.</p>
        <p>Our focus is simple: give learners the foundations, practice, and support to keep growing.</p>
        <a href="#visit" className="about-button">Learn about MPI<span className="pill-arrow"><ArrowIcon/></span></a>
        <div className={`about-art ${imageUrl ? 'has-photo' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded image */}
          {imageUrl ? <img src={imageUrl} alt={imageAlt} loading="lazy"/> : <StudentsIllustration/>}
        </div>
      </div>
      <ul className="value-cards">
        {values(siteName).map(v => <li key={v.title} className={`value-card value-${v.tone}`}>
          <span className="value-watermark" aria-hidden="true">{v.watermark}</span>
          <div className="value-icon-row"><span className="value-icon" aria-hidden="true">{v.icon}</span>{sparks}</div>
          <h3>{v.title}</h3>
          <p>{v.text}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
