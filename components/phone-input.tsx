'use client';
import { useEffect, useRef, useState } from 'react';

// ISO code, name, dialling code. Nigeria is the default.
const LIST = 'AF Afghanistan 93|AL Albania 355|DZ Algeria 213|AD Andorra 376|AO Angola 244|AG Antigua and Barbuda 1|AR Argentina 54|AM Armenia 374|AU Australia 61|AT Austria 43|AZ Azerbaijan 994|BS Bahamas 1|BH Bahrain 973|BD Bangladesh 880|BB Barbados 1|BY Belarus 375|BE Belgium 32|BZ Belize 501|BJ Benin 229|BT Bhutan 975|BO Bolivia 591|BA Bosnia and Herzegovina 387|BW Botswana 267|BR Brazil 55|BN Brunei 673|BG Bulgaria 359|BF Burkina Faso 226|BI Burundi 257|KH Cambodia 855|CM Cameroon 237|CA Canada 1|CV Cape Verde 238|CF Central African Republic 236|TD Chad 235|CL Chile 56|CN China 86|CO Colombia 57|KM Comoros 269|CG Congo 242|CD Congo (DRC) 243|CR Costa Rica 506|CI Côte d’Ivoire 225|HR Croatia 385|CU Cuba 53|CY Cyprus 357|CZ Czechia 420|DK Denmark 45|DJ Djibouti 253|DM Dominica 1|DO Dominican Republic 1|EC Ecuador 593|EG Egypt 20|SV El Salvador 503|GQ Equatorial Guinea 240|ER Eritrea 291|EE Estonia 372|SZ Eswatini 268|ET Ethiopia 251|FJ Fiji 679|FI Finland 358|FR France 33|GA Gabon 241|GM Gambia 220|GE Georgia 995|DE Germany 49|GH Ghana 233|GR Greece 30|GD Grenada 1|GT Guatemala 502|GN Guinea 224|GW Guinea-Bissau 245|GY Guyana 592|HT Haiti 509|HN Honduras 504|HK Hong Kong 852|HU Hungary 36|IS Iceland 354|IN India 91|ID Indonesia 62|IR Iran 98|IQ Iraq 964|IE Ireland 353|IL Israel 972|IT Italy 39|JM Jamaica 1|JP Japan 81|JO Jordan 962|KZ Kazakhstan 7|KE Kenya 254|KW Kuwait 965|KG Kyrgyzstan 996|LA Laos 856|LV Latvia 371|LB Lebanon 961|LS Lesotho 266|LR Liberia 231|LY Libya 218|LI Liechtenstein 423|LT Lithuania 370|LU Luxembourg 352|MO Macao 853|MG Madagascar 261|MW Malawi 265|MY Malaysia 60|MV Maldives 960|ML Mali 223|MT Malta 356|MR Mauritania 222|MU Mauritius 230|MX Mexico 52|MD Moldova 373|MC Monaco 377|MN Mongolia 976|ME Montenegro 382|MA Morocco 212|MZ Mozambique 258|MM Myanmar 95|NA Namibia 264|NP Nepal 977|NL Netherlands 31|NZ New Zealand 64|NI Nicaragua 505|NE Niger 227|NG Nigeria 234|MK North Macedonia 389|NO Norway 47|OM Oman 968|PK Pakistan 92|PS Palestine 970|PA Panama 507|PG Papua New Guinea 675|PY Paraguay 595|PE Peru 51|PH Philippines 63|PL Poland 48|PT Portugal 351|QA Qatar 974|RO Romania 40|RU Russia 7|RW Rwanda 250|KN Saint Kitts and Nevis 1|LC Saint Lucia 1|VC Saint Vincent and the Grenadines 1|WS Samoa 685|SM San Marino 378|ST São Tomé and Príncipe 239|SA Saudi Arabia 966|SN Senegal 221|RS Serbia 381|SC Seychelles 248|SL Sierra Leone 232|SG Singapore 65|SK Slovakia 421|SI Slovenia 386|SB Solomon Islands 677|SO Somalia 252|ZA South Africa 27|KR South Korea 82|SS South Sudan 211|ES Spain 34|LK Sri Lanka 94|SD Sudan 249|SR Suriname 597|SE Sweden 46|CH Switzerland 41|SY Syria 963|TW Taiwan 886|TJ Tajikistan 992|TZ Tanzania 255|TH Thailand 66|TL Timor-Leste 670|TG Togo 228|TO Tonga 676|TT Trinidad and Tobago 1|TN Tunisia 216|TR Türkiye 90|TM Turkmenistan 993|UG Uganda 256|UA Ukraine 380|AE United Arab Emirates 971|GB United Kingdom 44|US United States 1|UY Uruguay 598|UZ Uzbekistan 998|VU Vanuatu 678|VE Venezuela 58|VN Vietnam 84|YE Yemen 967|ZM Zambia 260|ZW Zimbabwe 263';
const COUNTRIES = LIST.split('|').map(row => { const parts = row.split(' '); return { iso: parts[0], name: parts.slice(1, -1).join(' '), dial: parts[parts.length - 1] }; });
const byIso = new Map(COUNTRIES.map(c => [c.iso, c]));
const DEFAULT = 'NG';

// The visitor's time zone is a good guess at their country; anything not listed stays on Nigeria.
const ZONES: Record<string, string> = {
  'Africa/Lagos': 'NG', 'Africa/Accra': 'GH', 'Africa/Abidjan': 'CI', 'Africa/Nairobi': 'KE', 'Africa/Johannesburg': 'ZA', 'Africa/Cairo': 'EG',
  'Africa/Kampala': 'UG', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Kigali': 'RW', 'Africa/Douala': 'CM', 'Africa/Porto-Novo': 'BJ', 'Africa/Lome': 'TG',
  'Africa/Dakar': 'SN', 'Africa/Freetown': 'SL', 'Africa/Monrovia': 'LR', 'Africa/Banjul': 'GM', 'Africa/Niamey': 'NE', 'Africa/Casablanca': 'MA',
  'Africa/Addis_Ababa': 'ET', 'Africa/Lusaka': 'ZM', 'Africa/Harare': 'ZW', 'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Amsterdam': 'NL', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'America/New_York': 'US', 'America/Chicago': 'US',
  'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN', 'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU'
};

/** A number typed with its own code (+44…, 0044…) moves the picker to that country. */
function splitInternational(raw: string, current: string) {
  const digits = raw.replace(/^\s*(\+|00)/, '').replace(/\D/g, '');
  const matches = COUNTRIES.filter(c => digits.startsWith(c.dial)).sort((a, b) => b.dial.length - a.dial.length);
  if (!matches.length) return null;
  const longest = matches.filter(c => c.dial === matches[0].dial);
  const country = longest.find(c => c.iso === current) ?? longest.find(c => c.iso === 'US' || c.iso === 'GB' || c.iso === 'RU') ?? longest[0];
  return { iso: country.iso, number: digits.slice(country.dial.length) };
}

/**
 * Phone number with a country-code picker. Nigeria by default, or the country the
 * visitor's time zone suggests. The form sends one value, e.g. "+234 8012345678";
 * a leading 0 typed out of habit (0801…) is dropped.
 */
export function PhoneInput({ id, name, required, placeholder, describedBy }: { id: string; name: string; required: boolean; placeholder?: string; describedBy?: string }) {
  const [iso, setIso] = useState(DEFAULT);
  const [number, setNumber] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try { const zone = ZONES[Intl.DateTimeFormat().resolvedOptions().timeZone]; if (zone && byIso.has(zone)) setIso(zone); } catch { /* keep Nigeria */ }
    const form = box.current?.closest('form');
    const reset = () => setNumber('');
    form?.addEventListener('reset', reset);
    return () => form?.removeEventListener('reset', reset);
  }, []);
  const country = byIso.get(iso) ?? byIso.get(DEFAULT)!;
  const national = number.replace(/\D/g, '').replace(/^0+/, '');
  const change = (raw: string) => {
    if (/^\s*(\+|00)/.test(raw)) { const split = splitInternational(raw, iso); if (split) { setIso(split.iso); setNumber(split.number); return; } }
    setNumber(raw);
  };
  return <div className="phone-input" ref={box}>
    <label className="phone-country">
      <span aria-hidden="true">{country.iso} <b>+{country.dial}</b></span>
      <select aria-label="Country code" value={iso} onChange={e => setIso(e.target.value)}>
        {COUNTRIES.map(c => <option key={c.iso} value={c.iso}>{c.name} (+{c.dial})</option>)}
      </select>
    </label>
    <input id={id} type="tel" inputMode="tel" autoComplete="tel-national" value={number} onChange={e => change(e.target.value)}
      required={required} placeholder={placeholder || '801 234 5678'} maxLength={20} pattern="[0-9\s()+\-]{4,20}" aria-describedby={describedBy}/>
    <input type="hidden" name={name} value={national ? `+${country.dial} ${national}` : ''}/>
  </div>;
}
