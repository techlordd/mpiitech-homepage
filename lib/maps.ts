// Turns a Google Maps link into something the contact page can show in its map frame.

const GOOGLE_HOST = /(^|\.)(google\.[a-z.]+|goo\.gl)$/i;
const NUM = '(-?\\d{1,3}(?:\\.\\d+)?)';

/** An address the map frame can show as it is ("Embed a map" code, or our own search links). */
export const isEmbedUrl = (url: string) => /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed|^https:\/\/maps\.google\.[a-z.]+\/maps\?.*output=embed/i.test(url);

/** A Google Maps link someone would copy from Share (maps.app.goo.gl/…, google.com/maps/place/…). */
export function isMapsLink(url: string) {
  try { const u = new URL(url); return u.protocol === 'https:' && GOOGLE_HOST.test(u.hostname) && (u.hostname.endsWith('goo.gl') || u.pathname.startsWith('/maps')); }
  catch { return false; }
}

/** The pin's coordinates in a Google Maps address, if it has them. */
export function coordinatesIn(url: string): [string, string] | null {
  const text = decodeURIComponent(url);
  const pin = text.match(new RegExp(`!3d${NUM}!4d${NUM}`)); // the place itself
  if (pin) return [pin[1], pin[2]];
  const query = text.match(new RegExp(`[?&](?:q|query|ll|destination)=${NUM},\\s*${NUM}`));
  if (query) return [query[1], query[2]];
  const view = text.match(new RegExp(`@${NUM},${NUM}`)); // centre of the view, close to the pin
  return view ? [view[1], view[2]] : null;
}

export const embedFor = ([lat, lng]: [string, string]) => `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;

/** MPIITECH on Google Maps. Shown when no other location is set in Admin → Contact page. */
export const HUB_MAP_LINK = 'https://www.google.com/maps/place/MPIITECH/@7.4724476,4.5345872,17z/data=!3m1!4b1!4m6!3m5!1s0x103837a8894953df:0x13a80c1ecc55177!8m2!3d7.4724476!4d4.5371675!16s%2Fg%2F11zz8616sg';
export const HUB_MAP = embedFor(coordinatesIn(HUB_MAP_LINK)!);

/**
 * Follows a Google Maps share link (short links redirect to the full one) and
 * returns a map-frame address pinned on the place. Only ever requests Google's
 * own addresses. Null if the link can't be read.
 */
export async function resolveMapsLink(link: string): Promise<string | null> {
  let url = link;
  for (let hop = 0; hop < 5; hop++) {
    if (!isMapsLink(url) && !GOOGLE_HOST.test(new URL(url).hostname)) return null;
    const found = coordinatesIn(url);
    if (found) return embedFor(found);
    const place = url.match(/\/maps\/place\/([^/@?]+)/)?.[1];
    let response: Response;
    try { response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (compatible; MPIITECH website)' }, signal: AbortSignal.timeout(8000) }); }
    catch { return place ? `https://maps.google.com/maps?q=${place}&z=17&output=embed` : null; }
    const next = response.headers.get('location')
      ?? (response.ok ? (await response.text()).match(/https:\/\/www\.google\.[a-z.]+\/maps\/[^"'\s<>\\]+/)?.[0] : undefined);
    if (!next) return place ? `https://maps.google.com/maps?q=${place}&z=17&output=embed` : null;
    url = new URL(next.replace(/\\u0026/g, '&'), url).toString();
  }
  return null;
}
