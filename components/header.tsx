'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Props = { logoUrl: string; logoAlt: string; topbarText: string; portalUrl?: string };

export default function Header({ logoUrl, logoAlt, topbarText, portalUrl }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <><div className="topbar"><div className="wrap"><span>{topbarText}</span><a href="/#visit">Visit Modakeke HQ</a></div></div>
  <header><div className="wrap nav"><Link href="/" className="logo" aria-label={`${logoAlt} home`}>
    {/* eslint-disable-next-line @next/next/no-img-element -- logo can be any uploaded image */}
    <img src={logoUrl} alt={logoAlt} width={174} height={55}/></Link>
  <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav">{open ? 'Close' : 'Menu'}</button>
  <nav id="main-nav" className={open ? 'open' : ''} aria-label="Main navigation" onClick={() => setOpen(false)}>
    <a href="/#programmes">Programmes</a><a href="/#about">About us</a><a href="/#hire">Hire the center</a>
    <Link href="/contact" aria-current={pathname === '/contact' ? 'page' : undefined}>Contact us</Link>
    <a href={portalUrl || '/#portal'}>Portal login</a><a className="button orange" href="/#apply">Apply now</a>
  </nav></div></header></>;
}
