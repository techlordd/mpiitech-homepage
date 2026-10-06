type Value = { title: string; text: string; tone: 'peach' | 'blue' | 'green' | 'purple'; icon: React.ReactNode };

const values = (siteName: string): Value[] => [
  {
    title: 'Learn by doing', text: 'Hands-on exercises and practical work help turn curiosity into skills.', tone: 'peach',
    icon: <svg viewBox="0 0 48 48"><rect x="9" y="11" width="30" height="20" rx="3" fill="#1f3a5f"/><rect x="12" y="14" width="24" height="14" rx="1.5" fill="#4aa3ff"/><path d="M12 24l9-10h6L12 28z" fill="#fff" opacity=".3"/><path d="M5 33h38l-3 5H8z" fill="#ff861f"/></svg>
  },
  {
    title: 'A clear learning journey', text: 'Build from basic digital literacy toward more advanced technology skills.', tone: 'blue',
    icon: <svg viewBox="0 0 48 48"><rect x="8" y="26" width="7" height="12" rx="2" fill="#4aa3ff"/><rect x="18" y="19" width="7" height="19" rx="2" fill="#2563eb"/><rect x="28" y="12" width="7" height="26" rx="2" fill="#1d4ed8"/><path d="M7 40h34" stroke="#1f3a5f" strokeWidth="3" strokeLinecap="round"/><path d="M38 8v10M38 8h7l-2 3 2 3h-7" fill="#ff861f" stroke="#ff861f" strokeWidth="1.5" strokeLinejoin="round"/></svg>
  },
  {
    title: 'Guidance that matters', text: 'Learn with instructors who explain, demonstrate, and support your progress.', tone: 'green',
    icon: <svg viewBox="0 0 48 48"><circle cx="17" cy="16" r="6" fill="#ffc53d"/><circle cx="31" cy="16" r="6" fill="#16a34a"/><path d="M6 38c0-8 5-13 11-13s11 5 11 13z" fill="#16a34a"/><path d="M20 38c0-8 5-13 11-13s11 5 11 13z" fill="#ffc53d"/></svg>
  },
  {
    title: 'A place to focus', text: `Use dedicated learning spaces at the ${siteName} center in Modakeke.`, tone: 'purple',
    icon: <svg viewBox="0 0 48 48"><path d="M24 4c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" fill="#7c3aed"/><circle cx="24" cy="18" r="6" fill="#fff"/></svg>
  }
];

export default function AboutSection({ siteName }: { siteName: string }) {
  return <section id="about" className="section about-section"><div className="wrap about-grid">
    <div>
      <span className="eyebrow">Built around our community</span>
      <h2>Technology skills.<br/>Opportunity close to home.</h2>
      <p>Founded by Modakeke Progressive International (MPI), USA &amp; Canada, {siteName} brings practical skills and community investment closer to Modakeke and surrounding communities.</p>
      <p>Our focus is simple: give learners the foundations, practice, and support to keep growing.</p>
      <a href="#visit" className="text-link">Learn about MPI</a>
    </div>
    <ul className="values-grid">{values(siteName).map(v => <li key={v.title} className={`value value-${v.tone}`}>
      <span className="value-icon" aria-hidden="true">{v.icon}</span>
      <h3>{v.title}</h3>
      <p>{v.text}</p>
    </li>)}</ul>
  </div></section>;
}
