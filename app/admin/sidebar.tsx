'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { logout } from './actions';

const groups: { title: string; links: { href: string; label: string; count?: string }[] }[] = [
  { title: '', links: [{ href: '/admin', label: 'Overview' }] },
  { title: 'Content', links: [
    { href: '/admin/pathways', label: 'Pathways' },
    { href: '/admin/forms', label: 'Forms' },
    { href: '/admin/contact', label: 'Contact page' }
  ] },
  { title: 'Inbox', links: [
    { href: '/admin/submissions?form=enquiry', label: 'Center hire enquiries', count: 'enquiry' },
    { href: '/admin/submissions?form=contact', label: 'Contact messages', count: 'contact' },
    { href: '/admin/submissions?form=programme', label: 'Programme interest', count: 'programme' },
    { href: '/admin/submissions?form=newsletter', label: 'Newsletter', count: 'newsletter' }
  ] },
  { title: 'Settings', links: [
    { href: '/admin/branding', label: 'Site branding' },
    { href: '/admin/seo', label: 'SEO' },
    { href: '/admin/email', label: 'Email & delivery log' },
    { href: '/admin/code', label: 'Custom code' }
  ] }
];

/** `newCounts`: submissions still marked New, per form. */
export default function Sidebar({ newCounts }: { newCounts: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const form = useSearchParams().get('form');
  const isActive = (href: string) => {
    const [path, query] = href.split('?');
    if (path !== pathname) return false;
    return !query || new URLSearchParams(query).get('form') === form;
  };
  return <>
    <div className="mobile-bar">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="MPIITECH"/>
      <button className="btn ghost sm" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="admin-sidebar">Menu</button>
    </div>
    <aside id="admin-sidebar" className={`sidebar ${open ? 'open' : ''}`} onClick={e => { if ((e.target as HTMLElement).closest('a')) setOpen(false); }}>
      <div className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.png" alt="MPIITECH"/>
        <span>Website admin</span>
      </div>
      <nav className="side-nav" aria-label="Admin">
        {groups.map(g => <div key={g.title || 'main'} style={{ display: 'contents' }}>
          {g.title && <div className="group">{g.title}</div>}
          {g.links.map(l => <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
            {l.label}{l.count && (newCounts[l.count] ?? 0) > 0 && <span className="count" title={`${newCounts[l.count]} new`}>{newCounts[l.count]}</span>}
          </Link>)}
        </div>)}
      </nav>
      <div className="bottom">
        <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
        <form action={logout}><button type="submit">Sign out</button></form>
        {open && <button onClick={() => setOpen(false)}>Close menu</button>}
      </div>
    </aside>
  </>;
}
