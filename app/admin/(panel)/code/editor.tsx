'use client';
import type { CustomCode } from '@/lib/content';
import { saveCode } from '../../actions';
import { SaveBar, TextArea, useEditor } from '../../ui';

const GA_EXAMPLE = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>`;

// Tags that can be placed in <head>; anything else there is ignored by browsers or by the site.
function headWarnings(code: string) {
  const stripped = code.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<(meta|link)\b[^>]*>/gi, '').trim();
  const warnings: string[] = [];
  if (stripped) warnings.push('Some code is not inside a <script>, <style>, <noscript>, <meta> or <link> tag and will be ignored. Put visible HTML in the body boxes instead.');
  if (/\son[a-z]+\s*=/i.test(code)) warnings.push('Inline event attributes (onload=, onclick=…) are removed from head tags.');
  if ((code.match(/<script\b/gi)?.length ?? 0) !== (code.match(/<\/script>/gi)?.length ?? 0)) warnings.push('A <script> tag is not closed.');
  return warnings;
}

export default function CodeEditor({ initial }: { initial: CustomCode }) {
  const editor = useEditor(initial, saveCode);
  const { value: c, update } = editor;
  const warnings = headWarnings(c.head);
  return <>
    <div className="card">
      <h2>Header code</h2>
      <p>Placed inside <code>&lt;head&gt;</code>. Use for Google Analytics, Tag Manager (head part), verification meta tags and stylesheets.</p>
      <TextArea label="Code in <head>" code rows={10} value={c.head} max={30000} onChange={head => update({ head })} placeholder={GA_EXAMPLE}/>
      {warnings.map(w => <div key={w} className="notice warn" style={{ marginTop: 10, marginBottom: 0 }}>{w}</div>)}
    </div>
    <div className="card">
      <h2>Body code</h2>
      <p>Placed right after the opening <code>&lt;body&gt;</code> tag. Use for Google Tag Manager’s <code>&lt;noscript&gt;</code> part.</p>
      <TextArea label="Code after <body>" code rows={6} value={c.bodyStart} max={30000} onChange={bodyStart => update({ bodyStart })}/>
    </div>
    <div className="card">
      <h2>Footer code</h2>
      <p>Placed before the closing <code>&lt;/body&gt;</code> tag. Use for chat widgets and scripts that should load last.</p>
      <TextArea label="Code before </body>" code rows={6} value={c.bodyEnd} max={30000} onChange={bodyEnd => update({ bodyEnd })}/>
    </div>
    <SaveBar editor={editor}/>
  </>;
}
