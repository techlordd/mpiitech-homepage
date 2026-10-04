import Link from 'next/link';

export default function Footer({ siteName, footerText }: { siteName: string; footerText: string }) {
  return <footer><div className="wrap"><span>© {new Date().getFullYear()} {siteName} · {footerText}</span><div><a href="/#visit">Modakeke HQ</a><Link href="/contact">Contact us</Link><a href="#privacy-notice">Privacy notice</a></div><details id="privacy-notice"><summary>Privacy notice</summary><p>Information submitted through this website is stored securely and emailed to the {siteName} team through Resend to respond to enquiries or manage requested updates. Newsletter and programme notifications require your consent. Contact the center to withdraw consent or ask about your information.</p></details></div></footer>;
}
