import type { Metadata } from 'next';
import { DynamicForm } from '@/components/forms';
import { HUB_MAP, coordinatesIn, isEmbedUrl } from '@/lib/maps';
import { pageMetadata } from '@/lib/seo';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getContent(), 'contact', '/contact');
}

export default async function ContactPage() {
  const content = await getContent();
  const c = content.contact;
  const oneLineAddress = c.address.replace(/\s*\n\s*/g, ' ');
  const map = c.mapPin || (isEmbedUrl(c.mapEmbedUrl) ? c.mapEmbedUrl : HUB_MAP);
  const pin = coordinatesIn(map);
  const directions = pin ? `https://www.google.com/maps/dir/?api=1&destination=${pin[0]},${pin[1]}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(oneLineAddress)}`;
  const whatsapp = c.whatsapp.replace(/[^\d]/g, '');
  return <main id="contact">
    <section className="page-hero"><div className="wrap"><span className="eyebrow">{c.eyebrow}</span><h1>{c.heading}</h1>{c.intro && <p>{c.intro}</p>}</div></section>
    <section className="section pale"><div className="wrap contact-grid">
      <div className="contact-details">
        <div className="card contact-card">
          <h2>Get in touch</h2>
          <dl>
            {c.address && <div><dt>Visit us</dt><dd className="address">{c.address}</dd></div>}
            {c.phone && <div><dt>Call</dt><dd><a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a></dd></div>}
            {whatsapp && <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">{c.whatsapp}</a></dd></div>}
            {c.email && <div><dt>Email</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd></div>}
            {c.hours && <div><dt>Opening hours</dt><dd className="address">{c.hours}</dd></div>}
          </dl>
        </div>
        {c.showMap && c.address && <div className="map-frame"><iframe title={`Map showing ${content.branding.siteName}`} src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></div>}
        {c.showMap && c.address && <a className="text-link map-directions" href={directions} target="_blank" rel="noopener noreferrer">Get directions in Google Maps</a>}
      </div>
      <DynamicForm def={content.forms.contact}/>
    </div></section>
  </main>;
}
