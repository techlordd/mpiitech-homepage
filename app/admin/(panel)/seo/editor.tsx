'use client';
import { useState } from 'react';
import { seoVars, type Branding, type PageSeo, type Seo, type SeoPageKey } from '@/lib/content';
import { saveSeo } from '../../actions';
import { ImageField, ListField, SaveBar, TextArea, TextField, Toggle, useEditor } from '../../ui';

const TABS = [['general', 'General'], ['home', 'Home page'], ['contact', 'Contact page'], ['verification', 'Verification'], ['schema', 'Organisation schema']] as const;
type Tab = typeof TABS[number][0];
const PATHS: Record<SeoPageKey, string> = { home: '/', contact: '/contact' };

export default function SeoEditor({ initial, branding, initialTab }: { initial: Seo; branding: Branding; initialTab?: string }) {
  const editor = useEditor(initial, saveSeo);
  const { value: seo, update } = editor;
  const [tab, setTab] = useState<Tab>(TABS.some(t => t[0] === initialTab) ? initialTab as Tab : 'general');
  const setPage = (key: SeoPageKey, patch: Partial<PageSeo>) => update({ pages: { ...seo.pages, [key]: { ...seo.pages[key], ...patch } } });
  const setSchema = (patch: Partial<Seo['schema']>) => update({ schema: { ...seo.schema, ...patch } });
  return <>
    <div className="tabs" role="tablist">{TABS.map(([key, label]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>

    {tab === 'general' && <div className="card">
      <h2>General settings</h2>
      <p>These apply to every page.</p>
      <div className="stack">
        <TextField label="Website address" value={seo.siteUrl} onChange={siteUrl => update({ siteUrl })} placeholder="https://www.mpiitech.com" hint="Your live domain. Used for canonical links, the sitemap and social sharing."/>
        <div className="grid2">
          <TextField label="Title separator" value={seo.titleSeparator} onChange={titleSeparator => update({ titleSeparator })} max={5} hint={<>Used for <code>%%sep%%</code>, e.g. | – · •</>}/>
          <TextField label="X (Twitter) username" value={seo.twitterHandle} onChange={twitterHandle => update({ twitterHandle })} placeholder="@mpiitech"/>
        </div>
        <ImageField label="Default social sharing image" value={seo.defaultOgImageUrl} onChange={defaultOgImageUrl => update({ defaultOgImageUrl })} cover hint="Shown when a page is shared on WhatsApp, Facebook, LinkedIn or X. Best size: 1200 × 630 px."/>
        <Toggle label="Allow search engines to index this website" hint="Turn off while the site is being built. When off, every page is marked noindex and robots.txt blocks crawlers." checked={seo.allowIndexing} onChange={allowIndexing => update({ allowIndexing })}/>
      </div>
    </div>}

    {(tab === 'home' || tab === 'contact') && <PageSeoPanel key={tab} pageKey={tab} page={seo.pages[tab]} seo={seo} branding={branding} onChange={patch => setPage(tab, patch)}/>}

    {tab === 'verification' && <div className="card">
      <h2>Search engine verification</h2>
      <p>Prove you own the site to Google Search Console and Bing Webmaster Tools. Paste the code, or the whole <code>&lt;meta&gt;</code> tag — we’ll extract the code for you. For other services (Pinterest, Yandex, Facebook domain verification), use <a href="/admin/code">Custom code</a>.</p>
      <div className="stack">
        <TextField label="Google Search Console" value={seo.googleVerification} onChange={googleVerification => update({ googleVerification })} placeholder='<meta name="google-site-verification" content="…" />' hint="Search Console → Add property → URL prefix → HTML tag."/>
        <TextField label="Bing Webmaster Tools" value={seo.bingVerification} onChange={bingVerification => update({ bingVerification })} placeholder='<meta name="msvalidate.01" content="…" />'/>
      </div>
    </div>}

    {tab === 'schema' && <div className="card">
      <h2>Organisation schema (structured data)</h2>
      <p>Helps Google show your organisation’s details, address and logo in search results.</p>
      <div className="stack">
        <Toggle label="Add organisation structured data to the home page" checked={seo.schema.enabled} onChange={enabled => setSchema({ enabled })}/>
        <div className="grid2">
          <label className="f"><span>Organisation type</span><select value={seo.schema.type} onChange={e => setSchema({ type: e.target.value })}>{['EducationalOrganization', 'Organization', 'LocalBusiness', 'NGO'].map(t => <option key={t}>{t}</option>)}</select></label>
          <TextField label="Organisation name" value={seo.schema.name} onChange={name => setSchema({ name })}/>
          <TextField label="Telephone" value={seo.schema.telephone} onChange={telephone => setSchema({ telephone })} placeholder="+234…"/>
          <TextField label="Email" value={seo.schema.email} onChange={email => setSchema({ email })}/>
          <TextField className="span2" label="Street address" value={seo.schema.streetAddress} onChange={streetAddress => setSchema({ streetAddress })}/>
          <TextField label="Town / city" value={seo.schema.locality} onChange={locality => setSchema({ locality })}/>
          <TextField label="State / region" value={seo.schema.region} onChange={region => setSchema({ region })}/>
          <TextField label="Country code" value={seo.schema.country} onChange={country => setSchema({ country })} hint="Two letters, e.g. NG."/>
        </div>
        <ListField label="Social profiles" value={seo.schema.sameAs} onChange={sameAs => setSchema({ sameAs })} placeholder={'https://www.facebook.com/…\nhttps://www.linkedin.com/company/…'} hint="Full links to your social media pages, one per line."/>
      </div>
    </div>}
    <SaveBar editor={editor}/>
  </>;
}

type Check = { level: 'good' | 'ok' | 'bad'; text: string };

function analyse(page: PageSeo, title: string, description: string, seo: Seo): Check[] {
  const kp = page.focusKeyphrase.trim().toLowerCase();
  const checks: Check[] = [];
  if (!kp) checks.push({ level: 'bad', text: 'No focus keyphrase set. Add the main phrase people would search for to find this page.' });
  else {
    checks.push(title.toLowerCase().includes(kp) ? { level: 'good', text: 'The focus keyphrase appears in the SEO title.' } : { level: 'bad', text: 'The focus keyphrase does not appear in the SEO title.' });
    checks.push(description.toLowerCase().includes(kp) ? { level: 'good', text: 'The focus keyphrase appears in the meta description.' } : { level: 'ok', text: 'Add the focus keyphrase to the meta description.' });
  }
  checks.push(title.length < 30 ? { level: 'ok', text: `The SEO title is short (${title.length} characters). Aim for 30–60.` } : title.length <= 60 ? { level: 'good', text: 'The SEO title length is good.' } : { level: 'bad', text: `The SEO title is ${title.length} characters and may be cut off in Google. Keep it under 60.` });
  checks.push(!description ? { level: 'bad', text: 'No meta description. Google will pick text from the page instead.' } : description.length < 120 ? { level: 'ok', text: `The meta description is short (${description.length} characters). Aim for 120–156.` } : description.length <= 156 ? { level: 'good', text: 'The meta description length is good.' } : { level: 'ok', text: `The meta description is ${description.length} characters and may be shortened in results.` });
  checks.push(!seo.allowIndexing ? { level: 'bad', text: 'Search engine indexing is turned off for the whole site (General tab).' } : page.noindex ? { level: 'bad', text: 'This page is hidden from search engines (noindex).' } : { level: 'good', text: 'This page can be shown in search results.' });
  checks.push(page.ogImageUrl || seo.defaultOgImageUrl ? { level: 'good', text: 'A social sharing image is set.' } : { level: 'ok', text: 'Add a social sharing image so links look good on WhatsApp and social media.' });
  return checks;
}

function PageSeoPanel({ pageKey, page, seo, branding, onChange }: { pageKey: SeoPageKey; page: PageSeo; seo: Seo; branding: Branding; onChange: (p: Partial<PageSeo>) => void }) {
  const vars = { branding, seo };
  const title = seoVars(page.title || '%%sitename%% %%sep%% %%tagline%%', vars);
  const description = seoVars(page.description, vars);
  const url = `${seo.siteUrl || 'https://your-domain.com'}${PATHS[pageKey] === '/' ? '' : PATHS[pageKey]}`;
  const checks = analyse(page, title, description, seo);
  const score = checks.some(c => c.level === 'bad') ? (checks.filter(c => c.level === 'bad').length > 1 ? 'bad' : 'ok') : 'good';
  const image = page.ogImageUrl || seo.defaultOgImageUrl;
  return <>
    <div className="card">
      <div className="card-head"><h2>Search appearance</h2><span className={`badge ${score === 'good' ? 'green' : score === 'ok' ? 'amber' : 'red'}`}>SEO: {score === 'good' ? 'Good' : score === 'ok' ? 'Needs improvement' : 'Problems'}</span></div>
      <div className="stack">
        <TextField label="Focus keyphrase" value={page.focusKeyphrase} onChange={focusKeyphrase => onChange({ focusKeyphrase })} max={100} hint="The main search phrase you want this page to rank for."/>
        <TextField label="SEO title" value={page.title} onChange={t => onChange({ title: t })} max={200} recommend={[30, 60]} hint={<>Variables: <code>%%sitename%%</code> <code>%%tagline%%</code> <code>%%sep%%</code></>}/>
        <TextArea label="Meta description" value={page.description} onChange={d => onChange({ description: d })} max={400} recommend={[120, 156]} hint="A short summary shown under the title in search results."/>
        <div>
          <div className="f"><span>Google preview</span></div>
          <div className="serp" style={{ marginTop: 6 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="site"><img src={branding.faviconUrl || '/favicon.png'} alt=""/><div>{branding.siteName}<small>{url}</small></div></div>
            <div className="t">{title}</div>
            <div className="d">{description || 'Add a meta description to control the text shown here.'}</div>
          </div>
        </div>
        <div><div className="f"><span>Analysis</span></div><ul className="analysis">{checks.map(c => <li key={c.text}><i className={c.level}/>{c.text}</li>)}</ul></div>
        <Toggle label="Hide this page from search engines (noindex)" checked={page.noindex} onChange={noindex => onChange({ noindex })}/>
      </div>
    </div>
    <div className="card">
      <h2>Social sharing</h2>
      <p>How this page looks when shared on WhatsApp, Facebook, LinkedIn and X. Leave empty to reuse the SEO title and description.</p>
      <div className="grid2">
        <div className="stack">
          <TextField label="Social title" value={page.ogTitle} onChange={ogTitle => onChange({ ogTitle })} placeholder={title}/>
          <TextArea label="Social description" value={page.ogDescription} onChange={ogDescription => onChange({ ogDescription })} placeholder={description}/>
          <ImageField label="Social image" value={page.ogImageUrl} onChange={ogImageUrl => onChange({ ogImageUrl })} cover hint="1200 × 630 px. Uses the default image when empty."/>
        </div>
        <div className="social" aria-label="Social preview">
          <div className="img" style={{ backgroundImage: image ? `url("${image}")` : undefined }}/>
          <div className="body"><small>{url.replace(/^https?:\/\//, '').split('/')[0]}</small><b>{seoVars(page.ogTitle, vars) || title}</b><p>{seoVars(page.ogDescription, vars) || description}</p></div>
        </div>
      </div>
    </div>
  </>;
}
