'use client';
import type { Branding } from '@/lib/content';
import { saveBranding } from '../../actions';
import { ImageField, SaveBar, TextField, useEditor } from '../../ui';

export default function BrandingEditor({ initial }: { initial: Branding }) {
  const editor = useEditor(initial, saveBranding);
  const { value: b, update } = editor;
  return <>
    <div className="card">
      <h2>Site identity</h2>
      <p>Used in page titles (<code>%%sitename%%</code> and <code>%%tagline%%</code> in SEO titles), the footer and email subjects.</p>
      <div className="grid2">
        <TextField label="Site title" value={b.siteName} onChange={siteName => update({ siteName })} max={80}/>
        <TextField label="Tagline" value={b.tagline} onChange={tagline => update({ tagline })} max={120} hint="A short phrase, e.g. “Learn, Build & Grow”."/>
        <TextField label="Top bar text" value={b.topbarText} onChange={topbarText => update({ topbarText })} max={140}/>
        <TextField label="Footer text" value={b.footerText} onChange={footerText => update({ footerText })} max={200} hint="Shown after “© year Site title ·”."/>
      </div>
    </div>
    <div className="card">
      <h2>Logo and favicon</h2>
      <p>The logo appears on a white header, so use a version with a transparent background. The favicon is the small icon in browser tabs — a square PNG of at least 512 × 512 works best.</p>
      <div className="stack">
        <ImageField label="Logo" value={b.logoUrl} onChange={logoUrl => update({ logoUrl })} hint="Recommended: transparent PNG or SVG, about 640 × 200 px."/>
        <TextField label="Logo alternative text" value={b.logoAlt} onChange={logoAlt => update({ logoAlt })} max={120} hint="Read by screen readers. Usually your organisation name."/>
        <ImageField label="Favicon" value={b.faviconUrl} onChange={faviconUrl => update({ faviconUrl })} dark hint="Square PNG, ICO or SVG."/>
      </div>
    </div>
    <div className="card">
      <h2>Home page hero image</h2>
      <p>The large picture beside the main heading. Landscape photos around 1400 × 1000 px look best.</p>
      <div className="stack">
        <ImageField label="Hero image" value={b.heroImageUrl} onChange={heroImageUrl => update({ heroImageUrl })} cover hint="JPG or WebP, up to 4 MB."/>
        <TextField label="Image description (alt text)" value={b.heroImageAlt} onChange={heroImageAlt => update({ heroImageAlt })} max={200} hint="Describe the picture for screen readers and search engines."/>
        <div className="grid2">
          <TextField label="Caption" value={b.heroCaption} onChange={heroCaption => update({ heroCaption })} max={120} hint="Leave both caption fields empty to hide the caption."/>
          <TextField label="Caption label" value={b.heroCaptionLabel} onChange={heroCaptionLabel => update({ heroCaptionLabel })} max={80}/>
        </div>
      </div>
    </div>
    <SaveBar editor={editor}/>
  </>;
}
