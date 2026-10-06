// Inline SVG artwork for the programmes section. Flat, colourful and brand-neutral (no third-party logos).
import type { SkillIcon as SkillIconName } from '@/lib/content';

type IconName = Exclude<SkillIconName, 'auto'>;

const icons: Record<IconName, React.ReactNode> = {
  computer: <>
    <rect x="8" y="8" width="72" height="50" rx="6" fill="#1f3a5f"/>
    <rect x="13" y="13" width="62" height="39" rx="3" fill="#3d9bf5"/>
    <path d="M13 41 37 13h14L13 52z" fill="#fff" opacity=".18"/>
    <rect x="22" y="22" width="20" height="4" rx="2" fill="#fff" opacity=".9"/>
    <rect x="22" y="30" width="32" height="4" rx="2" fill="#fff" opacity=".6"/>
    <rect x="40" y="58" width="9" height="8" fill="#5b6b80"/>
    <rect x="29" y="65" width="31" height="5" rx="2.5" fill="#33475f"/>
    <rect x="88" y="14" width="24" height="56" rx="5" fill="#33475f"/>
    <rect x="93" y="21" width="14" height="3" rx="1.5" fill="#7d90a6"/>
    <rect x="93" y="27" width="14" height="3" rx="1.5" fill="#7d90a6"/>
    <circle cx="100" cy="58" r="3.5" fill="#3d9bf5"/>
    <rect x="16" y="76" width="56" height="9" rx="3" fill="#51637a"/>
    <path d="M21 80.5h46" stroke="#8fa2b8" strokeWidth="2" strokeDasharray="3 2"/>
    <ellipse cx="84" cy="80" rx="6" ry="5" fill="#7d90a6"/>
  </>,
  documents: <>
    <rect x="6" y="20" width="42" height="56" rx="8" fill="#2f6fde"/>
    <path d="M15 34h24M15 42h24M15 50h18M15 58h22" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".9"/>
    <rect x="40" y="8" width="42" height="56" rx="8" fill="#1f9d5c"/>
    <path d="M48 22h26v32H48zM48 32.7h26M48 43.3h26M60 22v32" stroke="#fff" strokeWidth="2.6" fill="none" opacity=".9"/>
    <rect x="74" y="22" width="42" height="56" rx="8" fill="#f2672d"/>
    <rect x="82" y="32" width="26" height="18" rx="3" fill="#fff" opacity=".92"/>
    <circle cx="91" cy="41" r="5" fill="#f2672d"/>
    <path d="M82 58h26M82 65h17" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".9"/>
  </>,
  internet: <>
    <circle cx="50" cy="45" r="36" fill="#3b82f6"/>
    <path d="M30 26c8 2 10 8 6 13s3 9 9 10-1 12-6 15c-8-4-14-13-14-22 0-6 2-12 5-16zM60 14c9 3 17 9 21 18-6 2-11-1-14-5s-9-6-7-13z" fill="#5fd38d"/>
    <g fill="none" stroke="#fff" strokeWidth="2" opacity=".55"><ellipse cx="50" cy="45" rx="15" ry="36"/><path d="M14 45h72M19 28h62M19 62h62"/></g>
    <path d="M90 34l24 8v16c0 14-10 24-24 29-14-5-24-15-24-29V42z" fill="#ffc53d"/>
    <path d="M90 34v53c-14-5-24-15-24-29V42z" fill="#f5a623"/>
    <rect x="81" y="56" width="18" height="15" rx="3" fill="#1f3a5f"/>
    <path d="M85 56v-4a5 5 0 0 1 10 0v4" stroke="#1f3a5f" strokeWidth="3.4" fill="none"/>
    <circle cx="90" cy="63" r="2.2" fill="#ffc53d"/>
  </>,
  code: <>
    <rect x="4" y="8" width="84" height="62" rx="8" fill="#1d2b44"/>
    <path d="M4 16a8 8 0 0 1 8-8h68a8 8 0 0 1 8 8v4H4z" fill="#2c3d5c"/>
    <circle cx="13" cy="14" r="2.4" fill="#ff6b5b"/><circle cx="21" cy="14" r="2.4" fill="#ffc53d"/><circle cx="29" cy="14" r="2.4" fill="#4fd17c"/>
    <rect x="13" y="29" width="26" height="4" rx="2" fill="#5aa9ff"/><rect x="43" y="29" width="18" height="4" rx="2" fill="#ff7ab6"/>
    <rect x="21" y="39" width="30" height="4" rx="2" fill="#ffc53d"/>
    <rect x="21" y="49" width="20" height="4" rx="2" fill="#4fd17c"/><rect x="45" y="49" width="12" height="4" rx="2" fill="#5aa9ff"/>
    <rect x="13" y="59" width="16" height="4" rx="2" fill="#ff7ab6"/>
    <rect x="62" y="40" width="54" height="40" rx="9" fill="#7c5cf2"/>
    <path d="M78 52l-8 8 8 8M100 52l8 8-8 8M93 49l-8 22" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </>,
  network: <>
    <path d="M60 22 26 58M60 22l34 36M26 58h68M60 22v54" stroke="#7d90a6" strokeWidth="3"/>
    <circle cx="60" cy="22" r="14" fill="#3b82f6"/><circle cx="26" cy="58" r="12" fill="#1f9d5c"/><circle cx="94" cy="58" r="12" fill="#f2672d"/><circle cx="60" cy="76" r="9" fill="#7c5cf2"/>
    <rect x="53" y="16" width="14" height="10" rx="2" fill="#fff"/>
  </>,
  data: <>
    <rect x="8" y="8" width="104" height="74" rx="10" fill="#fff" stroke="#d6e0eb" strokeWidth="2"/>
    <rect x="22" y="50" width="14" height="22" rx="3" fill="#5aa9ff"/><rect x="44" y="38" width="14" height="34" rx="3" fill="#1f9d5c"/>
    <rect x="66" y="44" width="14" height="28" rx="3" fill="#ffc53d"/><rect x="88" y="26" width="14" height="46" rx="3" fill="#f2672d"/>
    <path d="M22 36 46 24l22 8 30-16" stroke="#7c5cf2" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </>,
  ai: <>
    <rect x="28" y="16" width="60" height="60" rx="12" fill="#1d2b44"/>
    <path d="M40 16V6M58 16V6M76 16V6M40 86V76M58 86V76M76 86V76M28 32H18M28 50H18M28 68H18M98 32H88M98 50H88M98 68H88" stroke="#7d90a6" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M58 30c2 9 5 12 14 14-9 2-12 5-14 14-2-9-5-12-14-14 9-2 12-5 14-14z" fill="#ffc53d"/>
    <circle cx="74" cy="62" r="4" fill="#5aa9ff"/><circle cx="44" cy="64" r="3" fill="#ff7ab6"/>
  </>,
  security: <>
    <path d="M60 6l40 13v26c0 23-17 38-40 45-23-7-40-22-40-45V19z" fill="#1f9d5c"/>
    <path d="M60 6v84c-23-7-40-22-40-45V19z" fill="#17844c"/>
    <path d="M42 48l12 12 24-24" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </>,
  design: <>
    <path d="M60 8C33 8 12 27 12 50s17 36 34 36c9 0 9-8 5-13s-1-12 8-12h15c21 0 34-10 34-25C108 20 86 8 60 8z" fill="#ffc53d"/>
    <circle cx="36" cy="44" r="7" fill="#f2672d"/><circle cx="50" cy="26" r="7" fill="#3b82f6"/><circle cx="74" cy="24" r="7" fill="#1f9d5c"/><circle cx="90" cy="40" r="7" fill="#7c5cf2"/>
  </>,
  book: <>
    <path d="M60 22C48 12 28 12 10 16v60c18-4 38-4 50 6z" fill="#3b82f6"/>
    <path d="M60 22c12-10 32-10 50-6v60c-18-4-38-4-50 6z" fill="#f2672d"/>
    <path d="M20 30c10-2 22-1 30 4M20 42c10-2 22-1 30 4M70 34c8-5 20-6 30-4M70 46c8-5 20-6 30-4" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8" fill="none"/>
  </>
};

export function SkillIcon({ name, className }: { name: IconName; className?: string }) {
  return <svg className={className} viewBox="0 0 120 92" aria-hidden="true" focusable="false">{icons[name]}</svg>;
}

export const CapIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 1 9l11 6 9-4.9V17h2V9z" fill="currentColor"/><path d="M5 13.2v3.6C6.7 18.8 9.2 20 12 20s5.3-1.2 7-3.2v-3.6L12 17z" fill="currentColor"/></svg>;
export const MailIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>;
export const ArrowIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;

/** Default artwork for the featured pathway when no photo has been uploaded. */
export function FoundationsIllustration() {
  return <svg className="foundations-art" viewBox="0 0 360 420" role="img" aria-label="A laptop showing a beginner computer lesson, with badges for a completed lesson and typing practice">
    <path d="M58 92c38-62 150-80 222-34s70 152 22 214-150 94-218 52S20 154 58 92z" fill="#e3effd"/>
    <circle cx="214" cy="236" r="112" fill="#ffc98f"/>
    <circle cx="214" cy="236" r="78" fill="#ffb366" opacity=".55"/>
    <g className="art-spark" stroke="#ff861f" strokeWidth="7" strokeLinecap="round"><path d="M64 70l18 18M96 46l6 24M44 104l24 6"/></g>
    <circle cx="316" cy="96" r="7" fill="#7c5cf2"/><circle cx="40" cy="300" r="9" fill="#5fd38d"/><circle cx="300" cy="370" r="6" fill="#3b82f6"/>
    {/* laptop */}
    <g transform="rotate(-4 190 250)">
      <rect x="70" y="128" width="236" height="156" rx="14" fill="#1d2b44"/>
      <rect x="82" y="140" width="212" height="132" rx="6" fill="#fff"/>
      <rect x="82" y="140" width="212" height="22" rx="6" fill="#0c2338"/>
      <circle cx="94" cy="151" r="3.5" fill="#ff6b5b"/><circle cx="105" cy="151" r="3.5" fill="#ffc53d"/><circle cx="116" cy="151" r="3.5" fill="#4fd17c"/>
      <rect x="96" y="176" width="78" height="10" rx="5" fill="#0c2338"/>
      <rect x="96" y="194" width="118" height="7" rx="3.5" fill="#c9d6e4"/>
      <rect x="96" y="208" width="96" height="7" rx="3.5" fill="#c9d6e4"/>
      <rect x="96" y="230" width="58" height="26" rx="13" fill="#ff861f"/>
      <rect x="108" y="240" width="34" height="6" rx="3" fill="#0c2338"/>
      <rect x="224" y="174" width="56" height="56" rx="12" fill="#e3effd"/>
      <path d="M238 216l10-14 8 10 6-6 10 10z" fill="#3b82f6"/><circle cx="264" cy="190" r="6" fill="#ffc53d"/>
      <rect x="224" y="240" width="56" height="8" rx="4" fill="#e7edf3"/><rect x="224" y="240" width="38" height="8" rx="4" fill="#4fd17c"/>
      <path d="M50 284h276l-16 22H66z" fill="#33475f"/>
      <path d="M50 284h276v6H50z" fill="#4c6077"/>
      <path d="M160 296h56" stroke="#1d2b44" strokeWidth="4" strokeLinecap="round"/>
    </g>
    <path d="M232 238l0 34 9-8 7 15 7-3-7-15h12z" fill="#fff" stroke="#0c2338" strokeWidth="3" strokeLinejoin="round"/>
    {/* badges */}
    <g className="art-float">
      <rect x="18" y="168" width="120" height="44" rx="14" fill="#fff" stroke="#e1e8f0"/>
      <circle cx="40" cy="190" r="12" fill="#1f9d5c"/><path d="M34 190l4.5 4.5L46 186" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="58" y="186" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700" fill="#0c2338">Lesson 1</text>
      <text x="58" y="201" fontFamily="Arial, sans-serif" fontSize="10" fill="#61758a">Completed</text>
    </g>
    <g className="art-float delay">
      <rect x="226" y="328" width="122" height="46" rx="14" fill="#fff" stroke="#e1e8f0"/>
      <rect x="238" y="340" width="22" height="22" rx="6" fill="#7c5cf2"/>
      <path d="M243 347h12M243 351h12M245 355h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      <text x="268" y="347" fontFamily="Arial, sans-serif" fontSize="10" fill="#61758a">Typing speed</text>
      <text x="268" y="362" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="#0c2338">35 words/min</text>
    </g>
  </svg>;
}
