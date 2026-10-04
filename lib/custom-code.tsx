// Turns admin-supplied <head> snippets (analytics, verification tags…) into React elements.
// Only <script>, <style>, <noscript>, <meta> and <link> tags are allowed in the head.
import { createElement, type ReactNode } from 'react';

const PROP_NAMES: Record<string, string> = {
  class: 'className', charset: 'charSet', 'http-equiv': 'httpEquiv', crossorigin: 'crossOrigin', referrerpolicy: 'referrerPolicy',
  nomodule: 'noModule', fetchpriority: 'fetchPriority', hreflang: 'hrefLang', itemprop: 'itemProp', imagesrcset: 'imageSrcSet', imagesizes: 'imageSizes'
};
const BOOLEAN = new Set(['async', 'defer', 'nomodule']);
const ATTRIBUTE = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const TAG = /<!--[\s\S]*?-->|<(script|style|noscript)\b([^>]*)>([\s\S]*?)<\/\1\s*>|<(meta|link)\b([^>]*?)\/?>/gi;

function decode(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function parseAttributes(source: string) {
  const props: Record<string, string | boolean> = {};
  for (const [, rawName, dq, sq, bare] of source.matchAll(ATTRIBUTE)) {
    const name = rawName.toLowerCase();
    if (name.startsWith('on')) continue; // inline event handlers are not supported
    const value = dq ?? sq ?? bare;
    props[PROP_NAMES[name] ?? name] = BOOLEAN.has(name) ? true : value === undefined ? '' : decode(value);
  }
  return props;
}

export function parseHeadCode(code: string): { elements: ReactNode[]; ignored: number } {
  const elements: ReactNode[] = [];
  let rest = code;
  for (const match of code.matchAll(TAG)) {
    rest = rest.replace(match[0], '');
    if (match[0].startsWith('<!--')) continue;
    const key = `custom-head-${elements.length}`;
    if (match[1]) {
      const inner = match[3];
      elements.push(createElement(match[1].toLowerCase(), { ...parseAttributes(match[2]), key, ...(inner.trim() ? { dangerouslySetInnerHTML: { __html: inner } } : {}) }));
    } else {
      elements.push(createElement(match[4].toLowerCase(), { ...parseAttributes(match[5]), key }));
    }
  }
  return { elements, ignored: rest.trim() ? 1 : 0 };
}

export function HeadCode({ code }: { code: string }) {
  return code.trim() ? <>{parseHeadCode(code).elements}</> : null;
}

/** Body snippets are written into the server HTML as-is so their scripts run on page load. */
export function BodyCode({ code, id }: { code: string; id: string }) {
  return code.trim() ? <div id={id} style={{ display: 'contents' }} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} /> : null;
}
