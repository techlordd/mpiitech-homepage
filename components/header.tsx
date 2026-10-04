'use client';
import Image from 'next/image';
import {useState} from 'react';
export default function Header(){
  const [open,setOpen]=useState(false);
  return <><div className="topbar"><div className="wrap"><span>An initiative of MPI, USA & Canada</span><a href="#visit">Visit Modakeke HQ</a></div></div>
  <header><div className="wrap nav"><a href="#home" className="logo" aria-label="MPIITECH home"><Image src="/logo.png" alt="MPIITECH" width={134} height={48} priority unoptimized/></a>
  <button className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="main-nav">{open?'Close':'Menu'}</button>
  <nav id="main-nav" className={open?'open':''} aria-label="Main navigation" onClick={()=>setOpen(false)}><a href="#programmes">Programmes</a><a href="#about">About us</a><a href="#hire">Hire the center</a><a href="#visit">Visit the center</a><a href={process.env.NEXT_PUBLIC_PORTAL_URL || '#portal'}>Portal login</a><a className="button orange" href="#apply">Apply now</a></nav></div></header></>;
}
