import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getContent();
  return { title: { absolute: `Privacy notice | ${branding.siteName}` }, description: `How ${branding.siteName} uses information submitted through this website.`, alternates: { canonical: '/privacy' } };
}

export default async function PrivacyPage() {
  const { branding: { siteName } } = await getContent();
  return <main id="privacy">
    <section className="page-hero"><div className="wrap"><span className="eyebrow">Privacy notice</span><h1>How we use your information.</h1><p>A short, plain explanation of what happens to the details you share through this website.</p></div></section>
    <section className="section"><div className="wrap prose">
      <h2>What we collect</h2>
      <p>When you send an enquiry, a contact message, or ask for programme or newsletter updates, we receive the details you enter in the form, such as your name, email address, phone number, and your message.</p>
      <h2>How we use it</h2>
      <p>Your details are stored securely and emailed to the {siteName} team through our email provider, Resend, so we can respond to your enquiry or send the updates you asked for. We do not sell your information.</p>
      <h2>Your consent</h2>
      <p>Newsletter and programme notifications are only sent if you tick the consent box. You can withdraw your consent or ask about the information we hold at any time.</p>
      <h2>Contact us</h2>
      <p><Link className="text-link" href="/contact">Contact the {siteName} team</Link> to withdraw consent, update your details, or ask a question about your information.</p>
    </div></section>
  </main>;
}
