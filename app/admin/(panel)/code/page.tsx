import { loadContent } from '@/lib/site';
import { PageHead } from '../../ui';
import CodeEditor from './editor';

export const metadata = { title: 'Custom code' };

export default async function CodePage() {
  const { code } = await loadContent();
  return <>
    <PageHead title="Custom code" description="Add tracking and verification snippets such as Google Analytics, Google Tag Manager, Meta Pixel or Search Console tags. Code is added to every public page (not the admin)."/>
    <div className="notice warn"><b>Only paste code from services you trust</b>Scripts added here run on every visitor’s browser. A broken snippet can affect how the website works.</div>
    <CodeEditor initial={code}/>
  </>;
}
