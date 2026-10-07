'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = { logoUrl: string; logoAlt: string; topbarText: string; portalUrl?: string; sticky?: boolean };

export default function Header({ logoUrl, logoAlt, topbarText, portalUrl, sticky = false }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Adds a soft shadow once the sticky header is floating over the page.
  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sticky]);
  const pathname = usePathname();
  return <><div className="topbar"><div className="wrap"><span>{topbarText}</span><a href="https://modakeke.org" target="_blank" rel="noopener noreferrer">Visit Modakeke.org</a></div></div>
  <header className={sticky ? `is-sticky${scrolled ? ' is-scrolled' : ''}` : undefined}><div className="wrap nav"><Link href="/" className="logo" aria-label={`${logoAlt} home`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- logo can be any uploaded image */}
    <img src={logoUrl} alt={logoAlt} width={174} height={55}/></Link>
  <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav">{open ? 'Close' : 'Menu'}</button>
  <nav id="main-nav" className={open ? 'open' : ''} aria-label="Main navigation" onClick={() => setOpen(false)}>
    <a href="/#programmes">Programmes</a><a href="/#about">About us</a><Link href="/hire-the-center" aria-current={pathname === '/hire-the-center' ? 'page' : undefined}>Hire the center</Link>
    <Link href="/contact" aria-current={pathname === '/contact' ? 'page' : undefined}>Contact us</Link>
    <a href={portalUrl || '/#portal'}>Portal login</a><a className="button orange" href="/#apply">Apply now</a>
  </nav></div></header></>;
}
