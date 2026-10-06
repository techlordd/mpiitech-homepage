import Link from 'next/link';

type Props = { siteName: string; footerText: string; address: string; phone: string; email: string };

export default function Footer({ siteName, footerText, address, phone, email }: Props) {
  return <footer className="site-footer"><div className="wrap">
    <div className="footer-top">
      <div className="footer-brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-white.png" alt={siteName} width={160} height={50}/>
        <p>Practical digital skills training for learners, schools, and organisations in Modakeke and surrounding communities.</p>
      </div>
      <nav className="footer-col" aria-label="Footer">
        <h2>Explore</h2>
        <a href="/#programmes">Programmes</a><a href="/#about">About us</a><Link href="/hire-the-center">Hire the center</Link><Link href="/contact">Contact us</Link>
      </nav>
      <div className="footer-col">
        <h2>Visit</h2>
        <p className="address">{address}</p>
        {phone && <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>}
        {email && <a href={`mailto:${email}`}>{email}</a>}
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} {siteName} · {footerText}</span>
      <Link href="/privacy">Privacy notice</Link>
    </div>
  </div></footer>;
}
